"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ApiClient } from "@/lib/api-client"
import type { ApplicationDto, VacancyRecommendationDto, ApplicationStatisticsDto } from "@/lib/types"
import Link from "next/link"
import styles from "./dashboard.module.css"

export default function JobSeekerDashboard() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const api = ApiClient.getInstance()

  const [stats, setStats] = useState<ApplicationStatisticsDto | null>(null)
  const [recentApplications, setRecentApplications] = useState<ApplicationDto[]>([])
  const [recommendations, setRecommendations] = useState<VacancyRecommendationDto[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== "JOB_SEEKER") {
        router.push("/auth/login")
      } else {
        fetchDashboardData()
      }
    }
  }, [user, authLoading, router])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)

      // Fetch application statistics
      const statsData = await api.get<ApplicationStatisticsDto>("/applications/my/statistics")
      setStats(statsData)

      // Fetch recent applications
      const appsResponse = await api.get<any>("/applications/my?page=0&size=5")
      setRecentApplications(appsResponse.content || [])

      // Fetch recommendations
      const recsResponse = await api.get<VacancyRecommendationDto[]>("/vacancies/recommendations?limit=6")
      setRecommendations(recsResponse || [])
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
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

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.title}>Welcome back, {user?.fullName}!</h1>
            <p className={styles.subtitle}>Track your job search progress</p>
          </div>
          <div className={styles.headerActions}>
            <Link href="/jobs" className={styles.btnPrimary}>Browse Jobs</Link>
            <Link href="/jobseeker/profile" className={styles.btnSecondary}>Profile</Link>
          </div>
        </div>
      </header>

      {/* Statistics Cards */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📨</div>
            <div>
              <div className={styles.statValue}>{stats?.totalApplications || 0}</div>
              <div className={styles.statLabel}>Applications Submitted</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>⏳</div>
            <div>
              <div className={styles.statValue}>{stats?.pending || 0}</div>
              <div className={styles.statLabel}>Pending Reviews</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>⭐</div>
            <div>
              <div className={styles.statValue}>{stats?.shortlisted || 0}</div>
              <div className={styles.statLabel}>Shortlisted</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>✅</div>
            <div>
              <div className={styles.statValue}>{stats?.accepted || 0}</div>
              <div className={styles.statLabel}>Accepted</div>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.mainContent}>
        {/* Recent Applications */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Applications</h2>
            <Link href="/my-applications" className={styles.viewAllLink}>View All</Link>
          </div>

          {recentApplications.length === 0 ? (
            <div className={styles.emptyState}>
              <p>You haven't applied to any jobs yet</p>
              <Link href="/jobs" className={styles.btnPrimary}>Browse Jobs</Link>
            </div>
          ) : (
            <div className={styles.applicationsList}>
              {recentApplications.map((app) => (
                <div key={app.id} className={styles.applicationCard}>
                  <div className={styles.appHeader}>
                    <div>
                      <h3 className={styles.appTitle}>{app.vacancyTitle}</h3>
                      <p className={styles.appDate}>Applied {new Date(app.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div
                      className={styles.matchScore}
                      style={{ backgroundColor: getMatchColor(app.matchScore) }}
                    >
                      {app.matchScore}%
                    </div>
                  </div>
                  <div className={styles.appFooter}>
                    <span
                      className={styles.statusBadge}
                      style={{ backgroundColor: getStatusColor(app.status) }}
                    >
                      {app.status.replace(/_/g, " ")}
                    </span>
                    <Link href={`/my-applications/${app.id}`} className={styles.viewLink}>
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recommendations */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>🎯 Recommended for You</h2>
            <Link href="/recommendations" className={styles.viewAllLink}>View All</Link>
          </div>

          {recommendations.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Complete your profile to get personalized recommendations</p>
              <Link href="/jobseeker/profile" className={styles.btnPrimary}>Complete Profile</Link>
            </div>
          ) : (
            <div className={styles.jobsGrid}>
              {recommendations.map((job) => (
                <Link href={`/jobs/${job.id}`} key={job.id} className={styles.jobCard}>
                  <div className={styles.jobHeader}>
                    <h3 className={styles.jobTitle}>{job.title}</h3>
                    <div
                      className={styles.matchScore}
                      style={{ backgroundColor: getMatchColor(job.matchScore) }}
                    >
                      {job.matchScore}%
                    </div>
                  </div>
                  <p className={styles.jobCompany}>{job.company?.companyName}</p>
                  <div className={styles.jobDetails}>
                    <span>📍 {job.city}</span>
                    <span>💰 {job.salaryMin}-{job.salaryMax} {job.salaryCurrency}</span>
                  </div>
                  <div className={styles.jobSkills}>
                    {job.matchedSkills?.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className={styles.skillTag}>{skill}</span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className={styles.quickActions}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
          <div className={styles.actionsGrid}>
            <Link href="/companies" className={styles.actionCard}>
              <div className={styles.actionIcon}>🏢</div>
              <h3 className={styles.actionTitle}>Browse Companies</h3>
              <p className={styles.actionDesc}>Explore companies and reviews</p>
            </Link>
            <Link href="/jobseeker/cv-analysis" className={styles.actionCard}>
              <div className={styles.actionIcon}>📄</div>
              <h3 className={styles.actionTitle}>Analyze CV</h3>
              <p className={styles.actionDesc}>Get AI feedback on your resume</p>
            </Link>
            <Link href="/jobseeker/chat" className={styles.actionCard}>
              <div className={styles.actionIcon}>💬</div>
              <h3 className={styles.actionTitle}>AI Assistant</h3>
              <p className={styles.actionDesc}>Chat with our job search bot</p>
            </Link>
            <Link href="/saved-jobs" className={styles.actionCard}>
              <div className={styles.actionIcon}>❤️</div>
              <h3 className={styles.actionTitle}>Saved Jobs</h3>
              <p className={styles.actionDesc}>View your saved positions</p>
            </Link>
            <Link href="/my-reviews" className={styles.actionCard}>
              <div className={styles.actionIcon}>⭐</div>
              <h3 className={styles.actionTitle}>My Reviews</h3>
              <p className={styles.actionDesc}>Manage company reviews</p>
            </Link>
          </div>
        </section>
      </div>

      {/* Navigation */}
      <nav className={styles.bottomNav}>
        <Link href="/jobseeker/dashboard" className={styles.navItem + " " + styles.navItemActive}>
          <span className={styles.navIcon}>🏠</span>
          <span>Dashboard</span>
        </Link>
        <Link href="/jobs" className={styles.navItem}>
          <span className={styles.navIcon}>🔍</span>
          <span>Browse</span>
        </Link>
        <Link href="/my-applications" className={styles.navItem}>
          <span className={styles.navIcon}>📨</span>
          <span>Applications</span>
        </Link>
        <Link href="/jobseeker/profile" className={styles.navItem}>
          <span className={styles.navIcon}>👤</span>
          <span>Profile</span>
        </Link>
      </nav>
    </div>
  )
}
