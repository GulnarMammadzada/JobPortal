"use client"

import type React from "react"
import { useRouter } from "next/navigation" // Added useRouter
import { useAuth } from "@/lib/auth-context"
import { JobSeekerHeader } from "@/components/jobseeker/jobseeker-header"
// import { CompanyHeader } from "@/components/company/company-header" // Removed CompanyHeader import
import { Header as GeneralHeader } from "@/components/jobs/header"

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter() // Initialize useRouter

  // Render different headers based on user role
  const renderHeader = () => {
    return null; // Temporarily return null for debugging
  }

  return (
    <>
      {renderHeader()}
      {children}
    </>
  )
}