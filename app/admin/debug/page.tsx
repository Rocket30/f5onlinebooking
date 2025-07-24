"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { checkZipCodeInServiceArea } from "@/app/actions/check-zip-code"
import { supabase } from "@/lib/supabase"

export default function DebugPage() {
  const [zipCode, setZipCode] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [serviceAreas, setServiceAreas] = useState<any[]>([])
  const [loadingServiceAreas, setLoadingServiceAreas] = useState(false)

  const handleCheck = async () => {
    setLoading(true)
    try {
      const checkResult = await checkZipCodeInServiceArea(zipCode)
      setResult(checkResult)
    } catch (error) {
      console.error("Error checking zip code:", error)
      setResult({ error: "An error occurred while checking the zip code" })
    } finally {
      setLoading(false)
    }
  }

  const loadServiceAreas = async () => {
    setLoadingServiceAreas(true)
    try {
      const { data, error } = await supabase.from("service_area_zip_codes").select("*")
      if (error) {
        throw error
      }
      setServiceAreas(data || [])
    } catch (error) {
      console.error("Error loading service areas:", error)
    } finally {
      setLoadingServiceAreas(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">ZIP Code Debug Tool</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Check ZIP Code</CardTitle>
            <CardDescription>Test if a ZIP code is in the service area</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2 mb-4">
              <Input placeholder="Enter ZIP code" value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
              <Button onClick={handleCheck} disabled={loading}>
                {loading ? "Checking..." : "Check"}
              </Button>
            </div>

            {result && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium mb-2">Result:</h3>
                <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(result, null, 2)}</pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Area ZIP Codes</CardTitle>
            <CardDescription>View all ZIP codes in the service area</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={loadServiceAreas} disabled={loadingServiceAreas} className="mb-4">
              {loadingServiceAreas ? "Loading..." : "Load Service Areas"}
            </Button>

            {serviceAreas.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Service Areas ({serviceAreas.length}):</h3>
                <div className="max-h-80 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-2 text-left">ZIP Code</th>
                        <th className="p-2 text-left">City</th>
                        <th className="p-2 text-left">State</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serviceAreas.map((area) => (
                        <tr key={area.zip_code} className="border-b">
                          <td className="p-2">{area.zip_code}</td>
                          <td className="p-2">{area.city}</td>
                          <td className="p-2">{area.state}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
