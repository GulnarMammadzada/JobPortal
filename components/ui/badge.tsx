import React from "react"
import styles from "./badge.module.css"

interface BadgeProps {
  variant?: "default" | "secondary" | "success" | "warning" | "danger"
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  const variantClass = styles[variant] || styles.default

  return (
    <span className={`${styles.badge} ${variantClass} ${className}`}>
      {children}
    </span>
  )
}
