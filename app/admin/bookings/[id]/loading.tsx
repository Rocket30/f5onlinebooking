import { Card, CardContent } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardContent className="p-8 text-center">
          <p>Loading booking details...</p>
        </CardContent>
      </Card>
    </div>
  )
}
