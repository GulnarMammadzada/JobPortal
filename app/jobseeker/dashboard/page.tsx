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
  const [allApplications, setAllApplications] = useState<ApplicationDto[]>([]) // New state for all applications
  const [recommendations, setRecommendations] = useState<VacancyRecommendationDto[]>([])
  const [profileCompletion, setProfileCompletion] = useState(0)
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

  const calculateProfileCompletion = (profileData: JobSeekerDto | null) => {
    if (!profileData) return 0

    const totalFields = 11 // dateOfBirth, gender, city, address, educationLevel, education, experienceYears, experience, cvUrl, linkedinUrl, githubUrl, portfolio, skills
    let completedFields = 0

    if (profileData.dateOfBirth) completedFields++
    if (profileData.gender) completedFields++
    if (profileData.city) completedFields++
    if (profileData.address) completedFields++
    if (profileData.educationLevel) completedFields++
    if (profileData.education) completedFields++
    if (profileData.experienceYears && profileData.experienceYears > 0) completedFields++
    if (profileData.experience) completedFields++
    if (profileData.cvFileUrl) completedFields++
    if (profileData.linkedinUrl) completedFields++
    if (profileData.githubUrl) completedFields++
    if (profileData.portfolio) completedFields++
    if (profileData.skills && profileData.skills.length > 0) completedFields++

    return Math.round((completedFields / totalFields) * 100)
  }

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)

      // Fetch all applications for client-side statistics
      const allAppsResponse = await api.get<PageResponse<ApplicationDto>>("/applications/my?page=0&size=1000")
      const fetchedAllApplications = allAppsResponse.content || []
      setAllApplications(fetchedAllApplications)

      // Calculate stats from fetched applications
      const calculatedStats = calculateStatsFromApplications(fetchedAllApplications)
      setStats(calculatedStats)

      // Fetch recent applications (can be a subset of allApplications)
      setRecentApplications(fetchedAllApplications.slice(0, 5))

      // Fetch recommendations
      const recsResponse = await api.get<VacancyRecommendationDto[]>("/vacancies/recommendations?limit=6")
      setRecommendations(recsResponse || [])

      // Fetch job seeker profile for completion
      const profileData = await api.get<JobSeekerDto>("/job-seekers/me")
      setProfileCompletion(calculateProfileCompletion(profileData))

    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStatsFromApplications = (applications: ApplicationDto[]): ApplicationStatisticsDto => {
    const stats: ApplicationStatisticsDto = {
      totalApplications: applications.length,
      pending: 0,
      reviewed: 0,
      shortlisted: 0,
      interviewScheduled: 0,
      interviewed: 0,
      offerSent: 0,
      accepted: 0,
      rejected: 0,
    }

    applications.forEach(app => {
      switch (app.status) {
        case "PENDING":
          stats.pending++
          break
        case "REVIEWED":
          stats.reviewed++
          break
        case "SHORTLISTED":
          stats.shortlisted++
          break
        case "INTERVIEW_SCHEDULED":
          stats.interviewScheduled++
          break
        case "INTERVIEWED":
          stats.interviewed++
          break
        case "OFFER_SENT":
          stats.offerSent++
          break
        case "ACCEPTED":
          stats.accepted++
          break
        case "REJECTED":
          stats.rejected++
          break
        default:
          // Handle unknown statuses if necessary
          break
      }
    })
    return stats
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

  const getChartData = () => {
    // Ensure stats and its properties are treated as numbers, defaulting to 0
    const safeStats = {
      totalApplications: stats?.totalApplications || 0,
      pending: stats?.pending || 0,
      reviewed: stats?.reviewed || 0,
      shortlisted: stats?.shortlisted || 0,
      interviewScheduled: stats?.interviewScheduled || 0,
      interviewed: stats?.interviewed || 0,
      offerSent: stats?.offerSent || 0,
      accepted: stats?.accepted || 0,
      rejected: stats?.rejected || 0,
    }

    if (safeStats.totalApplications === 0) {
      return [
        { label: "Pending", count: 0, color: "#ff9800", percentage: 0, startPercentage: 0 },
        { label: "Reviewed", count: 0, color: "#2196f3", percentage: 0, startPercentage: 0 },
        { label: "Shortlisted", count: 0, color: "#9c27b0", percentage: 0, startPercentage: 0 },
        { label: "Interview Scheduled", count: 0, color: "#ff5722", percentage: 0, startPercentage: 0 },
        { label: "Interviewed", count: 0, color: "#00bcd4", percentage: 0, startPercentage: 0 },
        { label: "Offer Sent", count: 0, color: "#ffeb3b", percentage: 0, startPercentage: 0 },
        { label: "Accepted", count: 0, color: "#4caf50", percentage: 0, startPercentage: 0 },
        { label: "Rejected", count: 0, color: "#f44336", percentage: 0, startPercentage: 0 },
      ]
    }

    const data = [
      { label: "Pending", count: safeStats.pending, color: "#ff9800" },
      { label: "Reviewed", count: safeStats.reviewed, color: "#2196f3" },
      { label: "Shortlisted", count: safeStats.shortlisted, color: "#9c27b0" },
      { label: "Interview Scheduled", count: safeStats.interviewScheduled, color: "#ff5722" },
      { label: "Interviewed", count: safeStats.interviewed, color: "#00bcd4" },
      { label: "Offer Sent", count: safeStats.offerSent, color: "#ffeb3b" },
      { label: "Accepted", count: safeStats.accepted, color: "#4caf50" },
      { label: "Rejected", count: safeStats.rejected, color: "#f44336" },
    ]

    let totalPercentage = 0
    return data.map((item) => {
      const percentage = (item.count / safeStats.totalApplications) * 100
      const startPercentage = totalPercentage
      totalPercentage += percentage
      return {
        ...item,
        percentage: percentage,
        startPercentage: startPercentage,
      }
    })
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
            {/* Links moved to JobSeekerHeader */}
          </div>
        </div>
      </header>

      {/* Statistics Cards */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><span className="material-symbols-outlined">mail</span></div>
            <div>
              <div className={styles.statValue}>{stats?.totalApplications || 0}</div>
              <div className={styles.statLabel}>Applications Submitted</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><span className="material-symbols-outlined">pending_actions</span></div>
            <div>
              <div className={styles.statValue}>{stats?.pending || 0}</div>
              <div className={styles.statLabel}>Pending Reviews</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><span className="material-symbols-outlined">star</span></div>
            <div>
              <div className={styles.statValue}>{stats?.shortlisted || 0}</div>
              <div className={styles.statLabel}>Shortlisted</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><span className="material-symbols-outlined">check_circle</span></div>
            <div>
              <div className={styles.statValue}>{stats?.accepted || 0}</div>
              <div className={styles.statLabel}>Accepted</div>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.mainContent}>
        {/* Profile Completion */}
        <section className={styles.section + " " + styles.profileCompletionSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Profile Completion</h2>
            <Link href="/jobseeker/profile" className={styles.viewAllLink}>Complete Profile</Link>
          </div>
          <div className={styles.profileCompletionContent}>
            <div className={styles.progressBarContainer}>
              <div className={styles.progressBar} style={{ width: `${profileCompletion}%` }}></div>
            </div>
            <p className={styles.completionText}>{profileCompletion}% Complete</p>
            {profileCompletion < 100 && (
              <p className={styles.completionTip}>
                Complete your profile to get better job recommendations and increase your visibility to employers.
              </p>
            )}
          </div>
        </section>

        {/* Application Status */}
        <section className={styles.section + " " + styles.applicationStatusSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Application Status</h2>
            <Link href="/my-applications" className={styles.viewAllLink}>View All</Link>
          </div>
          <div className={styles.chartContainer}>
            {stats && (
              <div className={styles.donutChart}>
                <svg viewBox="0 0 36 36" className={styles.donut}>
                  {getChartData().map((slice, index) => (
                    <circle
                      key={index}
                      className={styles.donutSegment}
                      cx="18"
                      cy="18"
                      r="15.915494309189535"
                      fill="transparent"
                      stroke={slice.color}
                      strokeWidth="3"
                      strokeDasharray={`${slice.percentage} ${100 - slice.percentage}`}
                      strokeDashoffset={100 - slice.startPercentage}
                    ></circle>
                  ))}
                </svg>
                <div className={styles.chartCenterText}>
                  <span className={styles.chartCenterValue}>{stats.totalApplications || 0}</span>
                  <span className={styles.chartCenterLabel}>Total Apps</span>
                </div>
              </div>
            )}
            <div className={styles.chartLegend}>
              {stats && getChartData().map((slice, index) => (
                <div key={index} className={styles.legendItem}>
                  <span className={styles.legendColor} style={{ backgroundColor: slice.color }}></span>
                  <span className={styles.legendLabel}>{slice.label} ({slice.count})</span>
                </div>
              ))}
            </div>
          </div>
        </section>

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
            <h2 className={styles.sectionTitle}><span className="material-symbols-outlined">recommend</span> Recommended for You</h2>
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
          <h2 className={styles.sectionTitle}><span className="material-symbols-outlined">flash_on</span> Quick Actions</h2>
          <div className={styles.actionsGrid}>
            <Link href="/companies" className={styles.actionCard}>
              <div className={styles.actionIcon}><span className="material-symbols-outlined">business</span></div>
              <h3 className={styles.actionTitle}>Browse Companies</h3>
              <p className={styles.actionDesc}>Explore companies and reviews</p>
            </Link>
            <Link href="/jobseeker/cv-analysis" className={styles.actionCard}>
              <div className={styles.actionIcon}><span className="material-symbols-outlined">description</span></div>
              <h3 className={styles.actionTitle}>Analyze CV</h3>
              <p className={styles.actionDesc}>Get AI feedback on your resume</p>
            </Link>
            <Link href="/jobseeker/chat" className={styles.actionCard}>
              <div className={styles.actionIcon}><span className="material-symbols-outlined">chat</span></div>
              <h3 className={styles.actionTitle}>AI Assistant</h3>
              <p className={styles.actionDesc}>Chat with our job search bot</p>
            </Link>
            <Link href="/saved-jobs" className={styles.actionCard}>
              <div className={styles.actionIcon}><span className="material-symbols-outlined">favorite</span></div>
              <h3 className={styles.actionTitle}>Saved Jobs</h3>
              <p className={styles.actionDesc}>View your saved positions</p>
            </Link>
            <Link href="/my-reviews" className={styles.actionCard}>
              <div className={styles.actionIcon}><span className="material-symbols-outlined">rate_review</span></div>
              <h3 className={styles.actionTitle}>My Reviews</h3>
              <p className={styles.actionDesc}>Manage company reviews</p>
            </Link>
          </div>
        </section>
      </div>


    </div>
  )
}
