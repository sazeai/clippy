"use client"

import { motion } from "framer-motion"
import type { CATEGORIES } from "@/lib/db"

interface CategoryTagProps {
  category: (typeof CATEGORIES)[0]
  isActive: boolean
  isSelected: boolean // New prop for form selection sync
  count: number
  onClick: () => void
}

export function CategoryTag({ category, isActive, isSelected, count, onClick }: CategoryTagProps) {
  // Determine visual state priority: active (viewing) > selected (form) > default
  const getTagStyle = () => {
    if (isActive) {
      return "bg-gray-900 text-white border-gray-900"
    }
    if (isSelected) {
      return "bg-gray-100 text-gray-900 border-gray-400"
    }
    return "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
  }

  return (
    <motion.button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-all duration-150 ${getTagStyle()}`}
      whileTap={{ scale: 0.98 }}
      animate={
        isSelected && !isActive
          ? {
              scale: [1, 1.05, 1],
              borderColor: ["#d1d5db", "#9ca3af", "#d1d5db"],
            }
          : {}
      }
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <motion.span
        className="w-2 h-2 rounded-full bg-current opacity-60"
        animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
      <span>{category.name}</span>
      {count > 0 && (
        <span
          className={`text-xs px-1.5 py-0.5 rounded-full ${
            isActive ? "bg-white/20" : isSelected ? "bg-gray-200" : "bg-gray-100"
          }`}
        >
          {count}
        </span>
      )}
    </motion.button>
  )
}
