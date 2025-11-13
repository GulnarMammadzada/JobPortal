"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ApiClient } from "@/lib/api-client"
import type { UserDto, PageResponse } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DeleteDialog } from "@/components/ui/delete-dialog"
import styles from "./users.module.css"

export default function UsersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<UserDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRole, setFilterRole] = useState<"ALL" | "JOB_SEEKER" | "COMPANY" | "ADMIN">("ALL")
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; user: UserDto | null }>({
    isOpen: false,
    user: null,
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
      fetchUsers()
    }
  }, [filterRole, user])

  const fetchUsers = async () => {
    setIsLoading(true)
    setError("")

    try {
      const params = new URLSearchParams()
      params.append("page", "0")
      params.append("size", "50")
      if (filterRole !== "ALL") {
        params.append("role", filterRole)
      }

      const response = await api.get<PageResponse<UserDto>>(`/admin/users?${params.toString()}`)
      setUsers(response.content)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users")
      console.log("[v0] Error fetching users:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      (filterRole === "ALL" || user.role === filterRole) &&
      (`${user.firstname} ${user.lastname}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleDeleteUser = async () => {
    if (!deleteDialog.user) return

    await api.delete(`/admin/users/${deleteDialog.user.id}`)
    await fetchUsers()
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "JOB_SEEKER":
        return "bg-blue-100 text-blue-800"
      case "COMPANY":
        return "bg-green-100 text-green-800"
      case "ADMIN":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>User Management</h1>
        <p className={styles.subtitle}>Manage platform users and their roles</p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <Card className={styles.card}>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Total users: {users.length}</CardDescription>
        </CardHeader>

        <CardContent>
          <div className={styles.filters}>
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />

            <div className={styles.roleButtons}>
              {(["ALL", "JOB_SEEKER", "COMPANY", "ADMIN"] as const).map((role) => (
                <Button
                  key={role}
                  onClick={() => setFilterRole(role)}
                  variant={filterRole === role ? "default" : "outline"}
                  size="sm"
                >
                  {role === "ALL"
                    ? "All"
                    : role === "JOB_SEEKER"
                      ? "Job Seekers"
                      : role === "COMPANY"
                        ? "Companies"
                        : "Admins"}
                </Button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className={styles.loadingContainer}>
              <Spinner />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className={styles.noResults}>
              <p>No users found</p>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className={styles.nameCell}>
                        <strong>
                          {user.firstname} {user.lastname}
                        </strong>
                      </TableCell>
                      <TableCell className={styles.emailCell}>{user.email}</TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.role)}>
                          {user.role === "JOB_SEEKER" ? "Job Seeker" : user.role === "COMPANY" ? "Company" : user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className={styles.dateCell}>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className={styles.actions}>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteDialog({ isOpen: true, user })}
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
        onClose={() => setDeleteDialog({ isOpen: false, user: null })}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message="Are you sure you want to delete this user? All associated data will be permanently removed."
        itemName={deleteDialog.user ? `${deleteDialog.user.firstname} ${deleteDialog.user.lastname} (${deleteDialog.user.email})` : undefined}
      />
    </div>
  )
}