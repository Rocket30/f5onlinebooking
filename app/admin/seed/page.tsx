"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { seedInitialData } from "@/app/actions/seed-data"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SeedPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null)
  const router = useRouter()

  // Update the handleSeed function to provide more detailed feedback
  const handleSeed = async () => {
    setIsLoading(true)
    try {
      console.log("Starting database initialization...")
      const result = await seedInitialData()
      console.log("Seed result:", result)
      setResult(result)

      if (result.success) {
        // Add a delay to show success message before redirecting
        setTimeout(() => {
          router.refresh()
        }, 3000)
      }
    } catch (error) {
      console.error("Seed error details:", error)
      setResult({
        success: false,
        error:
          error instanceof Error
            ? `Error: ${error.message}`
            : "An unknown error occurred during database initialization",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Initialize Database</CardTitle>
          {/* Add more detailed instructions */}
          <CardDescription>
            Create and seed the database with services and room types for the cleaning service scheduler.
            <strong className="block mt-2 text-yellow-600">
              If you're seeing "Failed to fetch" errors, run this initialization first.
            </strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                This will create all necessary database tables and seed them with initial data. Run this if you're
                seeing database errors like "relation does not exist".
              </AlertDescription>
            </Alert>

            <Button onClick={handleSeed} disabled={isLoading} className="bg-yellow-500 hover:bg-yellow-600 text-black">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initializing Database...
                </>
              ) : (
                "Initialize Database"
              )}
            </Button>

            {result && (
              <Alert className={result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
                <AlertDescription>{result.success ? result.message : `Error: ${result.error}`}</AlertDescription>

                {!result.success && (
                  <div className="mt-4 space-y-3">
                    <p className="text-sm font-medium">Alternative solutions:</p>
                    <ol className="list-decimal pl-5 text-sm space-y-2">
                      <li>
                        Create the tables manually in the Supabase dashboard SQL editor
                        <Link
                          href="https://supabase.com/dashboard"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:underline mt-1"
                        >
                          Go to Supabase Dashboard <ExternalLink className="h-3 w-3 ml-1" />
                        </Link>
                      </li>
                      <li>Check your Supabase connection settings in your environment variables</li>
                      <li>Ensure your Supabase project is active and the database is accessible</li>
                    </ol>
                  </div>
                )}
              </Alert>
            )}

            {/* Add manual SQL instructions */}
            <div className="mt-8 border-t pt-6">
              <h3 className="font-medium text-lg mb-3">Manual Database Setup</h3>
              <p className="text-sm mb-4">
                If the automatic initialization fails, you can create the tables manually using SQL in the Supabase
                dashboard:
              </p>

              <div className="bg-gray-50 p-4 rounded-md overflow-auto text-sm">
                <pre className="whitespace-pre-wrap">
                  {`-- Run these SQL commands in your Supabase SQL Editor

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  fixed_price DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id),
  booking_date DATE NOT NULL,
  booking_time VARCHAR(50) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  zip_code VARCHAR(20) NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create booking_services table
CREATE TABLE IF NOT EXISTS booking_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  service_id UUID NOT NULL REFERENCES services(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL
);

-- Create room_types table
CREATE TABLE IF NOT EXISTS room_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  special_price DECIMAL(10, 2),
  is_standard_room BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create booking_rooms table
CREATE TABLE IF NOT EXISTS booking_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  room_type VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL
);

-- Create service_area_zip_codes table
CREATE TABLE IF NOT EXISTS service_area_zip_codes (
  zip_code VARCHAR(20) PRIMARY KEY,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`}
                </pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
