"use client"

import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"
import { useAuth } from "./AuthProvider"

export function LoginButton() {
  const { signInWithGoogle, loading } = useAuth()

  return (
    <Button
      onClick={signInWithGoogle}
      disabled={loading}
      className="w-full flex items-center gap-2"
    >
      <LogIn className="h-4 w-4" />
      {loading ? "Loading..." : "Sign in with Google"}
    </Button>
  )
}
