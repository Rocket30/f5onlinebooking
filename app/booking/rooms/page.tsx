"use client"

// Add export const dynamic = "force-dynamic" to prevent static generation
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, ArrowRight, Minus, Plus } from "lucide-react"
import { Slideshow } from "@/components/slideshow"
import { useBooking } from "@/lib/booking-context"

// Sample placeholder images for the slideshow
const placeholderImages = [
  "/placeholder.svg?height=1080&width=1920&text=Clean+Carpets",
  "/placeholder.svg?height=1080&width=1920&text=Fresh+Upholstery",
  "/placeholder.svg?height=1080&width=1920&text=Sparkling+Tiles",
]

// Update the RoomType interface to include the isActive property
interface RoomType {
  id: string
  name: string
  description: string
  icon: string
  specialPrice?: number
  isStandardRoom?: boolean
  isCheckbox?: boolean
  isSquareFootage?: boolean
  minSqFt?: number
  maxSqFt?: number
  pricePerSqFt?: number
}

// Update the roomTypes object to add the square footage estimator and remove prices from Kitchen and Entryway
const roomTypes: Record<string, RoomType[]> = {
  carpet: [
    {
      id: "bedroom",
      name: "Bedroom, Living Room, Or Living Room/Dining Room Combo",
      description: "1st 5 rooms $89",
      icon: "🛏️",
      isStandardRoom: true,
    },
    { id: "hallway", name: "Hallway", description: "Hallway or corridor", icon: "🚪", specialPrice: 15 },
    { id: "stairs", name: "Stairs", description: "Carpeted staircase", icon: "🪜", specialPrice: 45 },
    { id: "area-rug", name: "Area Rug", description: "Area rug cleaning", icon: "🧶", specialPrice: 30 },
    {
      id: "walk-in-closet",
      name: "Walk-in Closet",
      description: "Walk-in closet cleaning",
      icon: "👔",
      specialPrice: 15,
    },
  ],
  upholstery: [
    { id: "sofa", name: "Sofa", description: "Standard 3-seat sofa", icon: "🛋️", specialPrice: 79 },
    { id: "loveseat", name: "Loveseat", description: "2-seat small sofa", icon: "💺", specialPrice: 69 },
    { id: "recliner", name: "Recliner", description: "Armchair or accent chair", icon: "🪑", specialPrice: 49 },
    { id: "dining-chair", name: "Dining chair", description: "Standard dining chair", icon: "🪑", specialPrice: 15 },
    { id: "sectional", name: "Sectional", description: "L-shaped or sectional sofa", icon: "🛋️", specialPrice: 149 },
    { id: "ottoman", name: "Ottoman", description: "Footstool or ottoman", icon: "🪑", specialPrice: 20 },
    { id: "mattress", name: "Mattress", description: "Mattress cleaning", icon: "🛏️", specialPrice: 50 },
    {
      id: "fabric-headboard",
      name: "Fabric Headboard",
      description: "Headboard cleaning",
      icon: "🛏️",
      specialPrice: 50,
    },
    {
      id: "fabric-bed",
      name: "Entire Fabric Bed",
      description: "Headboard, sides and footboard",
      icon: "🛏️",
      specialPrice: 99,
    },
    {
      id: "sofa-chair",
      name: "Sofa Chair",
      description: "Upholstered chair cleaning",
      icon: "🪑",
      specialPrice: 45,
    },
    {
      id: "chaise",
      name: "Chaise",
      description: "Chaise lounge cleaning",
      icon: "🛋️",
      specialPrice: 60,
    },
  ],
  tile: [
    {
      id: "square-footage",
      name: "Estimate square footage and cost",
      description: "Starting rate based on 500 square feet ($0.45 per sq ft)",
      icon: "📏",
      isSquareFootage: true,
      minSqFt: 500,
      maxSqFt: 2000,
      pricePerSqFt: 0.45,
    },
    {
      id: "grout-sealant",
      name: "Grout Sealant",
      description: "Protect your grout with sealant ($0.30 per sq ft)",
      icon: "🛡️",
      isSquareFootage: true,
      minSqFt: 100,
      maxSqFt: 2000,
      pricePerSqFt: 0.3,
    },
    { id: "kitchen", name: "Kitchen", description: "Kitchen floor and backsplash", icon: "🍳", isCheckbox: true },
    { id: "bathroom", name: "Bathroom", description: "Bathroom floor and shower", icon: "🚿" },
    { id: "entryway", name: "Entryway", description: "Foyer or entryway", icon: "🚪", isCheckbox: true },
    { id: "bedroom", name: "Bedroom", description: "Bedroom tile flooring", icon: "🛏️" },
    { id: "living-room", name: "Living Room", description: "Living room tile flooring", icon: "🛋️", isCheckbox: true },
  ],
}

