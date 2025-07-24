"use server"

import { supabase } from "@/lib/supabase"

export async function initializeDatabase() {
  try {
    // Create customers table
    const { error: customersError } = await supabase.rpc("create_customers_table_if_not_exists")
    if (customersError) throw new Error(`Error creating customers table: ${customersError.message}`)

    // Create services table
    const { error: servicesError } = await supabase.rpc("create_services_table_if_not_exists")
    if (servicesError) throw new Error(`Error creating services table: ${servicesError.message}`)

    // Create room_types table
    const { error: roomTypesError } = await supabase.rpc("create_room_types_table_if_not_exists")
    if (roomTypesError) throw new Error(`Error creating room_types table: ${roomTypesError.message}`)

    // Create bookings table with confirmation_number column
    const { error: bookingsError } = await supabase.rpc("create_bookings_table_if_not_exists")
    if (bookingsError) throw new Error(`Error creating bookings table: ${bookingsError.message}`)

    // Add confirmation_number column if it doesn't exist
    const { error: addColumnError } = await supabase.rpc("add_confirmation_number_column_if_not_exists")
    if (addColumnError) throw new Error(`Error adding confirmation_number column: ${addColumnError.message}`)

    // Create booking_services table
    const { error: bookingServicesError } = await supabase.rpc("create_booking_services_table_if_not_exists")
    if (bookingServicesError) throw new Error(`Error creating booking_services table: ${bookingServicesError.message}`)

    // Create booking_rooms table
    const { error: bookingRoomsError } = await supabase.rpc("create_booking_rooms_table_if_not_exists")
    if (bookingRoomsError) throw new Error(`Error creating booking_rooms table: ${bookingRoomsError.message}`)

    // Create service_areas table
    const { error: serviceAreasError } = await supabase.rpc("create_service_areas_table_if_not_exists")
    if (serviceAreasError) throw new Error(`Error creating service_areas table: ${serviceAreasError.message}`)

    return { success: true }
  } catch (error) {
    console.error("Database initialization error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}
