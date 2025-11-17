import React, { createContext, useContext, useState } from "react"

// Context for Select
interface SelectContextType {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}

const SelectContext = createContext<SelectContextType | undefined>(undefined)

interface SelectProps {
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
}

export function Select({ children, value: controlledValue, onValueChange, defaultValue = "" }: SelectProps) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const [open, setOpen] = useState(false)

  const value = controlledValue !== undefined ? controlledValue : internalValue
  
  const handleValueChange = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
    setOpen(false)
  }

  return (
    <SelectContext.Provider value={{ value, onValueChange: handleValueChange, open, setOpen }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

interface SelectTriggerProps {
  children: React.ReactNode
  className?: string
}

export function SelectTrigger({ children, className = "" }: SelectTriggerProps) {
  const context = useContext(SelectContext)
  if (!context) throw new Error("SelectTrigger must be used within Select")

  return (
    <button
      type="button"
      onClick={() => context.setOpen(!context.open)}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between ${className}`}
    >
      {children}
      <svg
        className={`w-4 h-4 transition-transform ${context.open ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  )
}

interface SelectValueProps {
  placeholder?: string
}

export function SelectValue({ placeholder = "Select..." }: SelectValueProps) {
  const context = useContext(SelectContext)
  if (!context) throw new Error("SelectValue must be used within Select")

  return <span className={context.value ? "" : "text-gray-400"}>{context.value || placeholder}</span>
}

interface SelectContentProps {
  children: React.ReactNode
  className?: string
}

export function SelectContent({ children, className = "" }: SelectContentProps) {
  const context = useContext(SelectContext)
  if (!context) throw new Error("SelectContent must be used within Select")

  if (!context.open) return null

  return (
    <div className={`absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto ${className}`}>
      {children}
    </div>
  )
}

interface SelectItemProps {
  children: React.ReactNode
  value: string
  className?: string
}

export function SelectItem({ children, value, className = "" }: SelectItemProps) {
  const context = useContext(SelectContext)
  if (!context) throw new Error("SelectItem must be used within Select")

  return (
    <button
      type="button"
      onClick={() => context.onValueChange(value)}
      className={`w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
        context.value === value ? 'bg-blue-50 text-blue-600' : ''
      } ${className}`}
    >
      {children}
    </button>
  )
}