// Add this function to calculate square footage price
const calculateSquareFootagePrice = (sqFt: number, pricePerSqFt: number): number => {
  return sqFt * pricePerSqFt
}

// Additional services that were moved from the services page
const additionalServices = [
  {
    id: "pet-treatment",
    name: "Pet Odor & Stain Treatment",
    description: "Special treatment to remove pet odors and stains from carpets",
    icon: "🐾",
    fixedPrice: 90,
    forService: "carpet",
  },
  {
    id: "carpet-protection",
    name: "Carpet Protection",
    description: "Apply protective coating to extend the life of your carpets",
    icon: "🛡️",
    fixedPrice: 90,
    forService: "carpet",
  },
  {
    id: "upholstery-pet-treatment",
    name: "Pet Odor & Stain Treatment for Upholstery",
    description: "Special treatment to remove pet odors and stains from upholstery",
    icon: "🐾",
    fixedPrice: 60,
    forService: "upholstery",
  },
  {
    id: "upholstery-protection",
    name: "Fabric Protection",
    description: "Apply protective coating to extend the life of your upholstery",
    icon: "🛡️",
    fixedPrice: 60,
    forService: "upholstery",
  },
]

// Service names mapping
const serviceNames = {
  carpet: "Carpet Cleaning",
  upholstery: "Upholstery Cleaning",
  tile: "Tile & Grout Cleaning",
}

