import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { LayoutContent } from "./layout-content" // Import LayoutContent
import { Toaster } from "@/components/ui/toast" // Import Toaster

const geistSans = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "JobPortal - Find Your Dream Job with AI",
  description: "Connect with top companies and find your dream job with AI-powered matching",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet"/>
      </head>
      <body className={`${geistSans.className} bg-background text-foreground`}>
        <AuthProvider>
          <LayoutContent>{children}</LayoutContent>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  )
}