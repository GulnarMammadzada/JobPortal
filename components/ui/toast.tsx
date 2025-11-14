"use client"

import React from "react"
import styles from "./toast.module.css"
import { useToast } from "./use-toast" // Import useToast hook

interface ToastItemProps {
  id: string
  title?: string
  description?: string
  variant?: "default" | "success" | "destructive"
  onOpenChange: (open: boolean) => void
}

function ToastItem({ id, title, description, variant = "default", onOpenChange }: ToastItemProps) {
  const [open, setOpen] = React.useState(true)

  React.useEffect(() => {
    // Automatically dismiss after a delay if not destructive
    if (variant !== "destructive") {
      const timer = setTimeout(() => {
        setOpen(false)
        onOpenChange(false)
      }, 5000) // Auto-dismiss after 5 seconds
      return () => clearTimeout(timer)
    }
  }, [variant, onOpenChange])

  if (!open) {
    return null
  }

  return (
    <div className={`${styles.toast} ${styles[variant]}`}>
      {title && <div className={styles.toastTitle}>{title}</div>}
      {description && <div className={styles.toastDescription}>{description}</div>}
      <button
        onClick={() => {
          setOpen(false)
          onOpenChange(false)
        }}
        className={styles.closeButton}
      >
        &times;
      </button>
    </div>
  )
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <div className={styles.toasterContainer}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} />
      ))}
    </div>
  )
}