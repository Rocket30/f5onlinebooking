"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface SlideshowProps {
  images: string[]
  className?: string
  interval?: number
}

export function Slideshow({ images, className = "", interval = 5000 }: SlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, interval)

    return () => clearInterval(timer)
  }, [images.length, interval])

  if (images.length === 0) return null

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={image || "/placeholder.svg"}
            alt={`Slide ${index + 1}`}
            fill
            className="object-cover"
            priority={index === 0}
          />
        </div>
      ))}
    </div>
  )
}
