import React from "react"
import styles from "./card.module.css"

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`${styles.card} ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = "" }: CardProps) {
  return (
    <div className={`${styles.cardHeader} ${className}`}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className = "" }: CardProps) {
  return (
    <h3 className={`${styles.cardTitle} ${className}`}>
      {children}
    </h3>
  )
}

export function CardDescription({ children, className = "" }: CardProps) {
  return (
    <p className={`${styles.cardDescription} ${className}`}>
      {children}
    </p>
  )
}

export function CardContent({ children, className = "" }: CardProps) {
  return (
    <div className={`${styles.cardContent} ${className}`}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = "" }: CardProps) {
  return (
    <div className={`${styles.cardFooter} ${className}`}>
      {children}
    </div>
  )
}
