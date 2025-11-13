"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ApiClient } from "@/lib/api-client"
import type { VacancyDto, PageResponse } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DeleteDialog } from "@/components/ui/delete-dialog"
import styles from "./vacancies.module.css"

export default function VacanciesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [vacancies, setVacancies] = useState<VacancyDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PENDING_APPROVAL" | "ACTIVE" | "REJECTED" | "CLOSED" | "DRAFT">("ALL")
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; vacancy: VacancyDto | null }>({
    isOpen: false,
    vacancy: null,
  })
  const api = ApiClient.getInstance()

  // Protect admin route
  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.push("/")
    }
  }, [user, router])

  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchVacancies()
    }
  }, [filterStatus, user])

  const fetchVacancies = async () => {
    setIsLoading(true)
    setError("")

    try {
      const params = new URLSearchParams()
      params.append("page", "0")
      params.append("size", "50")
      if (filterStatus !== "ALL") {
        params.append("status", filterStatus)
      }

      const response = await api.get<PageResponse<VacancyDto>>(`/admin/vacancies/all?${params.toString()}`)
      setVacancies(response.content)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch vacancies")
      console.log("[v0] Error fetching vacancies:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (vacancyId: number) => {
    try {
      await api.put(`/admin/vacancies/${vacancyId}/approve`)
      fetchVacancies()
    } catch (err) {
      console.error("Failed to approve vacancy:", err)
      alert("Failed to approve vacancy: " + (err instanceof Error ? err.message : "Unknown error"))
    }
  }

  const handleReject = async (vacancyId: number) => {
    if (confirm("Are you sure you want to reject this vacancy?")) {
      try {
        await api.put(`/admin/vacancies/${vacancyId}/reject`)
        fetchVacancies()
      } catch (error) {
        console.error("Failed to reject vacancy:", error)
        alert("Failed to reject vacancy: " + (error instanceof Error ? error.message : "Unknown error"))
      }
    }
  }

  const handleDeleteVacancy = async () => {
    if (!deleteDialog.vacancy) return

    await api.delete(`/admin/vacancies/${deleteDialog.vacancy.id}`)
    await fetchVacancies()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800"
      case "PENDING_APPROVAL":
        return "bg-yellow-100 text-yellow-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      case "CLOSED":
        return "bg-gray-100 text-gray-800"
      case "DRAFT":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const pendingCount = vacancies.filter((v) => v.status === "PENDING_APPROVAL").length

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Vacancy Management</h1>
        <p className={styles.subtitle}>Review and manage all job postings</p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <Card className={styles.card}>
        <CardHeader>
          <CardTitle>All Vacancies</CardTitle>
          <CardDescription>
            Total: {vacancies.length} | Pending Review: {pendingCount}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className={styles.filters}>
            {(["ALL", "PENDING_APPROVAL", "ACTIVE", "REJECTED", "CLOSED", "DRAFT"] as const).map((status) => (
              <Button
                key={status}
                onClick={() => setFilterStatus(status)}
                variant={filterStatus === status ? "default" : "outline"}
                size="sm"
              >
                {status.replace("_", " ")}
              </Button>
            ))}
          </div>

          {isLoading ? (
            <div className={styles.loadingContainer}>
              <Spinner />
            </div>
          ) : vacancies.length === 0 ? (
            <div className={styles.noResults}>
              <p>No vacancies found</p>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applications</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vacancies.map((vacancy) => (
                    <TableRow key={vacancy.id}>
                      <TableCell className={styles.titleCell}>
                        <strong>{vacancy.title}</strong>
                      </TableCell>
                      <TableCell>{vacancy.company.companyName}</TableCell>
                      <TableCell>{vacancy.city}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(vacancy.status)}>{vacancy.status}</Badge>
                      </TableCell>
                      <TableCell>{vacancy.applicationCount}</TableCell>
                      <TableCell>
                        <div className={styles.actions}>
                          {vacancy.status === "PENDING_APPROVAL" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApprove(vacancy.id)}
                                className={styles.approveButton}
                              >
                                Approve
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleReject(vacancy.id)}>
                                Reject
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteDialog({ isOpen: true, vacancy })}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, vacancy: null })}
        onConfirm={handleDeleteVacancy}
        title="Delete Vacancy"
        message="Are you sure you want to delete this vacancy? All associated applications and data will be permanently removed."
        itemName={deleteDialog.vacancy?.title}
      />
    </div>
  )
}