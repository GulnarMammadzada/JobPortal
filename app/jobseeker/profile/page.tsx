"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ApiClient } from "@/lib/api-client"
import type { JobSeekerDto, UpdateJobSeekerProfileRequest, UpdateJobSeekerSkillsRequest } from "@/lib/types"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast" // Import useToast from the correct path
import styles from "./profile.module.css"

export default function JobSeekerProfilePage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const api = ApiClient.getInstance()
  const { toast } = useToast() // Initialize useToast hook

  const [profile, setProfile] = useState<JobSeekerDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<UpdateJobSeekerProfileRequest>({
    dateOfBirth: "",
    gender: "",
    city: "",
    address: "",
    educationLevel: "",
    education: "",
    experienceYears: 0,
    experience: "",
    cvUrl: "",
    linkedinUrl: "",
    githubUrl: "",
    portfolio: "",
  })
  const [skillsInput, setSkillsInput] = useState("")
  const [currentSkills, setCurrentSkills] = useState<string[]>([])

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== "JOB_SEEKER") {
        router.push("/auth/login")
      } else {
        fetchProfile()
      }
    }
  }, [user, authLoading, router])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const data = await api.get<JobSeekerDto>("/job-seekers/me")
      setProfile(data)
      setFormData({
        dateOfBirth: data.dateOfBirth || "",
        gender: data.gender || "",
        city: data.city || "",
        address: data.address || "",
        educationLevel: data.educationLevel || "",
        education: data.education || "",
        experienceYears: data.experienceYears || 0,
        experience: data.experience || "",
        cvUrl: data.cvFileUrl || "", // Corrected to cvFileUrl
        linkedinUrl: data.linkedinUrl || "",
        githubUrl: data.githubUrl || "",
        portfolio: data.portfolio || "",
      })
      setCurrentSkills(data.skills || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSkillsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSkillsInput(e.target.value)
  }

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && skillsInput.trim() !== "") {
      e.preventDefault()
      const newSkill = skillsInput.trim()
      if (!currentSkills.includes(newSkill)) {
        setCurrentSkills((prev) => [...prev, newSkill])
      }
      setSkillsInput("")
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setCurrentSkills((prev) => prev.filter((skill) => skill !== skillToRemove))
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      const updatedProfile = await api.put<JobSeekerDto, UpdateJobSeekerProfileRequest>("/job-seekers/me", formData)
      await api.put<JobSeekerDto, UpdateJobSeekerSkillsRequest>("/job-seekers/skills", { skills: currentSkills })
      setProfile(updatedProfile)
      setIsEditing(false)
      toast({
        title: "Success!",
        description: "Profile updated successfully.",
        variant: "success",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update profile: " + (err instanceof Error ? err.message : "Unknown error"),
        variant: "destructive",
      })

    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className={styles.loading}>
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className={styles.error}>
        <p>{error || "Profile not found"}</p>
        <Button onClick={() => router.push("/jobseeker/dashboard")}>Go to Dashboard</Button>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Button onClick={() => router.back()} variant="outline" size="sm" className={styles.backButton}>
          <span className="material-symbols-outlined">arrow_back</span> Back
        </Button>
        <h1 className={styles.pageTitle}>My Profile</h1>
        <Button onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
      </header>

      <form onSubmit={handleUpdateProfile} className={styles.profileForm}>
        <section className={styles.profileSection}>
          <h2 className={styles.sectionTitle}>Personal Information</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="dateOfBirth">Date of Birth</label>
              <Input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                disabled={!isEditing}
                className={styles.select}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="city">City</label>
              <Input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="address">Address</label>
              <Input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>
        </section>

        <section className={styles.profileSection}>
          <h2 className={styles.sectionTitle}>Education & Experience</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="educationLevel">Education Level</label>
              <select
                id="educationLevel"
                name="educationLevel"
                value={formData.educationLevel}
                onChange={handleChange}
                disabled={!isEditing}
                className={styles.select}
              >
                <option value="">Select Education Level</option>
                <option value="HIGH_SCHOOL">High School</option>
                <option value="ASSOCIATE">Associate's Degree</option>
                <option value="BACHELOR">Bachelor's Degree</option>
                <option value="MASTER">Master's Degree</option>
                <option value="DOCTORATE">Doctorate</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="experienceYears">Years of Experience</label>
              <Input
                type="number"
                id="experienceYears"
                name="experienceYears"
                value={formData.experienceYears}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className={styles.formGroup + " " + styles.fullWidth}>
              <label htmlFor="education">Education Details</label>
              <Textarea
                id="education"
                name="education"
                value={formData.education}
                onChange={handleChange}
                disabled={!isEditing}
                rows={3}
              />
            </div>
            <div className={styles.formGroup + " " + styles.fullWidth}>
              <label htmlFor="experience">Experience Details</label>
              <Textarea
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                disabled={!isEditing}
                rows={5}
              />
            </div>
          </div>
        </section>

        <section className={styles.profileSection}>
          <h2 className={styles.sectionTitle}>Links & Documents</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="cvUrl">CV URL</label>
              <Input
                type="url"
                id="cvUrl"
                name="cvUrl"
                value={formData.cvUrl}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="linkedinUrl">LinkedIn Profile</label>
              <Input
                type="url"
                id="linkedinUrl"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="githubUrl">GitHub Profile</label>
              <Input
                type="url"
                id="githubUrl"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="portfolio">Portfolio URL</label>
              <Input
                type="url"
                id="portfolio"
                name="portfolio"
                value={formData.portfolio}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>
        </section>

        <section className={styles.profileSection}>
          <h2 className={styles.sectionTitle}>Skills</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup + " " + styles.fullWidth}>
              <label htmlFor="skillsInput">Add Skills</label>
              <Input
                type="text"
                id="skillsInput"
                value={skillsInput}
                onChange={handleSkillsInputChange}
                onKeyDown={handleAddSkill}
                placeholder="Type skill and press Enter"
                disabled={!isEditing}
              />
              <div className={styles.skillsContainer}>
                {currentSkills.map((skill) => (
                  <span key={skill} className={styles.skillTag}>
                    {skill}
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className={styles.removeSkillButton}
                      >
                        &times;
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {isEditing && (
          <div className={styles.formActions}>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}