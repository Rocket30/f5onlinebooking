import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="container mx-auto py-10 flex justify-center items-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
        <p className="text-gray-500 font-medium">Loading calendar...</p>
      </div>
    </div>
  )
}
