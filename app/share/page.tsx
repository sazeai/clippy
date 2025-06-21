"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Globe, Check } from "lucide-react"
import { db, CATEGORIES } from "@/lib/db"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export default function SharePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sharedUrl, setSharedUrl] = useState<string | null>(null)
  const [sharedTitle, setSharedTitle] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [savedCategory, setSavedCategory] = useState<string | null>(null)
  const [showViewLinks, setShowViewLinks] = useState(false)

  useEffect(() => {
    const url = searchParams.get("url")
    const title = searchParams.get("title")
    const text = searchParams.get("text")

    let linkUrl = url
    let linkTitle = title || ""

    // If no direct URL, try to extract from text
    if (!linkUrl && text) {
      const urlMatch = text.match(/(https?:\/\/[^\s]+)/i)
      if (urlMatch) {
        linkUrl = urlMatch[0]
      }
    }

    if (linkUrl) {
      setSharedUrl(linkUrl)
      setSharedTitle(linkTitle)
    } else {
      toast.error("No valid URL found")
      router.push("/")
    }
  }, [searchParams, router])

  const handleCategorySelect = async (categoryId: string) => {
    if (!sharedUrl || isLoading) return

    setIsLoading(true)
    try {
      await db.addLink(sharedUrl, categoryId, sharedTitle)
      setSavedCategory(categoryId)
      toast.success(`Saved to ${CATEGORIES.find((c) => c.id === categoryId)?.name} ✅`)
      setShowViewLinks(true)
      // Auto-close after 1.5s if not viewing links
      setTimeout(() => {
        if (!showViewLinks) router.push("/")
      }, 1500)
    } catch (error) {
      console.error("Failed to save shared link:", error)
      toast.error("Failed to save link")
      setIsLoading(false)
    }
  }

  // Auto-save to Inbox if user doesn't select a tag within 2 seconds
  useEffect(() => {
    if (sharedUrl && !savedCategory) {
      const timeout = setTimeout(() => {
        if (!savedCategory) handleCategorySelect("inbox")
      }, 7000)
      return () => clearTimeout(timeout)
    }
  }, [sharedUrl, savedCategory])

  if (!sharedUrl) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Processing shared link...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-lg font-medium text-gray-900">Save to Clippy</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-8">
        {/* Link Preview */}
        <div className="bg-white border border-gray-200 rounded-md p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-50 rounded-md flex items-center justify-center flex-shrink-0">
              <Globe className="h-4 w-4 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{sharedTitle || (sharedUrl ? new URL(sharedUrl).hostname : "")}</p>
              <p className="text-xs text-gray-500 truncate">{sharedUrl}</p>
            </div>
          </div>
        </div>

        {/* Category Selection */}
        {!savedCategory ? (
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-gray-900">Choose a category:</h2>
            <div className="space-y-2">
              {CATEGORIES.map((category) => (
                <motion.button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  disabled={isLoading}
                  className="w-full p-3 text-left bg-white border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-gray-400" />
                    <div>
                      <span className="font-medium text-gray-900">{category.name}</span>
                      <p className="text-xs text-gray-500 mt-0.5">{category.description}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {isLoading && (
              <div className="text-center py-4">
                <div className="text-sm text-gray-500">Saving...</div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Saved!</h2>
            <p className="text-sm text-gray-500">
              Link saved to {CATEGORIES.find((c) => c.id === savedCategory)?.name}
            </p>
            <p className="text-xs text-gray-400 mt-2">{showViewLinks ? <Button onClick={() => router.push("/")}>View all links</Button> : "Redirecting..."}</p>
          </div>
        )}
      </main>
    </div>
  )
}
