"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export default function DateDebugPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fixResult, setFixResult] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)

        // Fetch bookings
        const { data: bookingsData, error: bookingsError } = await supabase
          .from("bookings")
          .select("id, booking_date, special_instructions, created_at")
          .order("created_at", { ascending: false })
          .limit(20)

        if (bookingsError) throw bookingsError

        setBookings(bookingsData || [])

        // Fetch date logs if they exist
        try {
          const { data: logsData, error: logsError } = await supabase
            .from("date_logs")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(50)

          if (!logsError && logsData) {
            setLogs(logsData)
          }
        } catch (e) {
          console.log("Date logs table might not exist yet:", e)
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleFixDates = async () => {
    try {
      setIsLoading(true)

      // Execute the SQL to fix dates
      const { data, error } = await supabase.rpc("execute_sql", {
        sql_query: `
          UPDATE bookings
          SET special_instructions = CASE
            WHEN special_instructions IS NULL THEN '[Day of Week: ' || TO_CHAR(booking_date, 'Day') || ']'
            WHEN special_instructions NOT LIKE '%[Day of Week:%' THEN special_instructions || E'\n[Day of Week: ' || TRIM(TO_CHAR(booking_date, 'Day')) || ']'
            ELSE special_instructions
          END
          WHERE special_instructions IS NULL OR special_instructions NOT LIKE '%[Day of Week:%';
        `,
      })

      if (error) throw error

      setFixResult("Successfully updated booking dates with day of week information")

      // Refresh the data
      const { data: updatedData, error: fetchError } = await supabase
        .from("bookings")
        .select("id, booking_date, special_instructions, created_at")
        .order("created_at", { ascending: false })
        .limit(20)

      if (fetchError) throw fetchError

      setBookings(updatedData || [])
    } catch (err) {
      console.error("Error fixing dates:", err)
      setFixResult(`Error: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Extract day of week from special instructions
  const getDayOfWeek = (specialInstructions: string | null) => {
    if (!specialInstructions) return "N/A"

    const match = specialInstructions.match(/\[Day of Week: (.*?)\]/)
    return match ? match[1] : "Not found"
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Date Debugging Tool</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Recent Bookings</span>
              <Button onClick={handleFixDates} disabled={isLoading}>
                {isLoading ? "Processing..." : "Fix Missing Day of Week"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {fixResult && (
              <div
                className={`p-4 mb-4 rounded-md ${fixResult.startsWith("Error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}
              >
                {fixResult}
              </div>
            )}

            {error ? (
              <div className="bg-red-50 p-4 rounded-md text-red-700">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 text-left">ID</th>
                      <th className="p-2 text-left">Date in DB</th>
                      <th className="p-2 text-left">Day of Week (from DB)</th>
                      <th className="p-2 text-left">Day of Week (from Special Instructions)</th>
                      <th className="p-2 text-left">Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => {
                      const date = new Date(booking.booking_date)
                      const dayFromDate = date.toLocaleDateString("en-US", { weekday: "long" })
                      const dayFromInstructions = getDayOfWeek(booking.special_instructions)

                      return (
                        <tr key={booking.id} className="border-b">
                          <td className="p-2">{booking.id.substring(0, 8)}...</td>
                          <td className="p-2">{booking.booking_date}</td>
                          <td className="p-2">{dayFromDate}</td>
                          <td
                            className={`p-2 ${dayFromInstructions !== dayFromDate && dayFromInstructions !== "Not found" ? "bg-yellow-100" : ""}`}
                          >
                            {dayFromInstructions}
                          </td>
                          <td className="p-2">{new Date(booking.created_at).toLocaleString()}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {logs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Date Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 text-left">Booking ID</th>
                      <th className="p-2 text-left">Original Date</th>
                      <th className="p-2 text-left">Processed Date</th>
                      <th className="p-2 text-left">Notes</th>
                      <th className="p-2 text-left">Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b">
                        <td className="p-2">{log.booking_id.substring(0, 8)}...</td>
                        <td className="p-2">{log.original_date}</td>
                        <td className="p-2">{log.processed_date}</td>
                        <td className="p-2">{log.notes}</td>
                        <td className="p-2">{new Date(log.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
