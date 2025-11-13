"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ApiClient } from "@/lib/api-client"
import type { CompanyDto } from "@/lib/types"
import Link from "next/link"
import styles from "./companies.module.css"

export default function CompaniesPage() {
  const router = useRouter()
  const api = ApiClient.getInstance()

  const [companies, setCompanies] = useState<CompanyDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<any>("/companies?page=0&size=50")
      setCompanies(response.content || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch companies")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCompanies = companies.filter((company) =>
    company.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.city.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/" className={styles.backLink}>← Home</Link>
          <h1 className={styles.title}>Browse Companies</h1>
          <p className={styles.subtitle}>
            Discover companies hiring on our platform
          </p>

          {/* Search */}
          <div className={styles.searchContainer}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search companies..."
              className={styles.searchInput}
            />
          </div>
        </div>
      </header>

      <div className={styles.mainContent}>
        {isLoading ? (
          <div className={styles.loading}>Loading companies...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : filteredCompanies.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No companies found</p>
          </div>
        ) : (
          <div className={styles.companiesGrid}>
            {filteredCompanies.map((company) => (
              <Link
                key={company.id}
                href={`/companies/${company.id}`}
                className={styles.companyCard}
              >
                <div className={styles.companyHeader}>
                  <div className={styles.companyLogo}>
                    {company.logoUrl ? (
                      <img src={company.logoUrl} alt={company.companyName} />
                    ) : (
                      <span>{company.companyName.charAt(0)}</span>
                    )}
                  </div>
                  {company.isVerified && (
                    <span className={styles.verifiedBadge}>✓ Verified</span>
                  )}
                </div>

                <h3 className={styles.companyName}>{company.companyName}</h3>

                <div className={styles.companyInfo}>
                  <span className={styles.infoItem}>🏢 {company.industry}</span>
                  <span className={styles.infoItem}>👥 {company.companySize}</span>
                  <span className={styles.infoItem}>📍 {company.city}</span>
                </div>

                <p className={styles.companyDesc}>
                  {company.description?.substring(0, 100)}
                  {company.description && company.description.length > 100 ? "..." : ""}
                </p>

                {company.averageRating && company.totalReviews && company.totalReviews > 0 && (
                  <div className={styles.companyRating}>
                    <span className={styles.stars}>
                      {"⭐".repeat(Math.round(company.averageRating))}
                    </span>
                    <span className={styles.ratingText}>
                      {company.averageRating.toFixed(1)} ({company.totalReviews} reviews)
                    </span>
                  </div>
                )}

                <div className={styles.companyFooter}>
                  <span className={styles.viewProfile}>View Profile →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
