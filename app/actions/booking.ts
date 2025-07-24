"use server"

import { revalidatePath } from "next/cache"
import { supabase } from "@/lib/supabase"

export type BookingFormData = {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  unitNumber?: string
  city: string
  state: string
  zipCode: string
  propertyType?: "house" | "apartment" | null
  floors?: number
  floorLevel?: "1st" | "2nd" | null
  specialInstructions?: string
  services: string[]
  rooms: {
    serviceId: string
    roomId: string
    count: number
    isActive?: boolean
  }[]
  date: string
  dayOfWeek?: string // Add day of week
  time: string
  totalPrice: number
}

export async function createBooking(data: BookingFormData) {
  try {
    console.log("Creating booking with data:", JSON.stringify(data, null, 2))

    // 1. Create or find customer
    const { data: existingCustomers, error: customerFetchError } = await supabase
      .from("customers")
      .select("id")
      .eq("email", data.email)
      .limit(1)

    if (customerFetchError) {
      console.error("Error fetching customer:", customerFetchError)
      throw new Error(`Error fetching customer: ${customerFetchError.message}`)
    }

    let customerId: string

    if (existingCustomers && existingCustomers.length > 0) {
      // Update existing customer
      customerId = existingCustomers[0].id
      console.log("Found existing customer with ID:", customerId)

      // Create a base update object with required fields
      const updateData: any = {
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zip_code: data.zipCode,
      }

      // First, check if the unit_number column exists in the customers table
      const { data: columnInfo, error: columnCheckError } = await supabase.from("customers").select().limit(1)

      if (columnCheckError) {
        console.error("Error checking columns:", columnCheckError)
      } else {
        // Only add unit_number if the column exists in the database
        const sampleCustomer = columnInfo && columnInfo.length > 0 ? columnInfo[0] : null
        if (sampleCustomer && "unit_number" in sampleCustomer && data.unitNumber) {
          updateData.unit_number = data.unitNumber
        } else {
          console.log("unit_number column not found in customers table, skipping this field")
        }
      }

      const { error: updateError } = await supabase.from("customers").update(updateData).eq("id", customerId)

      if (updateError) {
        console.error("Error updating customer:", updateError)
        throw new Error(`Error updating customer: ${updateError.message}`)
      }
    } else {
      // Create new customer
      // Create a base insert object with required fields
      const insertData: any = {
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zip_code: data.zipCode,
      }

      // First, check if the unit_number column exists in the customers table
      const { data: columnInfo, error: columnCheckError } = await supabase.from("customers").select().limit(1)

      if (columnCheckError) {
        console.error("Error checking columns:", columnCheckError)
      } else {
        // Only add unit_number if the column exists in the database
        const sampleCustomer = columnInfo && columnInfo.length > 0 ? columnInfo[0] : null
        if (sampleCustomer && "unit_number" in sampleCustomer && data.unitNumber) {
          insertData.unit_number = data.unitNumber
        } else {
          console.log("unit_number column not found in customers table, skipping this field")
        }
      }

      console.log("Creating new customer with data:", insertData)
      const { data: newCustomer, error: createError } = await supabase
        .from("customers")
        .insert(insertData)
        .select("id")
        .single()

      if (createError) {
        console.error("Error creating customer:", createError)
        throw new Error(`Error creating customer: ${createError.message}`)
      }

      if (!newCustomer) {
        throw new Error("Failed to create customer: No ID returned")
      }

      customerId = newCustomer.id
      console.log("Created new customer with ID:", customerId)
    }

    // Generate a confirmation number
    const confirmationNumber = `CL${Math.floor(100000 + Math.random() * 900000)}`
    console.log("Generated confirmation number:", confirmationNumber)

    // Store day of week in special instructions if provided
    let specialInstructions = data.specialInstructions || ""

    // Add confirmation number
    specialInstructions += `\n[Confirmation: ${confirmationNumber}]`

    // Add day of week for verification
    if (data.dayOfWeek) {
      specialInstructions += `\n[Day of Week: ${data.dayOfWeek}]`
    }

    // 2. Create booking using direct SQL to avoid date conversion issues
    const bookingInsertQuery = `
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
        ${data.totalPrice}, 
        '${data.zipCode}', 
        '${specialInstructions.replace(/'/g, "''")}', 
        'pending'
      )
      RETURNING id;
    `

    console.log("Executing direct SQL insert:", bookingInsertQuery)

    // Execute the SQL query
    const { data: insertResult, error: insertError } = await supabase.rpc("execute_sql", {
      sql_query: bookingInsertQuery,
    })

    let bookingId: string

    if (insertError) {
      console.error("Error in direct SQL insert:", insertError)

      // Fall back to standard insert if RPC fails
      console.log("Falling back to standard insert")

      const bookingData = {
        customer_id: customerId,
        booking_date: data.date,
        booking_time: data.time,
        total_price: data.totalPrice,
        zip_code: data.zipCode,
        special_instructions: specialInstructions,
        status: "pending",
      }

      console.log("Creating booking with data:", bookingData)
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert(bookingData)
        .select("id")
        .single()

      if (bookingError) {
        console.error("Error creating booking:", bookingError)
        throw new Error(`Error creating booking: ${bookingError.message}`)
      }

      if (!booking) {
        throw new Error("Failed to create booking: No ID returned")
      }

      bookingId = booking.id
    } else {
      console.log("Direct SQL insert result:", insertResult)
      // Extract booking ID from the result
      if (!insertResult || !insertResult.length) {
        throw new Error("Failed to create booking: No ID returned from SQL query")
      }

      // Parse the result to get the booking ID
      try {
        const parsedResult = JSON.parse(insertResult)
        bookingId = parsedResult[0].id
      } catch (e) {
        console.error("Error parsing SQL result:", e)
        throw new Error("Failed to parse booking ID from SQL result")
      }
    }

    console.log("Created booking with ID:", bookingId)

    // 3. Create booking services
    if (data.services.length > 0) {
      // First get service details
      const serviceNames = data.services.map((service) => {
        // Convert service IDs like "carpet" to proper names like "Carpet Cleaning"
        switch (service) {
          case "carpet":
            return "Carpet Cleaning"
          case "upholstery":
            return "Upholstery Cleaning"
          case "tile":
            return "Tile & Grout Cleaning"
          case "pet-treatment":
            return "Pet Odor & Stain Treatment"
          case "carpet-protection":
            return "Carpet Protection"
          default:
            return service
        }
      })

      console.log("Looking up services with names:", serviceNames)
      const { data: serviceDetails, error: serviceError } = await supabase
        .from("services")
        .select("id, name, fixed_price")
        .in("name", serviceNames)

      if (serviceError) {
        console.error("Error fetching services:", serviceError)
        throw new Error(`Error fetching services: ${serviceError.message}`)
      }

      if (!serviceDetails || serviceDetails.length === 0) {
        console.error("No services found for:", serviceNames)
        throw new Error(`No services found for the provided service IDs`)
      }

      console.log("Found services:", serviceDetails)
      const bookingServices = serviceDetails.map((service) => ({
        booking_id: bookingId,
        service_id: service.id,
        quantity: 1,
        price: service.fixed_price || 0,
      }))

      console.log("Creating booking services:", bookingServices)
      const { error: bookingServiceError } = await supabase.from("booking_services").insert(bookingServices)

      if (bookingServiceError) {
        console.error("Error creating booking services:", bookingServiceError)
        throw new Error(`Error creating booking services: ${bookingServiceError.message}`)
      }
    }

    // 4. Create booking rooms
    if (data.rooms.length > 0) {
      const bookingRooms = data.rooms.map((room) => ({
        booking_id: bookingId,
        room_type: `${room.serviceId}-${room.roomId}`,
        quantity: room.count,
        price: 0, // We'll calculate this based on the pricing logic
      }))

      console.log("Creating booking rooms:", bookingRooms)
      const { error: bookingRoomError } = await supabase.from("booking_rooms").insert(bookingRooms)

      if (bookingRoomError) {
        console.error("Error creating booking rooms:", bookingRoomError)
        throw new Error(`Error creating booking rooms: ${bookingRoomError.message}`)
      }
    }

    revalidatePath("/booking")
    console.log("Booking creation successful. Returning:", {
      success: true,
      bookingId: bookingId,
      confirmationNumber,
      date: data.date,
      dayOfWeek: data.dayOfWeek,
    })

    return {
      success: true,
      bookingId: bookingId,
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
