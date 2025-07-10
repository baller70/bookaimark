'use client'

import { StagewiseToolbar } from '@stagewise/toolbar-next'
import ReactPlugin from '@stagewise-plugins/react'

export function StagewiseWrapper() {
  // Only render in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <StagewiseToolbar config={{ plugins: [ReactPlugin] }} />
  )
} 