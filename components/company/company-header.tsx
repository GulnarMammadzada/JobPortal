"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import styles from "./company-header.module.css"

export function CompanyHeader() {
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
                <Link href="/company/dashboard" className={styles.logo}>
                    JobPortal
                </Link>

                <nav className={styles.nav}>
                    <Link href="/company/dashboard" className={`${styles.navLink} ${pathname === "/company/dashboard" ? styles.navLinkActive : ""}`}>
                        <span className="material-symbols-outlined">dashboard</span>
                        <span>Dashboard</span>
                    </Link>
                    <Link href="/company/vacancies" className={`${styles.navLink} ${pathname.startsWith("/company/vacancies") ? styles.navLinkActive : ""}`}>
                        <span className="material-symbols-outlined">work</span>
                        <span>My Vacancies</span>
                    </Link>
                    <Link href="/company/ai-generator" className={`${styles.navLink} ${pathname.startsWith("/company/ai-generator") ? styles.navLinkActive : ""}`}>
                        <span className="material-symbols-outlined">smart_toy</span>
                        <span>AI Generator</span>
                    </Link>
                    <Link href="/company/profile" className={`${styles.navLink} ${pathname.startsWith("/company/profile") ? styles.navLinkActive : ""}`}>
                        <span className="material-symbols-outlined">business_center</span>
                        <span>Profile</span>
                    </Link>
                </nav>

                <div className={styles.userMenu}>
                    {user ? (
                        <>
                            <Link href="/company/vacancies/new" className={styles.postJobButton}>
                                <span className="material-symbols-outlined">add_circle</span>
                                <span>Post New Job</span>
                            </Link>
                            <span className={styles.userName}>
                                {user.company?.companyName || user.fullName}
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
