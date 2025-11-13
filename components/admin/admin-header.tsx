"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import styles from "./admin-header.module.css"

export function AdminHeader() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/auth/login")
  }

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h1 className={styles.title}>Admin Control Panel</h1>
        <div className={styles.right}>
          {user && (
            <>
              <span className={styles.userName}>
                {user.firstname} {user.lastname}
              </span>
              <Button onClick={handleLogout} variant="outline" size="sm">
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}