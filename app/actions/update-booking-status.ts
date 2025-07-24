"use server"

import { revalidatePath } from "next/cache"
import { supabase } from "@/lib/supabase"
import { sendBookingStatusUpdateEmail } from "./send-email"

export async function updateBookingStatus(
  bookingId: string,
  newStatus: string,
  setBookings?: any,
  setIsUpdating?: any,
  setError?: any,
) {
  try {
    // Validate the status - we only allow completed or cancelled now
    const validStatuses = ["completed", "cancelled"]
    if (!validStatuses.includes(newStatus)) {
      return { success: false, error: "Invalid status. Only 'completed' or 'cancelled' are allowed." }
    }

    // Fetch the current booking to check if status is actually changing
    const { data: currentBooking, error: fetchError } = await supabase
      .from("bookings")
      .select(`
        id,
        status,
        booking_date,
        booking_time,
        total_price,
        customer:customer_id (
          first_name,
          last_name,
          email,
          address,
          city,
          state,
          zip_code
        )
      `)
      .eq("id", bookingId)
      .single()

    if (fetchError) {
      throw new Error(`Error fetching booking: ${fetchError.message}`)
    }

    if (!currentBooking) {
      return { success: false, error: "Booking not found" }
    }

    // If booking is already completed or cancelled, don't allow changes
    if (currentBooking.status === "completed" || currentBooking.status === "cancelled") {
      return {
        success: false,
        error: `Booking is already ${currentBooking.status}. No further status changes are allowed.`,
      }
    }

    // If status is not changing, return early
    if (currentBooking.status === newStatus) {
      return { success: true, message: "Status already set to " + newStatus }
    }

    // Update the booking status
    const { error: updateError } = await supabase.from("bookings").update({ status: newStatus }).eq("id", bookingId)

    if (updateError) {
      throw new Error(`Error updating booking status: ${updateError.message}`)
    }

    // Send email notification about the status change
    await sendBookingStatusUpdateEmail({
      ...currentBooking,
      status: newStatus, // Update with the new status
    })

    // Update local state if setBookings function is provided
    if (setBookings) {
      setBookings((prevBookings: any[]) =>
        prevBookings.map((booking) => (booking.id === bookingId ? { ...booking, status: newStatus } : booking)),
      )
    }

    // Reset updating state if provided
    if (setIsUpdating) {
      setIsUpdating((prev: any) => ({ ...prev, [bookingId]: false }))
    }

    revalidatePath("/admin")
    revalidatePath(`/admin/bookings/${bookingId}`)
    revalidatePath(`/booking/details/${bookingId}`)

    return { success: true }
  } catch (error) {
    console.error("Error updating booking status:", error)

    // Set error state if provided
    if (setError) {
      setError(error instanceof Error ? error.message : "An unknown error occurred")
    }

    // Reset updating state if provided
    if (setIsUpdating) {
      setIsUpdating((prev: any) => ({ ...prev, [bookingId]: false }))
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}
