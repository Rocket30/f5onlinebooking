"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { updateBookingStatus } from "@/app/actions/update-booking-status"
import {
  Calendar,
  Filter,
  Search,
  RefreshCw,
  Database,
  ExternalLink,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react"
import Link from "next/link"

type BookingWithCustomer = {
  id: string
  booking_date: string
  booking_time: string
  total_price: number
  status: string
  zip_code: string
  created_at: string
  customer: {
    first_name: string
    last_name: string
    email: string
    phone: string
  }
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<BookingWithCustomer[]>([])
  const [filteredBookings, setFilteredBookings] = useState<BookingWithCustomer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({})
  const [connectionStatus, setConnectionStatus] = useState<{
    checking: boolean
    connected: boolean
    error?: string
  }>({ checking: true, connected: false })

  useEffect(() => {
    // Check connection status first
    checkConnection()
  }, [])

  useEffect(() => {
    // Only fetch bookings if connection is successful
    if (connectionStatus.connected) {
      fetchBookings()
    }
  }, [connectionStatus.connected])

  useEffect(() => {
    filterBookings()
  }, [bookings, searchTerm, statusFilter, dateFilter])

  async function checkConnection() {
    setConnectionStatus({ checking: true, connected: false })
    try {
      // Simple query to test connection
      const { data, error } = await supabase.from("customers").select("count").limit(1)

      if (error) {
        console.error("Connection test error:", error)
        setConnectionStatus({
          checking: false,
          connected: false,
          error: error.message,
        })
        return
      }

      setConnectionStatus({ checking: false, connected: true })
    } catch (err) {
      console.error("Connection test exception:", err)
      setConnectionStatus({
        checking: false,
        connected: false,
        error: err instanceof Error ? err.message : "Unknown connection error",
      })
    }
  }

  async function fetchBookings() {
    try {
      setIsLoading(true)
      console.log("Attempting to fetch bookings from Supabase...")

      const { data, error } = await supabase
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
          email,
          phone
        )
      `)
        .order("booking_date", { ascending: true })

      if (error) {
        console.error("Supabase error:", error)
        throw new Error(error.message)
      }

      console.log("Bookings fetched successfully:", data?.length || 0, "bookings")
      setBookings(data as BookingWithCustomer[])
      setFilteredBookings(data as BookingWithCustomer[])
    } catch (err) {
      console.error("Error details:", err)
      setError(
        err instanceof Error
          ? `Fetch error: ${err.message}`
          : "An error occurred while fetching bookings. Please check your database connection.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  function filterBookings() {
    let filtered = [...bookings]

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (booking) =>
          booking.customer?.first_name?.toLowerCase().includes(term) ||
          booking.customer?.last_name?.toLowerCase().includes(term) ||
          booking.customer?.email?.toLowerCase().includes(term) ||
          booking.customer?.phone?.includes(term) ||
          booking.zip_code?.includes(term),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter)
    }

    // Apply date filter
    if (dateFilter !== "all") {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const nextWeek = new Date(today)
      nextWeek.setDate(nextWeek.getDate() + 7)

      filtered = filtered.filter((booking) => {
        const bookingDate = new Date(booking.booking_date)
        bookingDate.setHours(0, 0, 0, 0)

        if (dateFilter === "today") {
          return (
            bookingDate.getDate() === today.getDate() &&
            bookingDate.getMonth() === today.getMonth() &&
            bookingDate.getFullYear() === today.getFullYear()
          )
        } else if (dateFilter === "tomorrow") {
          return (
            bookingDate.getDate() === tomorrow.getDate() &&
            bookingDate.getMonth() === tomorrow.getMonth() &&
            bookingDate.getFullYear() === tomorrow.getFullYear()
          )
        } else if (dateFilter === "thisWeek") {
          return bookingDate >= today && bookingDate <= nextWeek
        }
        return true
      })
    }

    // Sort filtered bookings by date (soonest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.booking_date + "T" + a.booking_time)
      const dateB = new Date(b.booking_date + "T" + b.booking_time)
      return dateA.getTime() - dateB.getTime()
    })

    setFilteredBookings(filtered)
  }

  const handleCompleteBooking = async (bookingId: string) => {
    if (confirm("Are you sure you want to mark this booking as completed?")) {
      await updateBookingStatus(bookingId, "completed", setBookings, setIsUpdating, setError)
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (confirm("Are you sure you want to cancel this booking?")) {
      await updateBookingStatus(bookingId, "cancelled", setBookings, setIsUpdating, setError)
    }
  }

  const getStatusColor = (status: string) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle>Bookings Dashboard</CardTitle>
            <CardDescription>View and manage all cleaning service bookings</CardDescription>
          </div>
          <Button onClick={fetchBookings} variant="outline" size="sm" className="self-end sm:self-auto">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Connection Status */}
            {connectionStatus.checking ? (
              <div className="bg-blue-50 p-4 rounded-md">
                <div className="flex items-center">
                  <Loader2 className="h-5 w-5 text-blue-500 animate-spin mr-2" />
                  <p>Checking database connection...</p>
                </div>
              </div>
            ) : !connectionStatus.connected ? (
              <div className="bg-red-50 p-4 rounded-md">
                <h3 className="text-red-800 font-medium mb-2 flex items-center">
                  <Database className="h-5 w-5 mr-2" /> Database Connection Error
                </h3>
                <p className="text-red-600 mb-3">{connectionStatus.error || "Could not connect to the database"}</p>
                <div className="space-y-2">
                  <p className="text-sm">Possible solutions:</p>
                  <ol className="list-decimal pl-5 text-sm space-y-1">
                    <li>Check your Supabase URL and API key in environment variables</li>
                    <li>Make sure your Supabase project is active</li>
                    <li>Initialize the database tables</li>
                  </ol>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Button onClick={checkConnection} variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry Connection
                    </Button>
                    <Link href="/admin/seed">
                      <Button variant="outline" size="sm">
                        Initialize Database
                      </Button>
                    </Link>
                    <Link href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        Supabase Dashboard <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Filters */}
            {connectionStatus.connected && (
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search by name, email, phone or ZIP..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-[140px]">
                      <Calendar className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Dates</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="tomorrow">Tomorrow</SelectItem>
                      <SelectItem value="thisWeek">This Week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="bg-red-50 p-4 rounded-md mb-4">
                <h3 className="text-red-800 font-medium mb-2">Error fetching bookings</h3>
                <p className="text-red-500 text-sm">{error}</p>
                <p className="text-sm mt-2">
                  This could be due to:
                  <ul className="list-disc pl-5 mt-1">
                    <li>Database connection issues</li>
                    <li>Missing tables - try running the Seed Data function</li>
                    <li>Supabase API rate limits</li>
                  </ul>
                </p>
                <div className="mt-3">
                  <Button onClick={fetchBookings} variant="outline" size="sm" className="mr-2">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                  <Link href="/admin/seed">
                    <Button variant="outline" size="sm">
                      Go to Seed Data
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Bookings table */}
            {isLoading ? (
              <div className="text-center py-4">Loading bookings...</div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-4">No bookings found</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>ZIP Code</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>{formatDate(booking.booking_date)}</TableCell>
                        <TableCell>{booking.booking_time}</TableCell>
                        <TableCell>
                          {booking.customer?.first_name} {booking.customer?.last_name}
                        </TableCell>
                        <TableCell>
                          <div>{booking.customer?.email}</div>
                          <div className="text-sm text-gray-500">{booking.customer?.phone}</div>
                        </TableCell>
                        <TableCell>{booking.zip_code}</TableCell>
                        <TableCell>${booking.total_price}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {booking.status !== "completed" && booking.status !== "cancelled" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                                  onClick={() => handleCompleteBooking(booking.id)}
                                  disabled={isUpdating[booking.id]}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Complete
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                                  onClick={() => handleCancelBooking(booking.id)}
                                  disabled={isUpdating[booking.id]}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Cancel
                                </Button>
                              </>
                            )}
                            <Link href={`/admin/bookings/${booking.id}`}>
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
