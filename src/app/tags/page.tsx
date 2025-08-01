"use client"

import { useAuth } from "@/components/auth/AuthProvider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { AppLayout } from "@/components/layout/AppSidebar"
import { TagManagement } from "@/components/tags/TagManagement"

export default function TagsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <AppLayout>
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Manage Tags</h1>
            <p className="text-gray-600 mt-2">
              Create, edit, and organize your tags to better categorize your
              todos
            </p>
          </div>

          <TagManagement />
        </div>
      </main>
    </AppLayout>
  )
}
