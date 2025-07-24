"use server"

import { revalidatePath } from "next/cache"
import { supabase } from "@/lib/supabase"
import { logError } from "@/lib/error-handler"

export async function rescheduleBookingSimple(bookingId: string, newDate: string, newTime: string, dayOfWeek: string) {
  try {
    console.log(`[RESCHEDULE] Starting simple reschedule for booking ${bookingId}`)
    console.log(`[RESCHEDULE] New date: "${newDate}" (${dayOfWeek}), New time: "${newTime}"`)

    // Call the SQL function to update the booking date
    const { data, error } = await supabase.rpc("fix_booking_date", {
      booking_id: bookingId,
      new_date: newDate,
      new_time: newTime,
      day_of_week: dayOfWeek,
    })

    if (error) {
      console.error("[RESCHEDULE] Error updating booking:", error)
      return {
        success: false,
        error: `Error updating booking: ${error.message}`,
      }
    }

    console.log("[RESCHEDULE] Update result:", data)

    // Force revalidation of relevant paths with timestamp to bust cache
    const timestamp = Date.now()
    revalidatePath(`/booking/history?t=${timestamp}`)
    revalidatePath(`/booking/details/${bookingId}?t=${timestamp}`)
    revalidatePath(`/booking/manage?t=${timestamp}`)

    return {
      success: true,
      message: "Your appointment has been successfully rescheduled.",
      updatedBooking: {
        date: newDate,
        time: newTime,
        dayOfWeek: dayOfWeek,
        timestamp: timestamp,
      },
    }
  } catch (error) {
    console.error("[RESCHEDULE] Error in rescheduleBookingSimple:", error)
    logError("rescheduleBookingSimple", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}
