"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ApiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import styles from "./apply.module.css"

export default function ApplyPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [formData, setFormData] = useState({
    coverLetter: "",
    cvFile: null as File | null,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const api = ApiClient.getInstance()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [authLoading, isAuthenticated, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB")
        return
      }
      if (!["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type)) {
        setError("Only PDF, DOC, and DOCX files are allowed")
        return
      }
      setFormData((prev) => ({ ...prev, cvFile: file }))
      setError("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (!formData.cvFile) {
        setError("Please upload your CV/Resume")
        setIsLoading(false)
        return
      }

      const formDataToSend = new FormData()
      formDataToSend.append("vacancyId", jobId)
      formDataToSend.append("cvFile", formData.cvFile)
      if (formData.coverLetter) {
        formDataToSend.append("coverLetter", formData.coverLetter)
      }

      console.log("Submitting application:", { vacancyId: jobId, cvFile: formData.cvFile.name, coverLetter: formData.coverLetter })
      await api.postFormData("/applications", formDataToSend)
      setSuccess(true)

      setTimeout(() => {
        router.push("/my-applications")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit application")
      console.log("[v0] Application error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading authentication...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Redirect handled by useEffect
  }

  if (success) {
    return (
      <div className={styles.container}>
        <Card className={styles.successCard}>
          <CardContent className={styles.successContent}>
            <div className={styles.successIcon}>✓</div>
            <h2 className={styles.successTitle}>Application Submitted Successfully!</h2>
            <p className={styles.successMessage}>
              Thank you for applying. We'll review your application and get back to you soon.
            </p>
            <p className={styles.redirectMessage}>Redirecting to your applications...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={() => router.back()}>
        ← Back
      </button>

      <Card className={styles.card}>
        <CardHeader>
          <CardTitle>Apply for This Position</CardTitle>
          <CardDescription>Fill out the form below to submit your application</CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className={styles.alert}>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.infoBox}>
              <p className={styles.infoText}>
                Your contact information will be automatically fetched from your profile.
                Just upload your CV and optionally add a cover letter.
              </p>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="coverLetter" className={styles.label}>
                Cover Letter
              </label>
              <Textarea
                id="coverLetter"
                name="coverLetter"
                placeholder="Tell us why you're a great fit for this role..."
                value={formData.coverLetter}
                onChange={handleInputChange}
                disabled={isLoading}
                rows={6}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="cvFile" className={styles.label}>
                Upload CV/Resume * (PDF or DOC, max 5MB)
              </label>
              <div className={styles.fileUpload}>
                <input
                  id="cvFile"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  disabled={isLoading}
                  required
                  className={styles.fileInput}
                />
                <label htmlFor="cvFile" className={styles.fileLabel}>
                  <span className={styles.uploadIcon}>📎</span>
                  <span className={styles.uploadText}>
                    {formData.cvFile ? formData.cvFile.name : "Click to upload or drag and drop"}
                  </span>
                </label>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className={styles.submitButton}>
              {isLoading ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}