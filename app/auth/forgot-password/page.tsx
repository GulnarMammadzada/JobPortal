"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import styles from "./forgot-password.module.css"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // TODO: Implement forgot password API call
      // const response = await apiClient.post("/auth/forgot-password", { email })
      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email")
      console.log("[v0] Forgot password error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card className={styles.card}>
        <CardHeader className={styles.header}>
          <CardTitle className={styles.title}>Check Your Email</CardTitle>
          <CardDescription className={styles.description}>
            We've sent password reset instructions to your email address
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className={styles.successMessage}>
            <p>If an account exists with that email, you will receive a password reset link shortly.</p>
            <p>Please check your spam folder if you don't see it in your inbox.</p>
          </div>

          <div className={styles.footer}>
            <Link href="/auth/login" className={styles.link}>
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={styles.card}>
      <CardHeader className={styles.header}>
        <CardTitle className={styles.title}>Reset Password</CardTitle>
        <CardDescription className={styles.description}>
          Enter your email address and we'll send you a link to reset your password
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className={styles.alert}>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              className={styles.input}
            />
          </div>

          <Button type="submit" disabled={isLoading} className={styles.submitButton}>
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            <Link href="/auth/login" className={styles.link}>
              Back to Sign In
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}