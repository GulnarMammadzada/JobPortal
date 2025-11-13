"use client"

import type React from "react"

import { useState } from "react"
import type { UserDto } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import styles from "./profile-settings.module.css"

interface ProfileSettingsProps {
    user: UserDto | null
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })
    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        jobRecommendations: true,
        applicationUpdates: true,
        weeklyDigest: false,
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setPasswordData((prev) => ({ ...prev, [name]: value }))
    }

    const handleNotificationChange = (key: string) => {
        setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
    }

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setSuccess("")
        setIsLoading(true)

        try {
            if (passwordData.newPassword !== passwordData.confirmPassword) {
                setError("Passwords do not match")
                setIsLoading(false)
                return
            }

            if (passwordData.newPassword.length < 8) {
                setError("Password must be at least 8 characters long")
                setIsLoading(false)
                return
            }

            // TODO: Implement API call to change password
            // await api.post("/auth/change-password", passwordData)

            setSuccess("Password changed successfully!")
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            })
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to change password")
            console.log("[v0] Error changing password:", err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleNotificationSave = async () => {
        try {
            // TODO: Implement API call to save notification preferences
            // await api.put("/profile/notifications", notifications)
            setSuccess("Notification settings updated!")
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update notifications")
            console.log("[v0] Error updating notifications:", err)
        }
    }

    return (
        <div className={styles.container}>
            {error && (
                <Alert variant="destructive" className={styles.alert}>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert className={styles.successAlert}>
                    <AlertDescription>{success}</AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your password to keep your account secure</CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handlePasswordSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label htmlFor="currentPassword" className={styles.label}>
                                Current Password
                            </label>
                            <Input
                                id="currentPassword"
                                name="currentPassword"
                                type="password"
                                placeholder="••••••••"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                disabled={isLoading}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="newPassword" className={styles.label}>
                                New Password
                            </label>
                            <Input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                placeholder="••••••••"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                disabled={isLoading}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="confirmPassword" className={styles.label}>
                                Confirm Password
                            </label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                disabled={isLoading}
                            />
                        </div>

                        <Button type="submit" disabled={isLoading} className={styles.submitButton}>
                            {isLoading ? "Updating..." : "Update Password"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Choose what notifications you'd like to receive</CardDescription>
                </CardHeader>

                <CardContent>
                    <div className={styles.notificationsList}>
                        {Object.entries(notifications).map(([key, value]) => (
                            <div key={key} className={styles.notificationItem}>
                                <input id={key} type="checkbox" checked={value} onChange={() => handleNotificationChange(key)} />
                                <label htmlFor={key} className={styles.notificationLabel}>
                                    {key === "emailNotifications" && "Email Notifications"}
                                    {key === "jobRecommendations" && "Job Recommendations"}
                                    {key === "applicationUpdates" && "Application Updates"}
                                    {key === "weeklyDigest" && "Weekly Digest"}
                                </label>
                            </div>
                        ))}
                    </div>

                    <Button onClick={handleNotificationSave} className={styles.submitButton}>
                        Save Preferences
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Danger Zone</CardTitle>
                    <CardDescription>Irreversible and destructive actions</CardDescription>
                </CardHeader>

                <CardContent>
                    <div className={styles.dangerSection}>
                        <div className={styles.dangerContent}>
                            <h4 className={styles.dangerTitle}>Delete Account</h4>
                            <p className={styles.dangerDescription}>
                                Permanently delete your account and all associated data. This action cannot be undone.
                            </p>
                        </div>
                        <Button variant="destructive" className={styles.dangerButton}>
                            Delete Account
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
