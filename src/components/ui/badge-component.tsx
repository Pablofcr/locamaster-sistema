import { ReactNode } from "react"

interface BadgeProps {
  children: ReactNode
  className?: string
  variant?: "default" | "secondary" | "destructive" | "outline"
}

export function Badge({ children, className = "", variant = "default" }: BadgeProps) {
  const baseClasses = "inline-flex items-center px-2 py-1 text-xs font-medium rounded-full"
  
  const variantClasses = {
    default: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-100 text-gray-800", 
    destructive: "bg-red-100 text-red-800",
    outline: "border border-gray-300 text-gray-700"
  }

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}
