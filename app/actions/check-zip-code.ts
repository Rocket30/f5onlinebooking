"use server"

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function checkZipCodeInServiceArea(zipCode: string) {
  try {
    console.log("Checking ZIP code:", zipCode)

    // Query the service_area_zip_codes table
    const { data, error } = await supabase
      .from("service_area_zip_codes")
      .select("zip_code, city, state")
      .eq("zip_code", zipCode)
      .single()

    if (error) {
      console.error("Database error:", error)
      return {
        isValid: false,
        error: "Error checking service availability",
      }
    }

    if (data) {
      console.log("ZIP code found:", data)
      return {
        isValid: true,
        zipCode: data.zip_code,
        city: data.city,
        state: data.state,
      }
    }

    console.log("ZIP code not found in service area")
    return {
      isValid: false,
      error: "Sorry, we don't currently service this area",
    }
  } catch (error) {
    console.error("Unexpected error:", error)
    return {
      isValid: false,
      error: "An error occurred while checking service availability",
    }
  }
}
