"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import styles from "./jobseeker-header.module.css"

export function JobSeekerHeader() {
    const { user, logout } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    const handleLogout = () => {
        logout()
        router.push("/auth/login")
    }

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link href="/jobseeker/dashboard" className={styles.logo}>
                    JobPortal
                </Link>

                <nav className={styles.nav}>
                    <Link href="/jobseeker/dashboard" className={`${styles.navLink} ${pathname === "/jobseeker/dashboard" ? styles.navLinkActive : ""}`}>
                        <span className="material-symbols-outlined">home</span>
                        <span>Dashboard</span>
                    </Link>
                    <Link href="/jobs" className={`${styles.navLink} ${pathname.startsWith("/jobs") && pathname !== "/jobs/new" ? styles.navLinkActive : ""}`}>
                        <span className="material-symbols-outlined">search</span>
                        <span>Browse Jobs</span>
                    </Link>
                    <Link href="/my-applications" className={`${styles.navLink} ${pathname.startsWith("/my-applications") ? styles.navLinkActive : ""}`}>
                        <span className="material-symbols-outlined">mail</span>
                        <span>Applications</span>
                    </Link>
                    <Link href="/jobseeker/profile" className={`${styles.navLink} ${pathname.startsWith("/jobseeker/profile") ? styles.navLinkActive : ""}`}>
                        <span className="material-symbols-outlined">person</span>
                        <span>Profile</span>
                    </Link>
                </nav>

                <div className={styles.userMenu}>
                    {user ? (
                        <>
                            <span className={styles.userName}>
                                {user.fullName}
                            </span>
                            <Button onClick={handleLogout} variant="outline" size="sm">
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button onClick={() => router.push('/auth/login')} variant="outline" size="sm">
                                Login
                            </Button>
                            <Button onClick={() => router.push('/auth/register')} size="sm">
                                Sign Up
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
