"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { X, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CATEGORIES } from "@/lib/db"

interface QuickAddFormProps {
  onAdd: (url: string, category: string, title?: string) => Promise<void>
  onClose: () => void
  prefilledUrl?: string
}

export function QuickAddForm({ onAdd, onClose, prefilledUrl }: QuickAddFormProps) {
  const [url, setUrl] = useState(prefilledUrl || "")
  const [title, setTitle] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<"url" | "category">("url")

  useEffect(() => {
    if (prefilledUrl) {
      setStep("category")
    }
  }, [prefilledUrl])

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    setStep("category")
  }

  const handleCategorySelect = async (categoryId: string) => {
    setSelectedCategory(categoryId)
    setIsLoading(true)

    try {
      await onAdd(url.trim(), categoryId, title.trim() || undefined)
      // Form will close via parent component
    } catch (error) {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (step === "category") {
      setStep("url")
    } else {
      onClose()
    }
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white w-full sm:w-96 sm:rounded-lg border-t sm:border border-gray-200 p-6"
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">{step === "url" ? "Add link" : "Choose category"}</h2>
          <Button variant="ghost" size="sm" onClick={handleBack} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {step === "url" && (
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-10 bg-white border-gray-200 rounded-md focus:border-gray-900 focus:ring-0"
                required
                autoFocus
              />
            </div>

            <Input
              type="text"
              placeholder="Optional title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white border-gray-200 rounded-md focus:border-gray-900 focus:ring-0"
            />

            <Button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-md py-2">
              Continue
            </Button>
          </form>
        )}

        {step === "category" && (
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Globe className="h-4 w-4" />
                <span className="truncate">{new URL(url).hostname}</span>
              </div>
              {title && <p className="text-sm font-medium text-gray-900 mt-1 line-clamp-1">{title}</p>}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((category) => (
                <motion.button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategorySelect(category.id)}
                  disabled={isLoading}
                  className="p-3 text-left border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gray-400" />
                    <span className="font-medium text-gray-900">{category.name}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{category.description}</p>
                </motion.button>
              ))}
            </div>

            {isLoading && (
              <div className="text-center py-2">
                <div className="text-sm text-gray-500">Saving...</div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
