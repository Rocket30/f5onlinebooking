"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield } from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to admin dashboard after a short delay
    // The middleware will handle the authentication
    const timer = setTimeout(() => {
      router.push("/admin")
    }, 1500)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gray-800 p-3">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>Redirecting to secure admin area...</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="mt-2 flex justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-800"></div>
          </div>
          <p className="mt-4 text-sm text-gray-500">You will be prompted for authentication credentials.</p>
        </CardContent>
      </Card>
    </div>
  )
}
