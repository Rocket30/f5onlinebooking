import type React from "react"
import AdminLayoutClient from "./AdminLayoutClient"

export const metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for managing the application.",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminLayoutClient children={children} />
}
