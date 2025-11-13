"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ApiClient } from "@/lib/api-client"
import type { ApplicationDto, PageResponse } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Header } from "@/components/jobs/header"
import styles from "./my-applications.module.css"

type ApplicationStatus = "PENDING" | "REVIEWED" | "SHORTLISTED" | "INTERVIEW_SCHEDULED" | "INTERVIEWED" | "OFFER_SENT" | "ACCEPTED" | "REJECTED"

export default function MyApplicationsPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<ApplicationDto[]>([])
  const [allApplications, setAllApplications] = useState<ApplicationDto[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | "ALL">("ALL")
  const api = ApiClient.getInstance()

  useEffect(() => {
    fetchApplications()
  }, [selectedStatus])

  useEffect(() => {
    // Calculate stats from allApplications
    if (allApplications.length > 0) {
      const calculatedStats = {
        totalApplications: allApplications.length,
        pendingCount: allApplications.filter(a => a.status === "PENDING").length,
        reviewedCount: allApplications.filter(a => a.status === "REVIEWED").length,
        acceptedCount: allApplications.filter(a => a.status === "ACCEPTED").length,
        rejectedCount: allApplications.filter(a => a.status === "REJECTED").length,
        statusCounts: {
          SHORTLISTED: allApplications.filter(a => a.status === "SHORTLISTED").length,
          INTERVIEW_SCHEDULED: allApplications.filter(a => a.status === "INTERVIEW_SCHEDULED").length,
          INTERVIEWED: allApplications.filter(a => a.status === "INTERVIEWED").length,
          OFFER_SENT: allApplications.filter(a => a.status === "OFFER_SENT").length,
        }
      }
      setStats(calculatedStats)
    }
  }, [allApplications])

  const fetchApplications = async () => {
    setIsLoading(true)
    setError("")

    try {
      let endpoint = `/applications/my?page=0&size=50`
      if (selectedStatus !== "ALL") {
        endpoint = `/applications/my/by-status?status=${selectedStatus}&page=0&size=50`
      }
      const response = await api.get<PageResponse<ApplicationDto>>(endpoint)
      setApplications(response.content || [])

      // Keep all applications for stats
      if (selectedStatus === "ALL") {
        setAllApplications(response.content || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch applications")
      console.error("Error fetching applications:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "REVIEWED":
        return "bg-blue-100 text-blue-800"
      case "SHORTLISTED":
        return "bg-purple-100 text-purple-800"
      case "INTERVIEW_SCHEDULED":
        return "bg-indigo-100 text-indigo-800"
      case "INTERVIEWED":
        return "bg-teal-100 text-teal-800"
      case "OFFER_SENT":
        return "bg-cyan-100 text-cyan-800"
      case "ACCEPTED":
        return "bg-green-100 text-green-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredApplications = applications

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>My Applications</h1>
          <p className={styles.subtitle}>Track your job applications and their status</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {isLoading ? (
          <div className={styles.loadingContainer}>
            <Spinner />
          </div>
        ) : (
          <>
            {filteredApplications.length === 0 ? (
              <div className={styles.noResults}>
                <p>No applications found for status: {selectedStatus}</p>
                <Button onClick={() => router.push("/jobs")} className={styles.exploreButton}>
                  Explore Jobs
                </Button>
              </div>
            ) : (
          <>
            {stats && (
              <div className={styles.stats}>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Total</span>
                  <span className={styles.statValue}>{stats.totalApplications || 0}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Pending</span>
                  <span className={styles.statValue}>{stats.pendingCount || 0}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Reviewed</span>
                  <span className={styles.statValue}>{stats.reviewedCount || 0}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Shortlisted</span>
                  <span className={styles.statValue}>{stats.statusCounts?.SHORTLISTED || 0}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Interview Scheduled</span>
                  <span className={styles.statValue}>{stats.statusCounts?.INTERVIEW_SCHEDULED || 0}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Interviewed</span>
                  <span className={styles.statValue}>{stats.statusCounts?.INTERVIEWED || 0}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Offer Sent</span>
                  <span className={styles.statValue}>{stats.statusCounts?.OFFER_SENT || 0}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Accepted</span>
                  <span className={styles.statValue}>{stats.acceptedCount || 0}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Rejected</span>
                  <span className={styles.statValue}>{stats.rejectedCount || 0}</span>
                </div>
              </div>
            )}

            <div className={styles.tabsContainer}>
              <div className={styles.tabButtons}>
                <button
                  onClick={() => setSelectedStatus("ALL")}
                  className={selectedStatus === "ALL" ? styles.tabButtonActive : styles.tabButton}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedStatus("PENDING")}
                  className={selectedStatus === "PENDING" ? styles.tabButtonActive : styles.tabButton}
                >
                  Pending
                </button>
                <button
                  onClick={() => setSelectedStatus("REVIEWED")}
                  className={selectedStatus === "REVIEWED" ? styles.tabButtonActive : styles.tabButton}
                >
                  Reviewed
                </button>
                <button
                  onClick={() => setSelectedStatus("SHORTLISTED")}
                  className={selectedStatus === "SHORTLISTED" ? styles.tabButtonActive : styles.tabButton}
                >
                  Shortlisted
                </button>
                <button
                  onClick={() => setSelectedStatus("INTERVIEW_SCHEDULED")}
                  className={selectedStatus === "INTERVIEW_SCHEDULED" ? styles.tabButtonActive : styles.tabButton}
                >
                  Interview Scheduled
                </button>
                <button
                  onClick={() => setSelectedStatus("INTERVIEWED")}
                  className={selectedStatus === "INTERVIEWED" ? styles.tabButtonActive : styles.tabButton}
                >
                  Interviewed
                </button>
                <button
                  onClick={() => setSelectedStatus("OFFER_SENT")}
                  className={selectedStatus === "OFFER_SENT" ? styles.tabButtonActive : styles.tabButton}
                >
                  Offer Sent
                </button>
                <button
                  onClick={() => setSelectedStatus("ACCEPTED")}
                  className={selectedStatus === "ACCEPTED" ? styles.tabButtonActive : styles.tabButton}
                >
                  Accepted
                </button>
                <button
                  onClick={() => setSelectedStatus("REJECTED")}
                  className={selectedStatus === "REJECTED" ? styles.tabButtonActive : styles.tabButton}
                >
                  Rejected
                </button>
              </div>

              <div className={styles.applicationsListContainer}>
                <div className={styles.applicationsList}>
                  {filteredApplications.map((application) => (
                    <div key={application.id} className={styles.applicationCard}>
                      <div className={styles.cardHeader}>
                        <div className={styles.cardTitle}>
                          <h3 className={styles.jobTitle}>{application.vacancyTitle}</h3>
                          <Badge className={getStatusColor(application.status)}>{application.status}</Badge>
                        </div>
                        <div className={styles.cardMeta}>
                          <span className={styles.matchScore}>{application.matchScore}% Match</span>
                        </div>
                      </div>

                      <div className={styles.cardContent}>
                        <div className={styles.infoGrid}>
                          <div className={styles.infoItem}>
                            <span className={styles.label}>Applied</span>
                            <span className={styles.value}>{new Date(application.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className={styles.infoItem}>
                            <span className={styles.label}>Experience</span>
                            <span className={styles.value}>{application.experienceYears} years</span>
                          </div>
                          {application.reviewedAt && (
                            <div className={styles.infoItem}>
                              <span className={styles.label}>Reviewed</span>
                              <span className={styles.value}>
                                {new Date(application.reviewedAt).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {application.notes && (
                          <div className={styles.notes}>
                            <span className={styles.notesLabel}>Feedback:</span>
                            <p className={styles.notesText}>{application.notes}</p>
                          </div>
                        )}
                      </div>

                      <div className={styles.cardFooter}>
                        <Button
                          onClick={() => router.push(`/my-applications/${application.id}`)}
                          variant="outline"
                          size="sm"
                        >
                          View Details
                        </Button>
                        <Button onClick={() => router.push(`/jobs/${application.vacancyId}`)} variant="ghost" size="sm">
                          View Job
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
            )}
          </>
        )}
      </div>
    </div>
  )
}