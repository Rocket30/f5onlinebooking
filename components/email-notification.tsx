import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

interface EmailNotificationProps {
  emailResult: any
}

export function EmailNotification({ emailResult }: EmailNotificationProps) {
  if (!emailResult || !emailResult.development) return null

  return (
    <Alert className="mb-6 bg-blue-50 border-blue-200">
      <InfoIcon className="h-4 w-4 text-blue-500" />
      <AlertDescription className="text-blue-700">
        <strong>Note:</strong> Email notifications have been disabled. Customers will need to follow the instructions on
        the confirmation page.
      </AlertDescription>
    </Alert>
  )
}

// Keeping the type definition for any code that might reference it
export type BookingWithCustomerType = {
  id: string
  booking_date: string
  booking_time: string
  total_price: number
  status: string
  zip_code: string
  confirmation_number?: string
  metadata?: {
    confirmation_number?: string
    [key: string]: any
  }
  customer: {
    first_name: string
    last_name: string
    email: string
    address: string
    city: string
    state: string
    zip_code: string
  }
}
