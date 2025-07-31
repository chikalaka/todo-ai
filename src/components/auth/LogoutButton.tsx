"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useAuth } from "./AuthProvider"

export function LogoutButton() {
  const { signOut, loading } = useAuth()

  return (
    <Button
      onClick={signOut}
      disabled={loading}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      {loading ? "Loading..." : "Sign out"}
    </Button>
  )
}
