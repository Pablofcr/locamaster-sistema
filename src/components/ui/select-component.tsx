import { ReactNode, SelectHTMLAttributes, forwardRef } from "react"

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode
  className?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ children, className = "", ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
        {...props}
      >
        {children}
      </select>
    )
  }
)

Select.displayName = "Select"

// Para manter compatibilidade com o código existente
const SelectTrigger = Select
const SelectValue = ({ placeholder, children }: { placeholder?: string, children?: ReactNode }) => (
  <option value="" disabled>{placeholder || children}</option>
)
const SelectContent = ({ children }: { children: ReactNode }) => <>{children}</>
const SelectItem = ({ value, children }: { value: string, children: ReactNode }) => (
  <option value={value}>{children}</option>
)

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
