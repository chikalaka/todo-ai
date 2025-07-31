"use client"

import { useAuth } from "@/components/auth/AuthProvider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { AppLayout } from "@/components/layout/AppSidebar"
import { TodoList } from "@/components/todos/TodoList"

export default function ArchivePage() {
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
            <h1 className="text-2xl font-bold text-gray-900">Archive</h1>
            <p className="text-gray-600 mt-1">
              View your completed and archived tasks
            </p>
          </div>

          {/* For now, using the same TodoList component, but this could be enhanced 
              to filter for completed/archived todos specifically */}
          <TodoList />
        </div>
      </main>
    </AppLayout>
  )
}
