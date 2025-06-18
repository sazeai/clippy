"use client"

const BOOKMARKLET = `javascript:(function(){window.open('http://localhost:3000/share?title='+encodeURIComponent(document.title)+'&url='+encodeURIComponent(window.location.href),'_blank');})();`

export default function InstallBookmarkletPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-xl shadow-sm p-8 mt-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">Save links from any site with one tap</h1>
        <p className="text-gray-500 text-center mb-6">
          Drag the button below to your bookmarks bar. That's it.
          <span className="ml-2 group relative inline-block align-middle">
            <svg className="w-4 h-4 text-gray-400 inline-block cursor-pointer" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-56 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              Bookmarklets are tiny scripts you can save as bookmarks. Just drag the button to your bookmarks bar, then click it on any site to save the page to Clippy.
            </span>
          </span>
        </p>
        <div className="flex justify-center mb-8">
          <a
            href={BOOKMARKLET}
            className="px-6 py-3 rounded-lg bg-gray-900 text-white font-medium shadow hover:bg-gray-800 transition-colors text-lg select-none cursor-grab active:scale-95"
            draggable="true"
            title="Drag me to your bookmarks bar!"
            tabIndex={0}
            onClick={e => e.preventDefault()}
          >
            Save to Clippy
          </a>
        </div>
        <div className="text-xs text-gray-400 text-center">
          <span className="block md:hidden">Bookmarklets work best on desktop browsers.</span>
          <span className="hidden md:block">Need help? <a href="https://www.howtogeek.com/195607/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">How to use bookmarklets</a></span>
        </div>
      </div>
    </div>
  )
}
