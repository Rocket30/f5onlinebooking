"use server"

import { supabase } from "@/lib/supabase"
import type { RoomType } from "@/lib/supabase"

export async function getServices() {
  try {
    const { data: services, error: servicesError } = await supabase.from("services").select("*").order("name")

    if (servicesError) {
      throw new Error(`Error fetching services: ${servicesError.message}`)
    }

    const { data: roomTypes, error: roomTypesError } = await supabase.from("room_types").select("*").order("name")

    if (roomTypesError) {
      throw new Error(`Error fetching room types: ${roomTypesError.message}`)
    }

    // Group room types by service_id
    const roomTypesByService = roomTypes.reduce(
      (acc, room) => {
        const serviceId = room.service_id
        if (!acc[serviceId]) {
          acc[serviceId] = []
        }
        acc[serviceId].push(room)
        return acc
      },
      {} as Record<string, RoomType[]>,
    )

    return {
      services,
      roomTypesByService,
    }
  } catch (error) {
    console.error("Error fetching services:", error)
    return {
      services: [],
      roomTypesByService: {},
    }
  }
}
