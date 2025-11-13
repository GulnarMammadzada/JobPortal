"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuth } from "@/lib/auth-context"

interface ProtectedRouteProps {
    children: React.ReactNode
    requiredRole?: string | string[]
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const { user, isLoading, isAuthenticated } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (isLoading) return

        if (!isAuthenticated) {
            router.push("/login")
            return
        }

        if (requiredRole) {
            const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
            if (user && !roles.includes(user.role)) {
                router.push("/unauthorized")
            }
        }
    }, [isAuthenticated, isLoading, requiredRole, user, router])

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>
    }

    if (!isAuthenticated) {
        return null
    }

    if (requiredRole) {
        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
        if (user && !roles.includes(user.role)) {
            return null
        }
    }

    return <>{children}</>
}
