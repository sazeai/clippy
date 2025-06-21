"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Trash2, Clock, Edit, Copy, ArrowUpRight } from "lucide-react"
import { toast } from "sonner"
import type { SavedLink } from "@/lib/db"
import { useIsMobile } from "@/components/ui/use-mobile"

interface LinkCardProps {
  link: SavedLink
  onDelete: () => void
  onEdit: () => void
}

export function LinkCard({ link, onDelete, onEdit }: LinkCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const isMobile = useIsMobile()

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "just now"
  }

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(link.url)
      toast.success("Link copied to clipboard")
    } catch (error) {
      toast.error("Failed to copy link")
    }
  }

  const handleOpenLink = (e: React.MouseEvent) => {
    if (isHovered && !isMobile) {
      return
    }
    e.stopPropagation()
    window.open(link.url, "_blank", "noopener,noreferrer")
  }
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit()
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete()
  }

  const showActions = isHovered && !isMobile

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleOpenLink}
      className="relative bg-white hover:bg-gray-50 border border-gray-200 rounded-2xl p-4 cursor-pointer shadow-sm w-full"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      {/* Content */}
      <motion.div
        animate={{ opacity: showActions ? 0 : 1 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex items-start gap-3"
      >
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
            <img
              src={`https://www.google.com/s2/favicons?domain=${new URL(link.url).hostname}&sz=32`}
              alt=""
              className="w-6 h-6 rounded-md"
              onError={(e) => {
                e.currentTarget.style.display = "none"
              }}
            />
          </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 text-sm line-clamp-1 mb-1 hover:underline decoration-gray-300 underline-offset-2">
            {link.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="truncate font-mono">{new URL(link.url).hostname}</span>
            <span className="text-gray-300">•</span>
            <Clock className="h-3 w-3" />
            <span>{formatTimeAgo(link.createdAt)}</span>
          </div>
        </div>
      </motion.div>

      {/* Actions Overlay */}
      <motion.div
        className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: showActions ? 1 : 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        style={{ pointerEvents: showActions ? "auto" : "none" }}
      >
        <ActionButton label="Open" onClick={(e) => { e.stopPropagation(); window.open(link.url, "_blank", "noopener,noreferrer") }}>
          <ArrowUpRight className="w-4 h-4" />
        </ActionButton>
        <ActionButton label="Edit" onClick={handleEdit}>
          <Edit className="w-4 h-4" />
        </ActionButton>
        <ActionButton label="Copy" onClick={handleCopyLink}>
          <Copy className="w-4 h-4" />
        </ActionButton>
        <ActionButton label="Delete" onClick={handleDelete} isDelete>
          <Trash2 className="w-4 h-4" />
        </ActionButton>
      </motion.div>
      {isMobile && (
         <div className="absolute top-2 right-2 flex gap-1">
            <button onClick={handleEdit} className="p-2 rounded-full bg-gray-100/80 text-gray-600"> <Edit className="w-4 h-4" /></button>
            <button onClick={handleDelete} className="p-2 rounded-full bg-gray-100/80 text-red-500"> <Trash2 className="w-4 h-4" /></button>
         </div>
      )}
    </motion.div>
  )
}

const ActionButton = ({
  children,
  label,
  onClick,
  isDelete = false,
}: {
  children: React.ReactNode
  label: string
  onClick: (e: React.MouseEvent) => void
  isDelete?: boolean
}) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
      isDelete
        ? "text-red-500 hover:text-red-700"
        : "text-gray-600 hover:text-gray-900"
    }`}
  >
    <div
      className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
        isDelete
          ? "bg-red-100/50 hover:bg-red-100"
          : "bg-gray-200/50 hover:bg-gray-200"
      }`}
    >
      {children}
    </div>
    <span>{label}</span>
  </button>
)