export default function RoomsPage() {
  const router = useRouter()
  const { bookingData, updateBookingData, updateRoomCount, updateRoomActive, addService, removeService } = useBooking()

  const [additionalServiceIds, setAdditionalServiceIds] = useState<string[]>([])
  const [error, setError] = useState("")
  const [initialized, setInitialized] = useState(false)

  // Initialize room counts and additional services from booking context
  useEffect(() => {
    if (!initialized) {
      // Initialize additional services
      const additionalServiceIdsFromContext = bookingData.services.filter((id) =>
        additionalServices.some((service) => service.id === id),
      )
      setAdditionalServiceIds(additionalServiceIdsFromContext)

      // Initialize default room counts for newly selected services
      bookingData.services.forEach((serviceId) => {
        if (roomTypes[serviceId]) {
          roomTypes[serviceId].forEach((room) => {
            // Check if this room already exists in the context
            const existingRoom = bookingData.rooms.find((r) => r.serviceId === serviceId && r.roomId === room.id)

            if (!existingRoom) {
              // Set default values for new rooms
              if (room.isStandardRoom) {
                updateRoomCount(serviceId, room.id, 5) // Start with 5 standard rooms
              } else if (room.isSquareFootage) {
                updateRoomCount(serviceId, room.id, room.minSqFt || 500) // Start with minimum square footage
              }
            }
          })
        }
      })

      setInitialized(true)
    }
  }, [bookingData.services, bookingData.rooms, initialized, updateRoomCount])

  // Get room count for a specific room
  const getRoomCount = (serviceId: string, roomId: string): number => {
    const room = bookingData.rooms.find((r) => r.serviceId === serviceId && r.roomId === roomId)
    return room ? room.count : 0
  }

  // Check if a square footage room is active
  const isSquareFootageActive = (serviceId: string, roomId: string): boolean => {
    const room = bookingData.rooms.find((r) => r.serviceId === serviceId && r.roomId === roomId)
    return room ? !!room.isActive : false
  }

  // Handle room count changes
  const handleCountChange = (serviceId: string, roomId: string, change: number) => {
    const currentCount = getRoomCount(serviceId, roomId)

    // Find the room type
    const roomType = roomTypes[serviceId]?.find((room) => room.id === roomId)
    if (!roomType) return

    // Handle square footage limits
    if (roomType.isSquareFootage) {
      const newSqFt = currentCount + change

      // Enforce min/max limits
      if (newSqFt < (roomType.minSqFt || 500)) return
      if (newSqFt > (roomType.maxSqFt || 2000)) return

      updateRoomCount(serviceId, roomId, newSqFt)
      return
    }

    // For standard rooms, don't allow going below 5
    const minCount = roomType.isStandardRoom ? 5 : 0
    const newCount = Math.max(minCount, currentCount + change)

    updateRoomCount(serviceId, roomId, newCount)
  }

  // Handle additional service toggle
  const handleAdditionalServiceToggle = (serviceId: string) => {
    setAdditionalServiceIds((prev) => {
      if (prev.includes(serviceId)) {
        removeService(serviceId)
        return prev.filter((id) => id !== serviceId)
      } else {
        addService(serviceId)
        return [...prev, serviceId]
      }
    })
  }

  // Handle square footage active toggle
  const handleSquareFootageToggle = (serviceId: string, roomId: string) => {
    updateRoomActive(serviceId, roomId, !isSquareFootageActive(serviceId, roomId))
  }

  // Handle continue button
  const handleContinue = () => {
    // Check if any rooms or services are selected
    if (bookingData.rooms.length === 0 && additionalServiceIds.length === 0) {
      setError("Please select at least one room or service")
      return
    }

    // Navigate to schedule page
    router.push("/booking/schedule")
  }

  // Handle add more services button
  const handleAddMoreServices = () => {
    router.push("/booking/services")
  }

  // Get all special priced items for display in the pricing summary
  const getSpecialPricedItems = () => {
    const specialItems = []

    // Debug all rooms
    console.log("DEBUG - All rooms in booking data:", bookingData.rooms)

    // Process each room
    for (const room of bookingData.rooms) {
      // Skip rooms with count 0
      if (room.count === 0) continue

      // Skip standard carpet rooms (handled separately)
      if (room.serviceId === "carpet" && room.roomId === "bedroom") continue

      // Find the room type definition
      const serviceRoomTypes = roomTypes[room.serviceId]
      if (!serviceRoomTypes) continue

      const roomType = serviceRoomTypes.find((r) => r.id === room.roomId)
      if (!roomType) {
        console.log(`DEBUG - Could not find room type for ${room.serviceId}-${room.roomId}`)
        continue
      }

      // Handle different room types
      if (room.serviceId === "carpet" || room.serviceId === "upholstery") {
        // For carpet and upholstery, use the special price
        if (roomType.specialPrice) {
          specialItems.push({
            serviceId: room.serviceId,
            roomId: room.roomId,
            name: roomType.name,
            count: room.count,
            price: roomType.specialPrice,
            total: roomType.specialPrice * room.count,
          })

          // Debug upholstery items specifically
          if (room.serviceId === "upholstery") {
            console.log(
              `DEBUG - Added upholstery item: ${roomType.name}, count: ${room.count}, price: ${roomType.specialPrice}, total: ${roomType.specialPrice * room.count}`,
            )
          }
        }
      } else if (room.serviceId === "tile") {
        // For tile, handle square footage specially
        if ((room.roomId === "square-footage" || room.roomId === "grout-sealant") && room.isActive) {
          const pricePerSqFt = roomType.pricePerSqFt || 0.45
          const total = room.count * pricePerSqFt
          specialItems.push({
            serviceId: room.serviceId,
            roomId: room.roomId,
            name: `${roomType.name} (${room.count} sq ft)`,
            count: 1,
            price: total,
            total: total,
          })
        }
      }
    }

    console.log("DEBUG - Special priced items:", specialItems)
    return specialItems
  }

  // Get fixed price services
  const getFixedPriceServices = () => {
    return additionalServiceIds.map((id) => {
      const service = additionalServices.find((s) => s.id === id)
      return {
        id,
        name: service?.name || id,
        price: service?.fixedPrice || 0,
      }
    })
  }

  // Filter out fixed price services that don't need room selection
  const servicesWithRooms = bookingData.services.filter((id) => roomTypes[id] && roomTypes[id].length > 0)

  // Get additional services for a specific service type
  const getAdditionalServicesForType = (serviceType: string) => {
    return additionalServices.filter((service) => service.forService === serviceType)
  }

  // Determine the appropriate header text based on selected services
  const getHeaderText = () => {
    // If multiple services are selected
    if (bookingData.services.length > 1) {
      return {
        title: "MAKE YOUR SELECTIONS",
        description: "Select options for each of your chosen services",
      }
    }
    // If only upholstery is selected
    else if (
      bookingData.services.includes("upholstery") &&
      !bookingData.services.includes("carpet") &&
      !bookingData.services.includes("tile")
    ) {
      return {
        title: "SELECT UPHOLSTERY SERVICE",
        description: "Tell us which furniture you need cleaned",
      }
    }
    // If only tile is selected
    else if (
      bookingData.services.includes("tile") &&
      !bookingData.services.includes("carpet") &&
      !bookingData.services.includes("upholstery")
    ) {
      return {
        title: "MAKE YOUR SELECTIONS",
        description:
          "Check the box and select your estimated square feet then choose everything that applies to get your estimate",
      }
    }
    // Default case (single service that's not upholstery or tile, or carpet only)
    else {
      return {
        title: "SELECT ROOMS",
        description: "Tell us which rooms need cleaning",
      }
    }
  }

  const headerText = getHeaderText()
  const specialPricedItems = getSpecialPricedItems()
  const fixedPriceServices = getFixedPriceServices()

  return (
    <div className="min-h-screen bg-gray-900 relative">
      <Slideshow images={placeholderImages} className="absolute inset-0 bg-blend-overlay opacity-50" />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <Link href="/booking/services" className="inline-flex items-center text-white mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Services
        </Link>

        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{headerText.title}</CardTitle>
              <CardDescription className="mt-2">{headerText.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {servicesWithRooms.map((serviceId) => {
                  const rooms = roomTypes[serviceId]
                  if (!rooms || rooms.length === 0) return null

                  const serviceName = serviceNames[serviceId] || serviceId

                  return (
                    <div key={serviceId} className="space-y-4">
                      <h3 className="font-bold text-lg">{serviceName}</h3>

                      {/* Update the room rendering section to handle square footage display */}
                      {rooms.map((room) => (
                        <div key={room.id} className="flex items-center justify-between p-4 rounded-lg border">
                          <div>
                            <h4 className="font-medium">
                              {room.name}
                              {room.specialPrice && !room.isSquareFootage && (
                                <span className="text-sm text-yellow-600 ml-2">(${room.specialPrice} each)</span>
                              )}
                            </h4>
                            <p className={`text-gray-500 ${room.isSquareFootage ? "text-[10px]" : "text-sm"}`}>
                              {room.description}
                            </p>
                            {room.isStandardRoom && (
                              <p className="text-xs text-yellow-600 mt-1">First 5 rooms included in base price ($89)</p>
                            )}
                            {room.isSquareFootage && (
                              <p className="text-xs text-yellow-600 mt-1">
                                Current: {getRoomCount(serviceId, room.id) || room.minSqFt} sq ft = $
                                {calculateSquareFootagePrice(
                                  getRoomCount(serviceId, room.id) || room.minSqFt || 500,
                                  room.pricePerSqFt || 0.45,
                                ).toFixed(2)}
                              </p>
                            )}
                          </div>

                          {room.isCheckbox ? (
                            // Render checkbox for Kitchen and Entryway
                            <Checkbox
                              checked={getRoomCount(serviceId, room.id) > 0}
                              onCheckedChange={(checked) => {
                                updateRoomCount(serviceId, room.id, checked ? 1 : 0)
                              }}
                              className="data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                            />
                          ) : room.isSquareFootage ? (
                            // Render checkbox + plus/minus buttons for square footage
                            <div className="flex flex-col items-end">
                              <div className="flex items-center space-x-3">
                                <div className="flex flex-col items-center mr-2">
                                  <Checkbox
                                    checked={isSquareFootageActive(serviceId, room.id)}
                                    onCheckedChange={() => handleSquareFootageToggle(serviceId, room.id)}
                                    className="data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                                  />
                                  <div className="text-xs text-gray-500 mt-1 text-center">
                                    <div>check box to add</div>
                                    <div>estimate</div>
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleCountChange(serviceId, room.id, -100)}
                                  disabled={getRoomCount(serviceId, room.id) <= (room.minSqFt || 500)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-16 text-center">
                                  {getRoomCount(serviceId, room.id) || room.minSqFt} sq ft
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleCountChange(serviceId, room.id, 100)}
                                  disabled={getRoomCount(serviceId, room.id) >= (room.maxSqFt || 2000)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            // Render plus/minus buttons for other rooms
                            <div className="flex items-center space-x-3">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleCountChange(serviceId, room.id, -1)}
                                disabled={
                                  room.isStandardRoom
                                    ? getRoomCount(serviceId, room.id) <= 5
                                    : getRoomCount(serviceId, room.id) <= 0
                                }
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-16 text-center">{getRoomCount(serviceId, room.id) || 0}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleCountChange(serviceId, room.id, 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Additional Services Section for each service type */}
                      {(() => {
                        const serviceAdditionals = getAdditionalServicesForType(serviceId)
                        if (serviceAdditionals.length === 0) return null

                        return (
                          <div className="space-y-4 mt-6">
                            <h3 className="font-bold text-lg">Additional Services</h3>
                            {serviceAdditionals.map((service) => (
                              <div
                                key={service.id}
                                className={`flex items-start space-x-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                                  additionalServiceIds.includes(service.id)
                                    ? "border-yellow-500 bg-yellow-50"
                                    : "border-gray-200 hover:bg-gray-50"
                                }`}
                                onClick={() => handleAdditionalServiceToggle(service.id)}
                              >
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium">
                                      {service.name}
                                      {service.fixedPrice && (
                                        <span className="text-sm text-yellow-600 ml-2">(${service.fixedPrice})</span>
                                      )}
                                    </h4>
                                    <Checkbox
                                      checked={additionalServiceIds.includes(service.id)}
                                      onCheckedChange={() => handleAdditionalServiceToggle(service.id)}
                                      onClick={(e) => e.stopPropagation()}
                                      className="data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                                    />
                                  </div>
                                  <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      })()}
                    </div>
                  )
                })}

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Pricing Summary</h3>
                  <div className="space-y-2">
                    {bookingData.totalRooms > 0 && (
                      <>
                        <div className="flex justify-between">
                          <span>Standard Rooms:</span>
                          <span>{bookingData.totalRooms}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>First 5 rooms:</span>
                          <span>$89</span>
                        </div>
                        {bookingData.totalRooms > 5 && (
                          <div className="flex justify-between">
                            <span>Additional Rooms ({bookingData.totalRooms - 5} × $45):</span>
                            <span>${(bookingData.totalRooms - 5) * 45}</span>
                          </div>
                        )}
                      </>
                    )}

                    {/* Special priced items */}
                    {specialPricedItems.length > 0 && (
                      <>
                        {bookingData.totalRooms > 0 && <div className="border-t pt-2 mt-2"></div>}
                        {specialPricedItems.map((item, index) => (
                          <div key={index} className="flex justify-between">
                            <span>
                              {item.name} ({item.count} × ${item.price}):
                            </span>
                            <span>${item.total.toFixed(2)}</span>
                          </div>
                        ))}
                      </>
                    )}

                    {/* Fixed price services */}
                    {fixedPriceServices.length > 0 && (
                      <>
                        {(bookingData.totalRooms > 0 || specialPricedItems.length > 0) && (
                          <div className="border-t pt-2 mt-2"></div>
                        )}
                        {fixedPriceServices.map((service, index) => (
                          <div key={index} className="flex justify-between">
                            <span>{service.name}:</span>
                            <span>${service.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </>
                    )}

                    <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                      <span>Total Price:</span>
                      <span>${bookingData.price.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {bookingData.services.includes("carpet")
                        ? "We have a minimum charge of $89 for the first 5 rooms. Each additional room costs $45. Stairs are $45 each, hallways are $15 each, walk-in closets are $15 each, and area rugs are $30 each. Pet Odor & Stain Treatment and Carpet Protection are $90 each."
                        : bookingData.services.includes("upholstery")
                          ? "Upholstery services are priced per item. Additional services like Pet Odor & Stain Treatment and Fabric Protection are $60 each."
                          : "Services are priced per item."}
                    </p>
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
                  <Button onClick={handleAddMoreServices} variant="outline" className="order-2 sm:order-1">
                    Add More Services
                  </Button>
                  <Button
                    onClick={handleContinue}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black order-1 sm:order-2"
                  >
                    Continue to Schedule
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

const services = [
  {
    id: "carpet",
    name: "Carpet Cleaning",
    description: "Deep clean your carpets to remove dirt, stains, and allergens",
    icon: "🧹",
  },
  {
    id: "upholstery",
    name: "Upholstery Cleaning",
    description: "Refresh your furniture and remove embedded dirt and odors",
    icon: "🛋️",
  },
  {
    id: "tile",
    name: "Tile & Grout Cleaning",
    description: "Restore the original beauty of your tile floors and surfaces",
    icon: "🧽",
  },
]
