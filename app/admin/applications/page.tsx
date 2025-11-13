"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import styles from "./applications.module.css"

export default function AdminApplicationsPage() {
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
        <h1 className={styles.title}>Applications Management</h1>
        <p className={styles.subtitle}>Monitor all job applications across the platform</p>
      </div>

      <Card className={styles.card}>
        <CardHeader>
          <CardTitle>All Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.comingSoon}>
            <div className={styles.icon}>📋</div>
            <h2>Coming Soon</h2>
            <p>Application management features will be available here.</p>
            <div className={styles.features}>
              <div className={styles.feature}>
                <span className={styles.checkmark}>✓</span>
                <span>View all job applications</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.checkmark}>✓</span>
                <span>Filter by status, vacancy, and user</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.checkmark}>✓</span>
                <span>Export application data</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.checkmark}>✓</span>
                <span>Application analytics</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
