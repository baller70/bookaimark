'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { 
  User, 
  Heart, 
  Music, 
  Search, 
  BarChart3, 
  Clock,
  ArrowLeft
} from 'lucide-react'
import { useRouter } from 'next/navigation'

// Import all DNA Profile components
import { DNAProfileOverview } from '@/src/components/dna-profile/dna-profile-overview'
import DnaFavorites from '@/src/components/dna-profile/dna-favorites'
import DnaPlaylists from '@/src/components/dna-profile/dna-playlists'
import DnaSearch from '@/src/components/dna-profile/dna-search'
import DnaAnalytics from '@/src/components/dna-profile/dna-analytics'
import DnaTimeCapsule from '@/src/components/dna-profile/dna-time-capsule'
import { DashboardProvider } from '@/components/dashboard/DashboardContext'
import { ChatSidebar } from '@/components/dashboard/ChatSidebar'
import { NewSidebarComponent } from '@/src/components/ui/new-sidebar'

// Default profile data
const defaultProfileData = {
  name: 'John Doe',
  business: 'Software Engineer',
  bio: 'Passionate about technology and innovation',
  avatar: '/avatars/default.png',
  tier: 'Pro' as const
}

// Wrapper component for DNAProfileOverview
const DnaProfileOverviewWrapper = () => <DNAProfileOverview profileData={defaultProfileData} />

const dnaProfileTabs = [
  {
    id: 'profile',
    label: 'DNA Profile',
    icon: User,
    description: 'Personal info & interests',
    component: DnaProfileOverviewWrapper,
    badge: null
  },
  {
    id: 'favorites',
    label: 'Favorites',
    icon: Heart,
    description: 'Bookmarked content',
    component: DnaFavorites,
    badge: '1.2K'
  },
  {
    id: 'playlists',
    label: 'Playlists',
    icon: Music,
    description: 'Curated collections',
    component: DnaPlaylists,
    badge: '12'
  },
  {
    id: 'search',
    label: 'Search',
    icon: Search,
    description: 'AI-enhanced search',
    component: DnaSearch,
    badge: null
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    description: 'Usage insights',
    component: DnaAnalytics,
    badge: null
  },
  {
    id: 'time-capsule',
    label: 'Time Capsule',
    icon: Clock,
    description: 'Versioned snapshots',
    component: DnaTimeCapsule,
    badge: '8'
  }
].filter(tab => tab.label !== 'AI-Copolit' && tab.id !== 'ai-copolit')

export default function DnaProfilePage() {
  const [activeTab, setActiveTab] = useState('profile')
  const router = useRouter();
  const loading = false
  const hasChanges = false

  // Sidebar sections for DNA Profile
  const sidebarSections = dnaProfileTabs.map(tab => ({
    id: tab.id,
    label: tab.label,
    icon: tab.icon
  }))

  // Dummy save/reset handlers
  const handleReset = () => window.location.reload()
  const handleSave = () => {/* save logic here */}

  return (
    <DashboardProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        {/* Screenshot-style Header */}
        <div className="sticky top-0 z-50 bg-white/80 dark:bg-card backdrop-blur-sm border-b border-gray-200 dark:border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left: Back to Dashboard */}
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-primary focus:outline-none"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Dashboard</span>
                </button>
                <div className="h-6 w-px bg-gray-300" />
                {/* Center/left: Gear icon and title */}
                <div className="flex items-center space-x-2">
                  <User className="h-6 w-6" />
                  <span className="text-2xl font-bold tracking-tight">DNA Profile</span>
                </div>
              </div>
              {/* Right: Reset and Save Changes buttons */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className="h-9 px-4 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading || !hasChanges}
                  className="h-9 px-4 rounded-md bg-[#ffb3b3] text-white font-semibold text-sm shadow hover:opacity-90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Main Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Settings-style Sidebar */}
            <NewSidebarComponent
              sections={sidebarSections}
              activeSection={activeTab}
              onSectionChange={setActiveTab}
            />
            {/* Main Content */}
            <div className="lg:col-span-3 flex-1 flex flex-col overflow-hidden bg-transparent">
              <main className="flex-1 overflow-y-auto bg-transparent">
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-0">
                    {/* Tab Content */}
                    <div className="p-6">
                      {dnaProfileTabs.map((tab) => (
                        activeTab === tab.id && (
                          <div key={tab.id}>
                            <div className="min-h-[600px]">
                              <tab.component />
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  </CardContent>
                </Card>
                {/* Footer */}
                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-500">
                    Your DNA Profile is continuously learning and adapting to provide better recommendations
                  </p>
                </div>
              </main>
            </div>
          </div>
        </div>
        <ChatSidebar />
      </div>
    </DashboardProvider>
  )
} 