'use client'

import { AdvancedAnalyticsDashboard } from '@/src/components/dna-profile/advanced-analytics-dashboard'
import { AnalyticsPage } from '@/src/components/dna-profile/analytics-page'
// import { AnalyticsVerification } from '@/src/components/dna-profile/analytics-verification'
import DnaTabsWrapper from '@/src/components/dna-profile/dna-tabs-wrapper'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function Analytics() {
  return (
    <>
      <DnaTabsWrapper />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="detailed">Detailed Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <AdvancedAnalyticsDashboard />
            </TabsContent>
            
            <TabsContent value="detailed" className="space-y-6">
              <AnalyticsPage userId="current-user" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
} 