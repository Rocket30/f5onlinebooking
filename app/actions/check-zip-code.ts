"use server"

import { supabase } from "@/lib/supabase"

export async function checkZipCodeInServiceArea(zipCode: string) {
  try {
    // Normalize the zip code by trimming and ensuring it's a string
    const normalizedZipCode = zipCode.trim()

    console.log(`Checking zip code: "${normalizedZipCode}"`)

    const { data, error } = await supabase.from("service_area_zip_codes").select("*").eq("zip_code", normalizedZipCode)

    if (error) {
      console.error("Error checking zip code:", error)
      return {
        isInServiceArea: false,
        valid: false,
        error: "Error checking service availability",
      }
    }

    // Log the result for debugging
    console.log(`Zip code check result for ${normalizedZipCode}:`, data)

    // Check if any data was returned (array with at least one item)
    const isInServiceArea = data && data.length > 0

    return {
      isInServiceArea,
      valid: isInServiceArea, // For backward compatibility
      locationData: isInServiceArea ? { city: data[0].city, state: data[0].state } : null,
    }
  } catch (error) {
    console.error("Error checking zip code:", error)
    return {
      isInServiceArea: false,
      valid: false,
      error: "An unexpected error occurred",
    }
  }
}

// Add the missing checkZipCode export
export async function checkZipCode(zipCode: string) {
  // This is an alias for checkZipCodeInServiceArea for backward compatibility
  const result = await checkZipCodeInServiceArea(zipCode)
  return {
    ...result,
    valid: result.isInServiceArea, // Ensure valid property is set based on isInServiceArea
  }
}
