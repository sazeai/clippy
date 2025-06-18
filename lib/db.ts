export interface SavedLink {
  id: string
  url: string
  title: string
  category: string
  isPinned: boolean
  createdAt: number
}

export const CATEGORIES = [
  { id: "work", name: "Work", description: "Professional links and resources" },
  { id: "ideas", name: "Ideas", description: "Inspiration and concepts" },
  { id: "read", name: "Read", description: "Articles and reading material" },
  { id: "tools", name: "Tools", description: "Useful apps and services" },
  { id: "inbox", name: "Inbox", description: "Unsorted links" },
]

class LinkDatabase {
  private dbName = "ClippyDB"
  private version = 3 // Increment version to force upgrade
  private storeName = "links"

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => {
        console.error("Database error:", request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        console.log("Database opened successfully")
        resolve(request.result)
      }

      request.onupgradeneeded = (event) => {
        console.log("Database upgrade needed")
        const db = (event.target as IDBOpenDBRequest).result

        // Delete old store if it exists
        if (db.objectStoreNames.contains(this.storeName)) {
          db.deleteObjectStore(this.storeName)
        }

        const store = db.createObjectStore(this.storeName, { keyPath: "id" })
        store.createIndex("category", "category", { unique: false })
        store.createIndex("createdAt", "createdAt", { unique: false })
        store.createIndex("isPinned", "isPinned", { unique: false })

        console.log("Database store created")
      }
    })
  }

  async fetchPageTitle(url: string): Promise<string> {
    console.log("Fetching title for:", url)

    // Try multiple methods to fetch title
    const methods = [
      // Method 1: AllOrigins
      async () => {
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`)
        const data = await response.json()
        if (data.contents) {
          const parser = new DOMParser()
          const doc = parser.parseFromString(data.contents, "text/html")
          const title = doc.querySelector("title")?.textContent?.trim()
          if (title && title.length > 0) {
            return title
          }
        }
        throw new Error("No title found")
      },

      // Method 2: CORS Anywhere (backup)
      async () => {
        const response = await fetch(`https://cors-anywhere.herokuapp.com/${url}`)
        const html = await response.text()
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, "text/html")
        const title = doc.querySelector("title")?.textContent?.trim()
        if (title && title.length > 0) {
          return title
        }
        throw new Error("No title found")
      },
    ]

    // Try each method
    for (const method of methods) {
      try {
        const title = await method()
        console.log("Title fetched:", title)
        return title
      } catch (error) {
        console.log("Method failed, trying next...")
        continue
      }
    }

    // Fallback to domain name
    try {
      const domain = new URL(url).hostname.replace("www.", "")
      const fallbackTitle = domain.charAt(0).toUpperCase() + domain.slice(1)
      console.log("Using fallback title:", fallbackTitle)
      return fallbackTitle
    } catch {
      console.log("Using default title")
      return "Untitled"
    }
  }

  async addLink(url: string, category: string, customTitle?: string): Promise<SavedLink> {
    console.log("Adding link:", url, category, customTitle)

    const db = await this.openDB()

    let title = customTitle
    if (!title) {
      try {
        title = await this.fetchPageTitle(url)
      } catch (error) {
        console.error("Failed to fetch title:", error)
        // Use domain as fallback
        try {
          const domain = new URL(url).hostname.replace("www.", "")
          title = domain.charAt(0).toUpperCase() + domain.slice(1)
        } catch {
          title = "Untitled"
        }
      }
    }

    const link: SavedLink = {
      id: crypto.randomUUID(),
      url,
      title,
      category,
      isPinned: false,
      createdAt: Date.now(),
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], "readwrite")
      const store = transaction.objectStore(this.storeName)
      const request = store.add(link)

      request.onerror = () => {
        console.error("Failed to add link:", request.error)
        reject(request.error)
      }
      request.onsuccess = () => {
        console.log("Link added successfully:", link)
        resolve(link)
      }
    })
  }

  async getAllLinks(): Promise<SavedLink[]> {
    try {
      const db = await this.openDB()

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], "readonly")
        const store = transaction.objectStore(this.storeName)
        const request = store.getAll()

        request.onerror = () => {
          console.error("Failed to get all links:", request.error)
          reject(request.error)
        }
        request.onsuccess = () => {
          console.log("Retrieved links:", request.result.length)
          resolve(request.result || [])
        }
      })
    } catch (error) {
      console.error("Database not available:", error)
      return []
    }
  }

  async getLinksByCategory(category: string): Promise<SavedLink[]> {
    try {
      const db = await this.openDB()

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], "readonly")
        const store = transaction.objectStore(this.storeName)
        const index = store.index("category")
        const request = index.getAll(category)

        request.onerror = () => {
          console.error("Failed to get links by category:", request.error)
          reject(request.error)
        }
        request.onsuccess = () => {
          const links = (request.result || []).sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1
            if (!a.isPinned && b.isPinned) return 1
            return b.createdAt - a.createdAt
          })
          console.log("Retrieved category links:", links.length)
          resolve(links)
        }
      })
    } catch (error) {
      console.error("Database not available:", error)
      return []
    }
  }

  async deleteLink(id: string): Promise<void> {
    const db = await this.openDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], "readwrite")
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(id)

      request.onerror = () => {
        console.error("Failed to delete link:", request.error)
        reject(request.error)
      }
      request.onsuccess = () => {
        console.log("Link deleted successfully")
        resolve()
      }
    })
  }

  async togglePin(id: string): Promise<void> {
    const db = await this.openDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], "readwrite")
      const store = transaction.objectStore(this.storeName)

      const getRequest = store.get(id)
      getRequest.onsuccess = () => {
        const link = getRequest.result
        if (link) {
          link.isPinned = !link.isPinned
          const putRequest = store.put(link)
          putRequest.onsuccess = () => resolve()
          putRequest.onerror = () => reject(putRequest.error)
        } else {
          reject(new Error("Link not found"))
        }
      }
      getRequest.onerror = () => reject(getRequest.error)
    })
  }
}

export const db = new LinkDatabase()
