"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export type RoomSelection = {
  serviceId: string
  roomId: string
  count: number
  isActive?: boolean
}

export type PropertyType = "house" | "apartment" | null
export type FloorLevel = "1st" | "2nd" | null

export type BookingData = {
  zipCode: string
  services: string[]
  rooms: RoomSelection[]
  date?: string
  time?: string
  price: number
  totalRooms: number
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  address?: string
  unitNumber?: string
  city?: string
  state?: string
  propertyType?: PropertyType
  floors?: number
  floorLevel?: FloorLevel
  specialInstructions?: string
}

type BookingContextType = {
  bookingData: BookingData
  updateBookingData: (data: Partial<BookingData>) => void
  updateRoomCount: (serviceId: string, roomId: string, count: number) => void
  updateRoomActive: (serviceId: string, roomId: string, isActive: boolean) => void
  addService: (serviceId: string) => void
  removeService: (serviceId: string) => void
  resetBooking: () => void
  calculatePrice: () => number
}

const initialBookingData: BookingData = {
  zipCode: "",
  services: [],
  rooms: [],
  price: 0,
  totalRooms: 0,
  propertyType: null,
  floors: 1,
  floorLevel: null,
}

const BookingContext = createContext<BookingContextType | undefined>(undefined)

const roomTypes = {
  carpet: {
    bedroom: { name: "Bedroom/Living Room", basePrice: true, specialPrice: 45 },
    hallway: { name: "Hallway", specialPrice: 15 },
    stairs: { name: "Stairs", specialPrice: 45 },
    "area-rug": { name: "Area Rug", specialPrice: 30 },
    "walk-in-closet": { name: "Walk-in Closet", specialPrice: 15 },
  },
  upholstery: {
    sofa: { name: "Sofa", specialPrice: 79 },
    loveseat: { name: "Loveseat", specialPrice: 69 },
    recliner: { name: "Recliner", specialPrice: 49 },
    "dining-chair": { name: "Dining Chair", specialPrice: 15 },
    sectional: { name: "Sectional", specialPrice: 149 },
    ottoman: { name: "Ottoman", specialPrice: 20 },
    mattress: { name: "Mattress", specialPrice: 50 },
    "fabric-headboard": { name: "Fabric Headboard", specialPrice: 50 },
    "fabric-bed": { name: "Entire Fabric Bed", specialPrice: 99 },
    "sofa-chair": { name: "Sofa Chair", specialPrice: 45 },
    chaise: { name: "Chaise", specialPrice: 60 },
  },
  tile: {
    "square-footage": { name: "Square Footage", pricePerSqFt: 0.45 },
    "grout-sealant": { name: "Grout Sealant", pricePerSqFt: 0.3 },
    kitchen: { name: "Kitchen", isCheckbox: true },
    bathroom: { name: "Bathroom" },
    entryway: { name: "Entryway", isCheckbox: true },
    bedroom: { name: "Bedroom" },
    "living-room": { name: "Living Room", isCheckbox: true },
  },
}

