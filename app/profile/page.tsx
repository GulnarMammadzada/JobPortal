"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ApiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/jobs/header"
import { JobSeekerProfile } from "@/components/profile/job-seeker-profile"
import { CompanyProfile } from "@/components/profile/company-profile"
import { ProfileSettings } from "@/components/profile/profile-settings"
import styles from "./profile.module.css"

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const api = ApiClient.getInstance()

  useEffect(() => {
    if (!authLoading) {
      setIsLoading(false)
      if (!user) {
        router.push("/auth/login")
      }
    }
  }, [authLoading, user, router])

  if (isLoading || authLoading) {
    return <div className={styles.loading}>Loading...</div>
  }

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>My Profile</h1>
          <p className={styles.subtitle}>Manage your account information and preferences</p>
        </div>

        <Tabs defaultValue="profile" className={styles.tabs}>
          <TabsList className={styles.tabsList}>
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className={styles.tabsContent}>
            {user?.role === "JOB_SEEKER" ? (
              <JobSeekerProfile user={user} />
            ) : user?.role === "COMPANY" ? (
              <CompanyProfile user={user} />
            ) : (
              <Card>
                <CardContent className={styles.noProfile}>
                  <p>Profile not available for your role</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="settings" className={styles.tabsContent}>
            <ProfileSettings user={user} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}