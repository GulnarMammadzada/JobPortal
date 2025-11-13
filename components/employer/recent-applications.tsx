"use client"

import { useState, useEffect } from "react"
import { ApiClient } from "@/lib/api-client"
import type { ApplicationDto, PageResponse } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import styles from "./recent-applications.module.css"

export function RecentApplications() {
  const [applications, setApplications] = useState<ApplicationDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const api = ApiClient.getInstance()

  useEffect(() => {
    fetchRecentApplications()
  }, [])

  const fetchRecentApplications = async () => {
    try {
      const response = await api.get<PageResponse<ApplicationDto>>("/applications?page=0&size=5")
      setApplications(response.content)
    } catch (err) {
      console.log("[v0] Error fetching applications:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className={styles.loadingContainer}>
          <Spinner />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Applications</CardTitle>
        <CardDescription>Latest applications from candidates</CardDescription>
      </CardHeader>
      <CardContent>
        {applications.length === 0 ? (
          <p className={styles.noData}>No applications yet</p>
        ) : (
          <div className={styles.applicationsList}>
            {applications.map((app) => (
              <div key={app.id} className={styles.applicationItem}>
                <div className={styles.applicantInfo}>
                  <div className={styles.name}>{app.fullName}</div>
                  <div className={styles.position}>{app.vacancyTitle}</div>
                  <div className={styles.matchScore}>{app.matchScore}% Match</div>
                </div>
                <Badge>{app.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}