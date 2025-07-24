"use server"

import { revalidatePath } from "next/cache"
import { createBooking } from "./booking-direct"

export async function submitBookingDetails(formData: FormData) {
  try {
    // Extract form data
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const address = formData.get("address") as string
    const city = formData.get("city") as string
    const state = formData.get("state") as string
    const zipCode = formData.get("zipCode") as string
    const unitNumber = formData.get("unitNumber") as string
    const propertyType = formData.get("propertyType") as string
    const floors = formData.get("floors") as string
    const floorLevel = formData.get("floorLevel") as string
    const specialInstructions = formData.get("specialInstructions") as string

    // Extract booking data from hidden fields
    const date = formData.get("date") as string
    const time = formData.get("time") as string
    const servicesJson = formData.get("servicesJson") as string
    const roomsJson = formData.get("roomsJson") as string
    const totalPrice = Number.parseFloat(formData.get("totalPrice") as string)

    // Parse JSON data
    const services = servicesJson ? JSON.parse(servicesJson) : []
    const rooms = roomsJson ? JSON.parse(roomsJson) : []

    // Calculate the day of week
    const bookingDate = new Date(date)
    const dayOfWeek = bookingDate.toLocaleDateString("en-US", { weekday: "long" })

    // Create booking
    const result = await createBooking({
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      unitNumber,
      propertyType,
      floors: floors || null,
      floorLevel: floorLevel || null,
      specialInstructions,
      date,
      time,
      services,
      rooms,
      totalPrice,
      dayOfWeek,
    })

    if (!result.success) {
      throw new Error(result.error || "Failed to create booking")
    }

    revalidatePath("/booking")

    return {
      success: true,
      bookingId: result.bookingId,
      confirmationNumber: result.confirmationNumber,
    }
  } catch (error) {
    console.error("Error submitting booking details:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}
