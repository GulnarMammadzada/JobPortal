import { Card, CardContent } from "@/components/ui/card"
import styles from "./admin-stats.module.css"

interface AdminStatsProps {
  stats: {
    totalUsers: number
    jobSeekers: number
    companies: number
    totalVacancies: number
    activeVacancies: number
    totalApplications: number
    pendingVacancies: number
  }
}

export function AdminStats({ stats }: AdminStatsProps) {
  return (
    <div className={styles.statsGrid}>
      <Card className={styles.statCard}>
        <CardContent className={styles.statContent}>
          <div className={styles.statValue}>{stats.totalUsers}</div>
          <div className={styles.statLabel}>Total Users</div>
        </CardContent>
      </Card>

      <Card className={styles.statCard}>
        <CardContent className={styles.statContent}>
          <div className={styles.statValue}>{stats.jobSeekers}</div>
          <div className={styles.statLabel}>Job Seekers</div>
        </CardContent>
      </Card>

      <Card className={styles.statCard}>
        <CardContent className={styles.statContent}>
          <div className={styles.statValue}>{stats.companies}</div>
          <div className={styles.statLabel}>Companies</div>
        </CardContent>
      </Card>

      <Card className={styles.statCard}>
        <CardContent className={styles.statContent}>
          <div className={styles.statValue}>{stats.totalVacancies}</div>
          <div className={styles.statLabel}>Total Vacancies</div>
        </CardContent>
      </Card>

      <Card className={styles.statCard}>
        <CardContent className={styles.statContent}>
          <div className={styles.statValue}>{stats.activeVacancies}</div>
          <div className={styles.statLabel}>Active Vacancies</div>
        </CardContent>
      </Card>

      <Card className={styles.statCard}>
        <CardContent className={styles.statContent}>
          <div className={styles.statValue}>{stats.totalApplications}</div>
          <div className={styles.statLabel}>Total Applications</div>
        </CardContent>
      </Card>

      <Card className={styles.statCard}>
        <CardContent className={styles.statContent}>
          <div className={styles.statValue}>{stats.pendingVacancies}</div>
          <div className={styles.statLabel}>Pending Approval</div>
        </CardContent>
      </Card>
    </div>
  )
}