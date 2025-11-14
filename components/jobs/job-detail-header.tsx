"use client"

import { Badge } from "@/components/ui/badge"
import type { VacancyDto } from "@/lib/types"
import styles from "./job-detail-header.module.css"

interface JobDetailHeaderProps {
    job: VacancyDto
}

export function JobDetailHeader({ job }: JobDetailHeaderProps) {
    return (
        <div className={styles.header}>
            {job.company.logoUrl && (
                <img src={job.company.logoUrl || "/placeholder.svg"} alt={job.company.companyName} className={styles.logo} />
            )}

            <div className={styles.content}>
                <h1 className={styles.title}>{job.title}</h1>
                <p className={styles.company}>{job.company.companyName}</p>

                <div className={styles.badges}>
                    <Badge variant="default">{job.employmentType}</Badge>
                    <Badge variant="secondary">{job.experienceLevel}</Badge>
                    {job.isRemote && <Badge variant="remote">Remote</Badge>}
                </div>

                <div className={styles.info}>
                    <span className={styles.infoItem}><span className="material-symbols-outlined">location_on</span> {job.city}</span>
                    <span className={styles.infoItem}>
                        <span className="material-symbols-outlined">payments</span> {job.salaryMin && job.salaryMax ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}` : 'Salary not specified'}
                    </span>
                    <span className={styles.infoItem}><span className="material-symbols-outlined">visibility</span> {job.viewCount} views</span>
                </div>
            </div>
        </div>
    )
}
