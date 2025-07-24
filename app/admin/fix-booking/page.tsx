"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"

export default function FixBookingPage() {
  const [bookingId, setBookingId] = useState("")
  const [bookingData, setBookingData] = useState<any>(null)
  const [newDate, setNewDate] = useState("")
  const [dayOfWeek, setDayOfWeek] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)

  const handleFetchBooking = async () => {
    if (!bookingId) return

    setIsLoading(true)
    setMessage(null)

    try {
      // Fetch the booking
      const { data, error } = await supabase
        .from("bookings")
        .select("*, customer:customer_id(*)")
        .eq("id", bookingId)
        .single()

      if (error) throw error

      setBookingData(data)
      setNewDate(data.booking_date)

      // Extract day of week from special instructions
      if (data.special_instructions) {
        const match = data.special_instructions.match(/\[Day of Week: (.*?)\]/)
        if (match && match[1]) {
          setDayOfWeek(match[1])
        } else {
          // Calculate day of week from date
          const date = new Date(data.booking_date)
          setDayOfWeek(date.toLocaleDateString("en-US", { weekday: "long" }))
        }
      } else {
        // Calculate day of week from date
        const date = new Date(data.booking_date)
        setDayOfWeek(date.toLocaleDateString("en-US", { weekday: "long" }))
      }
    } catch (error) {
      console.error("Error fetching booking:", error)
      setMessage({
        text: `Error: ${error instanceof Error ? error.message : "Failed to fetch booking"}`,
        type: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateBooking = async () => {
    if (!bookingData || !newDate || !dayOfWeek) return

    setIsLoading(true)
    setMessage(null)

    try {
      // Update the booking date
      const { error: updateError } = await supabase
        .from("bookings")
        .update({ booking_date: newDate })
        .eq("id", bookingId)

      if (updateError) throw updateError

      // Update the day of week in special instructions
      let specialInstructions = bookingData.special_instructions || ""

      // Remove any existing day of week
      specialInstructions = specialInstructions.replace(/\[Day of Week: .*?\]/g, "").trim()

      // Add the new day of week
      specialInstructions += `\n[Day of Week: ${dayOfWeek}]`

      // Update special instructions
      const { error: updateInstructionsError } = await supabase
        .from("bookings")
        .update({ special_instructions: specialInstructions })
        .eq("id", bookingId)

      if (updateInstructionsError) throw updateInstructionsError

      setMessage({
        text: "Booking updated successfully!",
        type: "success",
      })

      // Refresh booking data
      handleFetchBooking()
    } catch (error) {
      console.error("Error updating booking:", error)
      setMessage({
        text: `Error: ${error instanceof Error ? error.message : "Failed to update booking"}`,
        type: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewDate(e.target.value)

    // Update day of week based on new date
    try {
      const date = new Date(e.target.value)
      setDayOfWeek(date.toLocaleDateString("en-US", { weekday: "long" }))
    } catch (error) {
      console.error("Error calculating day of week:", error)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Fix Booking Date</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Lookup Booking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter booking ID"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              className="max-w-md"
            />
            <Button onClick={handleFetchBooking} disabled={isLoading || !bookingId}>
              {isLoading ? "Loading..." : "Fetch Booking"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {message && (
        <div
          className={`p-4 mb-6 rounded-md ${
            message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {bookingData && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Booking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Booking Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">ID:</span> {bookingData.id}
                    </div>
                    <div>
                      <span className="font-medium">Current Date:</span> {bookingData.booking_date}
                    </div>
                    <div>
                      <span className="font-medium">Time:</span> {bookingData.booking_time}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> {bookingData.status}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Customer Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Name:</span> {bookingData.customer?.first_name}{" "}
                      {bookingData.customer?.last_name}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {bookingData.customer?.email}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-4">Update Date Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Date</label>
                    <Input type="date" value={newDate} onChange={handleDateChange} className="max-w-xs" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Day of Week</label>
                    <select
                      value={dayOfWeek}
                      onChange={(e) => setDayOfWeek(e.target.value)}
                      className="w-full max-w-xs p-2 border rounded-md"
                    >
                      <option value="Sunday">Sunday</option>
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                    </select>
                  </div>

                  <Button onClick={handleUpdateBooking} disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update Booking"}
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Special Instructions</h3>
                <pre className="bg-gray-50 p-3 rounded-md whitespace-pre-wrap text-sm">
                  {bookingData.special_instructions || "No special instructions"}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
