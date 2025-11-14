"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import styles from "./job-filters.module.css"

interface JobFiltersProps {
    filters: {
        location: string
        salaryMin: number
        salaryMax: number
        employmentType: string
        experienceLevel: string
        isRemote: boolean
        category?: string
        skills?: string
        postedWithin?: string
    }
    onFilterChange: (filters: any) => void
}

const CATEGORIES = ["IT", "Finance", "Marketing", "Sales", "HR", "Engineering", "Design", "Healthcare", "Education"]
const POSTED_OPTIONS = [
    { label: "Last 24 hours", value: "1" },
    { label: "Last 7 days", value: "7" },
    { label: "Last 30 days", value: "30" },
    { label: "Any time", value: "" }
]

export function JobFilters({ filters, onFilterChange }: JobFiltersProps) {
    const [localFilters, setLocalFilters] = useState(filters)

    const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const updated = { ...localFilters, location: e.target.value }
        setLocalFilters(updated)
        onFilterChange(updated)
    }

    const handleSalaryChange = (value: number[]) => {
        const updated = { ...localFilters, salaryMin: value[0], salaryMax: value[1] }
        setLocalFilters(updated)
        onFilterChange(updated)
    }

    const handleEmploymentTypeChange = (type: string) => {
        const updated = { ...localFilters, employmentType: type }
        setLocalFilters(updated)
        onFilterChange(updated)
    }

    const handleExperienceLevelChange = (level: string) => {
        const updated = { ...localFilters, experienceLevel: level }
        setLocalFilters(updated)
        onFilterChange(updated)
    }

    const handleRemoteChange = () => {
        const updated = { ...localFilters, isRemote: !localFilters.isRemote }
        setLocalFilters(updated)
        onFilterChange(updated)
    }

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const updated = { ...localFilters, category: e.target.value }
        setLocalFilters(updated)
        onFilterChange(updated)
    }

    const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const updated = { ...localFilters, skills: e.target.value }
        setLocalFilters(updated)
        onFilterChange(updated)
    }

    const handlePostedWithinChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const updated = { ...localFilters, postedWithin: e.target.value }
        setLocalFilters(updated)
        onFilterChange(updated)
    }

    const handleReset = () => {
        const reset = {
            location: "",
            salaryMin: 0,
            salaryMax: 500000,
            employmentType: "",
            experienceLevel: "",
            isRemote: false,
            category: "",
            skills: "",
            postedWithin: "",
        }
        setLocalFilters(reset)
        onFilterChange(reset)
    }

    return (
        <div className={styles.filters}>
            <h3 className={styles.title}>Filters</h3>
            <Button onClick={handleReset} variant="outline" className={styles.resetButton}>
                Clear All Filters
            </Button>

            <Card className={styles.filterSection}>
                <h4 className={styles.sectionTitle}><span className="material-symbols-outlined">search</span> Keyword Search</h4>
                <input
                    type="text"
                    placeholder="Search skills..."
                    value={localFilters.skills || ""}
                    onChange={handleSkillsChange}
                    className={styles.input}
                />
                <p className="text-xs text-gray-500 mt-1">e.g., Java, React, Python</p>
            </Card>

            <Card className={styles.filterSection}>
                <h4 className={styles.sectionTitle}><span className="material-symbols-outlined">category</span> Category</h4>
                <select
                    value={localFilters.category || ""}
                    onChange={handleCategoryChange}
                    className={styles.input}
                >
                    <option value="">All Categories</option>
                    {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </Card>

            <Card className={styles.filterSection}>
                <h4 className={styles.sectionTitle}><span className="material-symbols-outlined">location_on</span> Location</h4>
                <input
                    type="text"
                    placeholder="Enter city..."
                    value={localFilters.location}
                    onChange={handleLocationChange}
                    className={styles.input}
                />
            </Card>

            <Card className={styles.filterSection}>
                <h4 className={styles.sectionTitle}><span className="material-symbols-outlined">calendar_today</span> Posted Date</h4>
                <select
                    value={localFilters.postedWithin || ""}
                    onChange={handlePostedWithinChange}
                    className={styles.input}
                >
                    {POSTED_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </Card>

            <Card className={styles.filterSection}>
                <h4 className={styles.sectionTitle}><span className="material-symbols-outlined">payments</span> Salary Range</h4>
                <div className={styles.salaryDisplay}>
                    <span>${localFilters.salaryMin.toLocaleString()}</span>
                    <span>-</span>
                    <span>${localFilters.salaryMax.toLocaleString()}</span>
                </div>
                <Slider
                    min={0}
                    max={500000}
                    step={10000}
                    value={[localFilters.salaryMin, localFilters.salaryMax]}
                    onValueChange={handleSalaryChange}
                    className={styles.slider}
                />
            </Card>

            <Card className={styles.filterSection}>
                <h4 className={styles.sectionTitle}><span className="material-symbols-outlined">work</span> Employment Type</h4>
                <div className={styles.checkboxGroup}>
                    {["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"].map((type) => (
                        <div key={type} className={styles.checkboxItem}>
                            <Checkbox
                                id={type}
                                checked={localFilters.employmentType === type}
                                onCheckedChange={() => handleEmploymentTypeChange(type)}
                            />
                            <Label htmlFor={type} className={styles.label}>
                                {type.replace("_", " ")}
                            </Label>
                        </div>
                    ))}
                </div>
            </Card>

            <Card className={styles.filterSection}>
                <h4 className={styles.sectionTitle}><span className="material-symbols-outlined">trending_up</span> Experience Level</h4>
                <div className={styles.checkboxGroup}>
                    {["JUNIOR", "MID", "SENIOR", "LEAD"].map((level) => (
                        <div key={level} className={styles.checkboxItem}>
                            <Checkbox
                                id={level}
                                checked={localFilters.experienceLevel === level}
                                onCheckedChange={() => handleExperienceLevelChange(level)}
                            />
                            <Label htmlFor={level} className={styles.label}>
                                {level}
                            </Label>
                        </div>
                    ))}
                </div>
            </Card>

            <Card className={styles.filterSection}>
                <div className={styles.checkboxItem}>
                    <Checkbox id="remote" checked={localFilters.isRemote} onCheckedChange={handleRemoteChange} />
                    <Label htmlFor="remote" className={styles.label}>
                        Remote Only
                    </Label>
                </div>
            </Card>

            {/* Removed the old reset button as a new one is added at the top */}
            {/* <Button onClick={handleReset} variant="outline" className={styles.resetButton}>
                Reset Filters
            </Button> */}
        </div>
    )
}
