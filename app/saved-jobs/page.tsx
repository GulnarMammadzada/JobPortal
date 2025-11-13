"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ApiClient } from "@/lib/api-client"
import type { VacancyDto, PageResponse, SavedVacancyResponse } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Header } from "@/components/jobs/header"
import styles from "./saved-jobs.module.css"

export default function SavedJobsPage() {
  const router = useRouter()
  const [savedJobs, setSavedJobs] = useState<SavedVacancyResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const api = ApiClient.getInstance()

  useEffect(() => {
    fetchSavedJobs()
  }, [])

  const fetchSavedJobs = async () => {
    setIsLoading(true)
    setError("")

    try {
      // Backend returns List<SavedVacancyResponse>, not paginated
      const response = await api.get<SavedVacancyResponse[]>("/saved-vacancies")
      console.log("Saved jobs response:", response)
      if (response && Array.isArray(response)) {
        setSavedJobs(response)
      } else {
        setSavedJobs([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch saved jobs")
      console.error("Error fetching saved jobs:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveSavedJob = async (jobId: number) => {
    try {
      await api.delete(`/saved-vacancies/${jobId}`)
      setSavedJobs((prev) => prev.filter((savedJob) => savedJob.vacancy.id !== jobId))
    } catch (err) {
      console.log("[v0] Error removing saved job:", err)
    }
  }

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Saved Jobs</h1>
          <p className={styles.subtitle}>
            You have {savedJobs.length} saved job{savedJobs.length !== 1 ? "s" : ""}
          </p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {isLoading ? (
          <div className={styles.loadingContainer}>
            <Spinner />
          </div>
        ) : savedJobs.length === 0 ? (
          <div className={styles.noResults}>
            <p>No saved jobs yet.</p>
            <p>Start exploring and save jobs you're interested in!</p>
            <Button onClick={() => router.push("/jobs")} className={styles.exploreButton}>
              Explore Jobs
            </Button>
          </div>
        ) : (
          <div className={styles.jobsList}>
            {savedJobs.map((savedJob) => (
              <div key={savedJob.vacancyId} className={styles.jobCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.logoSection}>
                    {savedJob.vacancy?.company?.logoUrl && (
                      <img
                        src={savedJob.vacancy.company.logoUrl || "/placeholder.svg"}
                        alt={savedJob.vacancy.company?.companyName || "Company"}
                        className={styles.logo}
                      />
                    )}
                  </div>

                  <div className={styles.titleSection}>
                    <h3 className={styles.jobTitle}>{savedJob.vacancy?.title || "Job Title"}</h3>
                    <p className={styles.company}>{savedJob.vacancy?.company?.companyName || "Company"}</p>
                    <div className={styles.badges}>
                      {savedJob.vacancy?.employmentType && <Badge>{savedJob.vacancy.employmentType}</Badge>}
                      {savedJob.vacancy?.isRemote && <Badge variant="outline">Remote</Badge>}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveSavedJob(savedJob.vacancyId)}
                    className={styles.removeButton}
                    title="Remove from saved jobs"
                  >
                    ❤️
                  </button>
                </div>

                <div className={styles.cardContent}>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <span className={styles.label}>Location</span>
                      <span className={styles.value}>{savedJob.vacancy?.city || "N/A"}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.label}>Salary</span>
                      <span className={styles.value}>
                        {savedJob.vacancy?.salaryMin && savedJob.vacancy?.salaryMax
                          ? `$${savedJob.vacancy.salaryMin.toLocaleString()} - $${savedJob.vacancy.salaryMax.toLocaleString()}`
                          : "Not specified"}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.label}>Level</span>
                      <span className={styles.value}>{savedJob.vacancy?.experienceLevel || "N/A"}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.label}>Saved</span>
                      <span className={styles.value}>{new Date(savedJob.savedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {savedJob.vacancy?.description && (
                    <p className={styles.description}>{savedJob.vacancy.description.substring(0, 150)}...</p>
                  )}
                </div>

                <div className={styles.cardFooter}>
                  <Button
                    onClick={() => router.push(`/jobs/${savedJob.vacancyId}`)}
                    variant="outline"
                    className={styles.viewButton}
                  >
                    View Details
                  </Button>
                  <Button onClick={() => router.push(`/jobs/${savedJob.vacancyId}/apply`)} className={styles.applyButton}>
                    Apply Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}