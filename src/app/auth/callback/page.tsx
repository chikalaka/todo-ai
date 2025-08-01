"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"

export default function CallbackPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    // If user is authenticated, redirect to home
    if (!loading && user) {
      router.push("/")
    } else if (!loading && !user) {
      // If not authenticated after loading, redirect to auth page
      router.push("/auth")
    }
  }, [user, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Completing authentication...</p>
      </div>
    </div>
  )
}
