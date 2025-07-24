"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut, Home, Users, Calendar, Database, Code } from "lucide-react"

export default function AdminLayoutClient({ children }) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (path) => {
    return pathname === path
  }

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: <Home className="h-5 w-5" /> },
    { name: "Calendar", href: "/admin/calendar", icon: <Calendar className="h-5 w-5" /> },
    { name: "Service Area", href: "/admin/service-area", icon: <Users className="h-5 w-5" /> },
    { name: "SQL Setup", href: "/admin/sql-setup", icon: <Database className="h-5 w-5" /> },
    { name: "Seed Data", href: "/admin/seed", icon: <Code className="h-5 w-5" /> },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top navigation */}
      <nav className="bg-gray-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/admin" className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
              </Link>
            </div>

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive(item.href) ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/admin/fix-booking"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive("/admin/fix-booking")
                    ? "bg-gray-800 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                Fix Booking Dates
              </Link>
              <Link
                href="/admin/logout"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                <LogOut className="h-5 w-5" />
              </Link>
              <Link
                href="/"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                View Site
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  className={`${isMobileMenuOpen ? "hidden" : "block"} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg
                  className={`${isMobileMenuOpen ? "block" : "hidden"} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`${isMobileMenuOpen ? "block" : "hidden"} md:hidden`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(item.href) ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <div className="flex items-center">
                  {item.icon}
                  <span className="ml-2">{item.name}</span>
                </div>
              </Link>
            ))}
            <Link
              href="/admin/fix-booking"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <span className="ml-2">Fix Booking Dates</span>
            </Link>
            <Link
              href="/admin/logout"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <div className="flex items-center">
                <LogOut className="h-5 w-5" />
                <span className="ml-2">Logout</span>
              </div>
            </Link>
            <Link
              href="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <span className="ml-2">View Site</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="py-6">{children}</main>
    </div>
  )
}
