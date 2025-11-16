import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { notifications } from "@/lib/notifications"
import { 
  Plus,
  Package,
  DollarSign,
  MapPin,
  Calendar,
  AlertCircle
} from "lucide-react"

const equipmentSchema = z.object({
  name: z.string().min(3, "Nome deve ter ao menos 3 caracteres"),
  category: z.string().min(1, "Selecione uma categoria"),
  brand: z.string().min(2, "Marca é obrigatória"),
  model: z.string().min(2, "Modelo é obrigatório"),
  serialNumber: z.string().min(5, "Número de série deve ter ao menos 5 caracteres"),
  dailyPrice: z.number().min(1, "Preço deve ser maior que R$ 1"),
  condition: z.string().min(1, "Selecione a condição"),
  location: z.string().min(3, "Localização é obrigatória"),
  description: z.string().optional(),
})

type EquipmentFormData = z.infer<typeof equipmentSchema>

interface AddEquipmentModalProps {
  onAdd: (equipment: EquipmentFormData) => void
}

export function AddEquipmentModal({ onAdd }: AddEquipmentModalProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      condition: "good",
      category: "construcao",
      location: "Depósito A"
    }
  })

  const onSubmit = async (data: EquipmentFormData) => {
    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onAdd(data)
      reset()
      setOpen(false)
      
      // Show success notification
      notifications.equipment.added(data.name)
      
    } catch (error) {
      console.error("Erro ao adicionar equipamento:", error)
      notifications.system.connectionLost()
    } finally {
      setIsSubmitting(false)
    }
  }

  const categories = [
    { value: "construcao", label: "Construção Civil" },
    { value: "industrial", label: "Industrial" },
    { value: "automotivo", label: "Automotivo" },
    { value: "jardinagem", label: "Jardinagem" },
    { value: "limpeza", label: "Limpeza" },
    { value: "eventos", label: "Eventos" }
  ]

  const conditions = [
    { value: "new", label: "Novo" },
    { value: "good", label: "Bom" },
    { value: "fair", label: "Regular" },
    { value: "needs_repair", label: "Precisa Reparo" }
  ]

  const locations = [
    "Depósito A", "Depósito B", "Depósito C", "Oficina", "Pátio Externo"
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Novo Equipamento
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2 text-blue-600" />
            Adicionar Novo Equipamento
          </DialogTitle>
          <DialogDescription>
            Cadastre um novo equipamento no sistema. Todos os campos marcados com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Informações Básicas
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Equipamento *
                  </label>
                  <Input
                    {...register("name")}
                    placeholder="Ex: Betoneira Industrial 400L"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria *
                  </label>
                  <select
                    {...register("category")}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      errors.category ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marca *
                  </label>
                  <Input
                    {...register("brand")}
                    placeholder="Ex: Caterpillar"
                    className={errors.brand ? "border-red-500" : ""}
                  />
                  {errors.brand && (
                    <p className="text-red-500 text-xs mt-1">{errors.brand.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modelo *
                  </label>
                  <Input
                    {...register("model")}
                    placeholder="Ex: CAT-320D"
                    className={errors.model ? "border-red-500" : ""}
                  />
                  {errors.model && (
                    <p className="text-red-500 text-xs mt-1">{errors.model.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Série *
                  </label>
                  <Input
                    {...register("serialNumber")}
                    placeholder="Ex: CAT240001123"
                    className={errors.serialNumber ? "border-red-500" : ""}
                  />
                  {errors.serialNumber && (
                    <p className="text-red-500 text-xs mt-1">{errors.serialNumber.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condição *
                  </label>
                  <select
                    {...register("condition")}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      errors.condition ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    {conditions.map(cond => (
                      <option key={cond.value} value={cond.value}>
                        {cond.label}
                      </option>
                    ))}
                  </select>
                  {errors.condition && (
                    <p className="text-red-500 text-xs mt-1">{errors.condition.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing and Location */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Preço e Localização
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preço Diário (R$) *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register("dailyPrice", { valueAsNumber: true })}
                    placeholder="0.00"
                    className={errors.dailyPrice ? "border-red-500" : ""}
                  />
                  {errors.dailyPrice && (
                    <p className="text-red-500 text-xs mt-1">{errors.dailyPrice.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Localização *
                  </label>
                  <select
                    {...register("location")}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      errors.location ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    {locations.map(loc => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                  {errors.location && (
                    <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">
                Descrição Adicional
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  {...register("description")}
                  rows={3}
                  placeholder="Informações adicionais sobre o equipamento..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </div>
              ) : (
                "Adicionar Equipamento"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
