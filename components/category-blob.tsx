"use client"

import { motion } from "framer-motion"
import type { CATEGORIES } from "@/lib/db"

interface CategoryBlobProps {
  category: (typeof CATEGORIES)[0]
  isActive: boolean
  linkCount: number
  onClick: () => void
}

export function CategoryBlob({ category, isActive, linkCount, onClick }: CategoryBlobProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center w-20 h-20 rounded-full border transition-all duration-200 ${
        isActive
          ? "bg-indigo-50 border-indigo-200 scale-110"
          : "bg-white border-gray-200 hover:border-gray-300 hover:scale-105"
      }`}
      whileTap={{ scale: 0.95 }}
    >
      <span className="text-lg mb-1">{category.emoji}</span>
      <span className="text-xs font-medium text-gray-700">{category.name}</span>

      {linkCount > 0 && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
          {linkCount}
        </div>
      )}
    </motion.button>
  )
}
