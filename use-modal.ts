import { useState, useCallback } from 'react'

interface UseModalReturn {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
  setOpen: (open: boolean) => void
}

export function useModal(initialState: boolean = false): UseModalReturn {
  const [isOpen, setIsOpen] = useState<boolean>(initialState)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen(prev => !prev), [])
  const setOpen = useCallback((open: boolean) => setIsOpen(open), [])

  return {
    isOpen,
    open,
    close,
    toggle,
    setOpen
  }
}
