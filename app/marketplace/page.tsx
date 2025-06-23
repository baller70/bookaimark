'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { 
  DollarSign, 
  ShoppingCart, 
  Star,
  Heart,
  Download,
  Upload,
  Eye,
  Users,
  TrendingUp,
  Award,
  Zap,
  Plus,
  Search,
  Filter,
  Share2,
  Lock,
  Unlock,
  CreditCard,
  Wallet
} from 'lucide-react'

interface Playlist {
  id: string
  title: string
  description: string
  category: string
  price: number
  rating: number
  reviews: number
  downloads: number
  author: string
  authorAvatar: string
  bookmarkCount: number
  tags: string[]
  featured: boolean
  premium: boolean
  previewBookmarks: string[]
}

interface UserPlaylist {
  id: string
  title: string
  description: string
  bookmarkCount: number
  category: string
  isPublic: boolean
  price?: number
  earnings?: number
}

const featuredPlaylists: Playlist[] = [
  {
    id: '1',
    title: 'Ultimate Web Development Resources',
    description: 'Comprehensive collection of tools, tutorials, and frameworks for modern web development',
    category: 'Development',
    price: 29.99,
    rating: 4.9,
    reviews: 156,
    downloads: 2341,
    author: 'DevMaster Pro',
    authorAvatar: 'DM',
    bookmarkCount: 127,
    tags: ['React', 'JavaScript', 'CSS', 'Tools'],
    featured: true,
    premium: true,
    previewBookmarks: ['React Documentation', 'CSS Grid Guide', 'JavaScript ES6 Features']
  },
  {
    id: '2',
    title: 'AI & Machine Learning Essentials',
    description: 'Curated resources for learning and implementing AI/ML solutions',
    category: 'AI/ML',
    price: 39.99,
    rating: 4.8,
    reviews: 89,
    downloads: 1567,
    author: 'AI Researcher',
    authorAvatar: 'AR',
    bookmarkCount: 94,
    tags: ['TensorFlow', 'PyTorch', 'Datasets', 'Papers'],
    featured: true,
    premium: true,
    previewBookmarks: ['TensorFlow Tutorials', 'Kaggle Datasets', 'ArXiv Papers']
  },
  {
    id: '3',
    title: 'Design System Inspiration',
    description: 'Beautiful design systems and UI/UX resources from top companies',
    category: 'Design',
    price: 19.99,
    rating: 4.7,
    reviews: 203,
    downloads: 3421,
    author: 'DesignGuru',
    authorAvatar: 'DG',
    bookmarkCount: 78,
    tags: ['UI/UX', 'Figma', 'Components', 'Inspiration'],
    featured: false,
    premium: false,
    previewBookmarks: ['Material Design', 'Apple HIG', 'Atlassian Design']
  }
]

const userPlaylists: UserPlaylist[] = [
  {
    id: '1',
    title: 'My Development Tools',
    description: 'Personal collection of development utilities',
    bookmarkCount: 45,
    category: 'Development',
    isPublic: false,
    earnings: 0
  },
  {
    id: '2',
    title: 'Marketing Resources Hub',
    description: 'Essential marketing tools and guides',
    bookmarkCount: 32,
    category: 'Marketing',
    isPublic: true,
    price: 15.99,
    earnings: 127.93
  }
]

const categories = ['All', 'Development', 'Design', 'Marketing', 'AI/ML', 'Business', 'Education']

