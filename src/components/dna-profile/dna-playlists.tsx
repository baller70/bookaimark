'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
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
  Filter,
  Share,
  Download,
  Edit,
  Trash2,
  Copy,
  Users,
  Lock,
  Globe,
  Heart,
  Star,
  Clock,
  List,
  Music,
  Sparkles,
  ExternalLink,
  MoreHorizontal,
  GripVertical,
  FolderOpen,
  User,
  Calendar,
  Eye
} from 'lucide-react'
import { toast } from 'sonner'

interface Bookmark {
  id: string
  title: string
  url: string
  description: string
  favicon: string
  tags: string[]
  dateAdded: Date
  duration?: number // estimated reading time in minutes
}

interface Playlist {
  id: string
  name: string
  description: string
  bookmarks: Bookmark[]
  isPublic: boolean
  isCollaborative: boolean
  owner: {
    id: string
    name: string
    avatar: string
  }
  collaborators: Array<{
    id: string
    name: string
    avatar: string
  }>
  tags: string[]
  createdAt: Date
  updatedAt: Date
  plays: number
  likes: number
  isLiked: boolean
  thumbnail?: string
}

const mockBookmarks: Bookmark[] = [
  {
    id: '1',
    title: 'React Best Practices',
    url: 'https://react.dev/learn',
    description: 'Learn React fundamentals and best practices',
    favicon: '/react-icon.png',
    tags: ['React', 'Tutorial'],
    dateAdded: new Date('2024-01-15'),
    duration: 15
  },
  {
    id: '2',
    title: 'TypeScript Deep Dive',
    url: 'https://typescript.org',
    description: 'Advanced TypeScript concepts and patterns',
    favicon: '/ts-icon.png',
    tags: ['TypeScript', 'Advanced'],
    dateAdded: new Date('2024-01-16'),
    duration: 25
  }
]

const mockPlaylists: Playlist[] = [
  {
    id: '1',
    name: 'Frontend Mastery',
    description: 'Essential resources for becoming a frontend expert',
    bookmarks: mockBookmarks,
    isPublic: true,
    isCollaborative: false,
    owner: {
      id: '1',
      name: 'John Doe',
      avatar: '/avatars/john.png'
    },
    collaborators: [],
    tags: ['Frontend', 'React', 'JavaScript'],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-20'),
    plays: 245,
    likes: 32,
    isLiked: true,
    thumbnail: '/thumbnails/frontend.png'
  },
  {
    id: '2',
    name: 'Design System Resources',
    description: 'Curated collection of design system examples and tools',
    bookmarks: [],
    isPublic: false,
    isCollaborative: true,
    owner: {
      id: '1',
      name: 'John Doe',
      avatar: '/avatars/john.png'
    },
    collaborators: [
      {
        id: '2',
        name: 'Jane Smith',
        avatar: '/avatars/jane.png'
      }
    ],
    tags: ['Design', 'UI/UX', 'Systems'],
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-18'),
    plays: 89,
    likes: 15,
    isLiked: false
  }
]

