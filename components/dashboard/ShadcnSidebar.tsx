'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { 
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Star,
  Settings,
  Bookmark,
  Grid3X3,
  TrendingUp,
  Users,
  FolderOpen,
  Dna,
  ShoppingCart
} from 'lucide-react'

export function ShadcnSidebar() {
  const [selectedItem, setSelectedItem] = useState('Dashboard')
  const [isCollapsed, setIsCollapsed] = useState(false) // Start expanded
  const pathname = usePathname()

  const navigationItems = [
    { id: 'Dashboard', name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { id: 'DNA Profile', name: 'DNA Profile', icon: Dna, href: '/dna-profile' },
    { id: 'Marketplace', name: 'Marketplace', icon: ShoppingCart, href: '/marketplace' },
    { id: 'Setting', name: 'Setting', icon: Settings, href: '/settings' },
  ]

  const categoryItems = [
    { id: 'Development', name: 'Development', icon: Grid3X3, count: 2 },
    { id: 'Design', name: 'Design', icon: TrendingUp, count: 2 },
    { id: 'Productivity', name: 'Productivity', icon: Users, count: 2 },
    { id: 'Learning', name: 'Learning', icon: FolderOpen, count: 0 },
    { id: 'Entertainment', name: 'Entertainment', icon: Bookmark, count: 0 }
  ]

  const handleItemClick = (itemId: string) => {
    setSelectedItem(itemId)
  }

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <div className="h-full flex flex-col p-4">
      {/* Sidebar Container - Dynamic width based on collapse state */}
      <div className={cn(
        "bg-white rounded-lg border border-slate-200 shadow-sm h-full flex flex-col dark:bg-slate-950 dark:border-slate-800 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}>
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between w-full">
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Star className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-medium text-slate-900 dark:text-slate-100">BookmarkHub</span>
                  <span className="text-sm text-slate-500">Your digital workspace</span>
                </div>
              </div>
            )}
            
            {isCollapsed && (
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
                <Star className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-1"
              onClick={toggleCollapse}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 text-slate-500" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-slate-500" />
              )}
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 min-h-0">
            <ScrollArea className={cn("h-full py-4", isCollapsed ? "px-2" : "px-4")}>
              <div className={cn("space-y-2", !isCollapsed && "space-y-6")}>
                
                {/* Navigation Section */}
                <div className="space-y-1">
                  {!isCollapsed && (
                    <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                      Navigation
                    </h3>
                  )}
                  
                  <div className={cn("space-y-1", isCollapsed && "space-y-2")}>
                    {navigationItems.map((item) => {
                      const Icon = item.icon
                      const isSelected = pathname === item.href
                      
                      return (
                        <Link key={item.id} href={item.href}>
                          <button
                            className={cn(
                              "flex items-center rounded-md transition-colors group",
                              isCollapsed 
                                ? "w-12 h-12 justify-center relative" 
                                : "w-full justify-between px-3 py-2 text-sm",
                              isSelected 
                                ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100" 
                                : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                            )}
                            title={isCollapsed ? item.name : undefined}
                          >
                            {isCollapsed ? (
                              <>
                                <Icon className="h-5 w-5" />
                              </>
                            ) : (
                              <>
                                <div className="flex items-center gap-3">
                                  <Icon className="h-4 w-4" />
                                  <span>{item.name}</span>
                                </div>
                              </>
                            )}
                          </button>
                        </Link>
                      )
                    })}
                                    </div>
                </div>

                {/* Categories Section */}
                <div className="space-y-1">
                  {!isCollapsed && (
                    <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                      Categories
                    </h3>
                  )}
                  
                  <div className={cn("space-y-1", isCollapsed && "space-y-2")}>
                    {categoryItems.map((item) => {
                      const Icon = item.icon
                      const isSelected = selectedItem === item.id
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleItemClick(item.id)}
                          className={cn(
                            "flex items-center rounded-md transition-colors group",
                            isCollapsed 
                              ? "w-12 h-12 justify-center relative" 
                              : "w-full justify-between px-3 py-2 text-sm",
                            isSelected 
                              ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100" 
                              : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                          )}
                          title={isCollapsed ? item.name : undefined}
                        >
                          {isCollapsed ? (
                            <>
                              <Icon className="h-5 w-5" />
                              {item.count > 0 && (
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-slate-400 rounded-full"></div>
                              )}
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-3">
                                <Icon className="h-4 w-4" />
                                <span>{item.name}</span>
                              </div>
                              <Badge 
                                variant="secondary" 
                                className="text-xs px-2 py-0.5 text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-800"
                              >
                                {item.count}
                              </Badge>
                            </>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Upgrade to Pro Card - Only show when expanded */}
                {!isCollapsed && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                          Upgrade to Pro
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                          Get pro now to own all dashboards, templates and components for life.
                        </p>
                      </div>
                      
                      <Button 
                        className="w-full bg-black text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 font-medium rounded-md"
                        size="sm"
                      >
                        Get Shadcn UI Kit
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  )
} 