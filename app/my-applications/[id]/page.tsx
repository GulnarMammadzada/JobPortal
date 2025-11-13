"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ApiClient } from "@/lib/api-client"
import type { ApplicationWithHistoryDto } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Header } from "@/components/jobs/header"
import styles from "./application-detail.module.css"

export default function ApplicationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const applicationId = params.id as string
  const [application, setApplication] = useState<ApplicationWithHistoryDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const api = ApiClient.getInstance()

  useEffect(() => {
    fetchApplicationDetails()
  }, [applicationId])

  const fetchApplicationDetails = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await api.get<ApplicationWithHistoryDto>(`/applications/${applicationId}/history`)
      setApplication(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch application details")
      console.log("[v0] Error fetching application:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "REVIEWED":
        return "bg-blue-100 text-blue-800"
      case "ACCEPTED":
        return "bg-green-100 text-green-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className={styles.pageWrapper}>
        <Header />
        <div className={styles.loadingContainer}>
          <Spinner />
        </div>
      </div>
    )
  }

  if (error || !application) {
    return (
      <div className={styles.pageWrapper}>
        <Header />
        <div className={styles.container}>
          <div className={styles.errorContainer}>
            <p className={styles.error}>{error || "Application not found"}</p>
            <Button onClick={() => router.back()} variant="outline">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.container}>
        <button className={styles.backButton} onClick={() => router.back()}>
          ← Back to Applications
        </button>

        <div className={styles.mainContent}>
          <div className={styles.leftColumn}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h1 className={styles.jobTitle}>{application.vacancyTitle}</h1>
                <Badge className={getStatusColor(application.status)}>{application.status}</Badge>
              </div>

              <div className={styles.infoSection}>
                <h3 className={styles.sectionTitle}>Application Information</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Full Name</span>
                    <span className={styles.value}>{application.fullName}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Email</span>
                    <span className={styles.value}>{application.email}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Phone</span>
                    <span className={styles.value}>{application.phone}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Experience</span>
                    <span className={styles.value}>{application.experienceYears} years</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Applied Date</span>
                    <span className={styles.value}>{new Date(application.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Match Score</span>
                    <span className={styles.matchScore}>{application.matchScore}%</span>
                  </div>
                </div>
              </div>

              {application.coverLetter && (
                <div className={styles.infoSection}>
                  <h3 className={styles.sectionTitle}>Cover Letter</h3>
                  <p className={styles.coverLetter}>{application.coverLetter}</p>
                </div>
              )}

              {application.notes && (
                <div className={styles.feedbackSection}>
                  <h3 className={styles.sectionTitle}>Feedback from Employer</h3>
                  <p className={styles.feedback}>{application.notes}</p>
                </div>
              )}
            </div>
          </div>

          <aside className={styles.rightColumn}>
            <div className={styles.card}>
              <h3 className={styles.sectionTitle}>Timeline</h3>
              <div className={styles.timeline}>
                {application.statusHistory && application.statusHistory.length > 0 ? (
                  application.statusHistory.map((history, idx) => (
                    <div key={idx} className={styles.timelineItem}>
                      <div className={styles.timelineDot}></div>
                      <div className={styles.timelineContent}>
                        <p className={styles.timelineStatus}>{history.status}</p>
                        <p className={styles.timelineDate}>{new Date(history.changedAt).toLocaleDateString()}</p>
                        {history.changedBy && <p className={styles.timelineBy}>By: {history.changedBy}</p>}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={styles.noTimeline}>No timeline data available</p>
                )}
              </div>
            </div>

            <div className={styles.card}>
              <h3 className={styles.sectionTitle}>Actions</h3>
              <Button onClick={() => router.push(`/jobs/${application.vacancyId}`)} className={styles.actionButton}>
                View Job Posting
              </Button>
              {application.cvFileUrl && (
                <a
                  href={application.cvFileUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.actionLink}
                >
                  Download CV
                </a>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}