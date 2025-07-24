"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

// Types for booking data
export interface BookingService {
  id: string
  name: string
  price: number
  quantity: number
}

export interface BookingRoom {
  id: string
  name: string
  price: number
  quantity: number
}

export interface BookingData {
  zipCode: string
  services: BookingService[]
  rooms: BookingRoom[]
  selectedDate: string
  selectedTime: string
  customerInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    unitNumber?: string
  }
  specialInstructions: string
  totalPrice: number
}

interface BookingContextType {
  bookingData: BookingData
  updateBookingData: (data: Partial<BookingData>) => void
  resetBooking: () => void
  addService: (service: BookingService) => void
  removeService: (serviceId: string) => void
  addRoom: (room: BookingRoom) => void
  removeRoom: (roomId: string) => void
  calculateTotal: () => number
}

const initialBookingData: BookingData = {
  zipCode: "",
  services: [],
  rooms: [],
  selectedDate: "",
  selectedTime: "",
  customerInfo: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    unitNumber: "",
  },
  specialInstructions: "",
  totalPrice: 0,
}

const BookingContext = createContext<BookingContextType | undefined>(undefined)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookingData, setBookingData] = useState<BookingData>(initialBookingData)

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData((prev) => ({ ...prev, ...data }))
  }

  const resetBooking = () => {
    setBookingData(initialBookingData)
  }

  const addService = (service: BookingService) => {
    setBookingData((prev) => ({
      ...prev,
      services: [...prev.services.filter((s) => s.id !== service.id), service],
    }))
  }

  const removeService = (serviceId: string) => {
    setBookingData((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.id !== serviceId),
    }))
  }

  const addRoom = (room: BookingRoom) => {
    setBookingData((prev) => ({
      ...prev,
      rooms: [...prev.rooms.filter((r) => r.id !== room.id), room],
    }))
  }

  const removeRoom = (roomId: string) => {
    setBookingData((prev) => ({
      ...prev,
      rooms: prev.rooms.filter((r) => r.id !== roomId),
    }))
  }

  const calculateTotal = () => {
    const servicesTotal = bookingData.services.reduce((sum, service) => sum + service.price * service.quantity, 0)
    const roomsTotal = bookingData.rooms.reduce((sum, room) => sum + room.price * room.quantity, 0)
    return servicesTotal + roomsTotal
  }

  return (
    <BookingContext.Provider
      value={{
        bookingData,
        updateBookingData,
        resetBooking,
        addService,
        removeService,
        addRoom,
        removeRoom,
        calculateTotal,
      }}
    >
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  const context = useContext(BookingContext)
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider")
  }
  return context
}

// Export useBookingContext as an alias for backward compatibility
export const useBookingContext = useBooking
