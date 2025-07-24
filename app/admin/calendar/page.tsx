"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { ChevronLeft, ChevronRight, Loader2, CalendarIcon, Clock, User, Phone, Mail, MapPin } from "lucide-react"
import Link from "next/link"

// Maximum number of bookings allowed per day (5 time slots)
const MAX_BOOKINGS_PER_DAY = 5

// Available time slots
const TIME_SLOTS = [
  "10:00 AM - 11:30 AM",
  "11:30 AM - 1:00 PM",
  "1:00 PM - 2:30 PM",
  "2:30 PM - 4:00 PM",
  "4:00 PM - 5:30 PM",
]

// Operating days (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
const OPERATING_DAYS = [2, 3, 4, 5, 6] // Tuesday through Saturday

type BookingCount = {
  [date: string]: number
}

type BookingTimeSlots = {
  [date: string]: {
    [timeSlot: string]: boolean
  }
}

type DetailedBooking = {
  id: string
  booking_date: string
  booking_time: string
  total_price: number
  status: string
  zip_code: string
  customer: {
    first_name: string
    last_name: string
    email: string
    phone: string
  }
}

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [bookingCounts, setBookingCounts] = useState<BookingCount>({})
  const [bookingTimeSlots, setBookingTimeSlots] = useState<BookingTimeSlots>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedDateFormatted, setSelectedDateFormatted] = useState<string>("")
  const [dayBookings, setDayBookings] = useState<DetailedBooking[]>([])
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  // Get current month and year
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Get first day of the month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const firstDayOfWeek = firstDayOfMonth.getDay() // 0 = Sunday, 1 = Monday, etc.

  // Get last day of the month
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()

  // Get days of previous month to fill the calendar
  const daysFromPrevMonth = firstDayOfWeek

  // Get days of next month to fill the calendar
  const lastDayOfWeek = lastDayOfMonth.getDay()
  const daysFromNextMonth = 6 - lastDayOfWeek

  // Format month name
  const monthName = currentDate.toLocaleString("default", { month: "long" })

  useEffect(() => {
    fetchBookings()
  }, [currentMonth, currentYear])

  async function fetchBookings() {
    try {
      setIsLoading(true)

      // Calculate start and end dates for the query
      const startDate = new Date(currentYear, currentMonth, 1)
      const endDate = new Date(currentYear, currentMonth + 1, 0)

      const { data, error } = await supabase
        .from("bookings")
        .select("booking_date, booking_time")
        .gte("booking_date", startDate.toISOString().split("T")[0])
        .lte("booking_date", endDate.toISOString().split("T")[0])
        .not("status", "eq", "cancelled")

      if (error) {
        throw new Error(error.message)
      }

      // Count bookings per day and track booked time slots
      const counts: BookingCount = {}
      const timeSlots: BookingTimeSlots = {}

      if (data) {
        data.forEach((booking) => {
          const date = booking.booking_date
          const time = booking.booking_time

          // Initialize if not exists
          if (!counts[date]) counts[date] = 0
          if (!timeSlots[date]) timeSlots[date] = {}

          // Count total bookings for the day
          counts[date] = (counts[date] || 0) + 1

          // Mark time slot as booked
          if (time && TIME_SLOTS.includes(time)) {
            timeSlots[date][time] = true
          }
        })
      }

      setBookingCounts(counts)
      setBookingTimeSlots(timeSlots)
    } catch (err) {
      console.error("Error fetching bookings:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch bookings")
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchDayBookings(date: string) {
    try {
      setIsLoadingDetails(true)

      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          booking_date,
          booking_time,
          total_price,
          status,
          zip_code,
          customer:customer_id (
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .eq("booking_date", date)
        .not("status", "eq", "cancelled")
        .order("booking_time")

      if (error) {
        throw new Error(error.message)
      }

      setDayBookings(data as DetailedBooking[])
    } catch (err) {
      console.error("Error fetching day bookings:", err)
      setDayBookings([])
    } finally {
      setIsLoadingDetails(false)
    }
  }

  function isOperatingDay(date: Date) {
    const day = date.getDay()
    return OPERATING_DAYS.includes(day)
  }

  function getAvailabilityColor(date: string, dayDate: Date) {
    // Not an operating day
    if (!isOperatingDay(dayDate)) {
      return "bg-gray-100 text-gray-400"
    }

    const count = bookingCounts[date] || 0
    const maxBookings = MAX_BOOKINGS_PER_DAY

    if (count >= maxBookings) {
      return "bg-red-100 text-red-800" // Fully booked
    } else if (count >= maxBookings / 2) {
      return "bg-yellow-100 text-yellow-800" // Half booked
    } else {
      return "bg-green-100 text-green-800" // 3+ slots available
    }
  }

  // UPDATED FUNCTION: This function now returns just the number instead of text
  function getAvailabilityText(date: string, dayDate: Date) {
    // Not an operating day
    if (!isOperatingDay(dayDate)) {
      return "Not operating"
    }

    const count = bookingCounts[date] || 0
    const available = MAX_BOOKINGS_PER_DAY - count

    // Just return the number of available slots
    return available.toString()
  }

  function previousMonth() {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  function nextMonth() {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  function goToToday() {
    setCurrentDate(new Date())
  }

  function handleDayClick(day: { date: Date; isCurrentMonth: boolean; dateString: string }) {
    if (!day.isCurrentMonth || !isOperatingDay(day.date)) {
      return // Don't open dialog for non-current month days or non-operating days
    }

    setSelectedDate(day.dateString)
    setSelectedDateFormatted(formatDate(day.date))
    fetchDayBookings(day.dateString)
    setIsDialogOpen(true)
  }

  function formatDate(date: Date) {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  // Generate calendar days
  const calendarDays = []

  // Previous month days
  for (let i = 0; i < daysFromPrevMonth; i++) {
    const day = new Date(currentYear, currentMonth, -daysFromPrevMonth + i + 1)
    calendarDays.push({
      date: day,
      isCurrentMonth: false,
      dateString: day.toISOString().split("T")[0],
    })
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const day = new Date(currentYear, currentMonth, i)
    calendarDays.push({
      date: day,
      isCurrentMonth: true,
      dateString: day.toISOString().split("T")[0],
    })
  }

  // Next month days
  for (let i = 1; i <= daysFromNextMonth; i++) {
    const day = new Date(currentYear, currentMonth + 1, i)
    calendarDays.push({
      date: day,
      isCurrentMonth: false,
      dateString: day.toISOString().split("T")[0],
    })
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle>Booking Calendar</CardTitle>
            <CardDescription>View booking availability by date</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={previousMonth} variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button onClick={goToToday} variant="outline">
              Today
            </Button>
            <Button onClick={nextMonth} variant="outline" size="icon">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md">
              <p className="text-red-800">Error loading calendar: {error}</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-center">
                  {monthName} {currentYear}
                </h2>
              </div>

              <div className="mb-4 flex flex-wrap items-center justify-center gap-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded bg-green-100 mr-2"></div>
                  <span className="text-sm">3+ slots available</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded bg-yellow-100 mr-2"></div>
                  <span className="text-sm">1-2 slots left</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded bg-red-100 mr-2"></div>
                  <span className="text-sm">Fully booked</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded bg-gray-100 mr-2"></div>
                  <span className="text-sm">Not operating (Sun-Mon)</span>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {/* Day headers */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                  <div
                    key={day}
                    className={`text-center font-medium py-2 ${index === 0 || index === 1 ? "text-gray-400" : ""}`}
                  >
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {calendarDays.map((day, index) => {
                  const isToday = new Date().toDateString() === day.date.toDateString()
                  const isOperating = isOperatingDay(day.date)
                  const hasBookings = bookingCounts[day.dateString] > 0

                  // Determine if day is clickable
                  const isClickable = day.isCurrentMonth && (isOperating || hasBookings)

                  return (
                    <div
                      key={index}
                      className={`
                        min-h-[80px] p-1 border rounded-md
                        ${!day.isCurrentMonth ? "bg-gray-50 text-gray-400" : ""}
                        ${isToday ? "ring-2 ring-blue-500" : ""}
                        ${!isOperating && day.isCurrentMonth ? "bg-gray-50" : ""}
                        ${isClickable ? "cursor-pointer hover:bg-gray-50" : ""}
                      `}
                      onClick={isClickable ? () => handleDayClick(day) : undefined}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`font-medium ${!isOperating && day.isCurrentMonth ? "text-gray-400" : ""}`}>
                          {day.date.getDate()}
                        </span>
                      </div>

                      {day.isCurrentMonth && (
                        <div
                          className={`
                          mt-1 text-xs p-1 rounded-sm text-center font-bold
                          ${getAvailabilityColor(day.dateString, day.date)}
                        `}
                        >
                          {getAvailabilityText(day.dateString, day.date)}
                        </div>
                      )}

                      {/* Show booked slots indicator */}
                      {day.isCurrentMonth && isOperating && bookingTimeSlots[day.dateString] && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {bookingCounts[day.dateString] > 0 && (
                            <div className="text-xs text-gray-500">
                              <CalendarIcon className="h-3 w-3 inline mr-1" />
                              {bookingCounts[day.dateString]}/{MAX_BOOKINGS_PER_DAY}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Day Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Bookings for {selectedDateFormatted}</DialogTitle>
            <DialogDescription>Showing all appointments scheduled for this day</DialogDescription>
          </DialogHeader>

          {isLoadingDetails ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : dayBookings.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-500">No bookings found for this day.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dayBookings.map((booking) => (
                <Card key={booking.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    {/* Time slot */}
                    <div className="bg-gray-50 p-4 md:w-1/3 flex items-center">
                      <div>
                        <div className="flex items-center mb-2">
                          <Clock className="h-5 w-5 mr-2 text-gray-500" />
                          <span className="font-medium">{booking.booking_time}</span>
                        </div>
                        <div>{getStatusBadge(booking.status)}</div>
                        <div className="mt-2 text-sm text-gray-500">${booking.total_price.toFixed(2)}</div>
                      </div>
                    </div>

                    {/* Customer details */}
                    <div className="p-4 md:w-2/3">
                      <h3 className="font-medium text-lg mb-2 flex items-center">
                        <User className="h-5 w-5 mr-2 text-gray-500" />
                        {booking.customer?.first_name} {booking.customer?.last_name}
                      </h3>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{booking.customer?.phone}</span>
                        </div>

                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{booking.customer?.email}</span>
                        </div>

                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                          <span>ZIP: {booking.zip_code}</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <Link href={`/admin/bookings/${booking.id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
