"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation" // Import useSearchParams
import { useAuth } from "@/lib/auth-context"
import { ApiClient } from "@/lib/api-client"
import type { ApplicationDto } from "@/lib/types"
import Link from "next/link"
import styles from "./applications.module.css" // Assuming a new CSS module for applications

export default function CompanyApplicationsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams() // Use useSearchParams hook
  const vacancyId = searchParams.get("vacancyId") // Get vacancyId from query params
  const api = ApiClient.getInstance()

  const [applications, setApplications] = useState<ApplicationDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCompanyApplications = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      let fetchedApplications: ApplicationDto[] = []

      if (vacancyId) {
        // Fetch applications for a specific vacancy
        const appsResponse = await api.get<any>(`/applications/vacancy/${vacancyId}?page=0&size=100`)
        fetchedApplications = (appsResponse.content || []).map((app: ApplicationDto) => ({
          ...app,
          vacancyTitle: app.vacancyTitle || "N/A", // Ensure vacancyTitle is present
        }))
      } else {
        // Fetch all applications for the company (existing logic)
        const allVacanciesResponse = await api.get<any>("/vacancies/my?page=0&size=100")
        const allVacancies = allVacanciesResponse.content || []

        let allApplications: ApplicationDto[] = []

        for (const vacancy of allVacancies) {
          const appsResponse = await api.get<any>(`/applications/vacancy/${vacancy.id}?page=0&size=100`)
          const appsWithVacancyTitle = (appsResponse.content || []).map((app: ApplicationDto) => ({
            ...app,
            vacancyTitle: vacancy.title,
          }))
          allApplications = allApplications.concat(appsWithVacancyTitle)
        }
        fetchedApplications = allApplications
      }

      setApplications(fetchedApplications)
    } catch (err) {
      console.error("Failed to fetch company applications:", err)
      setError("Failed to load applications. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [api, vacancyId]) // Add api and vacancyId to useCallback dependencies

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== "COMPANY") {
        router.push("/")
      } else {
        fetchCompanyApplications()
      }
    }
  }, [user, authLoading, fetchCompanyApplications]) // Add fetchCompanyApplications to useEffect dependencies

  if (authLoading || isLoading) {
    return <div className={styles.loading}>Loading applications...</div>
  }

  if (error) {
    return <div className={styles.error}>{error}</div>
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>My Applications</h1>
      {applications.length === 0 ? (
        <div className={styles.emptyState}>
          <p>You have not received any applications yet.</p>
        </div>
      ) : (
        <div className={styles.applicationsList}>
          {applications.map((app) => (
            <div key={app.id} className={styles.applicationCard}>
              <h3 className={styles.appName}>{app.fullName}</h3>
              <p className={styles.appDetails}>Applied for: {app.vacancyTitle}</p> {/* Assuming vacancyTitle is available */}
              <p className={styles.appDate}>Applied on: {new Date(app.createdAt).toLocaleDateString()}</p>
              <span className={styles.statusBadge} style={{ backgroundColor: getAppStatusColor(app.status) }}>
                {app.status.replace(/_/g, " ")}
              </span>
              <Link href={`/company/applications/${app.id}`} className={styles.viewDetailsLink}>View Details</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Reusing getAppStatusColor from dashboard for consistency
const getAppStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    PENDING: "#ff9800",
    REVIEWED: "#2196f3",
    SHORTLISTED: "#9c27b0",
    INTERVIEW_SCHEDULED: "#ff5722",
    INTERVIEWED: "#00bcd4",
    OFFER_SENT: "#ffeb3b",
    ACCEPTED: "#4caf50",
    REJECTED: "#f44336",
  }
  return colors[status] || "#757575"
}
