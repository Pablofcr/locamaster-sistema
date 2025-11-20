interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  variant?: "primary" | "secondary" | "danger" | "outline"
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  type?: "button" | "submit" | "reset"
}

export function Button({ 
  children, 
  onClick, 
  className = "",
  variant = "primary",
  size = "md",
  disabled = false,
  type = "button"
}: ButtonProps) {
  const baseClasses = "inline-flex items-center justify-center rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500", 
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500"
  }
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm", 
    lg: "px-6 py-3 text-base"
  }
  
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : ""

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  )
}
