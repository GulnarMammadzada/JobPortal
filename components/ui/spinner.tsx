import React from "react"
import styles from "./spinner.module.css"

interface SpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  const sizeClass = styles[size] || styles.md

  return (
    <div className={`${styles.spinner} ${sizeClass} ${className}`}>
      <div className={styles.spinnerCircle}></div>
    </div>
  )
}
