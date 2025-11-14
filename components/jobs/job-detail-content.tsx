"use client"

import type { VacancyDto } from "@/lib/types"
import styles from "./job-detail-content.module.css"

interface JobDetailContentProps {
    job: VacancyDto
}

export function JobDetailContent({ job }: JobDetailContentProps) {
    const parseList = (text: string | null | undefined) => {
        if (!text) return []
        return text.split("\n").filter((item) => item.trim())
    }

    return (
        <div className={styles.content}>
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Job Overview</h2>
                <p className={styles.description}>{job.description}</p>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Requirements</h2>
                <ul className={styles.list}>
                    {parseList(job.requirements).map((req, idx) => (
                        <li key={idx} className={styles.listItem}>
                            <span className="material-symbols-outlined">check_circle</span>
                            {req}
                        </li>
                    ))}
                </ul>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Responsibilities</h2>
                <ul className={styles.list}>
                    {parseList(job.responsibilities).map((resp, idx) => (
                        <li key={idx} className={styles.listItem}>
                            <span className="material-symbols-outlined">arrow_right</span>
                            {resp}
                        </li>
                    ))}
                </ul>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Required Skills</h2>
                <div className={styles.skills}>
                    {job.skills.map((skill, idx) => (
                        <span key={idx} className={styles.skill}>
              {skill}
            </span>
                    ))}
                </div>
            </section>
        </div>
    )
}
