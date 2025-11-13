import { Card, CardContent } from "@/components/ui/card"
import styles from "./employer-stats.module.css"

interface EmployerStatsProps {
  stats: {
    totalVacancies: number
    activeVacancies: number
    totalApplications: number
    pendingReview: number
    acceptedApplications: number
  }
}

export function EmployerStats({ stats }: EmployerStatsProps) {
  return (
    <div className={styles.statsGrid}>
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
          <div className={styles.statValue}>{stats.pendingReview}</div>
          <div className={styles.statLabel}>Pending Review</div>
        </CardContent>
      </Card>

      <Card className={styles.statCard}>
        <CardContent className={styles.statContent}>
          <div className={styles.statValue}>{stats.acceptedApplications}</div>
          <div className={styles.statLabel}>Accepted</div>
        </CardContent>
      </Card>
    </div>
  )
}