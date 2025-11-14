"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import styles from "./register.module.css"

export default function RegisterPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false) // New state for password visibility
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showConfirmPassword, setShowConfirmPassword] = useState(false) // New state for confirm password visibility
  const [role, setRole] = useState<"JOB_SEEKER" | "COMPANY">("JOB_SEEKER")

  // Company fields
  const [companyName, setCompanyName] = useState("")
  const [description, setDescription] = useState("")
  const [industry, setIndustry] = useState("")
  const [companySize, setCompanySize] = useState("")
  const [website, setWebsite] = useState("")
  const [city, setCity] = useState("")

  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const validateForm = () => {
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      setError("All required fields must be filled")
      return false
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return false
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address")
      return false
    }
    if (role === "COMPANY" && (!companyName || !industry || !companySize || !city)) {
      setError("All company fields are required")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const companyData = role === "COMPANY" ? {
        companyName,
        description,
        industry,
        companySize,
        website,
        city
      } : undefined

      await register(fullName, email, password, phone, role, companyData)

      setTimeout(() => {
        window.location.href = "/"
      }, 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.")
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
          <h1 className={styles.title}>Create Your Account</h1>
          <p className={styles.description}>
            Join us to find your dream job or hire top talent
          </p>
        </div>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        {/* Role Selection */}
        <div className={styles.roleTabs}>
          <button
            type="button"
            className={`${styles.roleTab} ${role === "JOB_SEEKER" ? styles.roleTabActive : ""}`}
            onClick={() => setRole("JOB_SEEKER")}
          >
            I'm looking for a job
          </button>
          <button
            type="button"
            className={`${styles.roleTab} ${role === "COMPANY" ? styles.roleTabActive : ""}`}
            onClick={() => setRole("COMPANY")}
          >
            I'm hiring
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Common Fields */}
          <div className={styles.formGroup}>
            <label htmlFor="fullName" className={styles.label}>
              Full Name *
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email Address *
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
            <label htmlFor="phone" className={styles.label}>
              Phone Number *
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="+994501234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isLoading}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password *
            </label>
            <div className={styles.passwordInputWrapper}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 8 characters"
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

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirm Password *
            </label>
            <div className={styles.passwordInputWrapper}>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
                className={styles.input}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={styles.passwordToggleButton}
                aria-label="Toggle confirm password visibility"
              >
                <span className="material-symbols-outlined">
                  {showConfirmPassword ? "visibility" : "visibility_off"}
                </span>
              </button>
            </div>
          </div>

          {/* Company-specific Fields */}
          {role === "COMPANY" && (
            <>
              <div className={styles.divider}><span>Company Information</span></div>

              <div className={styles.formGroup}>
                <label htmlFor="companyName" className={styles.label}>
                  Company Name *
                </label>
                <input
                  id="companyName"
                  type="text"
                  placeholder="TechCorp LLC"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={isLoading}
                  required
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="industry" className={styles.label}>
                  Industry *
                </label>
                <select
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  disabled={isLoading}
                  required
                  className={styles.input}
                >
                  <option value="">Select Industry</option>
                  <option value="IT">Information Technology</option>
                  <option value="Finance">Finance & Banking</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Marketing">Marketing & Advertising</option>
                  <option value="Sales">Sales & Retail</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Construction">Construction</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="companySize" className={styles.label}>
                  Company Size *
                </label>
                <select
                  id="companySize"
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  disabled={isLoading}
                  required
                  className={styles.input}
                >
                  <option value="">Select Size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="500+">500+ employees</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="city" className={styles.label}>
                  City *
                </label>
                <select
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={isLoading}
                  required
                  className={styles.input}
                >
                  <option value="">Select City</option>
                  <option value="Baku">Baku</option>
                  <option value="Ganja">Ganja</option>
                  <option value="Sumqayit">Sumqayit</option>
                  <option value="Mingachevir">Mingachevir</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="website" className={styles.label}>
                  Website
                </label>
                <input
                  id="website"
                  type="url"
                  placeholder="https://example.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  disabled={isLoading}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="description" className={styles.label}>
                  Description
                </label>
                <textarea
                  id="description"
                  placeholder="Tell us about your company..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading}
                  rows={4}
                  className={styles.textarea}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitButton}
          >
            {isLoading ? (
              <>
                <svg className={styles.spinner} fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle className={styles.spinnerCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className={styles.spinnerPath} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"></path>
                </svg>
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Already have an account?{" "}
            <Link href="/auth/login" className={styles.link}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
