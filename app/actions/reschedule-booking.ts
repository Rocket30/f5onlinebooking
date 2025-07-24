"use server"

import { revalidatePath } from "next/cache"
import { supabase } from "@/lib/supabase"
import { logError } from "@/lib/error-handler"

export async function rescheduleBooking(
  bookingId: string,
  newDate: string,
  newTime: string,
  email: string,
  dayOfWeek: string, // Add day of week parameter for validation
) {
  try {
    console.log(`[RESCHEDULE] Starting reschedule for booking ${bookingId}`)
    console.log(`[RESCHEDULE] New date: "${newDate}" (${dayOfWeek}), New time: "${newTime}"`)

    // Verify that the booking belongs to the customer with the provided email
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select(`
        id,
        booking_date,
        booking_time,
        status,
        special_instructions,
        customer:customer_id (
          email
        )
      `)
      .eq("id", bookingId)
      .single()

    if (fetchError) {
      console.error("[RESCHEDULE] Error fetching booking:", fetchError)
      throw new Error(`Error fetching booking: ${fetchError.message}`)
    }

    if (!booking) {
      console.error("[RESCHEDULE] Booking not found:", bookingId)
      return { success: false, error: "Booking not found" }
    }

    console.log("[RESCHEDULE] Original booking:", booking)

    // Check if the booking belongs to the customer with the provided email
    if (booking.customer.email !== email && email !== "") {
      console.error("[RESCHEDULE] Unauthorized access attempt:", email)
      return { success: false, error: "Unauthorized access to this booking" }
    }

    // Only allow rescheduling if the booking status is 'pending'
    if (booking.status !== "pending") {
      console.error("[RESCHEDULE] Cannot reschedule non-pending booking:", booking.status)
      return {
        success: false,
        error: "Only pending bookings can be rescheduled",
      }
    }

    // Update special instructions to include the day of week
    let specialInstructions = booking.special_instructions || ""

    // Remove any existing day of week information
    specialInstructions = specialInstructions.replace(/\[Day of Week: .*?\]/g, "").trim()

    // Add the new day of week
    specialInstructions += ` [Day of Week: ${dayOfWeek}]`

    // CRITICAL FIX: Use direct SQL query with the exact date string
    // This completely bypasses any ORM date handling
    const updateQuery = `
      UPDATE bookings 
      SET booking_date = '${newDate}', booking_time = '${newTime}', special_instructions = '${specialInstructions}' 
      WHERE id = '${bookingId}'
      RETURNING id, booking_date, booking_time, special_instructions;
    `

    console.log("[RESCHEDULE] Executing direct SQL update:", updateQuery)

    const { data: updateResult, error: updateError } = await supabase.rpc("execute_sql", { sql_query: updateQuery })

    if (updateError) {
      console.error("[RESCHEDULE] Error in direct SQL update:", updateError)

      // Fall back to standard update if RPC fails
      console.log("[RESCHEDULE] Falling back to standard update")

      const { data: fallbackData, error: fallbackError } = await supabase
        .from("bookings")
        .update({
          booking_date: newDate,
          booking_time: newTime,
          special_instructions: specialInstructions,
        })
        .eq("id", bookingId)
        .select()

      if (fallbackError) {
        console.error("[RESCHEDULE] Error in fallback update:", fallbackError)
        throw new Error(`Error rescheduling booking: ${fallbackError.message}`)
      }

      console.log("[RESCHEDULE] Fallback update result:", fallbackData)
    } else {
      console.log("[RESCHEDULE] Direct SQL update result:", updateResult)
    }

    // Verify the update was successful by fetching the booking again
    const { data: verifyData, error: verifyError } = await supabase
      .from("bookings")
      .select("booking_date, booking_time, special_instructions")
      .eq("id", bookingId)
      .single()

    if (verifyError) {
      console.error("[RESCHEDULE] Error verifying update:", verifyError)
    } else {
      console.log("[RESCHEDULE] Verification result:", {
        expected: { date: newDate, time: newTime, dayOfWeek },
        actual: {
          date: verifyData.booking_date,
          time: verifyData.booking_time,
          specialInstructions: verifyData.special_instructions,
        },
      })

      // If the update didn't take effect, return an error
      if (verifyData.booking_date !== newDate) {
        console.error("[RESCHEDULE] Update verification failed - dates don't match")
        console.error(`Expected: ${newDate}, Got: ${verifyData.booking_date}`)
        return {
          success: false,
          error: "Failed to update booking date. Please try again.",
        }
      }
    }

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
        timestamp: timestamp, // Include timestamp for client-side cache busting
      },
    }
  } catch (error) {
    console.error("[RESCHEDULE] Error in rescheduleBooking:", error)
    logError("rescheduleBooking", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}
