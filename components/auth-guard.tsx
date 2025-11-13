"use client"

import type React from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function AuthGuard({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) {
    const { isAuthenticated, isLoading, user } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login")
        } else if (!isLoading && requiredRole && user?.role !== requiredRole) {
            router.push("/")
        }
    }, [isLoading, isAuthenticated, requiredRole, user, router])

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>
    }

    if (!isAuthenticated) {
        return null
    }

    if (requiredRole && user?.role !== requiredRole) {
        return null
    }

    return <>{children}</>
}
