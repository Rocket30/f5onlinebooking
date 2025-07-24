"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Search, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"

export default function BookingHistoryPage() {
  const [email, setEmail] = useState("")
  const [bookings, setBookings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setError("Please enter your email address")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from("bookings")
        .select(`
          id,
          booking_date,
          booking_time,
          total_price,
          status,
          zip_code,
          created_at,
          customer:customer_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq("customer.email", email)
        .order("booking_date", { ascending: false })

      if (fetchError) throw fetchError

      setBookings(data || [])
      setIsSubmitted(true)
    } catch (err) {
      console.error("Error fetching bookings:", err)
      setError("Unable to fetch your booking history. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center bg-no-repeat bg-blend-overlay">
      <div className="container mx-auto px-4 py-8">
        <Link href="/booking" className="inline-flex items-center text-white mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Booking
        </Link>

        <div className="max-w-3xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">BOOKING HISTORY</CardTitle>
              <CardDescription className="mt-2">
                View your past and upcoming cleaning service appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium">
                      Email Address
                    </label>
                    <div className="relative">
                      <Input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pr-10"
                        placeholder="Enter the email you used for booking"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 p-3 rounded-md flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      <p className="text-red-500 text-sm">{error}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                    disabled={isLoading}
                  >
                    {isLoading ? "Searching..." : "Find My Bookings"}
                  </Button>
                </form>
              ) : (
                <div className="space-y-6">
                  {bookings.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="flex justify-center mb-4">
                        <AlertCircle className="h-12 w-12 text-yellow-500" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No bookings found</h3>
                      <p className="text-gray-500 mb-4">We couldn't find any bookings associated with {email}</p>
                      <div className="space-y-2">
                        <Button onClick={() => setIsSubmitted(false)} variant="outline" className="w-full sm:w-auto">
                          Try Another Email
                        </Button>
                        <div className="flex justify-center mt-2">
                          <Link href="/booking" className="text-yellow-600 hover:underline">
                            Create a new booking
                          </Link>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <h3 className="font-medium">Bookings for {email}</h3>
                          <p className="text-sm text-gray-500">Found {bookings.length} booking(s)</p>
                        </div>
                        <Button onClick={() => setIsSubmitted(false)} variant="outline" size="sm">
                          Change Email
                        </Button>
                      </div>

                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Time</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {bookings.map((booking) => (
                              <TableRow key={booking.id}>
                                <TableCell>{formatDate(booking.booking_date)}</TableCell>
                                <TableCell>{booking.booking_time}</TableCell>
                                <TableCell>${booking.total_price}</TableCell>
                                <TableCell>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(booking.status)}`}
                                  >
                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Link href={`/booking/details/${booking.id}`}>
                                    <Button variant="ghost" size="sm">
                                      View Details
                                    </Button>
                                  </Link>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      <div className="flex justify-center pt-4">
                        <Link href="/booking">
                          <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">Book New Appointment</Button>
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
