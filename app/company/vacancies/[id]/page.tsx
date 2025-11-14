"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ApiClient } from "@/lib/api-client"
import type { VacancyDto } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import styles from "./company-vacancy-detail.module.css" // New CSS module

export default function CompanyVacancyDetailPage() {
  const router = useRouter()
  const params = useParams()
  const vacancyId = params.id as string
  const [vacancy, setVacancy] = useState<VacancyDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const { user, isLoading: authLoading } = useAuth()
  const api = ApiClient.getInstance()

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== "COMPANY") {
        router.push("/")
      } else {
        fetchVacancyDetails()
      }
    }
  }, [vacancyId, user, authLoading])

  const fetchVacancyDetails = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await api.get<VacancyDto>(`/vacancies/${vacancyId}`)
      setVacancy(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch vacancy details")
      console.error("Error fetching vacancy details:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: "#4caf50",
      PENDING_APPROVAL: "#ff9800",
      DRAFT: "#757575",
      REJECTED: "#f44336",
      CLOSED: "#9e9e9e",
    }
    return colors[status] || "#757575"
  }

  if (authLoading || isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner />
      </div>
    )
  }

  if (error || !vacancy) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.error}>{error || "Vacancy not found"}</p>
        <Button onClick={() => router.back()} variant="outline">
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Top App Bar */}
      <div className={styles.topAppBar}>
        <div className={styles.backArrowWrapper} onClick={() => router.back()}>
          <span className="material-symbols-outlined">arrow_back</span>
        </div>
        <h2 className={styles.appBarTitle}>My Vacancies &gt; {vacancy.title}</h2>
      </div>

      <main className={styles.mainContentWrapper}>
        <div className={styles.mainContent}>
          <div className={styles.leftColumn}>
            <div className={styles.headerSection}>
              <h1 className={styles.vacancyTitle}>{vacancy.title}</h1>
              <div className={styles.vacancyMeta}>
                <span className={styles.companyName}>{vacancy.company?.companyName}</span>
                <span className={styles.location}>{vacancy.city}</span>
                <span className={styles.statusBadge} style={{ backgroundColor: getStatusColor(vacancy.status) }}>
                  {vacancy.status.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Description</h2>
              <p className={styles.sectionContent}>{vacancy.description}</p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Requirements</h2>
              <ul className={styles.listContent}>
                {vacancy.requirements.split('\n').map((item, index) => item.trim() && <li key={index}>{item.trim()}</li>)}
              </ul>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Responsibilities</h2>
              <ul className={styles.listContent}>
                {vacancy.responsibilities.split('\n').map((item, index) => item.trim() && <li key={index}>{item.trim()}</li>)}
              </ul>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Skills</h2>
              <div className={styles.skillsList}>
                {vacancy.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className={styles.skillBadge}>{skill}</Badge>
                ))}
              </div>
            </section>
          </div>

          <aside className={styles.rightColumn}>
            <div className={styles.actionCard}>
              <Link href={`/company/vacancies/${vacancy.id}/edit`} className={styles.editButton}>
                Edit Vacancy
              </Link>
              <Link href={`/company/applications?vacancyId=${vacancy.id}`} className={styles.viewApplicationsButton}>
                View Applications ({vacancy.applicationCount})
              </Link>
            </div>

            <div className={styles.infoCard}>
              <h3 className={styles.cardTitle}>Vacancy Overview</h3>

              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Salary</span>
                  <span className={styles.infoValue}>
                    {vacancy.salaryMin && vacancy.salaryMax ? `$${vacancy.salaryMin.toLocaleString()} - $${vacancy.salaryMax.toLocaleString()}` : 'Salary not specified'}
                  </span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Employment Type</span>
                  <span className={styles.infoValue}>
                    <Badge>{vacancy.employmentType.replace(/_/g, " ")}</Badge>
                  </span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Experience Level</span>
                  <span className={styles.infoValue}>
                    <Badge variant="secondary">{vacancy.experienceLevel.replace(/_/g, " ")}</Badge>
                  </span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Location</span>
                  <span className={styles.infoValue}>
                    {vacancy.city} {vacancy.isRemote && "(Remote)"}
                  </span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Posted</span>
                  <span className={styles.infoValue}>{new Date(vacancy.createdAt).toLocaleDateString()}</span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Deadline</span>
                  <span className={styles.infoValue}>{new Date(vacancy.deadline).toLocaleDateString()}</span>
                </div>
              </div>
            </div>


          </aside>
        </div>
      </main>
    </div>
  )
}