"use server"

import { revalidatePath } from "next/cache"
import { supabase } from "@/lib/supabase"

export async function directRescheduleBooking(bookingId: string, newDate: string, newTime: string, dayOfWeek: string) {
  console.log("=== DIRECT RESCHEDULE ===")
  console.log(`Booking ID: ${bookingId}`)
  console.log(`New Date: ${newDate}`)
  console.log(`Day of Week: ${dayOfWeek}`)
  console.log(`New Time: ${newTime}`)

  try {
    // Call the direct SQL function
    const { data, error } = await supabase.rpc("direct_update_booking_date", {
      p_booking_id: bookingId,
      p_date: newDate,
      p_time: newTime,
      p_day_of_week: dayOfWeek,
    })

    if (error) {
      console.error("Direct reschedule error:", error)
      return {
        success: false,
        error: `Database error: ${error.message}`,
      }
    }

    console.log("Direct reschedule result:", data)

    // Force revalidation of all relevant paths
    const timestamp = Date.now()
    revalidatePath(`/booking/history?t=${timestamp}`)
    revalidatePath(`/booking/details/${bookingId}?t=${timestamp}`)
    revalidatePath(`/booking/manage?t=${timestamp}`)

    return {
      success: true,
      message: "Your appointment has been successfully rescheduled.",
      data: data,
    }
  } catch (error) {
    console.error("Unexpected error in directRescheduleBooking:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}
