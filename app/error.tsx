"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { logError } from "@/lib/error-handler"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    logError(error, "Application error component")
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-gray-100 p-4">
      <div className="bg-white text-gray-900 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-4">Something went wrong</h2>
        <p className="text-gray-600 text-center mb-6">
          We apologize for the inconvenience. Please try again or contact support if the issue persists.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset} className="bg-green-600 hover:bg-green-700 text-white">
            Try again
          </Button>
          <Button onClick={() => (window.location.href = "/")} variant="outline">
            Return to home
          </Button>
        </div>
        {error?.message && process.env.NODE_ENV === "development" && (
          <div className="mt-6 p-4 bg-gray-100 rounded text-sm overflow-auto">
            <p className="font-mono text-red-600">{error.message}</p>
          </div>
        )}
      </div>
    </div>
  )
}
