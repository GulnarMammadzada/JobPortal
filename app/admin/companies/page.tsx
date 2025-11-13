"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ApiClient } from "@/lib/api-client"
import type { CompanyDto } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DeleteDialog } from "@/components/ui/delete-dialog"
import styles from "./companies.module.css"

export default function AdminCompaniesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const api = ApiClient.getInstance()
  const [companies, setCompanies] = useState<CompanyDto[]>([])
  const [pendingCompanies, setPendingCompanies] = useState<CompanyDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; company: CompanyDto | null }>({
    isOpen: false,
    company: null,
  })

  // Protect admin route
  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.push("/")
    }
  }, [user, router])

  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchCompanies()
    }
  }, [user])

  const fetchCompanies = async () => {
    try {
      setIsLoading(true)
      const [allResponse, pendingResponse] = await Promise.all([
        api.get<any>("/companies?page=0&size=100"),
        api.get<any>("/admin/companies/pending?page=0&size=50"),
      ])

      setCompanies(allResponse.content || [])
      setPendingCompanies(pendingResponse.content || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch companies")
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (companyId: number) => {
    try {
      setProcessingId(companyId)
      await api.put(`/admin/companies/${companyId}/approve`, { approved: true })
      await fetchCompanies()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve company")
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (companyId: number) => {
    try {
      setProcessingId(companyId)
      await api.put(`/admin/companies/${companyId}/approve`, { approved: false })
      await fetchCompanies()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject company")
    } finally {
      setProcessingId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.company) return

    await api.delete(`/admin/companies/${deleteDialog.company.id}`)
    await fetchCompanies()
  }

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Company Management</h1>
          <p className={styles.subtitle}>Approve and manage companies on the platform</p>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.mainContent}>
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">
              Pending Approval ({pendingCompanies.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              All Companies ({companies.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {pendingCompanies.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No companies pending approval</p>
              </div>
            ) : (
              <div className={styles.companiesList}>
                {pendingCompanies.map((company) => (
                  <Card key={company.id} className={styles.companyCard}>
                    <CardContent>
                      <div className={styles.companyHeader}>
                        <div className={styles.companyInfo}>
                          <div className={styles.companyLogo}>
                            {company.logoUrl ? (
                              <img src={company.logoUrl} alt={company.companyName} />
                            ) : (
                              <span className={styles.logoPlaceholder}>
                                {company.companyName.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div>
                            <h3 className={styles.companyName}>{company.companyName}</h3>
                            <p className={styles.companyMeta}>
                              {company.industry} • {company.companySize} • {company.city}
                            </p>
                          </div>
                        </div>
                        <Badge variant="warning">Pending</Badge>
                      </div>

                      {company.description && (
                        <p className={styles.description}>{company.description}</p>
                      )}

                      {company.website && (
                        <p className={styles.website}>
                          <strong>Website:</strong>{" "}
                          <a href={company.website} target="_blank" rel="noopener noreferrer">
                            {company.website}
                          </a>
                        </p>
                      )}

                      <div className={styles.actions}>
                        <Button
                          variant="default"
                          onClick={() => handleApprove(company.id)}
                          disabled={processingId === company.id}
                        >
                          {processingId === company.id ? "Processing..." : "Approve"}
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleReject(company.id)}
                          disabled={processingId === company.id}
                        >
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all">
            <div className={styles.companiesList}>
              {companies.map((company) => (
                <Card key={company.id} className={styles.companyCard}>
                  <CardContent>
                    <div className={styles.companyHeader}>
                      <div className={styles.companyInfo}>
                        <div className={styles.companyLogo}>
                          {company.logoUrl ? (
                            <img src={company.logoUrl} alt={company.companyName} />
                          ) : (
                            <span className={styles.logoPlaceholder}>
                              {company.companyName.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className={styles.companyName}>{company.companyName}</h3>
                          <p className={styles.companyMeta}>
                            {company.industry} • {company.companySize} • {company.city}
                          </p>
                        </div>
                      </div>
                      {company.isVerified ? (
                        <Badge variant="success">✓ Verified</Badge>
                      ) : (
                        <Badge variant="secondary">Not Verified</Badge>
                      )}
                    </div>

                    {company.description && (
                      <p className={styles.description}>
                        {company.description.substring(0, 150)}
                        {company.description.length > 150 ? "..." : ""}
                      </p>
                    )}

                    {company.website && (
                      <p className={styles.website}>
                        <strong>Website:</strong>{" "}
                        <a href={company.website} target="_blank" rel="noopener noreferrer">
                          {company.website}
                        </a>
                      </p>
                    )}

                    {company.averageRating && company.totalReviews && company.totalReviews > 0 && (
                      <div className={styles.rating}>
                        <span className={styles.stars}>
                          {"⭐".repeat(Math.round(company.averageRating))}
                        </span>
                        <span className={styles.ratingText}>
                          {company.averageRating.toFixed(1)} ({company.totalReviews} reviews)
                        </span>
                      </div>
                    )}

                    <div className={styles.actions}>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteDialog({ isOpen: true, company })}
                      >
                        Delete Company
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, company: null })}
        onConfirm={handleDelete}
        title="Delete Company"
        message="Are you sure you want to delete this company? All associated data including vacancies and applications will be removed."
        itemName={deleteDialog.company?.companyName}
      />
    </div>
  )
}
