"use server"

import { revalidatePath } from "next/cache"
import { supabase } from "@/lib/supabase"
import { sendBookingCancellationEmail } from "./send-email"

export async function cancelBooking(bookingId: string, email: string) {
  try {
    // Verify that the booking belongs to the customer with the provided email
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select(`
        id,
        booking_date,
        booking_time,
        total_price,
        status,
        zip_code,
        customer:customer_id (
          id,
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

    if (!booking) {
      return { success: false, error: "Booking not found" }
    }

    // Check if the booking belongs to the customer with the provided email
    if (booking.customer.email !== email) {
      return { success: false, error: "Unauthorized access to this booking" }
    }

    // Only allow cancellation if the booking status is 'pending'
    if (booking.status !== "pending") {
      return {
        success: false,
        error: "Only pending bookings can be cancelled",
      }
    }

    // Update the booking status to 'cancelled'
    const { error: updateError } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bookingId)

    if (updateError) {
      throw new Error(`Error cancelling booking: ${updateError.message}`)
    }

    // Send cancellation email
    await sendBookingCancellationEmail(booking)

    revalidatePath("/booking/history")
    revalidatePath(`/booking/details/${bookingId}`)

    return { success: true }
  } catch (error) {
    console.error("Error cancelling booking:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}
