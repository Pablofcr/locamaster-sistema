import { HTMLAttributes } from "react"

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-100 text-gray-800",
    destructive: "bg-red-100 text-red-800",
    outline: "border border-gray-300 text-gray-700"
  }

  return (
    <div
      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${variants[variant]} ${className}`}
      {...props}
    />
  )
}

export { Badge }
