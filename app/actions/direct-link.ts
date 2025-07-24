"use server"
import { checkZipCodeInServiceArea } from "./check-zip-code"

export async function handleDirectSchedulingLink(zipCode: string) {
  try {
    // Validate the zip code
    const result = await checkZipCodeInServiceArea(zipCode)

    if (result.isInServiceArea) {
      // Redirect to the direct scheduling page with the zip code
      return { success: true, redirectUrl: `/booking/direct-schedule?zip=${zipCode}` }
    } else {
      // Redirect to the booking page with an error
      return {
        success: false,
        error: "We're sorry, but we don't currently service your area.",
        redirectUrl: `/booking?error=service-area&zip=${zipCode}`,
      }
    }
  } catch (error) {
    console.error("Error handling direct scheduling link:", error)
    return {
      success: false,
      error: "An error occurred. Please try again.",
      redirectUrl: "/booking",
    }
  }
}
