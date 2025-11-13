"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import styles from "./reports.module.css"

export default function AdminReportsPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.push("/")
    }
  }, [user, router])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Reports & Analytics</h1>
        <p className={styles.subtitle}>Platform performance insights and data analysis</p>
      </div>

      <div className={styles.grid}>
        <Card className={styles.card}>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.comingSoon}>
              <div className={styles.chartPlaceholder}>
                <div className={styles.bar} style={{ height: "60%" }}></div>
                <div className={styles.bar} style={{ height: "75%" }}></div>
                <div className={styles.bar} style={{ height: "85%" }}></div>
                <div className={styles.bar} style={{ height: "95%" }}></div>
                <div className={styles.bar} style={{ height: "100%" }}></div>
              </div>
              <p className={styles.placeholderText}>Chart visualization coming soon</p>
            </div>
          </CardContent>
        </Card>

        <Card className={styles.card}>
          <CardHeader>
            <CardTitle>Application Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.comingSoon}>
              <div className={styles.chartPlaceholder}>
                <div className={styles.bar} style={{ height: "80%" }}></div>
                <div className={styles.bar} style={{ height: "65%" }}></div>
                <div className={styles.bar} style={{ height: "90%" }}></div>
                <div className={styles.bar} style={{ height: "70%" }}></div>
                <div className={styles.bar} style={{ height: "85%" }}></div>
              </div>
              <p className={styles.placeholderText}>Chart visualization coming soon</p>
            </div>
          </CardContent>
        </Card>

        <Card className={styles.card}>
          <CardHeader>
            <CardTitle>Vacancy Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.comingSoon}>
              <div className={styles.chartPlaceholder}>
                <div className={styles.bar} style={{ height: "70%" }}></div>
                <div className={styles.bar} style={{ height: "85%" }}></div>
                <div className={styles.bar} style={{ height: "60%" }}></div>
                <div className={styles.bar} style={{ height: "95%" }}></div>
                <div className={styles.bar} style={{ height: "75%" }}></div>
              </div>
              <p className={styles.placeholderText}>Chart visualization coming soon</p>
            </div>
          </CardContent>
        </Card>

        <Card className={styles.card}>
          <CardHeader>
            <CardTitle>Company Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.comingSoon}>
              <div className={styles.chartPlaceholder}>
                <div className={styles.bar} style={{ height: "55%" }}></div>
                <div className={styles.bar} style={{ height: "70%" }}></div>
                <div className={styles.bar} style={{ height: "80%" }}></div>
                <div className={styles.bar} style={{ height: "65%" }}></div>
                <div className={styles.bar} style={{ height: "90%" }}></div>
              </div>
              <p className={styles.placeholderText}>Chart visualization coming soon</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className={styles.exportCard}>
        <CardHeader>
          <CardTitle>Export Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.exportSection}>
            <div className={styles.exportIcon}>📊</div>
            <h3>Data Export Features</h3>
            <p>Export platform data in various formats</p>
            <div className={styles.exportButtons}>
              <button className={styles.exportBtn} disabled>
                📄 Export to PDF
              </button>
              <button className={styles.exportBtn} disabled>
                📊 Export to Excel
              </button>
              <button className={styles.exportBtn} disabled>
                📈 Export to CSV
              </button>
            </div>
            <p className={styles.note}>Coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
