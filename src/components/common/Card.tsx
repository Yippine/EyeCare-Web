import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export default function Card({
  children,
  className = '',
  hover = false,
}: CardProps) {
  const baseStyles =
    'bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6'

  return (
    <motion.div
      className={`${baseStyles} ${className}`}
      initial={false}
      whileHover={
        hover ? { y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' } : {}
      }
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  )
}
