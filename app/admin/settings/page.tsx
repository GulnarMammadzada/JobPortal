"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import styles from "./settings.module.css"

export default function AdminSettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [settings, setSettings] = useState({
    siteName: "UJob Portal",
    siteEmail: "admin@ujob.com",
    maxApplications: "50",
    approvalRequired: true,
    emailNotifications: true,
  })

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.push("/")
    }
  }, [user, router])

  const handleSave = () => {
    alert("Settings saved! (Demo only - no backend)")
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Platform Settings</h1>
        <p className={styles.subtitle}>Configure your job portal settings</p>
      </div>

      <div className={styles.grid}>
        <Card className={styles.card}>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.formGroup}>
              <label>Platform Name</label>
              <Input
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                placeholder="UJob Portal"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Admin Email</label>
              <Input
                type="email"
                value={settings.siteEmail}
                onChange={(e) => setSettings({ ...settings, siteEmail: e.target.value })}
                placeholder="admin@ujob.com"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Max Applications per Job Seeker</label>
              <Input
                type="number"
                value={settings.maxApplications}
                onChange={(e) => setSettings({ ...settings, maxApplications: e.target.value })}
                placeholder="50"
              />
            </div>
          </CardContent>
        </Card>

        <Card className={styles.card}>
          <CardHeader>
            <CardTitle>Approval Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.toggleGroup}>
              <div className={styles.toggleItem}>
                <div>
                  <div className={styles.toggleLabel}>Company Approval Required</div>
                  <div className={styles.toggleDesc}>New companies need admin approval</div>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={settings.approvalRequired}
                    onChange={(e) => setSettings({ ...settings, approvalRequired: e.target.checked })}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>

              <div className={styles.toggleItem}>
                <div>
                  <div className={styles.toggleLabel}>Vacancy Approval Required</div>
                  <div className={styles.toggleDesc}>New job postings need admin approval</div>
                </div>
                <label className={styles.switch}>
                  <input type="checkbox" checked={true} readOnly />
                  <span className={styles.slider}></span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={styles.card}>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.toggleGroup}>
              <div className={styles.toggleItem}>
                <div>
                  <div className={styles.toggleLabel}>Email Notifications</div>
                  <div className={styles.toggleDesc}>Send email alerts to users</div>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>

              <div className={styles.toggleItem}>
                <div>
                  <div className={styles.toggleLabel}>Push Notifications</div>
                  <div className={styles.toggleDesc}>Browser push notifications</div>
                </div>
                <label className={styles.switch}>
                  <input type="checkbox" checked={false} readOnly />
                  <span className={styles.slider}></span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={styles.card}>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Version</span>
                <span className={styles.infoValue}>1.0.0</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Database Status</span>
                <span className={`${styles.infoBadge} ${styles.success}`}>Connected</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>API Status</span>
                <span className={`${styles.infoBadge} ${styles.success}`}>Online</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Last Updated</span>
                <span className={styles.infoValue}>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className={styles.actions}>
        <Button onClick={handleSave} className={styles.saveBtn}>
          Save Settings
        </Button>
        <Button variant="outline" onClick={() => router.push("/admin/dashboard")}>
          Cancel
        </Button>
      </div>

      <div className={styles.note}>
        <p>⚠️ This is a demo settings page. Changes are not persisted to the backend.</p>
      </div>
    </div>
  )
}
