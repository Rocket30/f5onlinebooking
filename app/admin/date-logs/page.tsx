"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"

export default function DateLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data, error } = await supabase
          .from("logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50)

        if (error) throw new Error(error.message)
        setLogs(data || [])
      } catch (err) {
        console.error("Error fetching logs:", err)
        setError(err instanceof Error ? err.message : "Failed to load logs")
      } finally {
        setIsLoading(false)
      }
    }

    fetchLogs()
  }, [])

  if (isLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-red-500">Error: {error}</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Date Handling Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p>No logs found.</p>
          ) : (
            <div className="space-y-6">
              {logs.map((log) => (
                <div key={log.id} className="border rounded-md p-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{log.message}</span>
                    <span className="text-sm text-gray-500">{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-60">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
