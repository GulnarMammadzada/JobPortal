"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ApiClient } from "@/lib/api-client"
import type { VacancyDto, ApplicationDto } from "@/lib/types"
import Link from "next/link"
import styles from "./dashboard.module.css"

export default function CompanyDashboard() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const api = ApiClient.getInstance()

  const [vacancies, setVacancies] = useState<VacancyDto[]>([])
  const [recentApplications, setRecentApplications] = useState<ApplicationDto[]>([])
  const [stats, setStats] = useState({
    totalVacancies: 0,
    activeVacancies: 0,
    pendingVacancies: 0,
    totalApplications: 0,
    newApplications: 0,
    totalViews: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== "COMPANY") {
        router.push("/")
      } else {
        fetchDashboardData()
      }
    }
  }, [user, authLoading])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)

      // Fetch company vacancies
      const vacanciesResponse = await api.get<any>("/vacancies/my?page=0&size=5")
      const vacanciesData = vacanciesResponse.content || []
      setVacancies(vacanciesData)

      // Calculate stats
      const totalVacancies = vacanciesData.length
      const activeVacancies = vacanciesData.filter((v: VacancyDto) => v.status === "ACTIVE").length
      const pendingVacancies = vacanciesData.filter((v: VacancyDto) => v.status === "PENDING_APPROVAL").length
      const totalApplications = vacanciesData.reduce((sum: number, v: VacancyDto) => sum + (v.applicationCount || 0), 0)
      const totalViews = vacanciesData.reduce((sum: number, v: VacancyDto) => sum + (v.viewCount || 0), 0)

      setStats({
        totalVacancies,
        activeVacancies,
        pendingVacancies,
        totalApplications,
        newApplications: 0, // Would need separate endpoint
        totalViews,
      })

      // Fetch recent applications (from first vacancy)
      if (vacanciesData.length > 0) {
        const firstVacancy = vacanciesData[0]
        const appsResponse = await api.get<any>(`/applications/vacancy/${firstVacancy.id}?page=0&size=5`)
        setRecentApplications(appsResponse.content || [])
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
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

  const getMatchColor = (score: number) => {
    if (score >= 80) return "#4caf50"
    if (score >= 60) return "#ff9800"
    return "#f44336"
  }

  if (authLoading || isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    )
  }

  const companyName = user?.company?.companyName || "Company"
  const isVerified = user?.company?.isVerified

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.title}>Welcome, {companyName}!</h1>
            <div className={styles.verificationStatus}>
              {isVerified ? (
                <span className={styles.verified}>✓ Verified Company</span>
              ) : (
                <span className={styles.pending}>⏳ Verification Pending</span>
              )}
            </div>
          </div>
          <div className={styles.headerActions}>
            <Link href="/company/vacancies/new" className={styles.btnPrimary}>
              + Create Vacancy
            </Link>
            <Link href="/company/profile" className={styles.btnSecondary}>
              Profile
            </Link>
          </div>
        </div>
      </header>

      {/* Statistics Cards */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>💼</div>
            <div>
              <div className={styles.statValue}>{stats.totalVacancies}</div>
              <div className={styles.statLabel}>Total Vacancies</div>
              <div className={styles.statDetail}>{stats.activeVacancies} active, {stats.pendingVacancies} pending</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📨</div>
            <div>
              <div className={styles.statValue}>{stats.totalApplications}</div>
              <div className={styles.statLabel}>Total Applications</div>
              <div className={styles.statDetail}>Across all vacancies</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🆕</div>
            <div>
              <div className={styles.statValue}>{stats.newApplications}</div>
              <div className={styles.statLabel}>New Applications</div>
              <div className={styles.statDetail}>Requires review</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>👁️</div>
            <div>
              <div className={styles.statValue}>{stats.totalViews}</div>
              <div className={styles.statLabel}>Total Views</div>
              <div className={styles.statDetail}>This month</div>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.mainContent}>
        {/* My Vacancies */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>My Vacancies</h2>
            <Link href="/company/vacancies" className={styles.viewAllLink}>View All</Link>
          </div>

          {vacancies.length === 0 ? (
            <div className={styles.emptyState}>
              <p>You haven't posted any jobs yet</p>
              <Link href="/company/vacancies/new" className={styles.btnPrimary}>Create First Vacancy</Link>
            </div>
          ) : (
            <div className={styles.vacanciesList}>
              {vacancies.map((vacancy) => (
                <div key={vacancy.id} className={styles.vacancyCard}>
                  <div className={styles.vacHeader}>
                    <div>
                      <h3 className={styles.vacTitle}>{vacancy.title}</h3>
                      <p className={styles.vacDetails}>
                        {vacancy.city} • {vacancy.employmentType.replace("_", " ")} • Posted {new Date(vacancy.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={styles.statusBadge}
                      style={{ backgroundColor: getStatusColor(vacancy.status) }}
                    >
                      {vacancy.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className={styles.vacStats}>
                    <span>👁️ {vacancy.viewCount} views</span>
                    <span>📨 {vacancy.applicationCount} applications</span>
                  </div>
                  <div className={styles.vacActions}>
                    <Link href={`/jobs/${vacancy.id}`} className={styles.vacLink}>View</Link>
                    <Link href={`/company/vacancies/${vacancy.id}/applications`} className={styles.vacLink}>
                      Applications
                    </Link>
                    <Link href={`/company/vacancies/${vacancy.id}/edit`} className={styles.vacLink}>Edit</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Applications */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Applications</h2>
            <Link href="/company/applications" className={styles.viewAllLink}>View All</Link>
          </div>

          {recentApplications.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No applications yet</p>
            </div>
          ) : (
            <div className={styles.applicationsList}>
              {recentApplications.map((app) => (
                <div key={app.id} className={styles.applicationCard}>
                  <div className={styles.appHeader}>
                    <div>
                      <h3 className={styles.appName}>{app.fullName}</h3>
                      <p className={styles.appEmail}>{app.email}</p>
                      <p className={styles.appDate}>Applied {new Date(app.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div
                      className={styles.matchScore}
                      style={{ backgroundColor: getMatchColor(app.matchScore) }}
                    >
                      {app.matchScore}% Match
                    </div>
                  </div>
                  <div className={styles.appFooter}>
                    <span
                      className={styles.statusBadge}
                      style={{ backgroundColor: getAppStatusColor(app.status) }}
                    >
                      {app.status.replace(/_/g, " ")}
                    </span>
                    <div className={styles.appActions}>
                      <a href={app.cvFileUrl} target="_blank" className={styles.appLink}>View CV</a>
                      <Link href={`/company/applications/${app.id}`} className={styles.appLink}>
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className={styles.quickActions}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
          <div className={styles.actionsGrid}>
            <Link href="/company/vacancies/new" className={styles.actionCard}>
              <div className={styles.actionIcon}>➕</div>
              <h3 className={styles.actionTitle}>Create Vacancy</h3>
              <p className={styles.actionDesc}>Post a new job opening</p>
            </Link>
            <Link href="/company/ai-generator" className={styles.actionCard}>
              <div className={styles.actionIcon}>🤖</div>
              <h3 className={styles.actionTitle}>AI Job Generator</h3>
              <p className={styles.actionDesc}>Generate job descriptions</p>
            </Link>
            <Link href="/company/applications" className={styles.actionCard}>
              <div className={styles.actionIcon}>📋</div>
              <h3 className={styles.actionTitle}>All Applications</h3>
              <p className={styles.actionDesc}>Manage candidates</p>
            </Link>
            <Link href="/company/profile" className={styles.actionCard}>
              <div className={styles.actionIcon}>🏢</div>
              <h3 className={styles.actionTitle}>Company Profile</h3>
              <p className={styles.actionDesc}>Update your info</p>
            </Link>
          </div>
        </section>
      </div>

      {/* Bottom Navigation */}
      <nav className={styles.bottomNav}>
        <Link href="/company/dashboard" className={styles.navItem + " " + styles.navItemActive}>
          <span className={styles.navIcon}>🏠</span>
          <span>Dashboard</span>
        </Link>
        <Link href="/company/vacancies" className={styles.navItem}>
          <span className={styles.navIcon}>💼</span>
          <span>Vacancies</span>
        </Link>
        <Link href="/company/applications" className={styles.navItem}>
          <span className={styles.navIcon}>📨</span>
          <span>Applications</span>
        </Link>
        <Link href="/company/profile" className={styles.navItem}>
          <span className={styles.navIcon}>🏢</span>
          <span>Profile</span>
        </Link>
      </nav>
    </div>
  )
}
