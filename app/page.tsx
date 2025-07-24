import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Phone, MapPin, Clock, Star } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/f5-commercial-building.jpg"
            alt="F5 Carpet Cleaning Van and Commercial Building"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">Professional Carpet Cleaning Services</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Deep cleaning, stain removal, and odor elimination for your home and business
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/booking">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg">
                Book Now
              </Button>
            </Link>
            <Link href="tel:813-562-6516">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg bg-transparent"
              >
                Call (813) 562-6516
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
                <h3 className="text-2xl font-bold mb-4 text-white">Premium Carpet Cleaning Services</h3>
                <p className="text-gray-300">
                  F5 Carpet Cleaning specializes in deep cleaning, stain removal, and odor elimination.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-700 border-gray-600">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4 text-white">Deep Carpet Cleaning</h3>
                <p className="text-gray-300">We deep clean down to the padding to remove deep dirt.</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-700 border-gray-600">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4 text-white">The Happy Client Club</h3>
                <p className="text-gray-300">
                  Join our hundreds of satisfied customers who trust us with their homes and businesses.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Ready to Book Section */}
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Book?</h2>
            <p className="text-xl mb-8">Schedule Your Deep Cleaning Services Today.</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/booking">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg">
                  Book Now
                </Button>
              </Link>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
                Main Site
              </Button>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold mb-2">813-562-6516</div>
              <p className="text-gray-300">If you need assistance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">What Our Customers Say</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-8">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "F5 Carpet Cleaning did an amazing job on our carpets. They look brand new!"
                </p>
                <p className="font-semibold">- Sarah M.</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"Professional service and great results. Highly recommend F5!"</p>
                <p className="font-semibold">- Mike R.</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"Fast, efficient, and affordable. Will definitely use them again."</p>
                <p className="font-semibold">- Jennifer L.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-8">Contact F5 Carpet Cleaning</h2>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="flex flex-col items-center">
              <Phone className="w-12 h-12 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Phone</h3>
              <p>(813) 562-6516</p>
            </div>

            <div className="flex flex-col items-center">
              <MapPin className="w-12 h-12 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Service Area</h3>
              <p>Tampa Bay Area, FL</p>
            </div>

            <div className="flex flex-col items-center">
              <Clock className="w-12 h-12 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Hours</h3>
              <p>Mon-Sat: 8AM-6PM</p>
            </div>
          </div>

          <Link href="/booking">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg">
              Schedule Your Cleaning Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
