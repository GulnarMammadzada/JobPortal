"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ApiClient } from "@/lib/api-client"
import type { CompanyDto, VacancyDto, AdminStatisticsDto } from "@/lib/types"
import Link from "next/link"
import styles from "./dashboard.module.css"

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const api = ApiClient.getInstance()

  const [stats, setStats] = useState<AdminStatisticsDto | null>(null)
  const [pendingCompanies, setPendingCompanies] = useState<CompanyDto[]>([])
  const [pendingVacancies, setPendingVacancies] = useState<VacancyDto[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== "ADMIN") {
        router.push("/auth/login")
      } else {
        fetchDashboardData()
      }
    }
  }, [user, authLoading, router])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)

      // Fetch admin statistics
      const statsData = await api.get<AdminStatisticsDto>("/admin/statistics")
      setStats(statsData)

      // Fetch pending companies
      const companiesResponse = await api.get<any>("/admin/companies/pending?page=0&size=5")
      setPendingCompanies(companiesResponse.content || [])

      // Fetch pending vacancies
      const vacanciesResponse = await api.get<any>("/admin/vacancies/pending?page=0&size=5")
      setPendingVacancies(vacanciesResponse.content || [])
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveCompany = async (id: number) => {
    try {
      await api.put(`/admin/companies/${id}/approve`)
      fetchDashboardData()
    } catch (error) {
      console.error("Failed to approve company:", error)
    }
  }

  const handleRejectCompany = async (id: number) => {
    if (confirm("Are you sure you want to reject this company?")) {
      try {
        await api.put(`/admin/companies/${id}/reject`)
        fetchDashboardData()
      } catch (error) {
        console.error("Failed to reject company:", error)
      }
    }
  }

  const handleApproveVacancy = async (id: number) => {
    try {
      await api.put(`/admin/vacancies/${id}/approve`)
      fetchDashboardData()
    } catch (error) {
      console.error("Failed to approve vacancy:", error)
    }
  }

  const handleRejectVacancy = async (id: number) => {
    if (confirm("Are you sure you want to reject this vacancy?")) {
      try {
        await api.put(`/admin/vacancies/${id}/reject`)
        fetchDashboardData()
      } catch (error) {
        console.error("Failed to reject vacancy:", error)
      }
    }
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
            <h1 className={styles.title}>Admin Dashboard</h1>
            <p className={styles.subtitle}>System Overview & Management</p>
          </div>
          <div className={styles.headerActions}>
            <Link href="/admin/users" className={styles.btnSecondary}>
              Manage Users
            </Link>
          </div>
        </div>
      </header>

      {/* Statistics Cards */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>👥</div>
            <div>
              <div className={styles.statValue}>{stats?.totalUsers || 0}</div>
              <div className={styles.statLabel}>Total Users</div>
              <div className={styles.statDetail}>
                {stats?.totalJobSeekers} job seekers, {stats?.totalCompanies} companies
              </div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🏢</div>
            <div>
              <div className={styles.statValue}>{stats?.totalCompanies || 0}</div>
              <div className={styles.statLabel}>Companies</div>
              <div className={styles.statDetail}>
                {stats?.activeCompanies} active, {stats?.pendingCompanies} pending
              </div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>💼</div>
            <div>
              <div className={styles.statValue}>{pendingVacancies.length}</div>
              <div className={styles.statLabel}>Pending Vacancies</div>
              <div className={styles.statDetail}>Awaiting approval</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>⏳</div>
            <div>
              <div className={styles.statValue}>{pendingCompanies.length}</div>
              <div className={styles.statLabel}>Pending Companies</div>
              <div className={styles.statDetail}>Awaiting verification</div>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.mainContent}>
        {/* Pending Companies Table */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>📋 Pending Company Approvals</h2>
            <Link href="/admin/companies" className={styles.viewAllLink}>View All →</Link>
          </div>

          {pendingCompanies.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🏢</div>
              <p className={styles.emptyText}>No pending company approvals</p>
              <p className={styles.emptySubtext}>All companies have been reviewed</p>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Company Name</th>
                    <th>Industry</th>
                    <th>Size</th>
                    <th>Location</th>
                    <th>Website</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingCompanies.map((company) => (
                    <tr key={company.id}>
                      <td>
                        <div className={styles.companyNameCell}>
                          <strong>{company.companyName}</strong>
                        </div>
                      </td>
                      <td>
                        <span className={styles.badge}>{company.industry}</span>
                      </td>
                      <td>{company.companySize}</td>
                      <td>{company.city}</td>
                      <td>
                        {company.website ? (
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.linkButton}
                          >
                            🔗 Visit
                          </a>
                        ) : (
                          <span className={styles.textMuted}>—</span>
                        )}
                      </td>
                      <td>{new Date(company.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button
                            onClick={() => handleApproveCompany(company.id)}
                            className={styles.approveBtn}
                            title="Approve"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => handleRejectCompany(company.id)}
                            className={styles.rejectBtn}
                            title="Reject"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Pending Vacancies Table */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>💼 Pending Vacancy Approvals</h2>
            <Link href="/admin/vacancies/all" className={styles.viewAllLink}>View All →</Link>
          </div>

          {pendingVacancies.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>💼</div>
              <p className={styles.emptyText}>No pending vacancy approvals</p>
              <p className={styles.emptySubtext}>All vacancies have been reviewed</p>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Level</th>
                    <th>Salary</th>
                    <th>Posted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingVacancies.map((vacancy) => (
                    <tr key={vacancy.id}>
                      <td>
                        <div className={styles.jobTitleCell}>
                          <strong>{vacancy.title}</strong>
                        </div>
                      </td>
                      <td>{vacancy.company?.companyName || '—'}</td>
                      <td>
                        <span className={styles.locationBadge}>
                          📍 {vacancy.city}
                          {vacancy.isRemote && <span className={styles.remoteBadge}>Remote</span>}
                        </span>
                      </td>
                      <td>
                        <span className={styles.badge}>{vacancy.employmentType.replace(/_/g, ' ')}</span>
                      </td>
                      <td>
                        <span className={styles.levelBadge}>{vacancy.experienceLevel}</span>
                      </td>
                      <td className={styles.salaryCell}>
                        {vacancy.salaryMin}-{vacancy.salaryMax} {vacancy.salaryCurrency}
                      </td>
                      <td>{new Date(vacancy.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className={styles.actionButtons}>
                          <Link
                            href={`/jobs/${vacancy.id}`}
                            className={styles.viewBtn}
                            title="View Details"
                          >
                            👁
                          </Link>
                          <button
                            onClick={() => handleApproveVacancy(vacancy.id)}
                            className={styles.approveBtn}
                            title="Approve"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => handleRejectVacancy(vacancy.id)}
                            className={styles.rejectBtn}
                            title="Reject"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className={styles.quickActions}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
          <div className={styles.actionsGrid}>
            <Link href="/admin/companies" className={styles.actionCard}>
              <div className={styles.actionIcon}>🏢</div>
              <h3 className={styles.actionTitle}>Review Companies</h3>
              <p className={styles.actionDesc}>{pendingCompanies.length} pending</p>
            </Link>
            <Link href="/admin/vacancies/all" className={styles.actionCard}>
              <div className={styles.actionIcon}>💼</div>
              <h3 className={styles.actionTitle}>Review Vacancies</h3>
              <p className={styles.actionDesc}>{pendingVacancies.length} pending</p>
            </Link>
            <Link href="/admin/users" className={styles.actionCard}>
              <div className={styles.actionIcon}>👥</div>
              <h3 className={styles.actionTitle}>Manage Users</h3>
              <p className={styles.actionDesc}>View all users</p>
            </Link>
            <Link href="/" className={styles.actionCard}>
              <div className={styles.actionIcon}>📊</div>
              <h3 className={styles.actionTitle}>View Statistics</h3>
              <p className={styles.actionDesc}>System analytics</p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
