"use server"

import { revalidatePath } from "next/cache"
import { supabase } from "@/lib/supabase"

export async function createBookingWithExactDate(data: any) {
  try {
    console.log("Creating booking with exact date:", data.date, "Day of week:", data.dayOfWeek)

    // First handle customer creation/update as in the original function
    // ... (customer handling code would go here)

    // For this example, let's assume we have the customerId
    const customerId = data.customerId || "00000000-0000-0000-0000-000000000000"

    // Generate a confirmation number
    const confirmationNumber = `CL${Math.floor(100000 + Math.random() * 900000)}`

    // Create special instructions with day of week
    let specialInstructions = data.specialInstructions || ""
    specialInstructions += `\n[Confirmation: ${confirmationNumber}]`
    specialInstructions += `\n[Day of Week: ${data.dayOfWeek}]`

    // Insert booking with direct SQL to avoid date conversion issues
    const insertQuery = `
      INSERT INTO bookings (
        customer_id, 
        booking_date, 
        booking_time, 
        total_price, 
        zip_code, 
        special_instructions, 
        status
      ) 
      VALUES (
        '${customerId}', 
        '${data.date}', 
        '${data.time}', 
        ${data.totalPrice || 0}, 
        '${data.zipCode || ""}', 
        '${specialInstructions.replace(/'/g, "''")}', 
        'pending'
      )
      RETURNING id;
    `

    const { data: result, error } = await supabase.rpc("execute_sql", { sql_query: insertQuery })

    if (error) {
      console.error("Error creating booking:", error)
      throw new Error(`Error creating booking: ${error.message}`)
    }

    // Parse the result to get the booking ID
    let bookingId
    try {
      const parsedResult = JSON.parse(result)
      bookingId = parsedResult[0].id
    } catch (e) {
      console.error("Error parsing SQL result:", e)
      throw new Error("Failed to parse booking ID from SQL result")
    }

    revalidatePath("/booking")

    return {
      success: true,
      bookingId,
      confirmationNumber,
      date: data.date,
      dayOfWeek: data.dayOfWeek,
    }
  } catch (error) {
    console.error("Booking creation error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}
