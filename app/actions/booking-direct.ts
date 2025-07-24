"use server"

import { revalidatePath } from "next/cache"
import { supabase } from "@/lib/supabase"
import { sendBookingConfirmationEmail } from "./send-email"

export async function createBooking(data: any) {
  try {
    console.log("Creating booking with date:", data.date, "Time:", data.time)

    // First, create or update the customer
    let customerId = data.customerId

    if (!customerId) {
      // Check if customer already exists with this email
      const { data: existingCustomer, error: lookupError } = await supabase
        .from("customers")
        .select("id")
        .eq("email", data.email)
        .maybeSingle()

      if (lookupError) {
        console.error("Error looking up customer:", lookupError)
      }

      if (existingCustomer?.id) {
        // Update existing customer
        customerId = existingCustomer.id
        const { error: updateError } = await supabase
          .from("customers")
          .update({
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
            address: data.address,
            city: data.city,
            state: data.state,
            zip_code: data.zipCode,
            unit_number: data.unitNumber,
            property_type: data.propertyType,
            floors: data.floors,
            floor_level: data.floorLevel,
          })
          .eq("id", customerId)

        if (updateError) {
          console.error("Error updating customer:", updateError)
          throw new Error(`Error updating customer: ${updateError.message}`)
        }
      } else {
        // Create new customer
        const { data: newCustomer, error: createError } = await supabase
          .from("customers")
          .insert({
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            phone: data.phone,
            address: data.address,
            city: data.city,
            state: data.state,
            zip_code: data.zipCode,
            unit_number: data.unitNumber,
            property_type: data.propertyType,
            floors: data.floors,
            floor_level: data.floorLevel,
          })
          .select("id")
          .single()

        if (createError) {
          console.error("Error creating customer:", createError)
          throw new Error(`Error creating customer: ${createError.message}`)
        }

        customerId = newCustomer.id
      }
    }

    // Generate a confirmation number
    const confirmationNumber = `CL${Math.floor(100000 + Math.random() * 900000)}`

    // Add confirmation number to special instructions
    let specialInstructions = data.specialInstructions || ""
    specialInstructions += `\n[Confirmation: ${confirmationNumber}]`

    // Get the day of week
    const bookingDate = new Date(data.date)
    const dayOfWeek = bookingDate.toLocaleDateString("en-US", { weekday: "long" })
    console.log("Day of week calculated:", dayOfWeek)

    // Use our SQL function to create the booking with exact date
    const { data: result, error } = await supabase.rpc("create_booking_with_exact_date", {
      p_customer_id: customerId,
      p_date: data.date,
      p_time: data.time,
      p_total_price: data.totalPrice || 0,
      p_zip_code: data.zipCode || "",
      p_special_instructions: specialInstructions,
      p_status: "pending",
    })

    if (error) {
      console.error("Error creating booking:", error)
      throw new Error(`Error creating booking: ${error.message}`)
    }

    const bookingId = result
    console.log("Booking created with ID:", bookingId)

    // Add services if provided
    if (data.services && data.services.length > 0) {
      const bookingServices = data.services.map((service: any) => ({
        booking_id: bookingId,
        service_id: service.id,
        quantity: service.quantity,
        price: service.price,
      }))

      const { error: servicesError } = await supabase.from("booking_services").insert(bookingServices)

      if (servicesError) {
        console.error("Error adding booking services:", servicesError)
      }
    }

    // Add rooms if provided
    if (data.rooms && data.rooms.length > 0) {
      const bookingRooms = data.rooms.map((room: any) => ({
        booking_id: bookingId,
        room_type: room.type,
        quantity: room.quantity,
        price: room.price,
      }))

      const { error: roomsError } = await supabase.from("booking_rooms").insert(bookingRooms)

      if (roomsError) {
        console.error("Error adding booking rooms:", roomsError)
      }
    }

    // Log the date information for debugging
    await supabase.rpc("log_date_info", {
      booking_id: bookingId,
      original_date: data.date,
      processed_date: data.date,
      notes: `Day of week: ${dayOfWeek}`,
    })

    // Send confirmation email
    try {
      await sendBookingConfirmationEmail({
        id: bookingId,
        customer: {
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
        },
        booking_date: data.date,
        booking_time: data.time,
        confirmation_number: confirmationNumber,
      })
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError)
    }

    revalidatePath("/booking")

    return {
      success: true,
      bookingId,
      confirmationNumber,
      date: data.date,
      dayOfWeek,
    }
  } catch (error) {
    console.error("Booking creation error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}
