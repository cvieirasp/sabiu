'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Network,
  ListTodo,
  Kanban,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

interface SidebarProps {
  isMobileOpen: boolean
  onMobileClose: () => void
}

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Itens',
    href: '/items',
    icon: ListTodo,
  },
  {
    title: 'Kanban',
    href: '/kanban',
    icon: Kanban,
  },
  {
    title: 'Gráfico',
    href: '/graph',
    icon: Network,
  },
]

function SidebarContent({
  collapsed,
  onToggleCollapse,
  isMobile = false,
}: {
  collapsed: boolean
  onToggleCollapse?: () => void
  isMobile?: boolean
}) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col">
      {/* Navigation */}
      <nav className="flex flex-col flex-1 space-y-1 p-4 gap-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start cursor-pointer',
                  collapsed && !isMobile && 'justify-center px-2'
                )}
                title={collapsed && !isMobile ? item.title : undefined}
              >
                <Icon
                  className={cn(
                    'size-5',
                    collapsed && !isMobile ? '' : 'mr-3'
                  )}
                />
                {(!collapsed || isMobile) && (
                  <span className="text-sm font-medium">{item.title}</span>
                )}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Toggle Button - Desktop Only */}
      {!isMobile && onToggleCollapse && (
        <div className="border-t p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className={cn(
              'w-full justify-start',
              collapsed && 'justify-center px-2'
            )}
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {collapsed ? (
              <ChevronRight className="size-5" />
            ) : (
              <>
                <ChevronLeft className="mr-3 size-5" />
                <span className="text-sm">Recolher</span>
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

export function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  const handleToggleCollapse = () => {
    setCollapsed(!collapsed)
  }

  return (
    <>
      {/* Mobile Sidebar - Sheet */}
      <Sheet open={isMobileOpen} onOpenChange={onMobileClose}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="border-b p-4">
            <SheetTitle className="text-left">Menu</SheetTitle>
          </SheetHeader>
          <SidebarContent collapsed={false} isMobile />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex lg:flex-col border-r bg-sidebar transition-all duration-300',
          collapsed ? 'w-20' : 'w-64'
        )}
      >
        <SidebarContent
          collapsed={collapsed}
          onToggleCollapse={handleToggleCollapse}
        />
      </aside>
    </>
  )
}
