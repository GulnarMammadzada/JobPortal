"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { ApiClient } from "@/lib/api-client"
import type { VacancyDto, PageResponse } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"

export default function CompanyVacanciesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [vacancies, setVacancies] = useState<VacancyDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const api = ApiClient.getInstance()

  useEffect(() => {
    if (user?.role !== "COMPANY") {
      router.push("/")
      return
    }
    fetchVacancies()
  }, [user, filter, router])

  const fetchVacancies = async () => {
    try {
      setIsLoading(true)
      let endpoint = `/vacancies/my?page=0&size=50`
      if (filter !== "all") {
        endpoint = `/vacancies/my?status=${filter.toUpperCase()}&page=0&size=50`
      }
      const response = await api.get<PageResponse<VacancyDto>>(endpoint)
      setVacancies(response.content || [])
    } catch (error) {
      console.error("Failed to fetch vacancies:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE: "bg-green-100 text-green-800",
      PENDING_APPROVAL: "bg-yellow-100 text-yellow-800",
      CLOSED: "bg-gray-100 text-gray-800",
      REJECTED: "bg-red-100 text-red-800",
      DRAFT: "bg-blue-100 text-blue-800",
    }
    return <Badge className={styles[status] || ""}>{status.replace("_", " ")}</Badge>
  }

  const stats = {
    total: vacancies.length,
    active: vacancies.filter(v => v.status === "ACTIVE").length,
    pending: vacancies.filter(v => v.status === "PENDING_APPROVAL").length,
    closed: vacancies.filter(v => v.status === "CLOSED").length,
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Vacancies</h1>
          <p className="text-gray-600 mt-1">Manage your job postings</p>
        </div>
        <Button onClick={() => router.push("/company/vacancies/new")}>
          + Create New Vacancy
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total Vacancies</div>
          <div className="text-2xl font-bold mt-1">{stats.total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Active</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{stats.active}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Pending Approval</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Closed</div>
          <div className="text-2xl font-bold text-gray-600 mt-1">{stats.closed}</div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          variant={filter === "active" ? "default" : "outline"}
          onClick={() => setFilter("active")}
        >
          Active
        </Button>
        <Button
          variant={filter === "pending_approval" ? "default" : "outline"}
          onClick={() => setFilter("pending_approval")}
        >
          Pending
        </Button>
        <Button
          variant={filter === "closed" ? "default" : "outline"}
          onClick={() => setFilter("closed")}
        >
          Closed
        </Button>
      </div>

      {/* Vacancies List */}
      {vacancies.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-xl font-semibold mb-2">No Vacancies Yet</h3>
          <p className="text-gray-600 mb-4">
            {filter === "all"
              ? "You haven't posted any jobs yet. Create your first vacancy to start hiring!"
              : `No ${filter.replace("_", " ")} vacancies found.`}
          </p>
          {filter === "all" && (
            <Button onClick={() => router.push("/company/vacancies/new")}>
              Create Your First Vacancy
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {vacancies.map((vacancy) => (
            <Card key={vacancy.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Link
                      href={`/company/vacancies/${vacancy.id}`}
                      className="text-xl font-semibold hover:text-blue-600"
                    >
                      {vacancy.title}
                    </Link>
                    {getStatusBadge(vacancy.status)}
                    {vacancy.isRemote && (
                      <Badge className="bg-purple-100 text-purple-800">Remote</Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">📍 Location:</span> {vacancy.city}
                    </div>
                    <div>
                      <span className="font-medium">💰 Salary:</span> {vacancy.salaryMin}-{vacancy.salaryMax} {vacancy.salaryCurrency}
                    </div>
                    <div>
                      <span className="font-medium">💼 Type:</span> {vacancy.employmentType.replace("_", " ")}
                    </div>
                    <div>
                      <span className="font-medium">📊 Level:</span> {vacancy.experienceLevel}
                    </div>
                  </div>

                  <div className="flex gap-6 mt-3 text-sm text-gray-600">
                    <div>👁️ <span className="font-medium">{vacancy.viewCount}</span> views</div>
                    <div>📨 <span className="font-medium">{vacancy.applicationCount}</span> applications</div>
                    <div>📅 Posted: {new Date(vacancy.createdAt).toLocaleDateString()}</div>
                    <div>⏰ Deadline: {new Date(vacancy.deadline).toLocaleDateString()}</div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {vacancy.skills.slice(0, 5).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                    {vacancy.skills.length > 5 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        +{vacancy.skills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/company/vacancies/${vacancy.id}`)}
                  >
                    📨 Applications ({vacancy.applicationCount})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/company/vacancies/${vacancy.id}/edit`)}
                  >
                    ✏️ Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/jobs/${vacancy.id}`)}
                  >
                    👁️ Preview
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
