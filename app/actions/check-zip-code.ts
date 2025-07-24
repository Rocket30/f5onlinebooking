"use server"

import { supabase } from "@/lib/supabase"

// Service area ZIP codes for Tampa Bay area
const serviceAreaZipCodes = [
  "33602",
  "33603",
  "33604",
  "33605",
  "33606",
  "33607",
  "33608",
  "33609",
  "33610",
  "33611",
  "33612",
  "33613",
  "33614",
  "33615",
  "33616",
  "33617",
  "33618",
  "33619",
  "33620",
  "33621",
  "33622",
  "33623",
  "33624",
  "33625",
  "33626",
  "33629",
  "33634",
  "33635",
  "33637",
  "33647",
  "33701",
  "33702",
  "33703",
  "33704",
  "33705",
  "33706",
  "33707",
  "33708",
  "33709",
  "33710",
  "33711",
  "33712",
  "33713",
  "33714",
  "33715",
  "33716",
  "33755",
  "33756",
  "33759",
  "33760",
  "33761",
  "33762",
  "33763",
  "33764",
  "33765",
  "33767",
  "33770",
  "33771",
  "33772",
  "33773",
  "33774",
  "33776",
  "33777",
  "33778",
  "33781",
  "33782",
  "33785",
  "33786",
]

export async function checkZipCodeInServiceArea(zipCode: string) {
  try {
    // Normalize the zip code by trimming and ensuring it's a string
    const normalizedZipCode = zipCode.trim()

    console.log(`Checking zip code: "${normalizedZipCode}"`)

    // Query the actual database table instead of using hardcoded array
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
      locationData: isInServiceArea
        ? {
            city: data[0].city,
            state: data[0].state,
          }
        : null,
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

// Add the missing checkZipCode export for backward compatibility
export async function checkZipCode(zipCode: string) {
  const result = await checkZipCodeInServiceArea(zipCode)
  return {
    ...result,
    valid: result.isInServiceArea,
  }
}
