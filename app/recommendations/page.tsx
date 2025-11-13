"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ApiClient } from "@/lib/api-client"
import type { VacancyRecommendationDto, PageResponse } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Header } from "@/components/jobs/header"
import { CircularProgress } from "@/components/ui/circular-progress"
import styles from "./recommendations.module.css"

export default function RecommendationsPage() {
  const router = useRouter()
  const [recommendations, setRecommendations] = useState<VacancyRecommendationDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [userProfile, setUserProfile] = useState<{ title: string; skills: string[]; experience: number } | null>(null)
  const api = ApiClient.getInstance()

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await api.get<PageResponse<VacancyRecommendationDto>>("/vacancies/recommendations?page=0&size=20")
      console.log("API Response:", response)
      setRecommendations(response.content || [])

      // Fetch user profile for display
      try {
        const profileResponse = await api.get<any>("/users/me")
        setUserProfile({
          title: "Senior UI/UX Designer",
          skills: ["UI/UX Design", "Figma", "Prototyping"],
          experience: 5,
        })
      } catch (e) {
        console.log("[v0] Error fetching user profile:", e)
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes("404")) {
        setError("Could not find recommendations. Please try again later.")
      } else {
        setError(err instanceof Error ? err.message : "Failed to fetch recommendations")
      }
      console.log("[v0] Error fetching recommendations:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchRecommendations()
  }

  return (
    <div className={styles.pageWrapper}>
      <Header />
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Jobs Recommended For You</h1>
            <p className={styles.subtitle}>Discover roles that match your skills and experience</p>
          </div>
          <Button onClick={handleRefresh} className={styles.refreshButton}>
            🔄 Refresh
          </Button>
        </div>

        {userProfile && (
          <div className={styles.profileSummary}>
            <div className={styles.profileCard}>
              <h3 className={styles.profileTitle}>{userProfile.title}</h3>
              <p className={styles.profileExperience}>{userProfile.experience}+ Years Experience</p>
              <div className={styles.skillsTags}>
                {userProfile.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
              <Button onClick={() => router.push("/profile")} variant="outline" className={styles.updateProfileButton}>
                Update Profile
              </Button>
            </div>

            <div className={styles.reasonCard}>
              <h3 className={styles.reasonTitle}>Why These Jobs?</h3>
              <p className={styles.reasonText}>
                Based on your experience in UI design and proficiency in Figma, we've prioritized roles at growing tech
                startups that value strong product-thinking skills.
              </p>
            </div>
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}

        {isLoading ? (
          <div className={styles.loadingContainer}>
            <Spinner />
          </div>
        ) : !recommendations || recommendations.length === 0 ? (
          <div className={styles.noResults}>
            <p>No recommendations available yet.</p>
            <p>Complete your profile to get personalized recommendations.</p>
            <Button onClick={() => router.push("/profile")} className={styles.profileButton}>
              Complete Profile
            </Button>
          </div>
        ) : (
          <div className={styles.recommendationsList}>
            {recommendations.map((recommendation) => (
              <div key={recommendation.id} className={styles.recommendationCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.matchCircle}>
                    <CircularProgress value={recommendation.matchScore} />
                  </div>

                  <div className={styles.headerContent}>
                    <h3 className={styles.jobTitle}>{recommendation.title}</h3>
                    <p className={styles.company}>{recommendation.company.companyName}</p>
                    <div className={styles.badges}>
                      <Badge>{recommendation.employmentType}</Badge>
                      <Badge variant="secondary">{recommendation.experienceLevel}</Badge>
                      {recommendation.isRemote && <Badge variant="outline">Remote</Badge>}
                    </div>
                  </div>
                </div>

                <div className={styles.matchDetails}>
                  <div className={styles.matchSection}>
                    <h4 className={styles.matchTitle}>Why It's a Match</h4>
                    <p className={styles.matchReason}>{recommendation.matchReason}</p>
                  </div>

                  {recommendation.matchedSkills.length > 0 && (
                    <div className={styles.matchSection}>
                      <h4 className={styles.matchTitle}>Matched Skills</h4>
                      <div className={styles.skillsList}>
                        {recommendation.matchedSkills.map((skill) => (
                          <span key={skill} className={styles.skillBadge}>
                            ✓ {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {recommendation.missingSkills.length > 0 && (
                    <div className={styles.matchSection}>
                      <h4 className={styles.matchTitle}>Skills to Develop</h4>
                      <div className={styles.skillsList}>
                        {recommendation.missingSkills.map((skill) => (
                          <span key={skill} className={styles.skillMissing}>
                            + {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.salary}>
                    ${recommendation.salaryMin.toLocaleString()} - ${recommendation.salaryMax.toLocaleString()}
                  </div>
                  <div className={styles.actions}>
                    <Button onClick={() => router.push(`/jobs/${recommendation.id}`)} className={styles.viewButton}>
                      View Job
                    </Button>
                    <Button
                      onClick={() => router.push(`/jobs/${recommendation.id}/apply`)}
                      className={styles.applyButton}
                    >
                      Apply Now
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}