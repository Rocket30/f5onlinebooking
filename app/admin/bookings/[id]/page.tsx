"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calendar, Clock, Home, User, Phone, Mail, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { updateBookingStatus } from "@/app/actions/update-booking-status"

export default function AdminBookingDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string

  const [booking, setBooking] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBookingDetails() {
      try {
        setIsLoading(true)

        const { data, error: fetchError } = await supabase
          .from("bookings")
          .select(`
            id,
            booking_date,
            booking_time,
            total_price,
            status,
            zip_code,
            special_instructions,
            created_at,
            customer:customer_id (
              id,
              first_name,
              last_name,
              email,
              phone,
              address,
              city,
              state,
              zip_code
            ),
            booking_services (
              id,
              service_id,
              quantity,
              price,
              service:service_id (
                id,
                name,
                description,
                icon,
                fixed_price
              )
            ),
            booking_rooms (
              id,
              room_type,
              quantity,
              price
            )
          `)
          .eq("id", bookingId)
          .single()

        if (fetchError) throw fetchError

        setBooking(data)
      } catch (err) {
        console.error("Error fetching booking details:", err)
        setError("Unable to fetch booking details. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    if (bookingId) {
      fetchBookingDetails()
    }
  }, [bookingId])

  const handleCompleteBooking = async () => {
    if (confirm("Are you sure you want to mark this booking as completed?")) {
      setIsUpdating(true)
      setUpdateError(null)

      try {
        const result = await updateBookingStatus(bookingId, "completed")

        if (result.success) {
          setBooking((prev: any) => ({
            ...prev,
            status: "completed",
          }))
        } else {
          setUpdateError(result.error || "Failed to update booking status")
        }
      } catch (err) {
        setUpdateError("An unexpected error occurred")
      } finally {
        setIsUpdating(false)
      }
    }
  }

  const handleCancelBooking = async () => {
    if (confirm("Are you sure you want to cancel this booking?")) {
      setIsUpdating(true)
      setUpdateError(null)

      try {
        const result = await updateBookingStatus(bookingId, "cancelled")

        if (result.success) {
          setBooking((prev: any) => ({
            ...prev,
            status: "cancelled",
          }))
        } else {
          setUpdateError(result.error || "Failed to update booking status")
        }
      } catch (err) {
        setUpdateError("An unexpected error occurred")
      } finally {
        setIsUpdating(false)
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
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

  // Helper function to parse room type
  const parseRoomType = (roomType: string) => {
    const parts = roomType.split("-")
    if (parts.length >= 2) {
      return {
        serviceId: parts[0],
        roomName: parts.slice(1).join("-"), // Handle room names that might contain hyphens
      }
    }
    return { serviceId: "unknown", roomName: roomType }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="p-8 text-center">
            <p>Loading booking details...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-red-500 mb-4">{error || "Booking not found"}</p>
            <Link href="/admin">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/admin" className="inline-flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Status:</span>
          <Badge className={getStatusColor(booking.status)}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Booking Details</TabsTrigger>
              <TabsTrigger value="customer">Customer Info</TabsTrigger>
              <TabsTrigger value="services">Services & Rooms</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Information</CardTitle>
                  <CardDescription>Details about this booking</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Booking ID</p>
                      <p>{booking.id}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Created At</p>
                      <p>{new Date(booking.created_at).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Date</p>
                        <p className="text-gray-600">{formatDate(booking.booking_date)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Time</p>
                        <p className="text-gray-600">{booking.booking_time}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Home className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Service Location</p>
                      <p className="text-gray-600">
                        {booking.customer.address}
                        <br />
                        {booking.customer.city}, {booking.customer.state} {booking.customer.zip_code}
                      </p>
                    </div>
                  </div>

                  {booking.special_instructions && (
                    <div className="border-t pt-4">
                      <p className="font-medium mb-2">Special Instructions</p>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-md">{booking.special_instructions}</p>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <p className="font-medium mb-2">Pricing</p>
                    <div className="flex justify-between font-bold">
                      <span>Total Price:</span>
                      <span>${booking.total_price}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="customer">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                  <CardDescription>Contact details for this customer</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Name</p>
                      <p className="text-gray-600">
                        {booking.customer.first_name} {booking.customer.last_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-gray-600">{booking.customer.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-gray-600">{booking.customer.phone}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="font-medium mb-2">Address</p>
                    <p className="text-gray-600">
                      {booking.customer.address}
                      <br />
                      {booking.customer.city}, {booking.customer.state} {booking.customer.zip_code}
                    </p>
                  </div>

                  <div className="border-t pt-4">
                    <Button variant="outline" size="sm">
                      View All Bookings by This Customer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="services">
              <Card>
                <CardHeader>
                  <CardTitle>Services & Rooms</CardTitle>
                  <CardDescription>Details of services and rooms booked</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {booking.booking_services && booking.booking_services.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-3">Services</h3>
                      <div className="space-y-2">
                        {booking.booking_services.map((bookingService: any) => (
                          <div key={bookingService.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                            <div className="text-2xl">{bookingService.service?.icon || "🧹"}</div>
                            <div className="flex-1">
                              <p className="font-medium">{bookingService.service?.name}</p>
                            </div>
                            <div className="text-sm">Qty: {bookingService.quantity}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {booking.booking_rooms && booking.booking_rooms.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-3">Rooms</h3>
                      <div className="space-y-2">
                        {booking.booking_rooms.map((room: any) => {
                          const { serviceId, roomName } = parseRoomType(room.room_type)

                          return (
                            <div key={room.id} className="flex items-center p-3 bg-gray-50 rounded-md">
                              <div className="flex-1">
                                <p className="font-medium">{roomName}</p>
                              </div>
                              <div className="text-sm">Qty: {room.quantity}</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Total Price Summary */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-bold">
                      <span>Total Price:</span>
                      <span>${booking.total_price}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Manage this booking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Update Status</p>

                {booking.status !== "completed" && booking.status !== "cancelled" && (
                  <div className="space-y-2">
                    <Button
                      className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                      variant="outline"
                      onClick={handleCompleteBooking}
                      disabled={isUpdating}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Completed
                    </Button>

                    <Button
                      className="w-full bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                      variant="outline"
                      onClick={handleCancelBooking}
                      disabled={isUpdating}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Booking
                    </Button>
                  </div>
                )}

                {(booking.status === "completed" || booking.status === "cancelled") && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-gray-500 text-sm">
                      This booking is already {booking.status}. No further status changes are allowed.
                    </p>
                  </div>
                )}

                {updateError && (
                  <div className="bg-red-50 p-3 rounded-md flex items-start gap-2 mt-2">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                    <p className="text-red-500 text-sm">{updateError}</p>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 space-y-2">
                <Button className="w-full" variant="outline">
                  Send Reminder Email
                </Button>
                <Button className="w-full" variant="outline">
                  Print Booking Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
