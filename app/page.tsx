"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ApiClient } from "@/lib/api-client"
import type { VacancyDto } from "@/lib/types"
import Link from "next/link"
import styles from "./page.module.css"

export default function LandingPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [featuredJobs, setFeaturedJobs] = useState<VacancyDto[]>([])
  const [searchKeyword, setSearchKeyword] = useState("")
  const [searchLocation, setSearchLocation] = useState("")
  const api = ApiClient.getInstance()

  useEffect(() => {
    fetchFeaturedJobs()
  }, [])

  const fetchFeaturedJobs = async () => {
    try {
      const response = await api.get<any>("/vacancies?page=0&size=6")
      setFeaturedJobs(response.content || [])
    } catch (error) {
      console.error("Failed to fetch featured jobs:", error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchKeyword) params.append("keyword", searchKeyword)
    if (searchLocation) params.append("city", searchLocation)
    router.push(`/jobs?${params.toString()}`)
  }

  return (
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navContent}>
          <Link href="/" className={styles.logo}>
            JobPortal
          </Link>
          <div className={styles.navLinks}>
            <Link href="/jobs" className={styles.navLink}>Browse Jobs</Link>
            <Link href="/companies" className={styles.navLink}>Companies</Link>
            <Link href="/auth/login" className={styles.navLinkBtn}>Login</Link>
            <Link href="/auth/register" className={styles.navLinkBtnPrimary}>Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Find Your Dream Job with AI</h1>
          <p className={styles.heroSubtitle}>
            Smart matching, personalized recommendations, and AI-powered career assistance
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
              type="text"
              placeholder="Job title, keywords..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className={styles.searchInput}
            />
            <select
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className={styles.searchSelect}
            >
              <option value="">All Locations</option>
              <option value="Baku">Baku</option>
              <option value="Ganja">Ganja</option>
              <option value="Sumqayit">Sumqayit</option>
              <option value="Mingachevir">Mingachevir</option>
            </select>
            <button type="submit" className={styles.searchBtn}>
              Search Jobs
            </button>
          </form>

          <div className={styles.heroActions}>
            <Link href="/jobs" className={styles.btnPrimary}>Find Jobs</Link>
            <Link href="/auth/register" className={styles.btnSecondary}>Post a Job</Link>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>Why Choose Us</h2>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🤖</div>
            <h3 className={styles.featureTitle}>AI-Powered Matching</h3>
            <p className={styles.featureDesc}>
              Smart algorithms match you with the best opportunities based on your skills and experience
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📊</div>
            <h3 className={styles.featureTitle}>CV Analysis</h3>
            <p className={styles.featureDesc}>
              Get professional AI feedback on your resume to improve your chances of getting hired
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>💬</div>
            <h3 className={styles.featureTitle}>Chatbot Assistant</h3>
            <p className={styles.featureDesc}>
              24/7 AI assistant to help you with your job search and answer your questions
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>⭐</div>
            <h3 className={styles.featureTitle}>Company Reviews</h3>
            <p className={styles.featureDesc}>
              Read authentic reviews from employees to make informed career decisions
            </p>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      {featuredJobs.length > 0 && (
        <section className={styles.featuredJobs}>
          <h2 className={styles.sectionTitle}>Featured Opportunities</h2>
          <div className={styles.jobsGrid}>
            {featuredJobs.map((job) => (
              <Link href={`/jobs/${job.id}`} key={job.id} className={styles.jobCard}>
                <div className={styles.jobHeader}>
                  <h3 className={styles.jobTitle}>{job.title}</h3>
                  {job.isRemote && <span className={styles.remoteBadge}>Remote</span>}
                </div>
                <p className={styles.jobCompany}>{job.company?.companyName}</p>
                <div className={styles.jobDetails}>
                  <span className={styles.jobDetail}>📍 {job.city}</span>
                  <span className={styles.jobDetail}>
                    💰 {job.salaryMin}-{job.salaryMax} {job.salaryCurrency}
                  </span>
                  <span className={styles.jobDetail}>💼 {job.employmentType.replace("_", " ")}</span>
                </div>
                <div className={styles.jobSkills}>
                  {job.skills.slice(0, 3).map((skill, idx) => (
                    <span key={idx} className={styles.skillTag}>{skill}</span>
                  ))}
                  {job.skills.length > 3 && (
                    <span className={styles.skillTag}>+{job.skills.length - 3} more</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <div className={styles.viewAllContainer}>
            <Link href="/jobs" className={styles.btnSecondary}>View All Jobs</Link>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className={styles.howItWorks}>
        <h2 className={styles.sectionTitle}>How It Works</h2>
        <div className={styles.stepsGrid}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <h3 className={styles.stepTitle}>Create Profile</h3>
            <p className={styles.stepDesc}>
              Sign up and build your professional profile with your skills and experience
            </p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            .
            <h3 className={styles.stepTitle}>Apply to Jobs</h3>
            <p className={styles.stepDesc}>
              Browse AI-recommended jobs and apply with one click
            </p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <h3 className={styles.stepTitle}>Get Hired</h3>
            <p className={styles.stepDesc}>
              Track your applications and land your dream job
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h4 className={styles.footerTitle}>JobPortal</h4>
            <p className={styles.footerText}>Find your dream job with AI-powered matching</p>
          </div>
          <div className={styles.footerSection}>
            <h4 className={styles.footerTitle}>For Job Seekers</h4>
            <Link href="/jobs" className={styles.footerLink}>Browse Jobs</Link>
            <Link href="/auth/register" className={styles.footerLink}>Create Profile</Link>
          </div>
          <div className={styles.footerSection}>
            <h4 className={styles.footerTitle}>For Employers</h4>
            <Link href="/auth/register" className={styles.footerLink}>Post a Job</Link>
            <Link href="/auth/login" className={styles.footerLink}>Sign In</Link>
          </div>
          <div className={styles.footerSection}>
            <h4 className={styles.footerTitle}>Company</h4>
            <Link href="/about" className={styles.footerLink}>About Us</Link>
            <Link href="/contact" className={styles.footerLink}>Contact</Link>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>&copy; 2025 JobPortal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
