import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Phone, MapPin, Clock } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0">
          <Image
            src="/images/f5-commercial-building.jpg"
            alt="F5 Carpet Cleaning Commercial Building"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">F5 CARPET CLEANING</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Professional carpet, upholstery, and tile cleaning services in Tampa Bay
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/booking">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg">
                BOOK NOW
              </Button>
            </Link>
            <Link href="tel:813-562-6516">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg bg-transparent"
              >
                CALL (813) 562-6516
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose F5 Section */}
      <section className="py-20 bg-gray-800 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose F5 Carpet Cleaning</h2>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="bg-gray-700 border-gray-600">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-bold mb-4 text-white">Premium Carpet Cleaning Services</h3>
                <p className="text-gray-300">
                  F5 Carpet Cleaning specializes in deep cleaning, stain removal, and odor elimination.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-700 border-gray-600">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-bold mb-4 text-white">Deep Carpet Cleaning</h3>
                <p className="text-gray-300">We deep clean down to the padding to remove deep dirt.</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-700 border-gray-600">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-bold mb-4 text-white">The Happy Client Club</h3>
                <p className="text-gray-300">
                  Join our hundreds of satisfied customers who trust us with their homes and businesses.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Ready to Book Section */}
          <div className="text-center">
            <h3 className="text-3xl font-bold mb-4">Ready to Book?</h3>
            <p className="text-xl mb-8 text-gray-300">Schedule Your Deep Cleaning Services Today.</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/booking">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg">
                  Book Now
                </Button>
              </Link>
              <Link href="https://f5carpetcleaning.com" target="_blank">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
                  Main Site
                </Button>
              </Link>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold mb-2">813-562-6516</div>
              <p className="text-gray-400">If you need assistance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16">Contact Us</h2>

            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <Phone className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Phone</h3>
                <p className="text-gray-600">(813) 562-6516</p>
              </div>

              <div className="flex flex-col items-center">
                <MapPin className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Service Area</h3>
                <p className="text-gray-600">Tampa Bay Area</p>
              </div>

              <div className="flex flex-col items-center">
                <Clock className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Hours</h3>
                <p className="text-gray-600">Mon-Sat: 8AM-6PM</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">F5 Carpet Cleaning</h3>
              <p className="text-gray-400">
                Professional carpet, upholstery, and tile cleaning services in the Tampa Bay area.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/booking" className="text-gray-400 hover:text-white">
                    Book Appointment
                  </Link>
                </li>
                <li>
                  <Link href="/booking/history" className="text-gray-400 hover:text-white">
                    Booking History
                  </Link>
                </li>
                <li>
                  <Link href="/booking/manage" className="text-gray-400 hover:text-white">
                    Manage Booking
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <p className="text-gray-400 mb-2">Phone: (813) 562-6516</p>
              <p className="text-gray-400">Service Area: Tampa Bay, FL</p>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">© 2024 F5 Carpet Cleaning. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
