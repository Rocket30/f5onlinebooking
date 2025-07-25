import { createClient as createSupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a single supabase client for the entire app
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

// Export createClient function for use in server actions
export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

// Types for our database tables
export type Customer = {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string
  address: string
  city: string
  state: string
  zip_code: string
  created_at: string
}

export type Booking = {
  id: string
  customer_id: string
  booking_date: string
  booking_time: string
  total_price: number
  status: "pending" | "confirmed" | "completed" | "cancelled"
  zip_code: string
  special_instructions?: string
  created_at: string
}

export type BookingService = {
  id: string
  booking_id: string
  service_id: string
  quantity: number
  price: number
}

export type BookingRoom = {
  id: string
  booking_id: string
  room_type: string
  quantity: number
  price: number
}

export type Service = {
  id: string
  name: string
  description: string
  icon: string
  fixed_price?: number
}

export type RoomType = {
  id: string
  service_id: string
  name: string
  description: string
  icon: string
  special_price?: number
  is_standard_room?: boolean
}

// Add type for service area zip codes
export type ServiceAreaZipCode = {
  id: string
  zip_code: string
  city: string
  state: string
  created_at: string
}

// Add connection validation function
export async function validateSupabaseConnection() {
  try {
    // Simple query to test connection
    const { data, error } = await supabase.from("customers").select("count").limit(1)

    if (error) {
      console.error("Supabase connection validation error:", error)
      return {
        connected: false,
        error: error.message,
      }
    }

    return {
      connected: true,
    }
  } catch (err) {
    console.error("Supabase connection exception:", err)
    return {
      connected: false,
      error: err instanceof Error ? err.message : "Unknown connection error",
    }
  }
}
