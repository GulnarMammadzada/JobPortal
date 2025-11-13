"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ApiClient } from "@/lib/api-client"
import type { VacancyDto, ApplicationDto, PageResponse } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function VacancyApplicationsPage() {
  const router = useRouter()
  const params = useParams()
  const vacancyId = params.id as string
  const api = ApiClient.getInstance()

  const [vacancy, setVacancy] = useState<VacancyDto | null>(null)
  const [applications, setApplications] = useState<ApplicationDto[]>([])
  const [filteredApplications, setFilteredApplications] = useState<ApplicationDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [selectedApp, setSelectedApp] = useState<ApplicationDto | null>(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState("")
  const [notes, setNotes] = useState("")
  const [selectedApps, setSelectedApps] = useState<Set<number>>(new Set())
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [bulkStatus, setBulkStatus] = useState("")

  useEffect(() => {
    fetchData()
  }, [vacancyId])

  useEffect(() => {
    filterApplications()
  }, [filter, applications])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [vacancyRes, appsRes] = await Promise.all([
        api.get<VacancyDto>(`/vacancies/${vacancyId}`),
        api.get<PageResponse<ApplicationDto>>(`/applications/vacancy/${vacancyId}?page=0&size=100`)
      ])
      setVacancy(vacancyRes)
      setApplications(appsRes.content || [])
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterApplications = () => {
    if (filter === "all") {
      setFilteredApplications(applications)
    } else {
      setFilteredApplications(applications.filter(app => app.status === filter.toUpperCase()))
    }
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50"
    if (score >= 60) return "text-orange-600 bg-orange-50"
    return "text-red-600 bg-red-50"
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      REVIEWED: "bg-blue-100 text-blue-800",
      SHORTLISTED: "bg-purple-100 text-purple-800",
      INTERVIEW_SCHEDULED: "bg-orange-100 text-orange-800",
      INTERVIEWED: "bg-cyan-100 text-cyan-800",
      OFFER_SENT: "bg-yellow-100 text-yellow-800",
      ACCEPTED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
    }
    return <Badge className={styles[status] || ""}>{status.replace("_", " ")}</Badge>
  }

  const handleChangeStatus = async () => {
    if (!selectedApp || !newStatus) return

    try {
      await api.put(`/applications/${selectedApp.id}/status`, {
        status: newStatus,
        notes: notes
      })
      setShowStatusModal(false)
      setSelectedApp(null)
      setNewStatus("")
      setNotes("")
      fetchData() // Refresh data
    } catch (error) {
      console.error("Failed to update status:", error)
      alert("Failed to update status")
    }
  }

  const handleBulkStatusChange = async () => {
    if (selectedApps.size === 0 || !bulkStatus) return

    try {
      const promises = Array.from(selectedApps).map(appId =>
        api.put(`/applications/${appId}/status`, {
          status: bulkStatus,
          notes: `Bulk status update to ${bulkStatus}`
        })
      )
      await Promise.all(promises)
      setShowBulkModal(false)
      setSelectedApps(new Set())
      setBulkStatus("")
      fetchData()
    } catch (error) {
      console.error("Failed to update statuses:", error)
      alert("Failed to update statuses")
    }
  }

  const handleSelectApp = (appId: number) => {
    const newSelected = new Set(selectedApps)
    if (newSelected.has(appId)) {
      newSelected.delete(appId)
    } else {
      newSelected.add(appId)
    }
    setSelectedApps(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedApps.size === filteredApplications.length) {
      setSelectedApps(new Set())
    } else {
      setSelectedApps(new Set(filteredApplications.map(app => app.id)))
    }
  }

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Phone", "Match Score", "Status", "Applied Date", "Experience", "Skills"]
    const rows = filteredApplications.map(app => [
      app.fullName,
      app.email,
      app.phone,
      app.matchScore,
      app.status,
      new Date(app.createdAt).toLocaleDateString(),
      app.experienceYears || "N/A",
      app.parsedSkills || "N/A"
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `applications_${vacancy?.title}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === "PENDING").length,
    reviewed: applications.filter(a => a.status === "REVIEWED").length,
    shortlisted: applications.filter(a => a.status === "SHORTLISTED").length,
    interview: applications.filter(a => a.status === "INTERVIEW_SCHEDULED").length,
    avgMatchScore: applications.length > 0
      ? Math.round(applications.reduce((sum, a) => sum + a.matchScore, 0) / applications.length)
      : 0
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  if (!vacancy) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>Vacancy not found</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Back Button */}
      <div className="mb-4">
        <Button variant="outline" onClick={() => router.push("/company/vacancies")}>
          ← Back to Vacancies
        </Button>
      </div>

      {/* Vacancy Info */}
      <Card className="p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{vacancy.title}</h1>
            <div className="flex gap-3 items-center mb-4">
              {getStatusBadge(vacancy.status)}
              {vacancy.isRemote && <Badge className="bg-purple-100 text-purple-800">Remote</Badge>}
              <span className="text-gray-600">📍 {vacancy.city}</span>
              <span className="text-gray-600">💰 {vacancy.salaryMin}-{vacancy.salaryMax} {vacancy.salaryCurrency}</span>
            </div>
            <div className="flex gap-4 text-sm text-gray-600">
              <div>👁️ {vacancy.viewCount} views</div>
              <div>📨 {vacancy.applicationCount} applications</div>
              <div>📅 Posted: {new Date(vacancy.createdAt).toLocaleDateString()}</div>
              <div>⏰ Deadline: {new Date(vacancy.deadline).toLocaleDateString()}</div>
            </div>
          </div>
          <Button variant="outline" onClick={() => router.push(`/jobs/${vacancy.id}`)}>
            Preview Public Page
          </Button>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total</div>
          <div className="text-2xl font-bold mt-1">{stats.total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Pending</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Reviewed</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{stats.reviewed}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Shortlisted</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">{stats.shortlisted}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Interview</div>
          <div className="text-2xl font-bold text-orange-600 mt-1">{stats.interview}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Avg Match</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{stats.avgMatchScore}%</div>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2 flex-wrap">
          <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
            All ({stats.total})
          </Button>
          <Button variant={filter === "pending" ? "default" : "outline"} onClick={() => setFilter("pending")}>
            Pending ({stats.pending})
          </Button>
          <Button variant={filter === "reviewed" ? "default" : "outline"} onClick={() => setFilter("reviewed")}>
            Reviewed ({stats.reviewed})
          </Button>
          <Button variant={filter === "shortlisted" ? "default" : "outline"} onClick={() => setFilter("shortlisted")}>
            Shortlisted ({stats.shortlisted})
          </Button>
          <Button variant={filter === "interview_scheduled" ? "default" : "outline"} onClick={() => setFilter("interview_scheduled")}>
            Interview ({stats.interview})
          </Button>
        </div>

        <div className="flex gap-2">
          {selectedApps.size > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowBulkModal(true)}
              className="bg-blue-50"
            >
              📝 Bulk Update ({selectedApps.size})
            </Button>
          )}
          <Button
            variant="outline"
            onClick={exportToCSV}
            disabled={filteredApplications.length === 0}
          >
            📥 Export CSV
          </Button>
        </div>
      </div>

      {/* Select All Checkbox */}
      {filteredApplications.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedApps.size === filteredApplications.length && filteredApplications.length > 0}
            onChange={handleSelectAll}
            className="w-4 h-4"
            id="select-all"
          />
          <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
            Select All ({filteredApplications.length} applications)
          </label>
          {selectedApps.size > 0 && (
            <span className="ml-auto text-sm text-gray-600">
              {selectedApps.size} selected
            </span>
          )}
        </div>
      )}

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-4xl mb-4">📭</div>
          <h3 className="text-xl font-semibold mb-2">No Applications Yet</h3>
          <p className="text-gray-600">
            {filter === "all"
              ? "No one has applied to this vacancy yet."
              : `No ${filter.replace("_", " ")} applications found.`}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => (
            <Card key={app.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex gap-4 flex-1">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedApps.has(app.id)}
                    onChange={() => handleSelectApp(app.id)}
                    className="w-5 h-5 mt-8"
                  />
                  {/* Match Score */}
                  <div className={`flex items-center justify-center w-20 h-20 rounded-full font-bold text-2xl ${getMatchScoreColor(app.matchScore)}`}>
                    {app.matchScore}%
                  </div>

                  {/* Candidate Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{app.fullName}</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>✉️ {app.email}</div>
                      <div>📱 {app.phone}</div>
                      <div>📅 Applied: {new Date(app.createdAt).toLocaleDateString()}</div>
                      {app.experienceYears && <div>💼 Experience: {app.experienceYears} years</div>}
                    </div>

                    {app.parsedSkills && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {app.parsedSkills.split(",").slice(0, 5).map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    {app.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                        <span className="font-medium">Notes:</span> {app.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 ml-4">
                  {getStatusBadge(app.status)}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`http://localhost:8080${app.cvFileUrl}`, "_blank")}
                  >
                    📄 View CV
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedApp(app)
                      setNewStatus(app.status)
                      setNotes(app.notes || "")
                      setShowStatusModal(true)
                    }}
                  >
                    Change Status
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Bulk Status Change Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowBulkModal(false)}>
          <Card className="p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">Bulk Status Update</h2>
            <p className="text-gray-600 mb-4">
              Update status for {selectedApps.size} selected applications
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">New Status</label>
                <select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select Status</option>
                  <option value="REVIEWED">Reviewed</option>
                  <option value="SHORTLISTED">Shortlisted</option>
                  <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                  <option value="INTERVIEWED">Interviewed</option>
                  <option value="OFFER_SENT">Offer Sent</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
                ⚠️ This will update all selected applications. Each candidate will receive an email notification.
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleBulkStatusChange}
                  className="flex-1"
                  disabled={!bulkStatus}
                >
                  Update {selectedApps.size} Applications
                </Button>
                <Button variant="outline" onClick={() => setShowBulkModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Status Change Modal */}
      {showStatusModal && selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowStatusModal(false)}>
          <Card className="p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">Change Application Status</h2>
            <p className="text-gray-600 mb-4">Candidate: {selectedApp.fullName}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="PENDING">Pending</option>
                  <option value="REVIEWED">Reviewed</option>
                  <option value="SHORTLISTED">Shortlisted</option>
                  <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                  <option value="INTERVIEWED">Interviewed</option>
                  <option value="OFFER_SENT">Offer Sent</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes / Message to Candidate</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={4}
                  placeholder="Add notes or a message that will be sent to the candidate..."
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleChangeStatus} className="flex-1">
                  Update Status
                </Button>
                <Button variant="outline" onClick={() => setShowStatusModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
