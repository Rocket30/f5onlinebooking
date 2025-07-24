"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from "@/lib/supabase"
import { AlertCircle, Plus, Trash2 } from "lucide-react"

export default function ServiceAreaPage() {
  const [zipCodes, setZipCodes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newZipCode, setNewZipCode] = useState("")
  const [newCity, setNewCity] = useState("")
  const [newState, setNewState] = useState("")
  const [addError, setAddError] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchZipCodes()
  }, [])

  async function fetchZipCodes() {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.from("service_area_zip_codes").select("*").order("zip_code")

      if (error) {
        throw new Error(error.message)
      }

      setZipCodes(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while fetching zip codes")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAddZipCode(e: React.FormEvent) {
    e.preventDefault()

    if (!newZipCode || newZipCode.length !== 5 || !/^\d+$/.test(newZipCode)) {
      setAddError("Please enter a valid 5-digit ZIP code")
      return
    }

    if (!newCity) {
      setAddError("Please enter a city")
      return
    }

    if (!newState || newState.length !== 2) {
      setAddError("Please enter a valid 2-letter state code")
      return
    }

    setIsAdding(true)
    setAddError(null)

    try {
      const { data, error } = await supabase
        .from("service_area_zip_codes")
        .insert([
          {
            zip_code: newZipCode,
            city: newCity,
            state: newState.toUpperCase(),
          },
        ])
        .select()

      if (error) {
        if (error.code === "23505") {
          setAddError("This ZIP code is already in your service area")
        } else {
          throw new Error(error.message)
        }
      } else {
        // Reset form
        setNewZipCode("")
        setNewCity("")
        setNewState("")

        // Refresh the list
        fetchZipCodes()
      }
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "An error occurred while adding the ZIP code")
    } finally {
      setIsAdding(false)
    }
  }

  async function handleDeleteZipCode(zipCode: string) {
    setIsDeleting((prev) => ({ ...prev, [zipCode]: true }))

    try {
      const { error } = await supabase.from("service_area_zip_codes").delete().eq("zip_code", zipCode)

      if (error) {
        throw new Error(error.message)
      }

      // Refresh the list
      fetchZipCodes()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while deleting the ZIP code")
    } finally {
      setIsDeleting((prev) => ({ ...prev, [zipCode]: false }))
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Service Area Management</CardTitle>
          <CardDescription>
            Manage the ZIP codes in your service area. Only customers in these ZIP codes will be able to book
            appointments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <form onSubmit={handleAddZipCode} className="space-y-4">
              <h3 className="text-lg font-medium">Add New ZIP Code</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium mb-1">
                    ZIP Code
                  </label>
                  <Input
                    id="zipCode"
                    value={newZipCode}
                    onChange={(e) => setNewZipCode(e.target.value)}
                    maxLength={5}
                    placeholder="e.g. 33602"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium mb-1">
                    City
                  </label>
                  <Input
                    id="city"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="e.g. Tampa"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium mb-1">
                    State
                  </label>
                  <Input
                    id="state"
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    maxLength={2}
                    placeholder="e.g. FL"
                  />
                </div>
              </div>

              {addError && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <p>{addError}</p>
                </div>
              )}

              <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-black" disabled={isAdding}>
                <Plus className="h-4 w-4 mr-2" />
                {isAdding ? "Adding..." : "Add ZIP Code"}
              </Button>
            </form>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Current Service Area</h3>

              {error && <div className="bg-red-50 p-3 rounded-md text-red-500 text-sm mb-4">{error}</div>}

              {isLoading ? (
                <div className="text-center py-4">Loading ZIP codes...</div>
              ) : zipCodes.length === 0 ? (
                <div className="text-center py-4">No ZIP codes in your service area yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ZIP Code</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>State</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {zipCodes.map((zipCode) => (
                        <TableRow key={zipCode.zip_code}>
                          <TableCell className="font-medium">{zipCode.zip_code}</TableCell>
                          <TableCell>{zipCode.city}</TableCell>
                          <TableCell>{zipCode.state}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteZipCode(zipCode.zip_code)}
                              disabled={isDeleting[zipCode.zip_code]}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
