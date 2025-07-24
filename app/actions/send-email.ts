"use server"

// Function to send a booking confirmation email
export async function sendBookingConfirmationEmail(booking: any) {
  try {
    console.log(
      "Email notifications are disabled. Would have sent confirmation for:",
      booking.id || booking.booking_id || "unknown",
    )

    // Return success but with a flag indicating emails are disabled
    return {
      success: true,
      emailsSent: false,
      development: true,
    }
  } catch (error) {
    console.error("Error in sendBookingConfirmationEmail:", error)
    return {
      success: false,
      emailsSent: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

// Function to send a booking cancellation email
export async function sendBookingCancellationEmail(booking: any) {
  try {
    console.log(
      "Email notifications are disabled. Would have sent cancellation for:",
      booking.id || booking.booking_id || "unknown",
    )

    // Return success but with a flag indicating emails are disabled
    return {
      success: true,
      emailsSent: false,
      development: true,
    }
  } catch (error) {
    console.error("Error in sendBookingCancellationEmail:", error)
    return {
      success: false,
      emailsSent: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

// Function to send a booking status update email
export async function sendBookingStatusUpdateEmail(booking: any) {
  try {
    console.log(
      "Email notifications are disabled. Would have sent status update for:",
      booking.id || booking.booking_id || "unknown",
    )

    // Return success but with a flag indicating emails are disabled
    return {
      success: true,
      emailsSent: false,
      development: true,
    }
  } catch (error) {
    console.error("Error in sendBookingStatusUpdateEmail:", error)
    return {
      success: false,
      emailsSent: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

// Generic email sending function
export async function sendEmail(options: {
  to: string
  subject: string
  body: string
}) {
  try {
    // Log that we're not actually sending emails
    console.log("Email notifications are disabled. Would have sent email to:", options.to)

    // Return success but with a flag indicating emails are disabled
    return {
      success: true,
      emailsSent: false,
      development: true,
    }
  } catch (error) {
    console.error("Error sending email:", error)
    return {
      success: false,
      emailsSent: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}
