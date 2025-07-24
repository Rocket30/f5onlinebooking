"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react"
import Link from "next/link"

interface Booking {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip_code: string
  service_date: string
  service_time: string
  total_price: number
  status: string
  services: string[]
  rooms: any[]
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
  "5:00 PM",
  "5:30 PM",
  "6:00 PM",
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
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchBooking()
  }, [params.id])

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${params.id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch booking")
      }
      const data = await response.json()
      setBooking(data)
    } catch (err) {
      setError("Failed to load booking details")
      console.error("Error fetching booking:", err)
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

    // Only Tuesday (2) through Saturday (6) are available
    // And date must be today or in the future
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

  const formatDateForSubmission = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const handleDateSelect = (day: number) => {
    const date = new Date(currentYear, currentMonth, day)
    if (isDateAvailable(date)) {
      setSelectedDate(formatDateForSubmission(date))
    }
  }

  const handleMonthChange = (direction: "prev" | "next") => {
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

  const handleMonthSelect = (monthIndex: number) => {
    setCurrentMonth(monthIndex)
  }

  const handleYearSelect = (year: number) => {
    setCurrentYear(year)
  }

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) {
      setError("Please select both a date and time")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch(`/api/bookings/${params.id}/reschedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newDate: selectedDate,
          newTime: selectedTime,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to reschedule booking")
      }

      router.push(`/booking/details/${params.id}?rescheduled=true`)
    } catch (err) {
      setError("Failed to reschedule booking. Please try again.")
      console.error("Error rescheduling booking:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear)
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear)
    const today = new Date()
    const selectedDateObj = selectedDate ? new Date(selectedDate + "T00:00:00") : null

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day)
      const isAvailable = isDateAvailable(date)
      const isToday = date.toDateString() === today.toDateString()
      const isSelected = selectedDateObj && date.toDateString() === selectedDateObj.toDateString()

      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(day)}
          disabled={!isAvailable}
          className={`
            h-10 w-10 rounded-lg text-sm font-medium transition-colors
            ${isAvailable ? "hover:bg-blue-100 text-gray-900" : "text-gray-300 cursor-not-allowed"}
            ${isToday ? "ring-2 ring-blue-500" : ""}
            ${isSelected ? "bg-yellow-400 text-gray-900" : ""}
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
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    )
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Link href="/booking/manage">
              <Button variant="outline">Back to Manage Bookings</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href={`/booking/details/${booking.id}`}>
            <Button variant="outline" className="mb-4 bg-transparent">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Booking Details
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Reschedule Appointment</h1>
          <p className="text-gray-600 mt-2">
            Current appointment: {booking?.service_date} at {booking?.service_time}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Select New Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Month and Year Selectors */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <Select
                    value={currentMonth.toString()}
                    onValueChange={(value) => handleMonthSelect(Number.parseInt(value))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={currentYear.toString()}
                    onValueChange={(value) => handleYearSelect(Number.parseInt(value))}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[currentYear, currentYear + 1, currentYear + 2].map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleMonthChange("prev")}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleMonthChange("next")}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="mb-4">
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="h-10 flex items-center justify-center text-sm font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <p>• Available: Tuesday - Saturday</p>
                <p>• Sunday and Monday are not available</p>
                <p>• Today's date has a blue border</p>
                <p>• Selected date is highlighted in yellow</p>
              </div>

              {selectedDate && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">
                    Selected Date: {formatDateForDisplay(new Date(selectedDate + "T00:00:00"))}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Time Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Select New Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`
                      p-3 text-sm font-medium rounded-lg border transition-colors
                      ${
                        selectedTime === time
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }
                    `}
                  >
                    {time}
                  </button>
                ))}
              </div>

              {selectedTime && (
                <div className="mb-6 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-900">Selected Time: {selectedTime}</p>
                </div>
              )}

              {error && (
                <div className="mb-6 p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button
                onClick={handleReschedule}
                disabled={!selectedDate || !selectedTime || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Rescheduling..." : "Confirm Reschedule"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
