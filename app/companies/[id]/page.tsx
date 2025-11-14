"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { ApiClient } from "@/lib/api-client"
import type { CompanyDto, VacancyDto, CompanyReviewDto, CreateCompanyReviewRequest, PageResponse } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import styles from "./company-detail.module.css"

export default function CompanyDetailPage() {
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string
  const api = ApiClient.getInstance()
  const { user } = useAuth()

  const [company, setCompany] = useState<CompanyDto | null>(null)
  const [vacancies, setVacancies] = useState<VacancyDto[]>([])
  const [reviews, setReviews] = useState<CompanyReviewDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchCompanyData()
  }, [companyId])

  const fetchCompanyData = async () => {
    try {
      setIsLoading(true)
      const [companyData, vacanciesData, reviewsData] = await Promise.all([
        api.get<CompanyDto>(`/companies/${companyId}`),
        api.get<PageResponse<VacancyDto>>(`/vacancies?companyId=${companyId}&page=0&size=10`),
        api.get<PageResponse<CompanyReviewDto>>(`/company-reviews/company/${companyId}?page=0&size=50`).catch(() => ({ content: [] } as PageResponse<CompanyReviewDto>))
      ])

      setCompany(companyData)
      setVacancies(vacanciesData.content || [])
      setReviews(reviewsData.content || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch company details")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className={styles.error}>
        <p>{error || "Company not found"}</p>
        <Link href="/companies" className={styles.backLink}>← Back to Companies</Link>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/companies" className={styles.backLink}>← Back to Companies</Link>

          <div className={styles.companyHeader}>
            <div className={styles.companyLogo}>
              {company.logoUrl ? (
                <img src={company.logoUrl} alt={company.companyName} />
              ) : (
                <span className={styles.logoPlaceholder}>
                  {company.companyName.charAt(0)}
                </span>
              )}
            </div>

            <div className={styles.companyInfo}>
              <div className={styles.titleRow}>
                <h1 className={styles.companyName}>{company.companyName}</h1>
                {company.isVerified && (
                  <Badge variant="success">✓ Verified</Badge>
                )}
              </div>

              <div className={styles.metaInfo}>
                <span className={styles.metaItem}>🏢 {company.industry}</span>
                <span className={styles.metaItem}>👥 {company.companySize}</span>
                <span className={styles.metaItem}>📍 {company.city}</span>
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.website}
                  >
                    🔗 Website
                  </a>
                )}
              </div>

              {company.averageRating && company.totalReviews && company.totalReviews > 0 && (
                <div className={styles.rating}>
                  <span className={styles.stars}>
                    {"⭐".repeat(Math.round(company.averageRating))}
                  </span>
                  <span className={styles.ratingText}>
                    {company.averageRating.toFixed(1)} ({company.totalReviews} reviews)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className={styles.mainContent}>
        <Tabs defaultValue="about">
          <TabsList>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="jobs">Open Positions ({vacancies.length})</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="about">
            <div className={styles.aboutSection}>
              <h2 className={styles.sectionTitle}>About {company.companyName}</h2>
              <p className={styles.description}>{company.description}</p>
            </div>
          </TabsContent>

          <TabsContent value="jobs">
            <div className={styles.jobsSection}>
              <h2 className={styles.sectionTitle}>Open Positions</h2>
              {vacancies.length === 0 ? (
                <p className={styles.emptyState}>No open positions at the moment</p>
              ) : (
                <div className={styles.jobsList}>
                  {vacancies.map((vacancy) => (
                    <Link
                      key={vacancy.id}
                      href={`/jobs/${vacancy.id}`}
                      className={styles.jobCard}
                    >
                      <div className={styles.jobHeader}>
                        <h3 className={styles.jobTitle}>{vacancy.title}</h3>
                        <Badge>{vacancy.employmentType}</Badge>
                      </div>
                      <p className={styles.jobLocation}>
                        📍 {vacancy.city} {vacancy.isRemote && "(Remote)"}
                      </p>
                      <p className={styles.jobSalary}>
                        💰 ${vacancy.salaryMin.toLocaleString()} - ${vacancy.salaryMax.toLocaleString()}
                      </p>
                      <p className={styles.jobDeadline}>
                        ⏰ Deadline: {new Date(vacancy.deadline).toLocaleDateString()}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <div className={styles.reviewsSection}>
              <div className={styles.reviewsHeader}>
                <h2 className={styles.sectionTitle}>Employee Reviews</h2>
              </div>

              {reviews.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No reviews yet. Be the first to review this company!</p>
                </div>
              ) : (
                <div className={styles.reviewsList}>
                  {reviews.map((review) => (
                    <div key={review.id} className={styles.reviewCard}>
                      <div className={styles.reviewHeader}>
                        <div>
                          <div className={styles.reviewerInfo}>
                            <strong>{review.reviewerName}</strong>
                            {review.isCurrentEmployee !== undefined && (
                              <span className={styles.employmentBadge}>
                                {review.isCurrentEmployee ? "Current Employee" : "Former Employee"}
                              </span>
                            )}
                          </div>
                          <div className={styles.reviewRating}>
                            <span className={styles.stars}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star} className={star <= review.rating ? styles.starFilled : styles.star}>
                                  ★
                                </span>
                              ))}
                            </span>
                            <span className={styles.reviewDate}>
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {review.title && <h3 className={styles.reviewTitle}>{review.title}</h3>}
                      <p className={styles.reviewText}>{review.comment}</p>

                      {review.updatedAt && review.updatedAt !== review.createdAt && (
                        <div className={styles.updatedNote}>
                          Updated {new Date(review.updatedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
