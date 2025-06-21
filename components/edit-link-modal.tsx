"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { db, type SavedLink, CATEGORIES } from "@/lib/db"
import { toast } from "sonner"

interface EditLinkModalProps {
  link: SavedLink
  isOpen: boolean
  onClose: () => void
  onUpdate: (updatedLink: SavedLink) => void
}

export function EditLinkModal({ link, isOpen, onClose, onUpdate }: EditLinkModalProps) {
  const [editedTitle, setEditedTitle] = useState(link.title)
  const [editedCategory, setEditedCategory] = useState(link.category)
  const [isSaving, setIsSaving] = useState(false)

  // Sync state when link prop changes
  useEffect(() => {
    setEditedTitle(link.title)
    setEditedCategory(link.category)
  }, [link])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const updatedLink = await db.updateLink(link.id, {
        title: editedTitle,
        category: editedCategory,
      })
      toast.success("Link updated successfully")
      onUpdate(updatedLink)
      onClose()
    } catch (error) {
      console.error("Failed to update link:", error)
      toast.error("Failed to update link")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Edit Link</h2>
              <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Title Input */}
            <div className="mb-4">
              <label htmlFor="title" className="text-sm font-medium text-gray-700 block mb-1">Title</label>
              <Input
                id="title"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full"
                placeholder="Enter a title"
              />
            </div>

            {/* Category Selection */}
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 block mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setEditedCategory(category.id)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                      editedCategory === category.id
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 