'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack,
  Shuffle,
  Repeat,
  Volume2,
  Plus,
  Search,
  Share,
  Users,
  Lock,
  Globe,
  Heart,
  List,
  Music,
  Sparkles,
  ExternalLink,
  MoreHorizontal,
  Eye,
  Loader2,
  Trash2
} from 'lucide-react'
import { toast } from 'sonner'
import { playbookService, PlaybookData, BookmarkData } from '@/services/playbook-service'

// Mock user ID - in production, this would come from auth context
const MOCK_USER_ID = 'user_123'

export default function DnaPlaybooks() {
  const [playbooks, setPlaybooks] = useState<PlaybookData[]>([])
  const [selectedPlaybook, setSelectedPlaybook] = useState<PlaybookData | null>(null)
  const [currentBookmark, setCurrentBookmark] = useState<BookmarkData | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isShuffled, setIsShuffled] = useState(false)
  const [isLooped, setIsLooped] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showAIGenerator, setShowAIGenerator] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [sortBy, setSortBy] = useState<string>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [aiPrompt, setAiPrompt] = useState('')
  const [newPlaybook, setNewPlaybook] = useState({
    name: '',
    description: '',
    isPublic: false,
    isCollaborative: false,
    category: '',
    tags: [] as string[]
  })

  // Load playbooks on component mount
  useEffect(() => {
    loadPlaybooks()
  }, [selectedCategory, sortBy, sortOrder, searchQuery])

  // Load playbook bookmarks when selected playbook changes
  useEffect(() => {
    if (selectedPlaybook) {
      loadPlaybookBookmarks(selectedPlaybook.id)
    }
  }, [selectedPlaybook])

  const loadPlaybooks = async () => {
    try {
      setIsLoading(true)
      const filters = {
        user_id: MOCK_USER_ID,
        include_public: true,
        include_collaborative: true,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        search: searchQuery || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        limit: 50
      }

      const data = await playbookService.getPlaybooks(filters)
      setPlaybooks(data)
      
      // Auto-select first playbook if none selected
      if (!selectedPlaybook && data.length > 0) {
        setSelectedPlaybook(data[0])
      }
    } catch (error) {
      console.error('Error loading playbooks:', error)
      toast.error('Failed to load playbooks')
    } finally {
      setIsLoading(false)
    }
  }

  const loadPlaybookBookmarks = async (playbookId: string) => {
    try {
      const bookmarks = await playbookService.getPlaybookBookmarks(playbookId, MOCK_USER_ID)
      // Update the selected playbook with fresh bookmark data
      setSelectedPlaybook(prev => prev ? { ...prev, bookmarks } : null)
    } catch (error) {
      console.error('Error loading playbook bookmarks:', error)
      toast.error('Failed to load playbook bookmarks')
    }
  }

  const filteredPlaybooks = useMemo(() => {
    if (!Array.isArray(playbooks) || isLoading) return []
    
    return playbooks.filter(playbook => {
      if (!playbook || typeof playbook !== 'object') return false
      
      // Category filter
      if (selectedCategory !== 'All' && playbook.category !== selectedCategory) {
        return false
      }
      
      // Search filter
      if (searchQuery && searchQuery.trim()) {
        const searchLower = searchQuery.toLowerCase()
        const name = typeof playbook.name === 'string' ? playbook.name : ''
        const description = typeof playbook.description === 'string' ? playbook.description : ''
        const tags = Array.isArray(playbook.tags) ? playbook.tags : []
        
        return (
          name.toLowerCase().includes(searchLower) ||
          description.toLowerCase().includes(searchLower) ||
          tags.some(tag => typeof tag === 'string' && tag.toLowerCase().includes(searchLower))
        )
      }
      
      return true
    })
  }, [playbooks, selectedCategory, searchQuery, isLoading])

  const totalDuration = selectedPlaybook?.bookmarks?.reduce((acc, bookmark) => acc + (bookmark.duration || 0), 0) || 0

  const handlePlayPause = async () => {
    if (!selectedPlaybook) return

    setIsPlaying(!isPlaying)
    
    if (!currentBookmark && selectedPlaybook.bookmarks?.length) {
      setCurrentBookmark(selectedPlaybook.bookmarks[0])
    }

    // Record play analytics
    if (!isPlaying) {
      await playbookService.recordPlay(selectedPlaybook.id, MOCK_USER_ID, {
        session_id: `session_${Date.now()}`,
        bookmark_count: selectedPlaybook.bookmarks?.length || 0
      })
    }
  }

  const handleNext = () => {
    if (!selectedPlaybook || !currentBookmark || !selectedPlaybook.bookmarks?.length) return
    
    const currentIndex = selectedPlaybook.bookmarks.findIndex(b => b.id === currentBookmark.id)
    const nextIndex = isShuffled 
      ? Math.floor(Math.random() * selectedPlaybook.bookmarks.length)
      : (currentIndex + 1) % selectedPlaybook.bookmarks.length
    
    setCurrentBookmark(selectedPlaybook.bookmarks[nextIndex])
  }

  const handlePrevious = () => {
    if (!selectedPlaybook || !currentBookmark || !selectedPlaybook.bookmarks?.length) return
    
    const currentIndex = selectedPlaybook.bookmarks.findIndex(b => b.id === currentBookmark.id)
    const prevIndex = currentIndex === 0 
      ? selectedPlaybook.bookmarks.length - 1 
      : currentIndex - 1
    
    setCurrentBookmark(selectedPlaybook.bookmarks[prevIndex])
  }

  const handleCreatePlaybook = async () => {
    if (!newPlaybook.name.trim()) {
      toast.error('Please enter a playbook name')
      return
    }

    try {
      setIsCreating(true)
      const playbook = await playbookService.createPlaybook({
        user_id: MOCK_USER_ID,
        name: newPlaybook.name,
        description: newPlaybook.description,
        is_public: newPlaybook.isPublic,
        is_collaborative: newPlaybook.isCollaborative,
        category: newPlaybook.category,
        tags: newPlaybook.tags
      })
    
      setPlaybooks(prev => [playbook, ...prev])
      setSelectedPlaybook(playbook)
    setShowCreateDialog(false)
    setNewPlaybook({
      name: '',
      description: '',
      isPublic: false,
      isCollaborative: false,
        category: '',
      tags: []
    })
    } catch (error) {
      console.error('Error creating playbook:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter a prompt for AI generation')
      return
    }

    try {
      setIsGeneratingAI(true)
      const playbook = await playbookService.generateAIPlaybook(MOCK_USER_ID, aiPrompt)
      
      setPlaybooks(prev => [playbook, ...prev])
      setSelectedPlaybook(playbook)
      setShowAIGenerator(false)
      setAiPrompt('')
    } catch (error) {
      console.error('Error generating AI playbook:', error)
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const handleLikePlaybook = async (playbook: PlaybookData) => {
    try {
      if (playbook.isLiked) {
        await playbookService.unlikePlaybook(playbook.id, MOCK_USER_ID)
      } else {
        await playbookService.likePlaybook(playbook.id, MOCK_USER_ID)
      }
      
      // Update local state
      setPlaybooks(prev => prev.map(p => 
        p.id === playbook.id 
          ? { ...p, isLiked: !p.isLiked, likes: p.likes + (p.isLiked ? -1 : 1) }
          : p
      ))
      
      if (selectedPlaybook?.id === playbook.id) {
        setSelectedPlaybook(prev => prev ? { ...prev, isLiked: !prev.isLiked, likes: prev.likes + (prev.isLiked ? -1 : 1) } : null)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const handleDeletePlaybook = async (playbook: PlaybookData) => {
    if (!confirm('Are you sure you want to delete this playbook?')) return

    try {
      await playbookService.deletePlaybook(playbook.id, MOCK_USER_ID)
      
      setPlaybooks(prev => prev.filter(p => p.id !== playbook.id))
      
      if (selectedPlaybook?.id === playbook.id) {
        const remainingPlaybooks = playbooks.filter(p => p.id !== playbook.id)
        setSelectedPlaybook(remainingPlaybooks[0] || null)
      }
    } catch (error) {
      console.error('Error deleting playbook:', error)
    }
  }

  const PlaybookSidebar = () => (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Music className="h-5 w-5 mr-2" />
            Playbooks
          </CardTitle>
          <div className="flex items-center space-x-1">
            <Button size="sm" variant="ghost" onClick={() => setShowAIGenerator(true)}>
              <Sparkles className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search playbooks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          </div>
          <div className="flex space-x-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                <SelectItem value="Frontend">Frontend</SelectItem>
                <SelectItem value="Backend">Backend</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="AI/ML">AI/ML</SelectItem>
                <SelectItem value="DevOps">DevOps</SelectItem>
              </SelectContent>
            </Select>
            <Select value={`${sortBy}_${sortOrder}`} onValueChange={(value) => {
              const [field, order] = value.split('_')
              setSortBy(field)
              setSortOrder(order as 'asc' | 'desc')
            }}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at_desc">Newest First</SelectItem>
                <SelectItem value="created_at_asc">Oldest First</SelectItem>
                <SelectItem value="name_asc">Name A-Z</SelectItem>
                <SelectItem value="name_desc">Name Z-A</SelectItem>
                <SelectItem value="plays_desc">Most Played</SelectItem>
                <SelectItem value="likes_desc">Most Liked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex space-x-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            ))
          ) : filteredPlaybooks.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Music className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No playbooks found</p>
              <p className="text-sm">Create your first playbook to get started</p>
            </div>
          ) : (
            filteredPlaybooks.map(playbook => (
            <div
              key={playbook.id}
              className={`p-3 cursor-pointer hover:bg-gray-50 border-l-4 transition-colors ${
                selectedPlaybook?.id === playbook.id ? 'bg-blue-50 border-l-blue-500' : 'border-l-transparent'
              }`}
              onClick={() => setSelectedPlaybook(playbook)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{playbook.name}</h4>
                  <p className="text-xs text-gray-600 truncate">{playbook.description}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {playbook.bookmarks?.length || 0} items
                    </Badge>
                      {playbook.category && (
                        <Badge variant="outline" className="text-xs">
                          {playbook.category}
                        </Badge>
                      )}
                    {playbook.isPublic && <Globe className="h-3 w-3 text-gray-400" />}
                    {playbook.isCollaborative && <Users className="h-3 w-3 text-gray-400" />}
                    {!playbook.isPublic && <Lock className="h-3 w-3 text-gray-400" />}
                  </div>
                    <div className="flex items-center space-x-3 mt-2">
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Eye className="h-3 w-3" />
                  <span>{playbook.plays}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLikePlaybook(playbook)
                        }}
                        className={`flex items-center space-x-1 text-xs ${
                          playbook.isLiked ? 'text-red-500' : 'text-gray-500'
                        }`}
                      >
                        <Heart className={`h-3 w-3 ${playbook.isLiked ? 'fill-current' : ''}`} />
                        <span>{playbook.likes}</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {playbook.owner.id === MOCK_USER_ID && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeletePlaybook(playbook)
                        }}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )

  const PlaybookPlayer = () => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={handlePrevious}>
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button onClick={handlePlayPause} disabled={!selectedPlaybook?.bookmarks?.length}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleNext}>
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>
            
            {currentBookmark && (
              <div className="flex items-center space-x-3">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={`https://www.google.com/s2/favicons?domain=${new URL(currentBookmark.url).hostname}&sz=32`} />
                  <AvatarFallback>{currentBookmark.title[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium text-sm">{currentBookmark.title}</h4>
                  <p className="text-xs text-gray-600">{currentBookmark.duration}min read</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsShuffled(!isShuffled)}
              className={isShuffled ? 'text-blue-500' : ''}
            >
              <Shuffle className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsLooped(!isLooped)}
              className={isLooped ? 'text-blue-500' : ''}
            >
              <Repeat className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Playbooks</h2>
          <p className="text-gray-600">Spotify for your bookmarks</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setShowAIGenerator(true)}>
            <Sparkles className="h-4 w-4 mr-2" />
            AI Generate
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Playbook
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <PlaybookSidebar />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Player */}
          <PlaybookPlayer />

          {/* Current Playbook */}
          {selectedPlaybook && (
              <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {selectedPlaybook.thumbnail && (
                      <img 
                        src={selectedPlaybook.thumbnail} 
                        alt={selectedPlaybook.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <CardTitle className="text-xl">{selectedPlaybook.name}</CardTitle>
                      <p className="text-gray-600 mt-1">{selectedPlaybook.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={selectedPlaybook.owner.avatar} />
                            <AvatarFallback>{selectedPlaybook.owner.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-600">{selectedPlaybook.owner.name}</span>
                        </div>
                        <Badge variant="secondary">
                          {selectedPlaybook.bookmarks?.length || 0} bookmarks
                        </Badge>
                        <Badge variant="outline">
                          {totalDuration} min total
                          </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLikePlaybook(selectedPlaybook)}
                      className={selectedPlaybook.isLiked ? 'text-red-500' : ''}
                    >
                      <Heart className={`h-4 w-4 ${selectedPlaybook.isLiked ? 'fill-current' : ''}`} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                  </div>
                </CardHeader>
                <CardContent>
                {selectedPlaybook.bookmarks?.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <List className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No bookmarks in this playbook yet</p>
                    <p className="text-sm">Add some bookmarks to get started</p>
                  </div>
                ) : (
                    <div className="space-y-2">
                      {selectedPlaybook.bookmarks?.map((bookmark, index) => (
                        <div
                          key={bookmark.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                          currentBookmark?.id === bookmark.id ? 'bg-blue-50 border border-blue-200' : ''
                          }`}
                          onClick={() => setCurrentBookmark(bookmark)}
                        >
                        <div className="flex items-center space-x-3 flex-1">
                          <span className="text-sm text-gray-400 w-6">{index + 1}</span>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}&sz=32`} />
                            <AvatarFallback>{bookmark.title[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{bookmark.title}</h4>
                            <p className="text-xs text-gray-600 truncate">{bookmark.description}</p>
                          </div>
                          </div>
                        <div className="flex items-center space-x-2">
                          {bookmark.duration && (
                            <Badge variant="secondary" className="text-xs">
                              {bookmark.duration}min
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(bookmark.url, '_blank')
                            }}
                          >
                            <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create Playbook Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Playbook</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter playbook name"
                value={newPlaybook.name}
                onChange={(e) => setNewPlaybook(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter playbook description"
                value={newPlaybook.description}
                onChange={(e) => setNewPlaybook(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={newPlaybook.category} onValueChange={(value) => setNewPlaybook(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Frontend">Frontend</SelectItem>
                  <SelectItem value="Backend">Backend</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="AI/ML">AI/ML</SelectItem>
                  <SelectItem value="DevOps">DevOps</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isPublic"
                checked={newPlaybook.isPublic}
                onCheckedChange={(checked) => setNewPlaybook(prev => ({ ...prev, isPublic: checked }))}
              />
              <Label htmlFor="isPublic">Make public</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isCollaborative"
                checked={newPlaybook.isCollaborative}
                onCheckedChange={(checked) => setNewPlaybook(prev => ({ ...prev, isCollaborative: checked }))}
              />
              <Label htmlFor="isCollaborative">Allow collaboration</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePlaybook} disabled={isCreating}>
                {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Playbook
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Generator Dialog */}
      <Dialog open={showAIGenerator} onOpenChange={setShowAIGenerator}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>AI Playbook Generator</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="aiPrompt">What would you like to learn about?</Label>
              <Textarea
                id="aiPrompt"
                placeholder="e.g., React best practices, Python data science, UI/UX design principles..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAIGenerator(false)}>
                Cancel
              </Button>
              <Button onClick={handleAIGenerate} disabled={isGeneratingAI}>
                {isGeneratingAI && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Generate Playbook
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 