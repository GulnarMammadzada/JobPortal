"use client"

import type React from "react"
import { useAuth } from "@/lib/auth-context"
import { JobSeekerHeader } from "@/components/jobseeker/jobseeker-header"
// import { CompanyHeader } from "@/components/company/company-header" // Removed CompanyHeader import
import { Header as GeneralHeader } from "@/components/jobs/header"

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  // Render different headers based on user role
  const renderHeader = () => {
    if (isLoading) {
      return null // Or a loading spinner for the header
    }
    if (user?.role === "JOB_SEEKER") {
      return <JobSeekerHeader />
    }
    if (user?.role === "COMPANY") {
      return null // No header for COMPANY role
    }
    // For now, default to GeneralHeader for non-job seekers or unauthenticated users
    return <GeneralHeader />
  }

  return (
    <>
      {renderHeader()}
      {children}
    </>
  )
}