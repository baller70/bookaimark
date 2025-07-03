'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bot, Eye, Mic, BrainCircuit, Wrench, Sparkles, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

const nav = [
  { href: '/settings/oracle/appearance', label: 'Appearance', icon: <Eye className="h-4 w-4" /> },
  { href: '/settings/oracle/behavior',   label: 'Behavior',   icon: <Bot className="h-4 w-4" /> },
  { href: '/settings/oracle/voice',      label: 'Voice',      icon: <Mic className="h-4 w-4" /> },
  { href: '/settings/oracle/context',    label: 'Context',    icon: <BrainCircuit className="h-4 w-4" /> },
  { href: '/settings/oracle/tools',      label: 'Tools',      icon: <Wrench className="h-4 w-4" /> },
  { href: '/settings/oracle/advanced',   label: 'Advanced',   icon: <Sparkles className="h-4 w-4" /> },
]

export default function OracleLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-card backdrop-blur-sm border-b border-gray-200 dark:border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/settings')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Settings</span>
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-2">
                <Bot className="h-6 w-6" />
                <h1 className="text-xl font-bold">Oracle AI Chat Bot</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <ScrollArea className="hidden lg:block w-56 shrink-0 rounded-lg border p-2">
            {nav.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted',
                  pathname.startsWith(item.href) && 'bg-muted font-medium'
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </ScrollArea>

          {/* Main content */}
          <div className="flex-1 w-full">{children}</div>
        </div>
      </div>
    </div>
  )
} 