function BookmarkMarketplace() {
  const [activeTab, setActiveTab] = useState('browse')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showMonetizeModal, setShowMonetizeModal] = useState(false)
  const [newPlaylist, setNewPlaylist] = useState({
    title: '',
    description: '',
    category: '',
    price: 0,
    tags: ''
  })

  const filteredPlaylists = featuredPlaylists.filter(playlist => {
    const matchesCategory = selectedCategory === 'All' || playlist.category === selectedCategory
    const matchesSearch = playlist.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         playlist.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         playlist.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const handlePurchase = (playlist: Playlist) => {
    toast.success(`Successfully purchased "${playlist.title}" for $${playlist.price}!`)
  }

  const handleCreatePlaylist = () => {
    if (!newPlaylist.title || !newPlaylist.description || !newPlaylist.category) {
      toast.error('Please fill in all required fields')
      return
    }
    
    toast.success('Playlist created successfully!')
    setShowCreateModal(false)
    setNewPlaylist({ title: '', description: '', category: '', price: 0, tags: '' })
  }

  const renderBrowseTab = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search playlists, tags, or authors..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Featured Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Featured Playlists</h2>
          <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <Star className="h-3 w-3 mr-1" />
            Trending
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaylists.map(playlist => (
            <Card key={playlist.id} className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {playlist.authorAvatar}
                    </div>
                    <div>
                      <CardTitle className="text-lg line-clamp-1">{playlist.title}</CardTitle>
                      <p className="text-sm text-gray-600">by {playlist.author}</p>
                    </div>
                  </div>
                  {playlist.featured && (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      <Award className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <CardDescription className="line-clamp-2">
                  {playlist.description}
                </CardDescription>
                
                {/* Preview Bookmarks */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Preview:</p>
                  <div className="space-y-1">
                    {playlist.previewBookmarks.slice(0, 3).map((bookmark, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                        {bookmark}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {playlist.downloads}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {playlist.rating}
                    </span>
                    <span>{playlist.bookmarkCount} bookmarks</span>
                  </div>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {playlist.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                {/* Price and Action */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-green-600">
                      ${playlist.price}
                    </span>
                    {playlist.premium && (
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        <Zap className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button 
                      onClick={() => handlePurchase(playlist)}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Buy Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )

  const renderMyPlaylistsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Playlists</h2>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Playlist
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userPlaylists.map(playlist => (
          <Card key={playlist.id} className="group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{playlist.title}</CardTitle>
                <div className="flex items-center gap-2">
                  {playlist.isPublic ? (
                    <Badge className="bg-green-100 text-green-800">
                      <Unlock className="h-3 w-3 mr-1" />
                      Public
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <Lock className="h-3 w-3 mr-1" />
                      Private
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <CardDescription>{playlist.description}</CardDescription>
              
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{playlist.bookmarkCount} bookmarks</span>
                <Badge variant="outline">{playlist.category}</Badge>
              </div>
              
              {playlist.earnings && (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">Total Earnings</span>
                  <span className="text-lg font-bold text-green-600">
                    ${playlist.earnings}
                  </span>
                </div>
              )}
              
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
                {!playlist.isPublic && (
                  <Button 
                    size="sm"
                    onClick={() => setShowMonetizeModal(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <DollarSign className="h-4 w-4 mr-1" />
                    Monetize
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderPurchasedTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Purchased Playlists</h2>
      
      <div className="text-center py-12">
        <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">No purchases yet</h3>
        <p className="text-gray-500 mb-4">Browse the marketplace to find amazing bookmark collections</p>
        <Button onClick={() => setActiveTab('browse')}>
          Browse Marketplace
        </Button>
      </div>
    </div>
  )

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Creator Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-green-600">$127.93</p>
              </div>
              <Wallet className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Playlists</p>
                <p className="text-2xl font-bold">1</p>
              </div>
              <Upload className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Rating</p>
                <p className="text-2xl font-bold">4.8</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Marketing Resources Hub</p>
                  <p className="text-sm text-gray-600">Sold to user_{i}23</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">$15.99</p>
                  <p className="text-sm text-gray-600">2 days ago</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Bookmark Marketplace</h1>
          <p className="text-gray-600">Discover, buy, and sell curated bookmark collections</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white p-1 rounded-lg mb-8 shadow-sm">
          {[
            { id: 'browse', label: 'Browse', icon: Search },
            { id: 'my-playlists', label: 'My Playlists', icon: Upload },
            { id: 'purchased', label: 'Purchased', icon: Download },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
        
        {/* Tab Content */}
        {activeTab === 'browse' && renderBrowseTab()}
        {activeTab === 'my-playlists' && renderMyPlaylistsTab()}
        {activeTab === 'purchased' && renderPurchasedTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
        
        {/* Create Playlist Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Create New Playlist</CardTitle>
                <CardDescription>Create a new bookmark collection to share or sell</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Title *</label>
                  <Input
                    placeholder="Enter playlist title"
                    value={newPlaylist.title}
                    onChange={(e) => setNewPlaylist({...newPlaylist, title: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Description *</label>
                  <Textarea
                    placeholder="Describe your playlist"
                    value={newPlaylist.description}
                    onChange={(e) => setNewPlaylist({...newPlaylist, description: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Category *</label>
                  <Select value={newPlaylist.category} onValueChange={(value) => setNewPlaylist({...newPlaylist, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.slice(1).map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Tags</label>
                  <Input
                    placeholder="Enter tags separated by commas"
                    value={newPlaylist.tags}
                    onChange={(e) => setNewPlaylist({...newPlaylist, tags: e.target.value})}
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreatePlaylist}
                    className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                  >
                    Create
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

// Monetization Dialog Component
function MonetizationDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      features: [
        'Up to 3 public playlists',
        'Basic analytics',
        'Community support',
        'Standard listing'
      ],
      color: 'from-gray-500 to-gray-600'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 9.99,
      features: [
        'Unlimited public playlists',
        'Advanced analytics',
        'Priority support',
        'Featured listings',
        'Custom branding'
      ],
      color: 'from-blue-500 to-purple-500',
      popular: true
    },
    {
      id: 'business',
      name: 'Business',
      price: 29.99,
      features: [
        'Everything in Pro',
        'Team collaboration',
        'API access',
        'White-label options',
        'Dedicated account manager'
      ],
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 99.99,
      features: [
        'Everything in Business',
        'Custom integrations',
        'On-premise deployment',
        'SLA guarantee',
        '24/7 phone support'
      ],
      color: 'from-orange-500 to-red-500'
    }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Monetization Plans</CardTitle>
              <CardDescription>Choose the perfect plan to start earning from your bookmark collections</CardDescription>
            </div>
            <Button variant="outline" onClick={onClose}>
              ✕
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {plans.map(plan => (
              <Card 
                key={plan.id} 
                className={`relative cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  selectedPlan === plan.id ? 'ring-2 ring-blue-500' : ''
                } ${plan.popular ? 'border-blue-500 border-2' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <div className={`h-12 w-12 rounded-full bg-gradient-to-r ${plan.color} mx-auto flex items-center justify-center mb-4`}>
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold">
                    ${plan.price}
                    <span className="text-sm font-normal text-gray-600">/month</span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Marketplace Stats */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg mb-6">
            <h3 className="text-lg font-bold mb-4">Marketplace Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">$50K+</div>
                <div className="text-sm text-gray-600">Total Creator Earnings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">10K+</div>
                <div className="text-sm text-gray-600">Active Buyers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">95%</div>
                <div className="text-sm text-gray-600">Seller Satisfaction</div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Maybe Later
            </Button>
            <Button 
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              disabled={!selectedPlan}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Upgrade to {plans.find(p => p.id === selectedPlan)?.name || 'Selected Plan'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function MarketplacePage() {
  const [showMonetizeModal, setShowMonetizeModal] = useState(false)
  
  return (
    <>
      <BookmarkMarketplace />
      <MonetizationDialog 
        isOpen={showMonetizeModal} 
        onClose={() => setShowMonetizeModal(false)} 
      />
    </>
  )
}

