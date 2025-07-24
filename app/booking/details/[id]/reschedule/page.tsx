"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

interface BookingDetails {
  id: string
  customer_name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip_code: string
  service_date: string
  service_time: string
  services: string[]
  total_price: number
  status: string
  special_instructions?: string
}

const timeSlots = [
  "8:00 AM",
  "8:30 AM",
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
]

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export default function ReschedulePage() {
  const params = useParams()
  const router = useRouter()
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchBookingDetails()
  }, [params.id])

  const fetchBookingDetails = async () => {
    try {
      // This would normally fetch from your API
      // For now, we'll simulate the booking data
      setBooking({
        id: params.id as string,
        customer_name: "John Doe",
        email: "john@example.com",
        phone: "(813) 555-0123",
        address: "123 Main St",
        city: "Tampa",
        state: "FL",
        zip_code: "33510",
        service_date: "2024-01-15",
        service_time: "10:00 AM",
        services: ["Carpet Cleaning"],
        total_price: 89,
        status: "confirmed",
      })
    } catch (error) {
      console.error("Error fetching booking:", error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay()
  }

  const isDateAvailable = (date: Date) => {
    const day = date.getDay()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Available Tuesday (2) through Saturday (6)
    return day >= 2 && day <= 6 && date >= today
  }

  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleDateSelect = (day: number) => {
    const date = new Date(currentYear, currentMonth, day)
    if (isDateAvailable(date)) {
      const dateString = date.toISOString().split("T")[0]
      setSelectedDate(dateString)
    }
  }

  const handleMonthChange = (month: string) => {
    const monthIndex = months.indexOf(month)
    setCurrentMonth(monthIndex)
  }

  const handleYearChange = (year: string) => {
    setCurrentYear(Number.parseInt(year))
  }

  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (currentMonth === 0) {
        setCurrentMonth(11)
        setCurrentYear(currentYear - 1)
      } else {
        setCurrentMonth(currentMonth - 1)
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0)
        setCurrentYear(currentYear + 1)
      } else {
        setCurrentMonth(currentMonth + 1)
      }
    }
  }

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) {
      alert("Please select both a date and time")
      return
    }

    setIsSubmitting(true)
    try {
      // This would normally call your reschedule API
      console.log("Rescheduling to:", selectedDate, selectedTime)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      alert("Booking rescheduled successfully!")
      router.push(`/booking/details/${params.id}`)
    } catch (error) {
      console.error("Error rescheduling:", error)
      alert("Error rescheduling booking. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear)
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear)
    const days = []
    const today = new Date()

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day)
      const isAvailable = isDateAvailable(date)
      const isSelected = selectedDate === date.toISOString().split("T")[0]
      const isToday = date.toDateString() === today.toDateString()

      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(day)}
          disabled={!isAvailable}
          className={`
            h-10 w-10 rounded-lg text-sm font-medium transition-colors
            ${
              isSelected
                ? "bg-yellow-500 text-white"
                : isAvailable
                  ? "hover:bg-blue-100 text-gray-900"
                  : "text-gray-400 cursor-not-allowed"
            }
            ${isToday ? "ring-2 ring-blue-500" : ""}
          `}
        >
          {day}
        </button>,
      )
    }

    return days
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading booking details...</p>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h1>
          <Link href="/booking/manage">
            <Button>Back to Manage Bookings</Button>
          </Link>
        </div>
      </div>
    )
  }

  const currentYearOptions = [currentYear, currentYear + 1, currentYear + 2]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Link
            href={`/booking/details/${params.id}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Booking Details
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Booking Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Current Booking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">Customer</h3>
                <p className="text-gray-600">{booking.customer_name}</p>
                <p className="text-gray-600">{booking.email}</p>
                <p className="text-gray-600">{booking.phone}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">Address</h3>
                <p className="text-gray-600">
                  {booking.address}
                  <br />
                  {booking.city}, {booking.state} {booking.zip_code}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">Current Schedule</h3>
                <p className="text-gray-600">
                  {new Date(booking.service_date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-gray-600">{booking.service_time}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">Services</h3>
                <p className="text-gray-600">{booking.services.join(", ")}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">Total</h3>
                <p className="text-xl font-bold text-green-600">${booking.total_price}</p>
              </div>
            </CardContent>
          </Card>

          {/* Reschedule Form */}
          <Card>
            <CardHeader>
              <CardTitle>Select New Date & Time</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Month and Year Selectors */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                  <Select value={months[currentMonth]} onValueChange={handleMonthChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <Select value={currentYear.toString()} onValueChange={handleYearChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currentYearOptions.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Calendar */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    {months[currentMonth]} {currentYear}
                  </h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="h-10 flex items-center justify-center text-sm font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>

                <p className="text-sm text-gray-500 mt-2">Available: Tuesday - Saturday</p>
              </div>

              {/* Selected Date Display */}
              {selectedDate && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900">Selected Date:</h4>
                  <p className="text-blue-800">{formatDateForDisplay(new Date(selectedDate))}</p>
                </div>
              )}

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Time</label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reschedule Button */}
              <Button
                onClick={handleReschedule}
                disabled={!selectedDate || !selectedTime || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Rescheduling..." : "Reschedule Booking"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
