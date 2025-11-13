"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { UserDto, AuthResponse } from "./types"
import { ApiClient } from "./api-client"

interface AuthContextType {
    user: UserDto | null
    isLoading: boolean
    isAuthenticated: boolean
    login: (email: string, password: string) => Promise<UserDto | null>
    register: (fullName: string, email: string, password: string, phone: string, role: "JOB_SEEKER" | "COMPANY", companyData?: any) => Promise<void>
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserDto | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const api = ApiClient.getInstance()

    // Check if user is already logged in on mount
    useEffect(() => {
        const checkAuth = async () => {
            if (api.getAccessToken()) {
                try {
                    const userData = await api.get<UserDto>("/users/me")
                    setUser(userData)
                } catch {
                    api.clearTokens()
                }
            }
            setIsLoading(false)
        }

        checkAuth()
    }, [])

    const login = async (email: string, password: string) => {
        try {
            console.log("AuthContext: Login attempt for", email)
            const response = await api.post<AuthResponse>("/auth/login", { email, password })
            console.log("AuthContext: Login response", { hasToken: !!response.accessToken, hasUser: !!response.user })
            api.setTokens(response.accessToken, response.refreshToken)
            setUser(response.user)
            return response.user
        } catch (error) {
            console.error("AuthContext: Login error", error)
            throw error
        }
    }

    const register = async (fullName: string, email: string, password: string, phone: string, role: "JOB_SEEKER" | "COMPANY", companyData?: any) => {
        const requestData: any = {
            fullName,
            email,
            password,
            phone,
            role,
        }

        // Add company-specific fields if registering as company
        if (role === "COMPANY" && companyData) {
            Object.assign(requestData, companyData)
        }

        const response = await api.post<AuthResponse>("/auth/register", requestData)
        api.setTokens(response.accessToken, response.refreshToken)
        setUser(response.user)
    }

    const logout = () => {
        api.clearTokens()
        setUser(null)
        // Disconnect WebSocket
        if (typeof window !== "undefined") {
            const { WebSocketService } = require("./websocket")
            WebSocketService.getInstance().disconnect()
        }
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider")
    }
    return context
}
