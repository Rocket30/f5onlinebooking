export async function seedInitialData() {
  try {
    console.log("Starting database initialization process...")

    // Use direct SQL queries instead of RPC calls
    const createCustomersTable = `
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
      )
    `

    const createServicesTable = `
      CREATE TABLE IF NOT EXISTS services (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        description TEXT,
        icon VARCHAR(50),
        fixed_price DECIMAL(10, 2),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    const createBookingsTable = `
      CREATE TABLE IF NOT EXISTS bookings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID NOT NULL,
        booking_date DATE NOT NULL,
        booking_time VARCHAR(50) NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        zip_code VARCHAR(20) NOT NULL,
        special_instructions TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    const createBookingServicesTable = `
      CREATE TABLE IF NOT EXISTS booking_services (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        booking_id UUID NOT NULL,
        service_id UUID NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        price DECIMAL(10, 2) NOT NULL
      )
    `

    const createRoomTypesTable = `
      CREATE TABLE IF NOT EXISTS room_types (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        service_id UUID NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        icon VARCHAR(50),
        special_price DECIMAL(10, 2),
        is_standard_room BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    const createBookingRoomsTable = `
      CREATE TABLE IF NOT EXISTS booking_rooms (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        booking_id UUID NOT NULL,
        room_type VARCHAR(100) NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        price DECIMAL(10, 2) NOT NULL
      )
    `

    const createZipCodesTable = `
      CREATE TABLE IF NOT EXISTS service_area_zip_codes (
        zip_code VARCHAR(20) PRIMARY KEY,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    // Execute each SQL query directly
    console.log("Creating customers table...")
    await supabase.rpc("exec_sql", { sql: createCustomersTable })

    console.log("Creating services table...")
    await supabase.rpc("exec_sql", { sql: createServicesTable })

    console.log("Creating bookings table...")
    await supabase.rpc("exec_sql", { sql: createBookingsTable })

    console.log("Creating booking_services table...")
    await supabase.rpc("exec_sql", { sql: createBookingServicesTable })

    console.log("Creating room_types table...")
    await supabase.rpc("exec_sql", { sql: createRoomTypesTable })

    console.log("Creating booking_rooms table...")
    await supabase.rpc("exec_sql", { sql: createBookingRoomsTable })

    console.log("Creating service_area_zip_codes table...")
    await supabase.rpc("exec_sql", { sql: createZipCodesTable })

    // Now check if services already exist
    const { data: existingServices, error: checkError } = await supabase.from("services").select("id").limit(1)

    if (checkError) {
      throw new Error(`Error checking existing data: ${checkError.message}`)
    }

    // If services already exist, don't seed again
    if (existingServices && existingServices.length > 0) {
      return { success: true, message: "Data already seeded" }
    }

    // The rest of the function remains the same...
    // 1. Insert services
    console.log("Seeding services data...")
    const { data: services, error: servicesError } = await supabase
      .from("services")
      .insert([
        {
          name: "Carpet Cleaning",
          description: "Deep clean your carpets to remove dirt, stains, and allergens",
          icon: "🧹",
          fixed_price: null,
        },
        {
          name: "Pet Odor & Stain Treatment",
          description: "Special treatment to remove pet odors and stains from carpets",
          icon: "🐾",
          fixed_price: 90,
        },
        {
          name: "Carpet Protection",
          description: "Apply protective coating to extend the life of your carpets",
          icon: "🛡️",
          fixed_price: 90,
        },
        {
          name: "Upholstery Cleaning",
          description: "Refresh your furniture and remove embedded dirt and odors",
          icon: "🛋️",
          fixed_price: null,
        },
        {
          name: "Tile & Grout Cleaning",
          description: "Restore the original beauty of your tile floors and surfaces",
          icon: "🧽",
          fixed_price: null,
        },
      ])
      .select("id, name")

    if (servicesError) {
      throw new Error(`Error seeding services: ${servicesError.message}`)
    }

    // Map service names to IDs
    const serviceMap = services.reduce(
      (acc, service) => {
        acc[service.name] = service.id
        return acc
      },
      {} as Record<string, string>,
    )

    // 2. Insert room types
    console.log("Seeding room types data...")
    const roomTypes = [
      // Carpet Cleaning rooms
      {
        service_id: serviceMap["Carpet Cleaning"],
        name: "Bedroom, Living Room, Or Living Room/Dining Room Combo",
        description: "1st 5 rooms $89",
        icon: "🛏️",
        is_standard_room: true,
      },
      {
        service_id: serviceMap["Carpet Cleaning"],
        name: "Hallway",
        description: "Hallway or corridor",
        icon: "🚪",
        special_price: 15,
      },
      {
        service_id: serviceMap["Carpet Cleaning"],
        name: "Stairs",
        description: "Carpeted staircase",
        icon: "🪜",
        special_price: 45,
      },
      {
        service_id: serviceMap["Carpet Cleaning"],
        name: "Area Rug",
        description: "Area rug cleaning",
        icon: "🧶",
        special_price: 30,
      },
      // Upholstery Cleaning rooms
      {
        service_id: serviceMap["Upholstery Cleaning"],
        name: "Sofa",
        description: "Standard 3-seat sofa",
        icon: "🛋️",
        special_price: 79,
      },
      {
        service_id: serviceMap["Upholstery Cleaning"],
        name: "Loveseat",
        description: "2-seat small sofa",
        icon: "💺",
        special_price: 69,
      },
      {
        service_id: serviceMap["Upholstery Cleaning"],
        name: "Chair",
        description: "Armchair or accent chair",
        icon: "🪑",
        special_price: 49,
      },
      {
        service_id: serviceMap["Upholstery Cleaning"],
        name: "Sectional",
        description: "L-shaped or sectional sofa",
        icon: "🛋️",
        special_price: 149,
      },
      {
        service_id: serviceMap["Upholstery Cleaning"],
        name: "Ottoman",
        description: "Footstool or ottoman",
        icon: "🪑",
        special_price: 20,
      },
      // Tile & Grout Cleaning rooms
      {
        service_id: serviceMap["Tile & Grout Cleaning"],
        name: "Kitchen",
        description: "Kitchen floor and backsplash",
        icon: "🍳",
      },
      {
        service_id: serviceMap["Tile & Grout Cleaning"],
        name: "Bathroom",
        description: "Bathroom floor and shower",
        icon: "🚿",
      },
      {
        service_id: serviceMap["Tile & Grout Cleaning"],
        name: "Entryway",
        description: "Foyer or entryway",
        icon: "🚪",
      },
    ]

    const { error: roomTypesError } = await supabase.from("room_types").insert(roomTypes)

    if (roomTypesError) {
      throw new Error(`Error seeding room types: ${roomTypesError.message}`)
    }

    // 3. Insert service area zip codes
    console.log("Seeding service area zip codes data...")
    const serviceAreaZipCodes = [
      { zip_code: "33601", city: "Tampa", state: "FL" },
      { zip_code: "33602", city: "Tampa", state: "FL" },
      { zip_code: "33603", city: "Tampa", state: "FL" },
      { zip_code: "33604", city: "Tampa", state: "FL" },
      { zip_code: "33605", city: "Tampa", state: "FL" },
      { zip_code: "33606", city: "Tampa", state: "FL" },
      { zip_code: "33607", city: "Tampa", state: "FL" },
      { zip_code: "33609", city: "Tampa", state: "FL" },
      { zip_code: "33610", city: "Tampa", state: "FL" },
      { zip_code: "33611", city: "Tampa", state: "FL" },
      { zip_code: "33612", city: "Tampa", state: "FL" },
      { zip_code: "33613", city: "Tampa", state: "FL" },
      { zip_code: "33614", city: "Tampa", state: "FL" },
      { zip_code: "33615", city: "Tampa", state: "FL" },
      { zip_code: "33616", city: "Tampa", state: "FL" },
      { zip_code: "33617", city: "Tampa", state: "FL" },
      { zip_code: "33618", city: "Tampa", state: "FL" },
      { zip_code: "33619", city: "Tampa", state: "FL" },
      { zip_code: "33620", city: "Tampa", state: "FL" },
      { zip_code: "33621", city: "Tampa", state: "FL" },
      { zip_code: "33624", city: "Tampa", state: "FL" },
      { zip_code: "33625", city: "Tampa", state: "FL" },
      { zip_code: "33626", city: "Tampa", state: "FL" },
      { zip_code: "33629", city: "Tampa", state: "FL" },
      { zip_code: "33634", city: "Tampa", state: "FL" },
      { zip_code: "33635", city: "Tampa", state: "FL" },
      { zip_code: "33637", city: "Tampa", state: "FL" },
      { zip_code: "33647", city: "Tampa", state: "FL" },
      // Add more zip codes as needed
    ]

    const { error: zipCodesError } = await supabase.from("service_area_zip_codes").insert(serviceAreaZipCodes)

    if (zipCodesError) {
      throw new Error(`Error seeding service area zip codes: ${zipCodesError.message}`)
    }

    return { success: true, message: "Database initialized and data seeded successfully" }
  } catch (error) {
    console.error("Error seeding data:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
      details: "Please check your Supabase connection settings and ensure your database exists and is accessible.",
    }
  }
}
