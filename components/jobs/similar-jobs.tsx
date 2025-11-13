"use client"

import { useState, useEffect } from "react"
import { ApiClient } from "@/lib/api-client"
import type { VacancyDto, PageResponse } from "@/lib/types"
import { useRouter } from "next/navigation"
import { JobCard } from "./job-card"
import styles from "./similar-jobs.module.css"

interface SimilarJobsProps {
    currentJobId: number
    category: string
}

export function SimilarJobs({ currentJobId, category }: SimilarJobsProps) {
    const [jobs, setJobs] = useState<VacancyDto[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const api = ApiClient.getInstance()

    useEffect(() => {
        fetchSimilarJobs()
    }, [currentJobId, category])

    const fetchSimilarJobs = async () => {
        try {
            const response = await api.get<PageResponse<VacancyDto>>(`/vacancies?category=${category}&page=0&size=4`)
            const filtered = response.content.filter((job) => job.id !== currentJobId)
            setJobs(filtered.slice(0, 3))
        } catch (err) {
            console.log("[v0] Error fetching similar jobs:", err)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading || jobs.length === 0) {
        return null
    }

    return (
        <section className={styles.section}>
            <h2 className={styles.title}>Similar Job Opportunities</h2>
            <div className={styles.grid}>
                {jobs.map((job) => (
                    <JobCard key={job.id} job={job} onClick={() => router.push(`/jobs/${job.id}`)} />
                ))}
            </div>
        </section>
    )
}
