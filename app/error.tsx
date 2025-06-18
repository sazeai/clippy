"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("App error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-medium text-gray-900 mb-2">Something went wrong!</h2>
        <p className="text-sm text-gray-500 mb-4">Don't worry, your links are safe.</p>
        <Button onClick={reset} className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg px-4 py-2">
          Try again
        </Button>
      </div>
    </div>
  )
}
