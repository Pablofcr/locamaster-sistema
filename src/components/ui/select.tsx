import { SelectHTMLAttributes, forwardRef, ReactNode } from "react"

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      >
        {children}
      </select>
    )
  }
)
Select.displayName = "Select"

// Componentes compatíveis para manter a API similar
const SelectTrigger = Select
const SelectContent = ({ children }: { children: ReactNode }) => <>{children}</>
const SelectValue = ({ placeholder }: { placeholder?: string }) => <option value="" disabled>{placeholder}</option>
const SelectItem = ({ value, children }: { value: string; children: ReactNode }) => <option value={value}>{children}</option>

export { Select, SelectTrigger, SelectContent, SelectValue, SelectItem }
