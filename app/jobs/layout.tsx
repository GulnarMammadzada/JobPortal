import type React from "react"
import { Header } from "@/components/jobs/header"
import { Sidebar } from "@/components/jobs/sidebar"

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}