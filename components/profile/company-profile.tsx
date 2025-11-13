"use client"

import type React from "react"

import { useState } from "react"
import type { UserDto } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import styles from "./company-profile.module.css"

interface CompanyProfileProps {
    user: UserDto
}

export function CompanyProfile({ user }: CompanyProfileProps) {
    const [formData, setFormData] = useState({
        companyName: "",
        website: "",
        industry: "",
        description: "",
        headquarters: "",
        phone: "",
        companySize: "",
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")
        setSuccess(false)

        try {
            // TODO: Implement API call to update company profile
            // await api.put("/profile/company", formData)
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update company profile")
            console.log("[v0] Error updating company profile:", err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <Card>
                <CardHeader>
                    <CardTitle>Company Information</CardTitle>
                    <CardDescription>
                        Update your company details to help job seekers learn more about your organization
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {error && (
                        <Alert variant="destructive" className={styles.alert}>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {success && (
                        <Alert className={styles.successAlert}>
                            <AlertDescription>Company profile updated successfully!</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label htmlFor="companyName" className={styles.label}>
                                Company Name
                            </label>
                            <Input
                                id="companyName"
                                name="companyName"
                                type="text"
                                placeholder="Your Company Name"
                                value={formData.companyName}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="website" className={styles.label}>
                                    Website
                                </label>
                                <Input
                                    id="website"
                                    name="website"
                                    type="url"
                                    placeholder="https://example.com"
                                    value={formData.website}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="phone" className={styles.label}>
                                    Phone Number
                                </label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    placeholder="+1 (555) 000-0000"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="industry" className={styles.label}>
                                    Industry
                                </label>
                                <Input
                                    id="industry"
                                    name="industry"
                                    type="text"
                                    placeholder="e.g., Technology, Finance, Healthcare"
                                    value={formData.industry}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="companySize" className={styles.label}>
                                    Company Size
                                </label>
                                <Input
                                    id="companySize"
                                    name="companySize"
                                    type="text"
                                    placeholder="e.g., 100-500 employees"
                                    value={formData.companySize}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="headquarters" className={styles.label}>
                                Headquarters Location
                            </label>
                            <Input
                                id="headquarters"
                                name="headquarters"
                                type="text"
                                placeholder="e.g., San Francisco, CA"
                                value={formData.headquarters}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="description" className={styles.label}>
                                Company Description
                            </label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Tell job seekers about your company, mission, and culture..."
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={6}
                            />
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
