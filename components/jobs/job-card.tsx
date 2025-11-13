"use client"

import { Badge } from "@/components/ui/badge"
import type { VacancyDto } from "@/lib/types"
import styles from "./job-card.module.css"

interface JobCardProps {
    job: VacancyDto
    onClick: () => void
}

export function JobCard({ job, onClick }: JobCardProps) {
    return (
        <div className={styles.card} onClick={onClick}>
            <div className={styles.header}>
                {job.company.logoUrl && (
                    <img src={job.company.logoUrl || "/placeholder.svg"} alt={job.company.companyName} className={styles.logo} />
                )}
                <div className={styles.headerContent}>
                    <h3 className={styles.title}>{job.title}</h3>
                    <p className={styles.company}>{job.company.companyName}</p>
                </div>
            </div>

            <div className={styles.badges}>
                <Badge variant="secondary">{job.employmentType}</Badge>
                {job.isRemote && <Badge variant="outline">Remote</Badge>}
                <Badge>{job.experienceLevel}</Badge>
            </div>

            <p className={styles.description}>{job.description.substring(0, 120)}...</p>

            <div className={styles.footer}>
                <div className={styles.location}>
                    <span className={styles.icon}>📍</span>
                    {job.city}
                </div>
                <div className={styles.salary}>
                    {job.salaryMin && job.salaryMax ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}` : 'Salary not specified'}
                </div>
            </div>

            <div className={styles.meta}>
                <span className={styles.posted}>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                <span className={styles.views}>{job.viewCount} views</span>
            </div>
        </div>
    )
}
