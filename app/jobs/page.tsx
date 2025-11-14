"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ApiClient } from "@/lib/api-client"
import type { VacancyDto, PageResponse } from "@/lib/types"
import { JobCard } from "@/components/jobs/job-card"
import { JobFilters } from "@/components/jobs/job-filters"
import { SearchBar } from "@/components/jobs/search-bar"
import { Pagination } from "@/components/ui/pagination"
import { Spinner } from "@/components/ui/spinner"
import styles from "./jobs.module.css"

export default function JobsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [jobs, setJobs] = useState<VacancyDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [filters, setFilters] = useState({
    location: searchParams.get("location") || "",
    salaryMin: searchParams.get("salaryMin") ? Number.parseInt(searchParams.get("salaryMin")!) : 0,
    salaryMax: searchParams.get("salaryMax") ? Number.parseInt(searchParams.get("salaryMax")!) : 500000,
    employmentType: searchParams.get("employmentType") || "",
    experienceLevel: searchParams.get("experienceLevel") || "",
    isRemote: searchParams.get("isRemote") === "true",
  })

  const api = ApiClient.getInstance()

  useEffect(() => {
    fetchJobs()
  }, [searchQuery, filters, currentPage])

  const fetchJobs = async () => {
    setIsLoading(true)
    setError("")

    try {
      const params = new URLSearchParams()
      params.append("page", (currentPage - 1).toString())
      params.append("size", "12")

      if (searchQuery) params.append("search", searchQuery)
      if (filters.location) params.append("city", filters.location)
      if (filters.salaryMin > 0) params.append("salaryMin", filters.salaryMin.toString())
      if (filters.salaryMax < 500000) params.append("salaryMax", filters.salaryMax.toString())
      if (filters.employmentType) params.append("employmentType", filters.employmentType)
      if (filters.experienceLevel) params.append("experienceLevel", filters.experienceLevel)
      if (filters.isRemote) params.append("isRemote", "true")

      const response = await api.get<PageResponse<VacancyDto>>(`/vacancies?${params.toString()}`)

      setJobs(response.content)
      setTotalPages(response.totalPages)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch jobs")
      console.log("[v0] Error fetching jobs:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
    const params = new URLSearchParams()
    if (query) params.append("q", query)
    router.push(`/jobs?${params.toString()}`)
  }

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  return (
    <div className={styles.container}>
      {/* Top App Bar */}
      <div className={styles.topAppBar}>
        <div className={styles.menuIconWrapper}>
          <span className="material-symbols-outlined">menu</span>
        </div>
        <h1 className={styles.appBarTitle}>Browse Jobs</h1>
        <div className={styles.notificationIconWrapper}>
          <button className={styles.notificationButton}>
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </div>
      </div>

      <div className={styles.searchAndFiltersSection}>
        {/* Search Bar */}
        <div className={styles.searchBarWrapper}>
          <SearchBar onSearch={handleSearch} defaultValue={searchQuery} />
        </div>
      </div>

      <div className={styles.content}>
        <aside className={styles.sidebar}>
          <JobFilters filters={filters} onFilterChange={handleFilterChange} />
        </aside>

        <section className={styles.main}>
          {error && <div className={styles.error}>{error}</div>}

          {isLoading ? (
            <div className={styles.loadingContainer}>
              <Spinner />
            </div>
          ) : jobs.length === 0 ? (
            <div className={styles.noResults}>
              <div className={styles.noResultsIconWrapper}>
                <span className="material-symbols-outlined">search_off</span>
              </div>
              <h3 className={styles.noResultsTitle}>No Jobs Found</h3>
              <p className={styles.noResultsText}>Try adjusting your filters to find what you're looking for.</p>
              <button className={styles.clearFiltersButton} onClick={() => handleFilterChange({
                location: "",
                salaryMin: 0,
                salaryMax: 500000,
                employmentType: "",
                experienceLevel: "",
                isRemote: false,
                category: "",
                skills: "",
                postedWithin: "",
              })}>
                <span>Clear Filters</span>
              </button>
            </div>
          ) : (
            <>
              <div className={styles.resultsInfo}>
                <p>Showing {jobs.length} jobs</p>
              </div>

              <div className={styles.jobsList}>
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} onClick={() => router.push(`/jobs/${job.id}`)} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  )
}