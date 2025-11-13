"use client"

import type React from "react"

import { useState } from "react"
import type { UserDto } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import styles from "./job-seeker-profile.module.css"

interface JobSeekerProfileProps {
    user: UserDto
}

export function JobSeekerProfile({ user }: JobSeekerProfileProps) {
    const [formData, setFormData] = useState({
        bio: "",
        experience: 0,
        skills: "",
        phone: "",
        city: "",
        isRemoteOpen: false,
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleCheckboxChange = () => {
        setFormData((prev) => ({ ...prev, isRemoteOpen: !prev.isRemoteOpen }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")
        setSuccess(false)

        try {
            // TODO: Implement API call to update job seeker profile
            // await api.put("/profile", formData)
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update profile")
            console.log("[v0] Error updating profile:", err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <Card>
                <CardHeader>
                    <CardTitle>Job Seeker Information</CardTitle>
                    <CardDescription>Update your professional information to help employers find you</CardDescription>
                </CardHeader>

                <CardContent>
                    {error && (
                        <Alert variant="destructive" className={styles.alert}>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {success && (
                        <Alert className={styles.successAlert}>
                            <AlertDescription>Profile updated successfully!</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label htmlFor="email" className={styles.label}>
                                Email Address
                            </label>
                            <Input id="email" type="email" value={user.email} disabled />
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="firstname" className={styles.label}>
                                    First Name
                                </label>
                                <Input id="firstname" type="text" value={user.firstname} disabled />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="lastname" className={styles.label}>
                                    Last Name
                                </label>
                                <Input id="lastname" type="text" value={user.lastname} disabled />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="bio" className={styles.label}>
                                Professional Bio
                            </label>
                            <Textarea
                                id="bio"
                                name="bio"
                                placeholder="Tell employers about yourself, your experience, and your career goals..."
                                value={formData.bio}
                                onChange={handleInputChange}
                                rows={4}
                            />
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="experience" className={styles.label}>
                                    Years of Experience
                                </label>
                                <Input
                                    id="experience"
                                    name="experience"
                                    type="number"
                                    value={formData.experience}
                                    onChange={handleInputChange}
                                    placeholder="5"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="city" className={styles.label}>
                                    Current City
                                </label>
                                <Input
                                    id="city"
                                    name="city"
                                    type="text"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    placeholder="San Francisco, CA"
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="skills" className={styles.label}>
                                Skills
                            </label>
                            <Input
                                id="skills"
                                name="skills"
                                placeholder="Comma-separated skills (e.g., React, TypeScript, Node.js)"
                                value={formData.skills}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className={styles.checkboxGroup}>
                            <input
                                id="isRemoteOpen"
                                type="checkbox"
                                checked={formData.isRemoteOpen}
                                onChange={handleCheckboxChange}
                            />
                            <label htmlFor="isRemoteOpen" className={styles.checkboxLabel}>
                                I'm open to remote positions
                            </label>
                        </div>

                        <Button type="submit" disabled={isLoading} className={styles.submitButton}>
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
