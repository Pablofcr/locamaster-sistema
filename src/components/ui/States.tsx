'use client'

import { Button } from './Button'

export function LoadingSpinner({ message = 'Carregando...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  )
}

export function EmptyState({
  message = 'Nenhum registro encontrado',
  actionLabel,
  onAction
}: {
  message?: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="text-center py-12">
      <div className="text-4xl mb-4">📭</div>
      <p className="text-gray-500 mb-4">{message}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  )
}

export function ErrorState({
  message = 'Ocorreu um erro ao carregar os dados',
  onRetry
}: {
  message?: string
  onRetry?: () => void
}) {
  return (
    <div className="text-center py-12">
      <div className="text-4xl mb-4">⚠️</div>
      <p className="text-red-600 mb-4">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">Tentar Novamente</Button>
      )}
    </div>
  )
}
