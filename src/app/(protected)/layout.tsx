'use client'

import { useState } from 'react'
import { TopBar } from '@/components/layouts/top-bar'
import { Sidebar } from '@/components/layouts/sidebar'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const handleMobileToggle = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen)
  }

  const handleMobileClose = () => {
    setIsMobileSidebarOpen(false)
  }

  return (
    <div className="flex h-screen flex-col">
      <TopBar onMenuToggle={handleMobileToggle} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={handleMobileClose}
        />

        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}
