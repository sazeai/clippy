"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CATEGORIES } from "@/lib/db"

interface AddLinkFormProps {
  onAdd: (url: string, category: string, title?: string) => Promise<void>
  onClose: () => void
}

export function AddLinkForm({ onAdd, onClose }: AddLinkFormProps) {
  const [url, setUrl] = useState("")
  const [title, setTitle] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim() || !selectedCategory) return

    setIsLoading(true)
    try {
      await onAdd(url.trim(), selectedCategory, title.trim() || undefined)
      setUrl("")
      setTitle("")
      setSelectedCategory("")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-lg p-6 w-full max-w-md border border-gray-200"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">Add link</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="rounded-lg border-gray-200 focus:border-indigo-300 focus:ring-0"
              required
              autoFocus
            />
          </div>

          <div>
            <Input
              type="text"
              placeholder="Optional title (auto-fetched if empty)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-lg border-gray-200 focus:border-indigo-300 focus:ring-0"
            />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Category</p>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    selectedCategory === category.id
                      ? "border-indigo-200 bg-indigo-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-lg mb-1">{category.emoji}</div>
                  <div className="text-xs font-medium text-gray-700">{category.name}</div>
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={!url.trim() || !selectedCategory || isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2"
          >
            {isLoading ? "Adding..." : "Add link"}
          </Button>
        </form>
      </motion.div>
    </motion.div>
  )
}