export default function DnaPlaylists() {
  const [playlists, setPlaylists] = useState<Playlist[]>(mockPlaylists)
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(playlists[0])
  const [currentBookmark, setCurrentBookmark] = useState<Bookmark | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isShuffled, setIsShuffled] = useState(false)
  const [isLooped, setIsLooped] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showAIGenerator, setShowAIGenerator] = useState(false)
  const [newPlaylist, setNewPlaylist] = useState({
    name: '',
    description: '',
    isPublic: false,
    isCollaborative: false,
    tags: [] as string[]
  })

  const filteredPlaylists = playlists.filter(playlist =>
    playlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    playlist.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    playlist.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const totalDuration = selectedPlaylist?.bookmarks.reduce((acc, bookmark) => acc + (bookmark.duration || 0), 0) || 0

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    if (!currentBookmark && selectedPlaylist?.bookmarks.length) {
      setCurrentBookmark(selectedPlaylist.bookmarks[0])
    }
  }

  const handleNext = () => {
    if (!selectedPlaylist || !currentBookmark) return
    
    const currentIndex = selectedPlaylist.bookmarks.findIndex(b => b.id === currentBookmark.id)
    const nextIndex = isShuffled 
      ? Math.floor(Math.random() * selectedPlaylist.bookmarks.length)
      : (currentIndex + 1) % selectedPlaylist.bookmarks.length
    
    setCurrentBookmark(selectedPlaylist.bookmarks[nextIndex])
  }

  const handlePrevious = () => {
    if (!selectedPlaylist || !currentBookmark) return
    
    const currentIndex = selectedPlaylist.bookmarks.findIndex(b => b.id === currentBookmark.id)
    const prevIndex = currentIndex === 0 
      ? selectedPlaylist.bookmarks.length - 1 
      : currentIndex - 1
    
    setCurrentBookmark(selectedPlaylist.bookmarks[prevIndex])
  }

  const handleCreatePlaylist = () => {
    const playlist: Playlist = {
      id: Date.now().toString(),
      ...newPlaylist,
      bookmarks: [],
      owner: {
        id: '1',
        name: 'John Doe',
        avatar: '/avatars/john.png'
      },
      collaborators: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      plays: 0,
      likes: 0,
      isLiked: false
    }
    
    setPlaylists(prev => [...prev, playlist])
    setShowCreateDialog(false)
    setNewPlaylist({
      name: '',
      description: '',
      isPublic: false,
      isCollaborative: false,
      tags: []
    })
    toast.success('Playlist created successfully!')
  }

  const handleAIGenerate = () => {
    toast.loading('AI is generating your playlist...')
    setTimeout(() => {
      const aiPlaylist: Playlist = {
        id: Date.now().toString(),
        name: 'AI-Generated: Web Development Essentials',
        description: 'Curated by AI based on your interests and learning patterns',
        bookmarks: mockBookmarks,
        isPublic: false,
        isCollaborative: false,
        owner: {
          id: '1',
          name: 'John Doe',
          avatar: '/avatars/john.png'
        },
        collaborators: [],
        tags: ['AI-Generated', 'Web Development', 'Learning'],
        createdAt: new Date(),
        updatedAt: new Date(),
        plays: 0,
        likes: 0,
        isLiked: false
      }
      
      setPlaylists(prev => [...prev, aiPlaylist])
      setShowAIGenerator(false)
      toast.success('AI playlist generated successfully!')
    }, 2000)
  }

  const PlaylistSidebar = () => (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Music className="h-5 w-5 mr-2" />
            Playlists
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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search playlists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1">
          {filteredPlaylists.map(playlist => (
            <div
              key={playlist.id}
              className={`p-3 cursor-pointer hover:bg-gray-50 border-l-4 transition-colors ${
                selectedPlaylist?.id === playlist.id ? 'bg-blue-50 border-l-blue-500' : 'border-l-transparent'
              }`}
              onClick={() => setSelectedPlaylist(playlist)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{playlist.name}</h4>
                  <p className="text-xs text-gray-600 truncate">{playlist.description}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {playlist.bookmarks.length} items
                    </Badge>
                    {playlist.isPublic && <Globe className="h-3 w-3 text-gray-400" />}
                    {playlist.isCollaborative && <Users className="h-3 w-3 text-gray-400" />}
                    {!playlist.isPublic && <Lock className="h-3 w-3 text-gray-400" />}
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Eye className="h-3 w-3" />
                  <span>{playlist.plays}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  const PlaylistPlayer = () => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={handlePrevious}>
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button onClick={handlePlayPause}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleNext}>
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>
            
            {currentBookmark && (
              <div className="flex items-center space-x-3">
                <img src={currentBookmark.favicon} alt="" className="w-6 h-6" />
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
          <h2 className="text-2xl font-bold">Playlists</h2>
          <p className="text-gray-600">Spotify for your bookmarks</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setShowAIGenerator(true)}>
            <Sparkles className="h-4 w-4 mr-2" />
            AI Generate
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Playlist
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <PlaylistSidebar />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {selectedPlaylist ? (
            <>
              {/* Playlist Header */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-6">
                    <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Music className="h-12 w-12 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="secondary">Playlist</Badge>
                        {selectedPlaylist.isPublic && <Badge variant="outline">Public</Badge>}
                        {selectedPlaylist.isCollaborative && <Badge variant="outline">Collaborative</Badge>}
                      </div>
                      <h1 className="text-3xl font-bold mb-2">{selectedPlaylist.name}</h1>
                      <p className="text-gray-600 mb-4">{selectedPlaylist.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={selectedPlaylist.owner.avatar} />
                            <AvatarFallback>{selectedPlaylist.owner.name[0]}</AvatarFallback>
                          </Avatar>
                          <span>{selectedPlaylist.owner.name}</span>
                        </div>
                        <span>•</span>
                        <span>{selectedPlaylist.bookmarks.length} bookmarks</span>
                        <span>•</span>
                        <span>{totalDuration}min total</span>
                        <span>•</span>
                        <span>{selectedPlaylist.plays} plays</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-4">
                        {selectedPlaylist.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button onClick={handlePlayPause}>
                        {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                        {isPlaying ? 'Pause' : 'Play'}
                      </Button>
                      <Button variant="outline">
                        <Heart className={`h-4 w-4 mr-2 ${selectedPlaylist.isLiked ? 'fill-current text-red-500' : ''}`} />
                        {selectedPlaylist.likes}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bookmarks List */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Bookmarks</CardTitle>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Bookmark
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedPlaylist.bookmarks.length > 0 ? (
                    <div className="space-y-2">
                      {selectedPlaylist.bookmarks.map((bookmark, index) => (
                        <div
                          key={bookmark.id}
                          className={`flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                            currentBookmark?.id === bookmark.id ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => setCurrentBookmark(bookmark)}
                        >
                          <div className="flex items-center space-x-3">
                            <GripVertical className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-500 w-6">{index + 1}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setCurrentBookmark(bookmark)
                                setIsPlaying(true)
                              }}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <img src={bookmark.favicon} alt="" className="w-6 h-6" />
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{bookmark.title}</h4>
                            <p className="text-xs text-gray-600 truncate">{bookmark.description}</p>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{bookmark.duration}min</span>
                            <span>{bookmark.dateAdded.toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <List className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No bookmarks yet</h3>
                      <p className="text-gray-600 mb-4">Start adding bookmarks to this playlist</p>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Bookmark
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a playlist</h3>
                <p className="text-gray-600">Choose a playlist from the sidebar to get started</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Player */}
      {currentBookmark && <PlaylistPlayer />}

      {/* Create Playlist Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Playlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Name</label>
              <Input
                placeholder="My awesome playlist"
                value={newPlaylist.name}
                onChange={(e) => setNewPlaylist(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                placeholder="Describe your playlist..."
                value={newPlaylist.description}
                onChange={(e) => setNewPlaylist(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Public playlist</label>
              <Switch
                checked={newPlaylist.isPublic}
                onCheckedChange={(checked) => setNewPlaylist(prev => ({ ...prev, isPublic: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Allow collaboration</label>
              <Switch
                checked={newPlaylist.isCollaborative}
                onCheckedChange={(checked) => setNewPlaylist(prev => ({ ...prev, isCollaborative: checked }))}
              />
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePlaylist} disabled={!newPlaylist.name.trim()}>
                Create Playlist
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Generator Dialog */}
      <Dialog open={showAIGenerator} onOpenChange={setShowAIGenerator}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-purple-500" />
              AI Playlist Generator
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Let AI create a personalized playlist based on your interests and browsing patterns.
            </p>
            <div>
              <label className="text-sm font-medium mb-2 block">Topic or Theme</label>
              <Input placeholder="e.g., Web Development, Design, AI/ML" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Playlist Length</label>
              <Select defaultValue="medium">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short (5-10 items)</SelectItem>
                  <SelectItem value="medium">Medium (10-20 items)</SelectItem>
                  <SelectItem value="long">Long (20+ items)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowAIGenerator(false)}>
                Cancel
              </Button>
              <Button onClick={handleAIGenerate}>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 