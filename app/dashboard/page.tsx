import React from 'react'
// Temporarily disabled Supabase to show dashboard
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
// import Chat from '@/components/dashboard/Chat'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

export default function Dashboard() {
  // const supabase = createClientComponentClient()

  // Removed Supabase authentication for demo

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Welcome back! Here's your overview.
              </p>
            </div>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
              <Badge variant="secondary">25</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,250</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <Badge variant="outline">Active</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">347</div>
              <p className="text-xs text-muted-foreground">+8% from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Apps Created</CardTitle>
              <Badge variant="default">New</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+3 this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Badge variant="destructive">98%</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98.5%</div>
              <p className="text-xs text-muted-foreground">+0.5% improvement</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Get started with these common tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start" variant="outline">
                <span className="mr-2">💳</span>
                Get More Credits
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <span className="mr-2">👤</span>
                Update Profile
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <span className="mr-2">📚</span>
                View Documentation
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <span className="mr-2">⚙️</span>
                Settings
              </Button>
            </CardContent>
          </Card>

          {/* AI Chat Interface */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>AI Assistant</CardTitle>
              <CardDescription>
                Chat with your AI assistant for help and guidance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Sample conversation */}
                <div className="flex items-start space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-blue-500 text-white text-xs">AI</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
                    <p className="text-sm">
                      Hello! I'm your AI assistant. How can I help you today?
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 justify-end">
                  <div className="flex-1 bg-blue-500 text-white rounded-lg p-3 max-w-xs ml-auto">
                    <p className="text-sm">
                      Can you help me understand my dashboard metrics?
                    </p>
                  </div>
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>You</AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex items-start space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-blue-500 text-white text-xs">AI</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
                    <p className="text-sm">
                      Absolutely! Your dashboard shows great performance with 1,250 total credits, 347 messages processed, and a 98.5% success rate. You've created 12 apps this period, which is excellent progress!
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Chat input area */}
                <div className="flex space-x-2">
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
                    <p className="text-sm text-slate-500">Type your message here...</p>
                  </div>
                  <Button>Send</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest actions and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New app created successfully</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
                <Badge variant="secondary">Success</Badge>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Credits purchased</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
                <Badge variant="outline">Payment</Badge>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Profile updated</p>
                  <p className="text-xs text-muted-foreground">3 hours ago</p>
                </div>
                <Badge variant="secondary">Profile</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 