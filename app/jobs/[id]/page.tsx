"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ApiClient } from "@/lib/api-client"
import type { VacancyDto } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { JobDetailHeader } from "@/components/jobs/job-detail-header"
import { JobDetailContent } from "@/components/jobs/job-detail-content"
import { SimilarJobs } from "@/components/jobs/similar-jobs"
import styles from "./job-detail.module.css"

export default function JobDetailPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string
  const [job, setJob] = useState<VacancyDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isSaved, setIsSaved] = useState(false)
  const api = ApiClient.getInstance()

  useEffect(() => {
    fetchJobDetails()
    checkIfJobIsSaved()
  }, [jobId])

  const checkIfJobIsSaved = async () => {
    try {
      const response = await api.get<PageResponse<VacancyDto>>("/saved-vacancies?page=0&size=100")
      if (response && response.content) {
        const isJobSaved = response.content.some((job) => job.id === parseInt(jobId))
        setIsSaved(isJobSaved)
      }
    } catch (err) {
      console.error("Error checking if job is saved:", err)
    }
  }

  const fetchJobDetails = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await api.get<VacancyDto>(`/vacancies/${jobId}`)
      setJob(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch job details")
      console.log("[v0] Error fetching job details:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApply = () => {
    router.push(`/jobs/${jobId}/apply`)
  }

  const handleSaveJob = async () => {
    try {
      if (isSaved) {
        await api.delete(`/saved-vacancies/${jobId}`)
      } else {
        await api.post(`/saved-vacancies/${jobId}`)
      }
      setIsSaved(!isSaved)
    } catch (err) {
      console.error("Error saving job:", err)
    }
  }

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner />
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.error}>{error || "Job not found"}</p>
        <Button onClick={() => router.back()} variant="outline">
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={() => router.back()}>
        ← Back to Jobs
      </button>

      <div className={styles.mainContent}>
        <div className={styles.leftColumn}>
          <JobDetailHeader job={job} />
          <JobDetailContent job={job} />
        </div>

        <aside className={styles.rightColumn}>
          <div className={styles.actionCard}>
            <Button onClick={handleApply} className={styles.applyButton}>
              Apply Now
            </Button>

            <button onClick={handleSaveJob} className={`${styles.saveButton} ${isSaved ? styles.saved : ""}`}>
              {isSaved ? "✓ Saved" : "Save Job"}
            </button>
          </div>

          <div className={styles.infoCard}>
            <h3 className={styles.cardTitle}>Job Overview</h3>

            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Salary</span>
                <span className={styles.infoValue}>
                  {job.salaryMin && job.salaryMax ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}` : 'Salary not specified'}
                </span>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Employment Type</span>
                <span className={styles.infoValue}>
                  <Badge>{job.employmentType}</Badge>
                </span>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Experience Level</span>
                <span className={styles.infoValue}>
                  <Badge variant="secondary">{job.experienceLevel}</Badge>
                </span>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Location</span>
                <span className={styles.infoValue}>
                  {job.city} {job.isRemote && "(Remote)"}
                </span>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Posted</span>
                <span className={styles.infoValue}>{new Date(job.createdAt).toLocaleDateString()}</span>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Deadline</span>
                <span className={styles.infoValue}>{new Date(job.deadline).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className={styles.companyCard}>
            <h3 className={styles.cardTitle}>About Company</h3>
            <div className={styles.companyInfo}>
              {job.company.logoUrl && (
                <img
                  src={job.company.logoUrl || "/placeholder.svg"}
                  alt={job.company.companyName}
                  className={styles.companyLogo}
                />
              )}
              <h4 className={styles.companyName}>{job.company.companyName}</h4>
              <p className={styles.companyIndustry}>{job.company.industry}</p>
              <p className={styles.companyLocation}>{job.company.city}</p>
              {job.company.isVerified && <Badge className={styles.verifiedBadge}>Verified</Badge>}
            </div>
          </div>
        </aside>
      </div>

      <SimilarJobs currentJobId={job.id} category={job.category} />
    </div>
  )
}