"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import styles from "./login.module.css"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false) // New state for password visibility
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    console.log("Login attempt:", { email, password: "***" })

    try {
      const user = await login(email, password)
      console.log("Login successful!", user)

      if (user) {
        // Redirect based on user role
        switch (user.role) {
          case "ADMIN":
            router.push("/admin/dashboard")
            break
          case "COMPANY":
            router.push("/company/dashboard")
            break
          case "JOB_SEEKER":
            router.push("/jobseeker/dashboard")
            break
          default:
            router.push("/") // Fallback to home
        }
      }
    } catch (err) {
      console.error("Login error:", err)
      const errorMessage = err instanceof Error ? err.message : "Login failed. Please try again."
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logoContainer}>
          <div className={styles.logoIconWrapper}>
            <span className="material-symbols-outlined">work</span>
          </div>
        </div>
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.description}>Sign in to your account to continue</p>
        </div>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email Address
            </label>
            <input
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

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <div className={styles.passwordInputWrapper}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className={styles.input}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.passwordToggleButton}
                aria-label="Toggle password visibility"
              >
                <span className="material-symbols-outlined">
                  {showPassword ? "visibility" : "visibility_off"}
                </span>
              </button>
            </div>
          </div>

          {/* Remember Me and Forgot Password */}
          <div className={styles.optionsRow}>
            <div className={styles.checkboxWrapper}>
              <input
                type="checkbox"
                id="remember-me"
                className={styles.checkbox}
              />
              <label htmlFor="remember-me" className={styles.checkboxLabel}>
                Remember me
              </label>
            </div>
            <Link href="/auth/forgot-password" className={styles.forgotPasswordLink}>
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={isLoading} className={styles.submitButton}>
            {isLoading ? (
              <>
                <svg className={styles.spinner} fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle className={styles.spinnerCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className={styles.spinnerPath} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"></path>
                </svg>
                Processing...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className={styles.divider}>
          <hr className={styles.dividerLine} />
          <p className={styles.dividerText}>OR</p>
          <hr className={styles.dividerLine} />
        </div>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Don't have an account?{" "}
            <Link href="/auth/register" className={styles.link}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}