"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Trash2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { motion } from "framer-motion"
import type { SavedLink } from "@/lib/db"

interface LinkCardProps {
  link: SavedLink
  onDelete: () => void
}

export function LinkCard({ link, onDelete }: LinkCardProps) {
  const [translateX, setTranslateX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [showDeleteButton, setShowDeleteButton] = useState(false)
  const startXRef = useRef(0)
  const currentXRef = useRef(0)

  const deleteThreshold = 80
  const maxSwipe = 120

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `${days}d`
    if (hours > 0) return `${hours}h`
    if (minutes > 0) return `${minutes}m`
    return "now"
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    startXRef.current = touch.clientX
    currentXRef.current = touch.clientX
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return

    const touch = e.touches[0]
    currentXRef.current = touch.clientX
    const deltaX = startXRef.current - currentXRef.current

    if (deltaX > 0) {
      const newTranslateX = Math.min(deltaX, maxSwipe)
      setTranslateX(newTranslateX)
      setShowDeleteButton(newTranslateX >= deleteThreshold)
    } else if (deltaX < 0 && translateX > 0) {
      const newTranslateX = Math.max(0, translateX + deltaX)
      setTranslateX(newTranslateX)
      setShowDeleteButton(newTranslateX >= deleteThreshold)
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)

    if (translateX >= deleteThreshold) {
      setTranslateX(deleteThreshold)
      setShowDeleteButton(true)
    } else {
      setTranslateX(0)
      setShowDeleteButton(false)
    }
  }

  const handleDelete = () => {
    setTranslateX(0)
    setShowDeleteButton(false)
    onDelete()
  }

  const handleCardClick = () => {
    if (showDeleteButton) {
      setTranslateX(0)
      setShowDeleteButton(false)
    } else if (!isDragging) {
      window.open(link.url, "_blank", "noopener,noreferrer")
    }
  }

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(link.url)
      toast.success("Link copied")
    } catch (error) {
      toast.error("Failed to copy link")
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl w-full">
      {/* Delete background */}
      <div
        className="absolute inset-0 bg-red-500 flex items-center justify-end pr-4 rounded-2xl"
        style={{
          opacity: translateX > 0 ? 1 : 0,
        }}
      >
        {showDeleteButton && (
          <Button onClick={handleDelete} className="bg-white/20 hover:bg-white/30 text-white rounded-full h-8 w-8 p-0">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Main card content */}
      <motion.div
        className="relative bg-white hover:bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md w-full"
        style={{
          transform: `translateX(-${translateX}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleCardClick}
        whileHover={{
          scale: 1.01,
          y: -1,
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      >
        <div className="flex items-center gap-3">
          {/* Favicon - larger and more prominent */}
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
            <img
              src={`https://www.google.com/s2/favicons?domain=${new URL(link.url).hostname}&sz=32`}
              alt=""
              className="w-6 h-6 rounded-md"
              onError={(e) => {
                e.currentTarget.style.display = "none"
              }}
            />
          </div>

          {/* Content with better hierarchy */}
          <div className="flex-1 min-w-0">
            <motion.h3
              className="font-medium text-gray-900 text-sm line-clamp-1 mb-1 hover:underline decoration-gray-300 underline-offset-2"
              whileHover={{ color: "#374151" }}
            >
              {link.title}
            </motion.h3>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500 truncate font-mono">{new URL(link.url).hostname}</span>
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-1 text-gray-400">
                <Clock className="h-2 w-2" />
                <span>{formatTimeAgo(link.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Subtle action indicator */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-1 h-1 bg-gray-300 rounded-full" />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
