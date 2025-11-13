"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import styles from "./header.module.css"

export function Header() {
    const { user, logout } = useAuth()
    const router = useRouter()

    const handleLogout = () => {
        logout()
        router.push("/auth/login")
    }

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link href="/jobs" className={styles.logo}>
                    VacancyService
                </Link>

                <nav className={styles.nav}>
                    <Link href="/jobs" className={styles.navLink}>
                        Browse Jobs
                    </Link>
                    <Link href="/companies" className={styles.navLink}>
                        Companies
                    </Link>
                    {user && (
                        <>
                            <Link href="/my-applications" className={styles.navLink}>
                                My Applications
                            </Link>
                            <Link href="/recommendations" className={styles.navLink}>
                                Recommendations
                            </Link>
                            <Link href="/saved-jobs" className={styles.navLink}>
                                Saved Jobs
                            </Link>
                        </>
                    )}
                </nav>

                <div className={styles.userMenu}>
                    {user ? (
                        <>
                            <span className={styles.userName}>
                                {user.firstname} {user.lastname}
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
