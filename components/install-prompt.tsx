"use client"

import { useState, useEffect } from "react"
import { X, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)

      // Show prompt after 2 seconds
      setTimeout(() => {
        setShowPrompt(true)
      }, 2000)
    }

    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setShowPrompt(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDeferredPrompt(null)
  }

  if (!showPrompt || !deferredPrompt) return null

  return (
    <div className="fixed bottom-6 left-4 right-4 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-gray-900 text-white rounded-2xl p-4 shadow-xl max-w-sm mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
            <Download className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">Install Clippy</p>
            <p className="text-xs text-gray-300 mt-0.5">Quick access from home screen</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleInstall}
              className="bg-white text-gray-900 hover:bg-gray-100 text-xs px-3 py-1.5 h-auto rounded-lg"
            >
              Install
            </Button>
            <Button
              onClick={handleDismiss}
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-white/10 h-6 w-6 p-0 rounded-lg"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
