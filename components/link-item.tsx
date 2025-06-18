"use client"

import type React from "react"

import { Copy, ExternalLink, Pin, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import type { SavedLink } from "@/lib/db"

interface LinkItemProps {
  link: SavedLink
  onDelete: () => void
  onTogglePin: () => void
}

export function LinkItem({ link, onDelete, onTogglePin }: LinkItemProps) {
  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(link.url)
      toast.success("Link copied")
    } catch (error) {
      toast.error("Failed to copy link")
    }
  }

  const handleOpenLink = () => {
    window.open(link.url, "_blank", "noopener,noreferrer")
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete()
  }

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation()
    onTogglePin()
  }

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "Just now"
  }

  return (
    <div
      className="group bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors cursor-pointer"
      onClick={handleOpenLink}
    >
      <div className="flex items-start gap-3">
        {/* Favicon */}
        <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
          <img
            src={`https://www.google.com/s2/favicons?domain=${new URL(link.url).hostname}&sz=32`}
            alt=""
            className="w-4 h-4"
            onError={(e) => {
              e.currentTarget.style.display = "none"
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">{link.title}</h3>
              <p className="text-xs text-gray-500 truncate mb-1">{new URL(link.url).hostname}</p>
              <p className="text-xs text-gray-400">{formatTimeAgo(link.createdAt)}</p>
            </div>

            {/* Pin indicator */}
            {link.isPinned && (
              <div className="ml-2 flex-shrink-0">
                <Pin className="h-3 w-3 text-indigo-600" />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePin}
            className={`h-7 w-7 p-0 ${link.isPinned ? "text-indigo-600" : "text-gray-400 hover:text-indigo-600"}`}
          >
            <Pin className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyLink}
            className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenLink}
            className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="h-7 w-7 p-0 text-gray-400 hover:text-red-600"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
