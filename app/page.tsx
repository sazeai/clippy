"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Plus, Globe, Link as LinkIcon, Settings as SettingsIcon, X as XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { CategoryTag } from "@/components/category-tag"
import { LinkCard } from "@/components/link-card"
import { EditLinkModal } from "@/components/edit-link-modal"
import { InstallPrompt } from "@/components/install-prompt"
import { db, type SavedLink, CATEGORIES } from "@/lib/db"

const BOOKMARKLET = `javascript:(function(){window.open('https://clippy-xi-six.vercel.app/share?title='+encodeURIComponent(document.title)+'&url='+encodeURIComponent(window.location.href),'_blank');})();`

export default function ClippyPage() {
  const [links, setLinks] = useState<SavedLink[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [categoryLinks, setCategoryLinks] = useState<SavedLink[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showBookmarklet, setShowBookmarklet] = useState(false)
  const [showRestore, setShowRestore] = useState(false)
  const [editingLink, setEditingLink] = useState<SavedLink | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Add form state
  const [url, setUrl] = useState("")
  const [title, setTitle] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("") // Single source of truth
  const [isAddingLink, setIsAddingLink] = useState(false)

  const urlInputRef = useRef<HTMLInputElement>(null)
  const [urlTouched, setUrlTouched] = useState(false)
  const [urlInvalid, setUrlInvalid] = useState(false)
  const [showTags, setShowTags] = useState(false)

  useEffect(() => {
    loadLinks()
    // Only show on desktop and if not already added
    if (typeof window !== "undefined") {
      const isDesktop = window.matchMedia("(min-width: 768px)").matches
      const dismissed = localStorage.getItem("bookmarkletDismissed") === "true"
      setShowBookmarklet(isDesktop && !dismissed)
      setShowRestore(isDesktop && dismissed)
    }
  }, [])

  // When opening the form, prefill URL with 'https://'
  useEffect(() => {
    if (showAddForm && url === "") {
      setUrl("https://")
      // Optionally, focus the input
      setTimeout(() => {
        urlInputRef.current?.focus()
        // Move cursor to end
        const val = urlInputRef.current?.value
        if (val) urlInputRef.current.setSelectionRange(val.length, val.length)
      }, 50)
    }
  }, [showAddForm])

  const loadLinks = async () => {
    try {
      const savedLinks = await db.getAllLinks()
      setLinks(savedLinks)
    } catch (error) {
      console.error("Failed to load links:", error)
      toast.error("Failed to load links")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCategoryToggle = async (categoryId: string) => {
    if (activeCategory === categoryId) {
      // If clicking the same active category, close it
      setActiveCategory(null)
      setCategoryLinks([])
      setSearchQuery("")
      // Don't clear selectedCategory - keep it for form
    } else {
      // Select new category
      setActiveCategory(categoryId)
      setSelectedCategory(categoryId) // Sync with form selection

      try {
        const links = await db.getLinksByCategory(categoryId)
        setCategoryLinks(links)
      } catch (error) {
        console.error("Failed to load category links:", error)
        toast.error("Failed to load links")
      }
    }
  }

  const handleFormCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    // Don't automatically change activeCategory from form selection
    // This allows user to select different category in form without changing view
  }

  const handleDeleteLink = async (id: string) => {
    try {
      await db.deleteLink(id)
      setCategoryLinks((prev) => prev.filter((link) => link.id !== id))
      setLinks((prev) => prev.filter((link) => link.id !== id))
      toast.success("Link deleted")
    } catch (error) {
      console.error("Failed to delete link:", error)
      toast.error("Failed to delete link")
    }
  }

  const handleUpdateLink = (updatedLink: SavedLink) => {
    // Update the main links list
    setLinks(prev => prev.map(l => (l.id === updatedLink.id ? updatedLink : l)))

    // Update the currently displayed category links
    setCategoryLinks(prev => {
      // If the category was changed, the link might no longer belong in the current view
      if (activeCategory && updatedLink.category !== activeCategory) {
        return prev.filter(l => l.id !== updatedLink.id)
      }
      // Otherwise, just update the item in place
      return prev.map(l => (l.id === updatedLink.id ? updatedLink : l))
    })
  }

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim() || !selectedCategory) return

    setIsAddingLink(true)
    try {
      const newLink = await db.addLink(url.trim(), selectedCategory, title.trim() || undefined)
      setLinks((prev) => [...prev, newLink])

      if (activeCategory === selectedCategory) {
        setCategoryLinks((prev) => [newLink, ...prev])
      }

      toast.success(`Saved to ${CATEGORIES.find((c) => c.id === selectedCategory)?.name}`)

      // Reset form but keep category selection
      setUrl("")
      setTitle("")
      // Keep selectedCategory for next link
      setShowAddForm(false)
    } catch (error) {
      console.error("Failed to add link:", error)
      toast.error("Failed to add link")
    } finally {
      setIsAddingLink(false)
    }
  }

  const handleBookmarkletDismiss = () => {
    setShowBookmarklet(false)
    setShowRestore(true)
    localStorage.setItem("bookmarkletDismissed", "true")
  }

  const handleRestore = () => {
    setShowBookmarklet(true)
    setShowRestore(false)
    localStorage.removeItem("bookmarkletDismissed")
  }

  const filteredLinks = categoryLinks.filter(
    (link) =>
      link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.url.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getCategoryCount = (categoryId: string) => {
    return links.filter((link) => link.category === categoryId).length
  }

  // Helper function to group links into rows of 3
  const groupLinksIntoRows = (links: SavedLink[]) => {
    const rows = []
    for (let i = 0; i < links.length; i += 3) {
      rows.push(links.slice(i, i + 3))
    }
    return rows
  }

  // Validate URL (simple check)
  const isValidUrl = (value: string) => {
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    )
  }

  const handleExportLinks = () => {
    const dataStr = JSON.stringify(links, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "clippy-links-export.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Links exported!");
  };

  const handleImportLinks = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedLinks = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedLinks)) {
          setLinks(importedLinks);
          localStorage.setItem('links', JSON.stringify(importedLinks));
          toast.success("Links imported successfully!");
        } else {
          toast.error("Invalid file format.");
        }
      } catch {
        toast.error("Import failed. Invalid JSON.");
      }8
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <InstallPrompt />

      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/icon-512.png" alt="Clippy Icon" className="w-6 rounded-md h-6" />
            <h1 className="text-lg font-medium text-gray-900">Clippy</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Bookmarklet Button (desktop only, icon+text) */}
            {showBookmarklet && (
              <div className="md:block hidden relative group">
                <a
                  href={BOOKMARKLET}
                  className="inline-flex items-center justify-center rounded-full bg-gray-900 text-white shadow hover:bg-gray-800 transition-colors select-none cursor-grab active:scale-95 px-3 h-9 text-sm font-medium"
                  draggable="true"
                  title="Drag me to your bookmarks bar!"
                  tabIndex={0}
                  onClick={e => e.preventDefault()}
                  aria-label="Save to Clippy bookmarklet"
                >
                  <LinkIcon className="w-4 h-4 mr-1" />
                  Save to Clippy
                </a>
                <button
                  onClick={handleBookmarkletDismiss}
                  className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-80 group-focus-within:opacity-80 transition-opacity bg-transparent text-gray-400 hover:text-gray-600 rounded-full w-6 h-6 flex items-center justify-center border-none p-0"
                  title="Dismiss"
                  aria-label="Dismiss bookmarklet button"
                  tabIndex={0}
                  style={{ boxShadow: 'none', border: 'none' }}
                >
                  <XIcon className="w-4 h-4" />
                </button>
                <span className="absolute left-1/2 top-full mt-2 -translate-x-1/2 w-56 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-normal text-center">
                  Drag to your bookmarks bar to save links from any site.
                </span>
              </div>
            )}
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              size="sm"
              className="bg-gray-900 text-sm hover:bg-gray-800 text-white rounded-lg px-3 py-1.5 text-sm"
            >
              {showAddForm ? <XIcon className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
              {showAddForm ? "Cancel" : "Add"}
            </Button>
          </div>
        </div>
      </header>

      {/* Restore Icon (bottom-right, low opacity, only if dismissed) */}
      {showRestore && (
        <button
          onClick={handleRestore}
          className="fixed bottom-4 right-4 z-50 opacity-30 hover:opacity-80 transition-opacity bg-white rounded-full p-2 shadow border border-gray-200 md:block hidden"
          title="Restore bookmarklet button"
          aria-label="Restore bookmarklet button"
        >
          <SettingsIcon className="w-6 h-6" />
        </button>
      )}

      {/* Edit Link Modal */}
      {editingLink && (
        <EditLinkModal
          link={editingLink}
          isOpen={!!editingLink}
          onClose={() => setEditingLink(null)}
          onUpdate={handleUpdateLink}
        />
      )}

      {/* Add Form - Minimal Notion Style */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="max-w-md mx-auto px-4 py-6">
              <form
                onSubmit={handleAddLink}
                className="flex flex-col gap-2"
                autoComplete="off"
              >
                {/* URL Input */}
                <motion.input
                  ref={urlInputRef}
                  type="url"
                  placeholder="Paste a link to save..."
                  value={url}
                  onChange={e => {
                    setUrl(e.target.value)
                    setUrlTouched(true)
                    setUrlInvalid(false)
                    setShowTags(isValidUrl(e.target.value))
                  }}
                  onBlur={() => setUrlTouched(true)}
                  onFocus={e => {
                    if (e.target.value === "") {
                      setUrl("https://")
                      setTimeout(() => {
                        urlInputRef.current?.setSelectionRange(8, 8)
                      }, 10)
                    }
                  }}
                  autoFocus
                  className={`w-full bg-transparent rounded-md border border-gray-300 focus:border-b-2 p-4 focus:border-black hover:bg-gray-50 focus:bg-gray-50 transition-all duration-150 outline-none text-base placeholder-gray-500 ${urlInvalid ? "border-b-2 border-red-500 animate-shake" : ""}`}
                  style={{ fontSize: 16, fontWeight: 500 }}
                  onInvalid={e => {
                    e.preventDefault()
                    setUrlInvalid(true)
                  }}
                />
                {/* Optional Title Input */}
                <input
                  type="text"
                  placeholder="Optional title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-transparent border border-gray-200 focus:border rounded-md focus:border-black hover:bg-gray-50 focus:bg-gray-50 transition-all duration-150 outline-none p-4 text-base placeholder-gray-400"
                  style={{ fontSize: 15 }}
                />
                {/* Tags - Only show after valid URL */}
                <AnimatePresence>
                  {showTags && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18 }}
                      className="flex flex-wrap gap-2 mt-2"
                    >
                      {CATEGORIES.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => setSelectedCategory(category.id)}
                          className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                            selectedCategory === category.id
                              ? "bg-gray-900 text-white border-gray-900"
                              : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* Save Button - prominent, full width */}
                <motion.button
                  type="submit"
                  disabled={!isValidUrl(url) || !selectedCategory || isAddingLink}
                  className="w-full mt-4 bg-black text-white rounded-lg py-3 font-semibold text-base shadow-sm hover:opacity-90 transition disabled:opacity-50"
                  whileTap={{ scale: 0.98 }}
                  onClick={e => {
                    if (!isValidUrl(url)) {
                      setUrlInvalid(true)
                      setTimeout(() => setUrlInvalid(false), 500)
                      e.preventDefault()
                    }
                  }}
                >
                  Save to Clippy
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 min-h-[calc(100vh-200px)]">
        <div className="w-full max-w-4xl">
          {/* Categories - Centered circle layout on desktop */}
          <div className="relative flex items-center justify-center mb-8">
            <div className="hidden md:block relative w-80 h-80">
              {/* Center blob with app name */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white border border-gray-200 rounded-full flex items-center justify-center">
                <img src="/icon-512.png" alt="Clippy Icon" className="w-12 h-12 rounded-full" />
              </div>

              {/* Categories in circle around center */}
              {CATEGORIES.map((category, index) => {
                const angle = (index / CATEGORIES.length) * 2 * Math.PI - Math.PI / 2
                const radius = 120
                const x = Math.cos(angle) * radius
                const y = Math.sin(angle) * radius

                return (
                  <div
                    key={category.id}
                    className="absolute top-1/2 left-1/2"
                    style={{
                      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                    }}
                  >
                    <CategoryTag
                      category={category}
                      isActive={activeCategory === category.id}
                      isSelected={selectedCategory === category.id}
                      count={getCategoryCount(category.id)}
                      onClick={() => handleCategoryToggle(category.id)}
                    />
                  </div>
                )
              })}
            </div>

            {/* Mobile layout - horizontal */}
            <div className="md:hidden flex flex-wrap gap-2 justify-center">
              {CATEGORIES.map((category) => (
                <CategoryTag
                  key={category.id}
                  category={category}
                  isActive={activeCategory === category.id}
                  isSelected={selectedCategory === category.id}
                  count={getCategoryCount(category.id)}
                  onClick={() => handleCategoryToggle(category.id)}
                />
              ))}
            </div>
          </div>

          {/* Search */}
          <AnimatePresence>
            {activeCategory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="mb-6"
              >
                <div className="relative max-w-md mx-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search links..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white border-gray-200 rounded-lg focus:border-gray-900 focus:ring-0"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Links - Three per row layout */}
          <AnimatePresence>
            {activeCategory && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="w-full max-w-5xl mx-auto"
              >
                {filteredLinks.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm mb-3">No links in this category</p>
                    <Button
                      onClick={() => setShowAddForm(true)}
                      className="bg-gray-900 text-sm hover:bg-gray-800 text-white rounded-lg px-4 py-2"
                    >
                      Add your first link
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {groupLinksIntoRows(filteredLinks).map((row, rowIndex) => (
                      <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {row.map((link, linkIndex) => (
                          <motion.div
                            key={link.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.3,
                              delay: (rowIndex * 3 + linkIndex) * 0.05,
                              ease: "easeOut",
                            }}
                          >
                            <LinkCard
                              link={link}
                              onDelete={() => handleDeleteLink(link.id)}
                              onEdit={() => setEditingLink(link)}
                            />
                          </motion.div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty State */}
          {links.length === 0 && !activeCategory && (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm mb-4">Your link collection is empty</p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-gray-900 text-sm hover:bg-gray-800 text-white rounded-lg px-4 py-2"
              >
                Add your first link
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4">
        <p className="text-xs text-gray-400 opacity-60">
          Built with ☕ by{" "}
          <a
            href="https://x.com/AINotSoSmart"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-600 transition-colors"
          >
            Harvansh
          </a>
        </p>
      </footer>
      <input
        type="file"
        accept="application/json"
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={handleImportLinks}
      />
      <div
        style={{
          position: "fixed",
          bottom: 16,
          left: 16,
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <button
          title="Export Links"
          onClick={handleExportLinks}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "#f3f4f6",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: 18,
          }}
        >
          {/* Download icon SVG */}
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M12 17V3m0 14l-5-5m5 5l5-5"/><rect x="4" y="17" width="16" height="4" rx="2" fill="#d1d5db"/></svg>
        </button>
        <button
          title="Import Links"
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "#f3f4f6",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: 18,
          }}
        >
          {/* Upload icon SVG */}
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M12 7v14m0-14l-5 5m5-5l5 5"/><rect x="4" y="3" width="16" height="4" rx="2" fill="#d1d5db"/></svg>
        </button>
      </div>
    </div>
  )
}