const additionalServices = {
  "pet-treatment": { name: "Pet Odor & Stain Treatment", fixedPrice: 90 },
  "carpet-protection": { name: "Carpet Protection", fixedPrice: 90 },
  "upholstery-pet-treatment": { name: "Pet Odor & Stain Treatment for Upholstery", fixedPrice: 60 },
  "upholstery-protection": { name: "Fabric Protection", fixedPrice: 60 },
}

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookingData, setBookingData] = useState<BookingData>(initialBookingData)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem("bookingData")
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData)
          setBookingData(parsedData)
        } catch (error) {
          console.error("Error parsing saved booking data:", error)
        }
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("bookingData", JSON.stringify(bookingData))
    }
  }, [bookingData])

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData((prev) => {
      const newData = { ...prev, ...data }
      return newData
    })
  }

  const updateRoomCount = (serviceId: string, roomId: string, count: number) => {
    setBookingData((prev) => {
      const existingRoomIndex = prev.rooms.findIndex((room) => room.serviceId === serviceId && room.roomId === roomId)
      const newRooms = [...prev.rooms]

      if (existingRoomIndex >= 0) {
        newRooms[existingRoomIndex] = {
          ...newRooms[existingRoomIndex],
          count,
        }
      } else {
        newRooms.push({
          serviceId,
          roomId,
          count,
          isActive: roomId === "square-footage" || roomId === "grout-sealant" ? false : true,
        })
      }

      const filteredRooms = newRooms.filter((room) => room.count > 0)
      const newPrice = calculatePrice(prev.services, filteredRooms)

      const standardRooms = filteredRooms.reduce((total, room) => {
        if (room.serviceId === "carpet" && roomTypes.carpet[room.roomId]?.basePrice) {
          return total + room.count
        }
        return total
      }, 0)

      return {
        ...prev,
        rooms: filteredRooms,
        price: newPrice,
        totalRooms: standardRooms,
      }
    })
  }

  const updateRoomActive = (serviceId: string, roomId: string, isActive: boolean) => {
    setBookingData((prev) => {
      const newRooms = prev.rooms.map((room) => {
        if (room.serviceId === serviceId && room.roomId === roomId) {
          return { ...room, isActive }
        }
        return room
      })

      const newPrice = calculatePrice(prev.services, newRooms)

      return {
        ...prev,
        rooms: newRooms,
        price: newPrice,
      }
    })
  }

  const addService = (serviceId: string) => {
    setBookingData((prev) => {
      if (prev.services.includes(serviceId)) {
        return prev
      }

      const newServices = [...prev.services, serviceId]
      const newPrice = calculatePrice(newServices, prev.rooms)

      return {
        ...prev,
        services: newServices,
        price: newPrice,
      }
    })
  }

  const removeService = (serviceId: string) => {
    setBookingData((prev) => {
      const newServices = prev.services.filter((id) => id !== serviceId)
      const newRooms = prev.rooms.filter((room) => room.serviceId !== serviceId)
      const newPrice = calculatePrice(newServices, newRooms)

      const standardRooms = newRooms.reduce((total, room) => {
        if (room.serviceId === "carpet" && roomTypes.carpet[room.roomId]?.basePrice) {
          return total + room.count
        }
        return total
      }, 0)

      return {
        ...prev,
        services: newServices,
        rooms: newRooms,
        price: newPrice,
        totalRooms: standardRooms,
      }
    })
  }

  const resetBooking = () => {
    setBookingData({ ...initialBookingData })
    if (typeof window !== "undefined") {
      localStorage.removeItem("bookingData")
    }
  }

  const calculatePrice = (services: string[] = bookingData.services, rooms: RoomSelection[] = bookingData.rooms) => {
    let totalPrice = 0

    const isCarpetSelected = services.includes("carpet")

    if (isCarpetSelected) {
      const standardRoomCount = rooms.reduce((count, room) => {
        if (room.serviceId === "carpet" && roomTypes.carpet[room.roomId]?.basePrice) {
          return count + room.count
        }
        return count
      }, 0)

      if (standardRoomCount > 0) {
        totalPrice += 89
        if (standardRoomCount > 5) {
          totalPrice += (standardRoomCount - 5) * 45
        }
      }
    }

    rooms.forEach((room) => {
      if (room.serviceId === "carpet" && roomTypes.carpet[room.roomId]?.basePrice) {
        return
      }

      if (room.serviceId === "carpet" && roomTypes.carpet[room.roomId]?.specialPrice) {
        totalPrice += roomTypes.carpet[room.roomId].specialPrice * room.count
      }

      if (room.serviceId === "upholstery" && roomTypes.upholstery[room.roomId]?.specialPrice) {
        totalPrice += roomTypes.upholstery[room.roomId].specialPrice * room.count
      }

      if (
        room.serviceId === "tile" &&
        (room.roomId === "square-footage" || room.roomId === "grout-sealant") &&
        room.isActive
      ) {
        const pricePerSqFt = roomTypes.tile[room.roomId].pricePerSqFt || 0.45
        totalPrice += room.count * pricePerSqFt
      }
    })

    services.forEach((serviceId) => {
      if (additionalServices[serviceId]?.fixedPrice) {
        totalPrice += additionalServices[serviceId].fixedPrice
      }
    })

    return totalPrice
  }

  return (
    <BookingContext.Provider
      value={{
        bookingData,
        updateBookingData,
        updateRoomCount,
        updateRoomActive,
        addService,
        removeService,
        resetBooking,
        calculatePrice: () => calculatePrice(),
      }}
    >
      {children}
    </BookingContext.Provider>
  )
}

export const useBooking = () => {
  const context = useContext(BookingContext)
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider")
  }
  return context
}

export const useBookingContext = () => {
  const context = useContext(BookingContext)
  if (!context) {
    throw new Error("useBookingContext must be used within a BookingProvider")
  }
  return context
}
