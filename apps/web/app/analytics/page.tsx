'use client'

import { AdvancedAnalyticsDashboard } from '@/src/components/dna-profile/advanced-analytics-dashboard'
import { AnalyticsPage } from '@/src/components/dna-profile/analytics-page'
import DnaProfileLayout from '@/src/components/dna-profile/dna-profile-layout'

export default function AnalyticsPageRoute() {
  return (
    <DnaProfileLayout 
      title="Analytics" 
      description="Analyze your browsing patterns and get insights from your DNA profile"
    >
      <div className="space-y-6">
        <AdvancedAnalyticsDashboard />
        <AnalyticsPage />
      </div>
    </DnaProfileLayout>
  )
} 