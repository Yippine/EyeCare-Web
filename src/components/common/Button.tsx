import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  onClick,
  disabled = false,
  type = 'button',
}: ButtonProps) {
  const baseStyles =
    'font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const variantStyles = {
    primary:
      'bg-primary text-white hover:opacity-90 focus:ring-primary dark:focus:ring-offset-gray-900',
    secondary:
      'bg-secondary text-gray-900 hover:opacity-90 focus:ring-secondary dark:focus:ring-offset-gray-900',
    outline:
      'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary dark:focus:ring-offset-gray-900',
  }

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={combinedClassName}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </motion.button>
  )
}
