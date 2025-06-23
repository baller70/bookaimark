'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Heart, 
  Music, 
  Search, 
  BarChart3, 
  Clock,
  Sparkles,
  Crown,
  Zap
} from 'lucide-react'

// Import all DNA Profile components
import { DNAProfileOverview } from '@/src/components/dna-profile/dna-profile-overview'
import DnaFavorites from '@/src/components/dna-profile/dna-favorites'
import DnaPlaylists from '@/src/components/dna-profile/dna-playlists'
import DnaSearch from '@/src/components/dna-profile/dna-search'
import DnaAnalytics from '@/src/components/dna-profile/dna-analytics'
import DnaTimeCapsule from '@/src/components/dna-profile/dna-time-capsule'

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
]

export default function DnaProfilePage() {
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                DNA Profile
              </h1>
              <p className="text-gray-600">Your personalized bookmark intelligence center</p>
            </div>
            <div className="flex items-center space-x-2 ml-auto">
              <Badge variant="outline" className="text-purple-600 border-purple-200">
                <Crown className="h-3 w-3 mr-1" />
                Pro Plan
              </Badge>
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                <Zap className="h-3 w-3 mr-1" />
                AI Enhanced
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Tab Navigation */}
              <div className="border-b bg-gray-50/50">
                <TabsList className="w-full h-auto p-2 bg-transparent justify-start overflow-x-auto">
                  {dnaProfileTabs.map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="flex items-center space-x-2 px-4 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200 min-w-fit"
                    >
                      <tab.icon className="h-4 w-4" />
                      <span className="font-medium">{tab.label}</span>
                      {tab.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {tab.badge}
                        </Badge>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {dnaProfileTabs.map((tab) => (
                  <TabsContent key={tab.id} value={tab.id} className="mt-0">
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <tab.icon className="h-5 w-5 text-gray-600" />
                        <h2 className="text-xl font-semibold text-gray-900">{tab.label}</h2>
                      </div>
                      <p className="text-gray-600 text-sm">{tab.description}</p>
                    </div>
                    <div className="min-h-[600px]">
                      <tab.component />
                    </div>
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Your DNA Profile is continuously learning and adapting to provide better recommendations
          </p>
        </div>
      </div>
    </div>
  )
} 