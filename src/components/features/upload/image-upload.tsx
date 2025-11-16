"use client"

import { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/lib/notifications'
import {
  Upload,
  X,
  Image as ImageIcon,
  Camera,
  FileImage,
  Loader2,
  Download,
  Eye,
  Trash2,
  Edit3,
  Crop,
  RotateCw
} from 'lucide-react'

interface UploadedImage {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploadedAt: Date
  equipment?: {
    id: string
    name: string
  }
}

interface ImageUploadProps {
  maxFiles?: number
  maxSize?: number // in MB
  equipmentId?: string
  equipmentName?: string
  onUploadComplete?: (images: UploadedImage[]) => void
  existingImages?: UploadedImage[]
}

export function ImageUpload({
  maxFiles = 5,
  maxSize = 10,
  equipmentId,
  equipmentName,
  onUploadComplete,
  existingImages = []
}: ImageUploadProps) {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>(existingImages)
  const [isUploading, setIsUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true)
    
    try {
      const newImages: UploadedImage[] = []
      
      for (const file of acceptedFiles) {
        // Validate file size
        if (file.size > maxSize * 1024 * 1024) {
          toast.error(`Arquivo ${file.name} é muito grande. Máximo ${maxSize}MB`)
          continue
        }

        // Create preview URL
        const url = URL.createObjectURL(file)
        
        // Simulate upload to server (replace with real API call)
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const uploadedImage: UploadedImage = {
          id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          url,
          uploadedAt: new Date(),
          equipment: equipmentId ? { id: equipmentId, name: equipmentName || 'Equipamento' } : undefined
        }
        
        newImages.push(uploadedImage)
      }
      
      const updatedImages = [...uploadedImages, ...newImages]
      setUploadedImages(updatedImages)
      onUploadComplete?.(updatedImages)
      
      toast.success(`${newImages.length} imagem(ns) enviada(s) com sucesso!`)
      
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Erro ao enviar imagens')
    } finally {
      setIsUploading(false)
    }
  }, [uploadedImages, maxSize, equipmentId, equipmentName, onUploadComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: maxFiles - uploadedImages.length,
    disabled: isUploading || uploadedImages.length >= maxFiles
  })

  const removeImage = (imageId: string) => {
    const updatedImages = uploadedImages.filter(img => img.id !== imageId)
    setUploadedImages(updatedImages)
    onUploadComplete?.(updatedImages)
    
    // Revoke URL to free memory
    const imageToRemove = uploadedImages.find(img => img.id === imageId)
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.url)
      toast.info(`Imagem ${imageToRemove.name} removida`)
    }
  }

  const downloadImage = (image: UploadedImage) => {
    const link = document.createElement('a')
    link.href = image.url
    link.download = image.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success(`Download de ${image.name} iniciado`)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const openCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment')
      fileInputRef.current.click()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ImageIcon className="h-5 w-5 mr-2 text-blue-600" />
          Upload de Imagens
          {equipmentName && (
            <span className="ml-2 text-sm font-normal text-gray-600">
              para {equipmentName}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          
          {/* Upload Area */}
          {uploadedImages.length < maxFiles && (
            <div>
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                  ${isDragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }
                  ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <input {...getInputProps()} />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files) {
                      onDrop(Array.from(e.target.files))
                    }
                  }}
                />
                
                <div className="space-y-4">
                  {isUploading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                    </div>
                  ) : (
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                  )}
                  
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      {isDragActive 
                        ? 'Solte as imagens aqui...'
                        : 'Clique ou arraste imagens aqui'
                      }
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Máximo {maxFiles} imagens, até {maxSize}MB cada
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Formatos: JPEG, PNG, GIF, WebP
                    </p>
                  </div>
                  
                  <div className="flex justify-center space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      <FileImage className="h-4 w-4 mr-1" />
                      Selecionar Arquivos
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={openCamera}
                      disabled={isUploading}
                    >
                      <Camera className="h-4 w-4 mr-1" />
                      Usar Câmera
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Uploaded Images Grid */}
          {uploadedImages.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900">
                  Imagens Carregadas ({uploadedImages.length}/{maxFiles})
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    uploadedImages.forEach(img => URL.revokeObjectURL(img.url))
                    setUploadedImages([])
                    onUploadComplete?.([])
                    toast.info('Todas as imagens foram removidas')
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remover Todas
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {uploadedImages.map((image) => (
                  <Card key={image.id} className="overflow-hidden">
                    <div className="aspect-square relative group">
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Overlay with actions */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setPreviewImage(image.url)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => downloadImage(image)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeImage(image.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <CardContent className="p-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {image.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(image.size)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {image.uploadedAt.toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Image Preview Modal */}
          {previewImage && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
              <div className="relative max-w-4xl max-h-full">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setPreviewImage(null)}
                  className="absolute top-4 right-4"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Upload Progress/Status */}
          {uploadedImages.length === maxFiles && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm font-medium">
                ✅ Limite máximo de imagens atingido ({maxFiles}/{maxFiles})
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Demo component
export function ImageUploadDemo() {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])

  return (
    <div className="space-y-6">
      <ImageUpload
        maxFiles={5}
        maxSize={5}
        equipmentId="eq_demo_001"
        equipmentName="Betoneira 400L Industrial"
        onUploadComplete={setUploadedImages}
        existingImages={uploadedImages}
      />
      
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumo do Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Total de imagens:</strong> {uploadedImages.length}</p>
            <p><strong>Tamanho total:</strong> {
              uploadedImages.reduce((acc, img) => acc + img.size, 0) > 0 
                ? (uploadedImages.reduce((acc, img) => acc + img.size, 0) / 1024 / 1024).toFixed(2) + ' MB'
                : '0 MB'
            }</p>
          </div>
          
          {uploadedImages.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">
                🎉 Funcionalidades implementadas:
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✅ Drag & drop de múltiplas imagens</li>
                <li>✅ Preview em tela cheia</li>
                <li>✅ Upload via câmera do dispositivo</li>
                <li>✅ Validação de tamanho e formato</li>
                <li>✅ Download individual das imagens</li>
                <li>✅ Remoção individual ou em lote</li>
                <li>✅ Interface responsiva e elegante</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
