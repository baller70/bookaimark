'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  Grid3X3, 
  List, 
  LayoutGrid, 
  Clock,
  Heart,
  ExternalLink,
  Edit,
  Edit2,
  Star,
  Eye,
  TrendingUp,
  Bookmark,
  Tag,
  Share2,
  Download,
  X,
  Calendar,
  Globe,
  Trash2,
  Copy,
  Activity,
  Folder,
  Target,
  Kanban,
  GitBranch,
  Camera,
  GripVertical,
  Check,
  Bell,
  Timer,
  Image,
  Upload,
  ImageIcon,
  Play,
  Pause,
  MessageSquare
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { NotificationTab } from '@/src/features/notifications'
import { TimerTab } from '@/src/features/pomodoro'
import { MediaHub } from '@/src/features/media'

export default function Dashboard() {
  const [viewMode, setViewMode] = useState('grid')
  const [showAddBookmark, setShowAddBookmark] = useState(false)
  const [selectedBookmarks, setSelectedBookmarks] = useState<number[]>([])
  const [selectedBookmark, setSelectedBookmark] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [chartTimePeriod, setChartTimePeriod] = useState('3months')
  const [newBookmark, setNewBookmark] = useState({
    title: '',
    url: '',
    description: '',
    tags: '',
    category: 'Development',
    priority: 'medium',
    notes: '',
    circularImage: ''
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState<string>('')
  const [notification, setNotification] = useState<string | null>(null)

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Exact bookmark data from the reference website - now as state for drag and drop
  const [bookmarks, setBookmarks] = useState([
    {
      id: 1,
      title: "GitHub",
      url: "https://github.com",
      description: "Development platform for version control and collaboration",
      category: "Development",
      tags: ["code", "git", "collaboration", "open-source"],
      priority: "high",
      isFavorite: true,
      visits: 45,
      lastVisited: "2024-01-15",
      dateAdded: "2024-01-10",
      favicon: "G",
      screenshot: "/placeholder.svg?height=200&width=300",
      circularImage: "/placeholder.svg?height=120&width=120",
      notes: "Main repository hosting platform for all projects. Contains personal and work repositories.",
      timeSpent: "2h 30m",
      weeklyVisits: 45,
      siteHealth: "excellent"
    },
    {
      id: 2,
      title: "Figma",
      url: "https://figma.com",
      description: "Collaborative design tool for UI/UX",
      category: "Design",
      tags: ["design", "ui", "collaboration", "prototyping"],
      priority: "high",
      isFavorite: true,
      visits: 32,
      lastVisited: "2024-01-14",
      dateAdded: "2024-01-08",
      favicon: "F",
      screenshot: "/placeholder.svg?height=200&width=300",
      circularImage: "/placeholder.svg?height=120&width=120",
      notes: "Primary design tool for all UI/UX projects. Team collaboration workspace.",
      timeSpent: "1h 45m",
      weeklyVisits: 32,
      siteHealth: "good"
    },
    {
      id: 3,
      title: "Stack Overflow",
      url: "https://stackoverflow.com",
      description: "Q&A platform for developers",
      category: "Development",
      tags: ["help", "programming", "community", "q&a"],
      priority: "medium",
      isFavorite: false,
      visits: 28,
      lastVisited: "2024-01-16",
      dateAdded: "2024-01-05",
      favicon: "S",
      screenshot: "/placeholder.svg?height=200&width=300",
      circularImage: "/placeholder.svg?height=120&width=120",
      notes: "Go-to resource for coding questions and solutions. Great community support.",
      timeSpent: "3h 15m",
      weeklyVisits: 28,
      siteHealth: "good"
    },
    {
      id: 4,
      title: "Notion",
      url: "https://notion.so",
      description: "All-in-one workspace for notes and collaboration",
      category: "Productivity",
      tags: ["notes", "workspace", "organization", "collaboration"],
      priority: "high",
      isFavorite: true,
      visits: 67,
      lastVisited: "2024-01-13",
      dateAdded: "2024-01-12",
      favicon: "N",
      screenshot: "/placeholder.svg?height=200&width=300",
      circularImage: "/placeholder.svg?height=120&width=120",
      notes: "Main workspace for project management, documentation, and team collaboration.",
      timeSpent: "4h 20m",
      weeklyVisits: 67,
      siteHealth: "excellent"
    },
    {
      id: 5,
      title: "Dribbble",
      url: "https://dribbble.com",
      description: "Design inspiration and portfolio platform",
      category: "Design",
      tags: ["inspiration", "portfolio", "design", "creative"],
      priority: "low",
      isFavorite: false,
      visits: 15,
      lastVisited: "2024-01-11",
      dateAdded: "2024-01-09",
      favicon: "D",
      screenshot: "/placeholder.svg?height=200&width=300",
      circularImage: "/placeholder.svg?height=120&width=120",
      notes: "Source of design inspiration and trends. Follow top designers for ideas.",
      timeSpent: "45m",
      weeklyVisits: 15,
      siteHealth: "good"
    },
    {
      id: 6,
      title: "Linear",
      url: "https://linear.app",
      description: "Issue tracking and project management",
      category: "Productivity",
      tags: ["project", "tracking", "management", "agile"],
      priority: "medium",
      isFavorite: false,
      visits: 23,
      lastVisited: "2024-01-10",
      dateAdded: "2024-01-06",
      favicon: "L",
      screenshot: "/placeholder.svg?height=200&width=300",
      circularImage: "/placeholder.svg?height=120&width=120",
      notes: "Issue tracking for development projects. Clean interface and fast performance.",
      timeSpent: "1h 30m",
      weeklyVisits: 23,
      siteHealth: "good"
    }
  ])

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bookmark.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bookmark.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || bookmark.category.toLowerCase() === selectedCategory.toLowerCase()
    
    return matchesSearch && matchesCategory
  })

  const handleAddBookmark = () => {
    // Validate required fields
    if (!newBookmark.title.trim()) {
      alert('Please enter a bookmark title');
      return;
    }
    
    if (!newBookmark.url.trim()) {
      alert('Please enter a bookmark URL');
      return;
    }
    
    // Validate URL format
    try {
      new URL(newBookmark.url);
    } catch {
      alert('Please enter a valid URL (e.g., https://example.com)');
      return;
    }
    
    // Create new bookmark object
    const bookmark = {
      id: bookmarks.length + 1,
      title: newBookmark.title,
      url: newBookmark.url,
      description: newBookmark.description || 'No description provided',
      category: newBookmark.category,
      tags: newBookmark.tags ? newBookmark.tags.split(',').map(tag => tag.trim()) : [],
      priority: newBookmark.priority,
      isFavorite: false,
      visits: 0,
      lastVisited: new Date().toLocaleDateString(),
      dateAdded: new Date().toLocaleDateString(),
      favicon: newBookmark.title.charAt(0).toUpperCase(), // Use first letter as fallback
      screenshot: "/placeholder.svg?height=200&width=300",
      circularImage: newBookmark.circularImage || "/placeholder.svg?height=120&width=120",
      notes: newBookmark.notes || 'No notes added',
      timeSpent: '0m',
      weeklyVisits: 0,
      siteHealth: 'good'
    }
    
    // Add bookmark to the array
    setBookmarks(prev => [...prev, bookmark])
    
    console.log('Bookmark added successfully:', bookmark)
    setShowAddBookmark(false)
    resetAddBookmarkForm()
  }

  const resetAddBookmarkForm = () => {
    setNewBookmark({
      title: '',
      url: '',
      description: '',
      tags: '',
      category: 'Development',
      priority: 'medium',
      notes: '',
      circularImage: ''
    })
  }

  const handleBookmarkSelect = (bookmarkId: number) => {
    setSelectedBookmarks(prev => 
      prev.includes(bookmarkId) 
        ? prev.filter(id => id !== bookmarkId)
        : [...prev, bookmarkId]
    )
  }

  const handleBookmarkClick = (bookmark: any) => {
    setSelectedBookmark(bookmark)
    setIsModalOpen(true)
  }

  const startEditing = (field: string, currentValue: string | string[]) => {
    setEditingField(field)
    if (field === 'tags' && Array.isArray(currentValue)) {
      setEditingValue(currentValue.join(', '))
    } else {
      setEditingValue(currentValue as string)
    }
  }

  const cancelEditing = () => {
    setEditingField(null)
    setEditingValue('')
  }

  const saveEdit = () => {
    if (!selectedBookmark || !editingField) return

    let newValue: string | string[] = editingValue
    if (editingField === 'tags') {
      newValue = editingValue.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    }

    // Update the bookmark in the bookmarks array
    setBookmarks(prev => prev.map(bookmark => 
      bookmark.id === selectedBookmark.id 
        ? { ...bookmark, [editingField]: newValue }
        : bookmark
    ))

    // Update the selected bookmark for immediate UI update
    setSelectedBookmark(prev => prev ? { ...prev, [editingField]: newValue } : prev)

    setEditingField(null)
    setEditingValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      saveEdit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancelEditing()
    }
  }

  const toggleFavorite = () => {
    if (!selectedBookmark) return

    const newFavoriteStatus = !selectedBookmark.isFavorite

    // Update the bookmark in the bookmarks array
    setBookmarks(prev => prev.map(bookmark => 
      bookmark.id === selectedBookmark.id 
        ? { ...bookmark, isFavorite: newFavoriteStatus }
        : bookmark
    ))

    // Update the selected bookmark for immediate UI update
    setSelectedBookmark(prev => prev ? { ...prev, isFavorite: newFavoriteStatus } : prev)

    showNotification(newFavoriteStatus ? 'Added to favorites!' : 'Removed from favorites!')
  }

  const shareBookmark = async () => {
    if (!selectedBookmark) return

    const shareData = {
      title: selectedBookmark.title,
      text: selectedBookmark.description,
      url: selectedBookmark.url,
    }

    try {
      // Try to use Web Share API if available
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(`${selectedBookmark.title}\n${selectedBookmark.description}\n${selectedBookmark.url}`)
        showNotification('Bookmark details copied to clipboard!')
      }
    } catch (error) {
      console.error('Error sharing:', error)
      // Fallback to copying URL only
      try {
        await navigator.clipboard.writeText(selectedBookmark.url)
        showNotification('Bookmark URL copied to clipboard!')
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError)
        showNotification('Unable to share or copy bookmark')
      }
    }
  }

  const copyBookmarkUrl = async () => {
    if (!selectedBookmark) return

    try {
      await navigator.clipboard.writeText(selectedBookmark.url)
      showNotification('Bookmark URL copied to clipboard!')
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = selectedBookmark.url
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        showNotification('Bookmark URL copied to clipboard!')
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError)
        showNotification('Unable to copy URL to clipboard')
      }
      document.body.removeChild(textArea)
    }
  }

  const visitSite = () => {
    if (!selectedBookmark) return
    window.open(selectedBookmark.url, '_blank', 'noopener,noreferrer')
  }

  const showNotification = (message: string) => {
    setNotification(message)
    setTimeout(() => setNotification(null), 3000)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id && over?.id) {
      setBookmarks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        if (oldIndex !== -1 && newIndex !== -1) {
          return arrayMove(items, oldIndex, newIndex)
        }
        return items
      })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getSiteHealthColor = (health: string) => {
    switch (health) {
      case 'excellent':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200'
      case 'good':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200'
      case 'fair':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  // Calculate total visits across all bookmarks for percentage calculation
  const totalVisits = bookmarks.reduce((sum, bookmark) => sum + bookmark.visits, 0)

  // Calculate usage percentage for a bookmark
  const getUsagePercentage = (visits: number) => {
    if (totalVisits === 0) return 0
    return Math.round((visits / totalVisits) * 100)
  }

  // Hexagon component for displaying usage percentage
  const UsageHexagon = ({ percentage }: { percentage: number }) => (
    <div className="absolute bottom-2 right-2 flex items-center justify-center">
      <svg width="65" height="57" viewBox="0 0 65 57" className="drop-shadow-sm">
        {/* Hexagon shape */}
        <path
          d="M32.5 4 L52 14.5 L52 37.5 L32.5 48 L13 37.5 L13 14.5 Z"
          fill="#b3ab69"
          stroke="#b3ab69"
          strokeWidth="1"
        />
        {/* Percentage text */}
        <text
          x="32.5"
          y="28.5"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize="16"
          fontWeight="bold"
        >
          {percentage}%
        </text>
      </svg>
    </div>
  )

  // Action icons component for top right corner
  const BookmarkActionIcons = ({ bookmark }: { bookmark: any }) => (
    <TooltipProvider>
      <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                // Toggle favorite for this specific bookmark
                const newFavoriteStatus = !bookmark.isFavorite
                setBookmarks(prev => prev.map(b => 
                  b.id === bookmark.id 
                    ? { ...b, isFavorite: newFavoriteStatus }
                    : b
                ))
                showNotification(newFavoriteStatus ? 'Added to favorites!' : 'Removed from favorites!')
              }}
            >
              <Heart className={`h-4 w-4 ${bookmark.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{bookmark.isFavorite ? 'Remove from favorites' : 'Add to favorites'}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                // Open bookmark details modal
                setSelectedBookmark(bookmark)
                setIsModalOpen(true)
              }}
            >
              <Eye className="h-4 w-4 text-gray-400 hover:text-blue-500" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>View details</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                // Copy bookmark URL
                navigator.clipboard.writeText(bookmark.url).then(() => {
                  showNotification('Bookmark URL copied to clipboard!')
                }).catch(() => {
                  showNotification('Failed to copy URL')
                })
              }}
            >
              <Edit className="h-4 w-4 text-gray-400 hover:text-green-500" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Copy URL</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                // Share bookmark
                const shareData = {
                  title: bookmark.title,
                  text: bookmark.description,
                  url: bookmark.url,
                }
                if (navigator.share) {
                  navigator.share(shareData).catch(console.error)
                } else {
                  navigator.clipboard.writeText(`${bookmark.title}\n${bookmark.url}`).then(() => {
                    showNotification('Bookmark details copied to clipboard!')
                  }).catch(() => {
                    showNotification('Failed to share bookmark')
                  })
                }
              }}
            >
              <Edit2 className="h-4 w-4 text-gray-400 hover:text-green-500" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share bookmark</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                // Delete bookmark with confirmation
                if (confirm(`Are you sure you want to delete "${bookmark.title}"?`)) {
                  setBookmarks(prev => prev.filter(b => b.id !== bookmark.id))
                  showNotification('Bookmark deleted successfully!')
                }
              }}
            >
              <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete bookmark</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )

  const SortableGridBookmarkCard = ({ bookmark }: { bookmark: any }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: bookmark.id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 1000 : 1,
    }

    return (
      <div ref={setNodeRef} style={style} {...attributes} className="relative group">
        {/* Drag Handle - Bottom Center */}
        <div 
          {...listeners} 
          className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20 p-1.5 rounded-md bg-white/90 hover:bg-white shadow-md border border-gray-300/50 cursor-grab active:cursor-grabbing opacity-60 hover:opacity-100 transition-all duration-200 hover:scale-105"
        >
          <GripVertical className="h-4 w-4 text-gray-700" />
        </div>
        <GridBookmarkCard bookmark={bookmark} />
      </div>
    )
  }

  const GridBookmarkCard = ({ bookmark }: { bookmark: any }) => (
    <Card 
      className="group hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 cursor-pointer bg-gradient-to-br from-white via-gray-50/30 to-white border border-gray-300 hover:border-blue-600 backdrop-blur-sm relative overflow-hidden"
      onClick={() => handleBookmarkClick(bookmark)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 via-transparent to-purple-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardContent className="p-6 relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-700 font-bold text-xl ring-2 ring-blue-100/50 group-hover:ring-blue-200 transition-all duration-300 shadow-sm">
              {bookmark.favicon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 truncate font-audiowide uppercase text-lg group-hover:text-blue-900 transition-colors duration-300">{bookmark.title}</h3>
              <p className="text-sm text-blue-600 hover:underline truncate font-medium mt-1">{bookmark.url}</p>
            </div>
          </div>
        </div>
        
        <div className="mb-4 flex justify-center">
          <div className="relative">
            <img 
              src={bookmark.circularImage || "/placeholder.svg?height=120&width=120"} 
              alt={`${bookmark.title} image`}
              className="w-24 h-24 object-cover rounded-full bg-gradient-to-br from-gray-100 to-gray-50 ring-2 ring-gray-200/50 group-hover:ring-blue-300/60 transition-all duration-300 shadow-md group-hover:shadow-lg"
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent via-transparent to-black/5 group-hover:to-blue-500/10 transition-all duration-300"></div>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">{bookmark.description}</p>

        <div className="flex items-center justify-between mb-4">
          <Badge className={`text-xs border shadow-sm ${getPriorityColor(bookmark.priority)}`}>
            {bookmark.priority}
          </Badge>
          <Badge variant="secondary" className="text-xs bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border border-gray-200/50 hover:from-blue-50 hover:to-blue-100 hover:text-blue-700 transition-all duration-300">
            {bookmark.category}
          </Badge>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100/80">
          <div className="flex items-center space-x-2 bg-gray-50/80 rounded-full px-3 py-1.5">
            <Eye className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600 font-medium">{bookmark.visits} VISITS</span>
          </div>
          <ExternalLink className="h-5 w-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:text-blue-600" />
        </div>
      </CardContent>
      
      {/* Action Icons */}
      <BookmarkActionIcons bookmark={bookmark} />
      
      {/* Usage Percentage Hexagon */}
      <UsageHexagon percentage={getUsagePercentage(bookmark.visits)} />
    </Card>
  )

  const SortableCompactBookmarkCard = ({ bookmark }: { bookmark: any }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: bookmark.id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 1000 : 1,
    }

    return (
      <div ref={setNodeRef} style={style} {...attributes} className="relative group">
        {/* Drag Handle - Bottom Center */}
        <div 
          {...listeners} 
          className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20 p-1.5 rounded-md bg-white/90 hover:bg-white shadow-md border border-gray-300/50 cursor-grab active:cursor-grabbing opacity-60 hover:opacity-100 transition-all duration-200 hover:scale-105"
        >
          <GripVertical className="h-4 w-4 text-gray-700" />
        </div>
        <CompactBookmarkCard bookmark={bookmark} />
      </div>
    )
  }

  const CompactBookmarkCard = ({ bookmark }: { bookmark: any }) => (
    <Card 
      className="group hover:shadow-xl hover:shadow-blue-500/15 transition-all duration-400 cursor-pointer bg-gradient-to-br from-white via-gray-50/20 to-white border border-gray-300 hover:border-blue-600 backdrop-blur-sm relative overflow-hidden"
      onClick={() => handleBookmarkClick(bookmark)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/2 via-transparent to-purple-500/2 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
      <CardContent className="p-4 relative z-10">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-700 font-bold ring-2 ring-blue-100/50 group-hover:ring-blue-200 transition-all duration-300 shadow-sm">
            {bookmark.favicon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 truncate font-audiowide uppercase group-hover:text-blue-900 transition-colors duration-300">{bookmark.title}</h3>
            </div>
            <p className="text-xs text-blue-600 truncate font-medium mt-1">{bookmark.url}</p>
            <div className="flex items-center space-x-3 mt-2">
              <Badge className={`text-xs border shadow-sm ${getPriorityColor(bookmark.priority)}`}>
                {bookmark.priority}
              </Badge>
              <div className="flex items-center space-x-1 bg-gray-50/80 rounded-full px-2 py-1">
                <Eye className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-gray-600 font-medium">{bookmark.visits} VISITS</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      {/* Action Icons */}
      <BookmarkActionIcons bookmark={bookmark} />
      
      {/* Usage Percentage Hexagon */}
      <UsageHexagon percentage={getUsagePercentage(bookmark.visits)} />
    </Card>
  )

  const SortableListBookmarkCard = ({ bookmark }: { bookmark: any }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: bookmark.id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 1000 : 1,
    }

    return (
      <div ref={setNodeRef} style={style} {...attributes} className="relative group">
        {/* Drag Handle - Bottom Center */}
        <div 
          {...listeners} 
          className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20 p-1.5 rounded-md bg-white/90 hover:bg-white shadow-md border border-gray-300/50 cursor-grab active:cursor-grabbing opacity-60 hover:opacity-100 transition-all duration-200 hover:scale-105"
        >
          <GripVertical className="h-4 w-4 text-gray-700" />
        </div>
        <ListBookmarkCard bookmark={bookmark} />
      </div>
    )
  }

  const ListBookmarkCard = ({ bookmark }: { bookmark: any }) => (
    <Card 
      className="group hover:shadow-xl hover:shadow-blue-500/15 transition-all duration-400 cursor-pointer bg-gradient-to-br from-white via-gray-50/20 to-white border border-gray-300 hover:border-blue-600 backdrop-blur-sm relative overflow-hidden"
      onClick={() => handleBookmarkClick(bookmark)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/2 via-transparent to-purple-500/2 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
      <CardContent className="p-6 relative z-10">
        <div className="flex items-start space-x-5">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-700 font-bold text-xl ring-2 ring-blue-100/50 group-hover:ring-blue-200 transition-all duration-300 shadow-sm">
            {bookmark.favicon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-4">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-gray-900 font-audiowide uppercase text-lg group-hover:text-blue-900 transition-colors duration-300">{bookmark.title}</h3>
                </div>
                <p className="text-sm text-blue-600 hover:underline font-medium mt-1">{bookmark.url}</p>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{bookmark.description}</p>
              </div>
              <div className="flex flex-col items-end space-y-3">
                <Badge className={`text-xs border shadow-sm ${getPriorityColor(bookmark.priority)}`}>
                  {bookmark.priority}
                </Badge>
                <Badge variant="secondary" className="text-xs bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border border-gray-200/50 hover:from-blue-50 hover:to-blue-100 hover:text-blue-700 transition-all duration-300">
                  {bookmark.category}
                </Badge>
                <div className="flex items-center space-x-2 bg-gray-50/80 rounded-full px-3 py-1.5">
                  <Eye className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600 font-medium">{bookmark.visits} VISITS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      {/* Action Icons */}
      <BookmarkActionIcons bookmark={bookmark} />
      
      {/* Usage Percentage Hexagon */}
      <UsageHexagon percentage={getUsagePercentage(bookmark.visits)} />
    </Card>
  )

  const SortableTimelineBookmarkCard = ({ bookmark }: { bookmark: any }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: bookmark.id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 1000 : 1,
    }

    return (
      <div ref={setNodeRef} style={style} {...attributes} className="relative group">
        {/* Drag Handle - Bottom Center */}
        <div 
          {...listeners} 
          className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20 p-1.5 rounded-md bg-white/90 hover:bg-white shadow-md border border-gray-300/50 cursor-grab active:cursor-grabbing opacity-60 hover:opacity-100 transition-all duration-200 hover:scale-105"
        >
          <GripVertical className="h-4 w-4 text-gray-700" />
        </div>
        <TimelineBookmarkCard bookmark={bookmark} />
      </div>
    )
  }

  const TimelineBookmarkCard = ({ bookmark }: { bookmark: any }) => (
    <div className="relative pl-10">
      <div className="absolute left-0 top-0 w-3 h-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full ring-4 ring-blue-100 shadow-sm"></div>
      <div className="absolute left-1.5 top-3 w-0.5 h-full bg-gradient-to-b from-blue-200 to-gray-200"></div>
      <Card 
        className="group hover:shadow-xl hover:shadow-blue-500/15 transition-all duration-400 cursor-pointer bg-gradient-to-br from-white via-gray-50/20 to-white border border-gray-300 hover:border-blue-600 backdrop-blur-sm ml-6 relative overflow-hidden"
        onClick={() => handleBookmarkClick(bookmark)}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/2 via-transparent to-purple-500/2 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
        <CardContent className="p-5 relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-700 font-bold ring-2 ring-blue-100/50 group-hover:ring-blue-200 transition-all duration-300 shadow-sm">
                {bookmark.favicon}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 font-audiowide uppercase group-hover:text-blue-900 transition-colors duration-300">{bookmark.title}</h3>
                <p className="text-xs text-gray-500 font-medium mt-1 bg-gray-50/80 rounded-full px-2 py-1">Added {bookmark.dateAdded}</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-3 leading-relaxed">{bookmark.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Badge className={`text-xs border shadow-sm ${getPriorityColor(bookmark.priority)}`}>
                {bookmark.priority}
              </Badge>
              <Badge variant="secondary" className="text-xs bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border border-gray-200/50 hover:from-blue-50 hover:to-blue-100 hover:text-blue-700 transition-all duration-300">
                {bookmark.category}
              </Badge>
            </div>
            <div className="flex items-center space-x-2 bg-gray-50/80 rounded-full px-3 py-1">
              <Eye className="h-3 w-3 text-gray-500" />
              <span className="text-xs text-gray-600 font-medium">{bookmark.visits} VISITS</span>
            </div>
          </div>
        </CardContent>
        
        {/* Action Icons */}
        <BookmarkActionIcons bookmark={bookmark} />
        
        {/* Usage Percentage Hexagon */}
        <UsageHexagon percentage={getUsagePercentage(bookmark.visits)} />
      </Card>
    </div>
  )

  const SortableHierarchyCard = ({ bookmark }: { bookmark: any }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: bookmark.id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 1000 : 1,
    }

    return (
      <div ref={setNodeRef} style={style} {...attributes} className="relative group">
        {/* Drag Handle - Bottom Center */}
        <div 
          {...listeners} 
          className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20 p-1.5 rounded-md bg-white/90 hover:bg-white shadow-md border border-gray-300/50 cursor-grab active:cursor-grabbing opacity-60 hover:opacity-100 transition-all duration-200 hover:scale-105"
        >
          <GripVertical className="h-4 w-4 text-gray-700" />
        </div>
        <div className="flex items-center space-x-5 p-4 hover:bg-gradient-to-r hover:from-gray-50/80 hover:to-blue-50/30 rounded-xl cursor-pointer relative transition-all duration-300 border border-gray-300 hover:border-blue-600" onClick={() => handleBookmarkClick(bookmark)}>
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 border-l-3 border-b-3 border-gray-400 group-hover:border-blue-400 transition-colors duration-300"></div>
            <div className="h-10 w-10 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl flex items-center justify-center ring-2 ring-gray-100/50 group-hover:ring-blue-200 transition-all duration-300 shadow-sm">
              <span className="text-sm font-bold text-gray-700">{bookmark.favicon}</span>
            </div>
          </div>
          <div className="flex-1">
            <h4 className="font-bold font-audiowide uppercase text-gray-900 group-hover:text-blue-900 transition-colors duration-300">{bookmark.title}</h4>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">{bookmark.description}</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className={`text-xs shadow-sm bg-white/50 border-gray-300/50 hover:bg-blue-50/50 hover:border-blue-300/50 transition-all duration-300 ${getPriorityColor(bookmark.priority)}`}>
              {bookmark.priority}
            </Badge>
            <div className="flex items-center space-x-2 bg-gray-50/80 rounded-full px-3 py-1.5">
              <Eye className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 font-medium">{bookmark.visits} VISITS</span>
            </div>
          </div>
          
          {/* Action Icons */}
          <BookmarkActionIcons bookmark={bookmark} />
          
          {/* Usage Percentage Hexagon */}
          <UsageHexagon percentage={getUsagePercentage(bookmark.visits)} />
        </div>
      </div>
    )
  }

  const SortableKanbanCard = ({ bookmark }: { bookmark: any }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: bookmark.id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 1000 : 1,
    }

    return (
      <div ref={setNodeRef} style={style} {...attributes} className="relative group">
        {/* Drag Handle - Bottom Center */}
        <div 
          {...listeners} 
          className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20 p-1.5 rounded-md bg-white/90 hover:bg-white shadow-md border border-gray-300/50 cursor-grab active:cursor-grabbing opacity-60 hover:opacity-100 transition-all duration-200 hover:scale-105"
        >
          <GripVertical className="h-4 w-4 text-gray-700" />
        </div>
        <Card className="p-4 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-400 cursor-pointer bg-gradient-to-br from-white via-gray-50/20 to-white border border-gray-300 hover:border-blue-600 backdrop-blur-sm relative overflow-hidden" onClick={() => handleBookmarkClick(bookmark)}>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/2 via-transparent to-purple-500/2 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
          <div className="relative z-10">
            <h4 className="font-bold text-sm mb-2 font-audiowide uppercase text-gray-900 hover:text-blue-900 transition-colors duration-300">{bookmark.title}</h4>
            <p className="text-xs text-gray-600 mb-3 leading-relaxed">{bookmark.description}</p>
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border border-gray-200/50 hover:from-blue-50 hover:to-blue-100 hover:text-blue-700 transition-all duration-300">{bookmark.priority}</Badge>
              <div className="flex items-center space-x-1 bg-gray-50/80 rounded-full px-2 py-1">
                <Eye className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-gray-600 font-medium">{bookmark.visits} VISITS</span>
              </div>
            </div>
          </div>
          
          {/* Action Icons */}
          <BookmarkActionIcons bookmark={bookmark} />
          
          {/* Usage Percentage Hexagon */}
          <UsageHexagon percentage={getUsagePercentage(bookmark.visits)} />
        </Card>
      </div>
    )
  }

  const SortableGoalsCard = ({ bookmark }: { bookmark: any }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: bookmark.id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 1000 : 1,
    }

    return (
      <div ref={setNodeRef} style={style} {...attributes} className="relative group">
        {/* Drag Handle - Bottom Center */}
        <div 
          {...listeners} 
          className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20 p-1.5 rounded-md bg-white/90 hover:bg-white shadow-md border border-gray-300/50 cursor-grab active:cursor-grabbing opacity-60 hover:opacity-100 transition-all duration-200 hover:scale-105"
        >
          <GripVertical className="h-4 w-4 text-gray-700" />
        </div>
        <Card className="p-8 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-500 cursor-pointer bg-gradient-to-br from-white via-green-50/10 to-white border border-gray-300 hover:border-blue-600 backdrop-blur-sm relative overflow-hidden" onClick={() => handleBookmarkClick(bookmark)}>
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/3 via-transparent to-blue-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-start space-x-5 relative z-10">
            <div className="h-14 w-14 bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center ring-2 ring-green-100/50 hover:ring-green-200 transition-all duration-300 shadow-sm">
              <Target className="h-7 w-7 text-green-700" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-xl mb-3 font-audiowide uppercase text-gray-900 hover:text-green-900 transition-colors duration-300">{bookmark.title}</h3>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">{bookmark.description}</p>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs bg-white/50 border-gray-300/50 hover:bg-green-50/50 hover:border-green-300/50 transition-all duration-300">{bookmark.category}</Badge>
                <div className="flex items-center space-x-2 bg-gray-50/80 rounded-full px-3 py-1.5">
                  <Eye className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-gray-600 font-medium">{bookmark.visits} VISITS</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Icons */}
          <BookmarkActionIcons bookmark={bookmark} />
          
          {/* Usage Percentage Hexagon */}
          <UsageHexagon percentage={getUsagePercentage(bookmark.visits)} />
        </Card>
      </div>
    )
  }

  const SortableFolderCard = ({ bookmark }: { bookmark: any }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: bookmark.id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 1000 : 1,
    }

    return (
      <div ref={setNodeRef} style={style} {...attributes} className="relative group">
        {/* Drag Handle - Bottom Center */}
        <div 
          {...listeners} 
          className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20 p-1.5 rounded-md bg-white/90 hover:bg-white shadow-md border border-gray-300/50 cursor-grab active:cursor-grabbing opacity-60 hover:opacity-100 transition-all duration-200 hover:scale-105"
        >
          <GripVertical className="h-4 w-4 text-gray-700" />
        </div>
        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer relative border border-gray-300 hover:border-blue-600" onClick={() => handleBookmarkClick(bookmark)}>
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Folder className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate font-audiowide uppercase">{bookmark.title}</h3>
              <p className="text-xs text-gray-500 truncate">{bookmark.category}</p>
            </div>
          </div>
          
          {/* Action Icons */}
          <BookmarkActionIcons bookmark={bookmark} />
          
          {/* Usage Percentage Hexagon */}
          <UsageHexagon percentage={getUsagePercentage(bookmark.visits)} />
        </Card>
      </div>
    )
  }

  const renderBookmarks = () => {
    const bookmarkIds = filteredBookmarks.map(bookmark => bookmark.id)
    
    switch (viewMode) {
      case 'compact':
        return (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={bookmarkIds} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredBookmarks.map((bookmark) => (
                  <SortableCompactBookmarkCard key={bookmark.id} bookmark={bookmark} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )
      case 'list':
        return (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={bookmarkIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {filteredBookmarks.map((bookmark) => (
                  <SortableListBookmarkCard key={bookmark.id} bookmark={bookmark} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )
      case 'timeline':
        return (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={bookmarkIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-6">
                {filteredBookmarks.map((bookmark) => (
                  <SortableTimelineBookmarkCard key={bookmark.id} bookmark={bookmark} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )
      case 'folder':
        return (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={bookmarkIds} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredBookmarks.map((bookmark) => (
                  <SortableFolderCard key={bookmark.id} bookmark={bookmark} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )
      case 'goals':
        return (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={bookmarkIds} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBookmarks.map((bookmark) => (
                  <SortableGoalsCard key={bookmark.id} bookmark={bookmark} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )
      case 'kanban':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {['Development', 'Design', 'Productivity'].map((category) => {
              const categoryBookmarks = filteredBookmarks.filter((bookmark) => bookmark.category === category)
              const categoryBookmarkIds = categoryBookmarks.map(bookmark => bookmark.id)
              
              return (
                <div key={category} className="bg-gradient-to-br from-gray-50 via-white to-gray-50/50 rounded-xl p-6 ring-1 ring-gray-200/50 shadow-sm">
                  <h3 className="font-bold text-xl mb-6 flex items-center text-gray-900">
                    <Kanban className="h-6 w-6 mr-3 text-gray-700" />
                    {category}
                  </h3>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext items={categoryBookmarkIds} strategy={verticalListSortingStrategy}>
                      <div className="space-y-4">
                        {categoryBookmarks.map((bookmark) => (
                          <SortableKanbanCard key={bookmark.id} bookmark={bookmark} />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              )
            })}
          </div>
        )
      case 'hierarchy':
        return (
          <div className="space-y-8">
            {['Development', 'Design', 'Productivity'].map((category) => {
              const categoryBookmarks = filteredBookmarks.filter((bookmark) => bookmark.category === category)
              const categoryBookmarkIds = categoryBookmarks.map(bookmark => bookmark.id)
              
              return (
                <div key={category} className="border border-gray-200/60 rounded-xl p-8 bg-gradient-to-br from-white via-gray-50/20 to-white shadow-sm hover:shadow-lg transition-all duration-300">
                  <h3 className="font-bold text-2xl mb-6 flex items-center text-gray-900">
                    <GitBranch className="h-7 w-7 mr-4 text-gray-700" />
                    {category}
                  </h3>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext items={categoryBookmarkIds} strategy={verticalListSortingStrategy}>
                      <div className="ml-11 space-y-4">
                        {categoryBookmarks.map((bookmark, index) => (
                          <SortableHierarchyCard key={bookmark.id} bookmark={bookmark} />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              )
            })}
          </div>
        )
      default: // grid
        return (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={bookmarkIds} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBookmarks.map((bookmark) => (
                  <SortableGridBookmarkCard key={bookmark.id} bookmark={bookmark} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )
    }
  }

  const totalBookmarks = bookmarks.length
  const favorites = bookmarks.filter(bookmark => bookmark.isFavorite).length

  // Chart data for different time periods
  const chartData = {
    '3months': {
      title: 'Total for the last 3 months',
      labels: ['Apr 1', 'Apr 7', 'Apr 13', 'Apr 19', 'Apr 26', 'May 2', 'May 8', 'May 14', 'May 21', 'May 28', 'Jun 3', 'Jun 9', 'Jun 15', 'Jun 21', 'Jun 29'],
      path: 'M 20 160 C 60 140, 100 150, 140 130 C 180 110, 220 120, 260 100 C 300 80, 340 90, 380 70 C 420 50, 460 60, 500 40 C 540 20, 580 30, 620 25 C 660 20, 700 30, 740 35 C 760 37, 780 40, 780 40',
      areaPath: 'M 20 160 C 60 140, 100 150, 140 130 C 180 110, 220 120, 260 100 C 300 80, 340 90, 380 70 C 420 50, 460 60, 500 40 C 540 20, 580 30, 620 25 C 660 20, 700 30, 740 35 C 760 37, 780 40, 780 40 L 780 180 L 20 180 Z'
    },
    '30days': {
      title: 'Total for the last 30 days',
      labels: ['Jun 1', 'Jun 3', 'Jun 5', 'Jun 7', 'Jun 9', 'Jun 11', 'Jun 13', 'Jun 15', 'Jun 17', 'Jun 19', 'Jun 21', 'Jun 23', 'Jun 25', 'Jun 27', 'Jun 29'],
      path: 'M 20 170 C 60 160, 100 165, 140 150 C 180 135, 220 140, 260 125 C 300 110, 340 115, 380 100 C 420 85, 460 90, 500 75 C 540 60, 580 65, 620 50 C 660 35, 700 40, 740 25 C 760 20, 780 22, 780 22',
      areaPath: 'M 20 170 C 60 160, 100 165, 140 150 C 180 135, 220 140, 260 125 C 300 110, 340 115, 380 100 C 420 85, 460 90, 500 75 C 540 60, 580 65, 620 50 C 660 35, 700 40, 740 25 C 760 20, 780 22, 780 22 L 780 180 L 20 180 Z'
    },
    '7days': {
      title: 'Total for the last 7 days',
      labels: ['Jun 23', 'Jun 24', 'Jun 25', 'Jun 26', 'Jun 27', 'Jun 28', 'Jun 29'],
      path: 'M 120 180 C 200 165, 280 170, 360 155 C 440 140, 520 145, 600 130 C 680 115, 680 115, 680 115',
      areaPath: 'M 120 180 C 200 165, 280 170, 360 155 C 440 140, 520 145, 600 130 C 680 115, 680 115, 680 115 L 680 180 L 120 180 Z'
    }
  }

  const currentChartData = chartData[chartTimePeriod as keyof typeof chartData]

  return (
    <div className="min-h-screen">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">BOOKMARKHUB</h1>
              <p className="text-gray-600 mt-1">Your Digital Workspace</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search bookmarks..."
                  className="pl-10 w-64 border-gray-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40 border-gray-200">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="productivity">Productivity</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={() => setShowAddBookmark(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                ADD BOOKMARK
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Learning Card - Spans 2 columns - Exact copy from screenshot */}
            <Card className="md:col-span-2 relative overflow-hidden bg-gradient-to-br from-white via-blue-50/10 to-white border border-gray-200/60 hover:border-blue-300/50 shadow-lg hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500">
              <CardContent className="p-8 relative">
                {/* Decorative elements scattered around */}
                <div className="absolute top-4 left-8">
                  <div className="w-2 h-2 bg-blue-500 rotate-45"></div>
                </div>
                <div className="absolute top-12 left-1/3">
                  <div className="w-2 h-2 bg-blue-600 rotate-45"></div>
                </div>
                <div className="absolute top-6 right-16">
                  <div className="w-2 h-2 bg-orange-500 rotate-45"></div>
                </div>
                <div className="absolute top-20 right-8">
                  <div className="w-2 h-2 bg-teal-500 rotate-45"></div>
                </div>
                <div className="absolute top-32 right-1/4">
                  <div className="w-2 h-2 bg-blue-500 rotate-45"></div>
                </div>
                <div className="absolute bottom-20 left-12">
                  <div className="w-2 h-2 bg-teal-400 rotate-45"></div>
                </div>
                <div className="absolute bottom-12 left-1/3">
                  <div className="w-2 h-2 bg-blue-400 rotate-45"></div>
                </div>
                <div className="absolute bottom-8 right-12">
                  <div className="w-2 h-2 bg-red-500 rotate-45"></div>
                </div>
                <div className="absolute bottom-16 right-1/3">
                  <div className="w-2 h-2 bg-orange-400 rotate-45"></div>
                </div>
                <div className="absolute top-1/2 left-4">
                  <div className="w-2 h-2 bg-teal-500 rotate-45"></div>
                </div>
                <div className="absolute top-3/4 right-4">
                  <div className="w-2 h-2 bg-blue-600 rotate-45"></div>
                </div>

                <div className="flex items-center justify-between">
                  {/* Left content */}
                  <div className="flex-1 space-y-6">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Hi, Andrew <span className="inline-block">👋</span>
                      </h2>
                      <h3 className="text-2xl font-semibold text-gray-800 mb-4 leading-tight">
                        What Do You Want To Learn Today With<br />Your Partner?
                      </h3>
                      <p className="text-gray-600 text-lg leading-relaxed">
                        Discover Courses, Track Progress, And Achieve Your<br />Learning Goals Seamlessly.
                      </p>
                    </div>
                    
                    <Button className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-lg text-base font-medium">
                      EXPLORE COURSE
                    </Button>
                  </div>

                  {/* Right illustration */}
                  <div className="flex-shrink-0 ml-8">
                    <div className="relative w-48 h-40">
                      {/* Person illustration */}
                      <div className="absolute bottom-0 right-8">
                        {/* Books/Platform */}
                        <div className="w-32 h-8 bg-gray-800 rounded-full mb-2"></div>
                        <div className="w-28 h-6 bg-gray-300 rounded-full absolute bottom-0 right-2"></div>
                        
                        {/* Person figure */}
                        <div className="absolute bottom-8 right-6">
                          {/* Head */}
                          <div className="w-8 h-8 bg-gray-400 rounded-full mb-1 relative">
                            <div className="w-6 h-4 bg-gray-600 rounded-t-full absolute top-1 left-1"></div>
                          </div>
                          {/* Body */}
                          <div className="w-6 h-12 bg-gray-700 rounded-t-lg mx-1"></div>
                          {/* Arms */}
                          <div className="w-3 h-8 bg-pink-300 rounded absolute -left-2 top-8"></div>
                          <div className="w-3 h-8 bg-pink-300 rounded absolute -right-2 top-8"></div>
                          {/* Legs */}
                          <div className="w-2 h-8 bg-gray-800 absolute left-1 top-16"></div>
                          <div className="w-2 h-8 bg-gray-800 absolute right-1 top-16"></div>
                        </div>
                        
                        {/* Graduation cap */}
                        <div className="absolute -top-2 right-4">
                          <div className="w-6 h-6 bg-black transform rotate-12"></div>
                          <div className="w-1 h-3 bg-black absolute top-1 right-2"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bookmark Overview Card - Exact copy from screenshot */}
            <Card className="p-8 bg-gradient-to-br from-white via-gray-50/20 to-white border border-gray-200/60 hover:border-blue-300/50 shadow-lg hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500">
              <CardContent className="p-0">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">BOOKMARK OVERVIEW</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Here Are Some Year-Long Metrics You Could Surface In Your BookmarkHub Dashboard
                    </p>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Saved Bookmarks */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl font-bold text-gray-900">{totalBookmarks}</span>
                        <span className="text-sm text-gray-500">bookmarks</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-1">
                        <div className="bg-black h-3 rounded-full" style={{width: '85%'}}></div>
                      </div>
                      <span className="text-xs font-medium text-gray-700">SAVED BOOKMARKS</span>
                    </div>

                    {/* Favorite Bookmarks */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl font-bold text-gray-900">{favorites}</span>
                        <span className="text-sm text-gray-500">bookmarks</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-1">
                        <div className="bg-gray-500 h-3 rounded-full" style={{width: '60%'}}></div>
                      </div>
                      <span className="text-xs font-medium text-gray-700">FAVORITE BOOKMARKS</span>
                    </div>

                    {/* Clicks/Opens */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl font-bold text-gray-900">{totalVisits}</span>
                        <span className="text-sm text-gray-500">clicks</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-1">
                        <div className="bg-black h-3 rounded-full" style={{width: '75%'}}></div>
                      </div>
                      <span className="text-xs font-medium text-gray-700">CLICKS/OPENS</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Efficiency Card with Bigger Donut Chart */}
            <Card className="p-8 bg-gradient-to-br from-white via-gray-50/20 to-white border border-gray-200/60 hover:border-blue-300/50 shadow-lg hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500">
              <CardContent className="p-0">
                <div className="space-y-6">
                  {/* Header with date range and dropdown */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">January - June 2026</span>
                    <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">April</span>
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-2xl font-bold text-gray-900">PROJECT EFFICIENCY</h3>
                  
                  {/* Bigger Donut Chart */}
                  <div className="flex items-center justify-center pt-4">
                    <div className="relative w-64 h-64">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 256 256">
                        {/* Donut chart with multiple segments - bigger size */}
                        {/* Large dark gray segment (top-right) */}
                        <path
                          d="M 128 16 A 112 112 0 0 1 222.63 94 L 194.18 94 A 84 84 0 0 0 128 44 Z"
                          fill="#4b5563"
                        />
                        {/* Black segment (right) */}
                        <path
                          d="M 222.63 94 A 112 112 0 0 1 222.63 162 L 194.18 162 A 84 84 0 0 0 194.18 94 Z"
                          fill="#1f2937"
                        />
                        {/* Light gray segment (bottom-right) */}
                        <path
                          d="M 222.63 162 A 112 112 0 0 1 128 240 L 128 212 A 84 84 0 0 0 194.18 162 Z"
                          fill="#d1d5db"
                        />
                        {/* Medium gray segment (bottom-left) */}
                        <path
                          d="M 128 240 A 112 112 0 0 1 33.37 162 L 61.82 162 A 84 84 0 0 0 128 212 Z"
                          fill="#9ca3af"
                        />
                        {/* Dark segment (left) */}
                        <path
                          d="M 33.37 162 A 112 112 0 0 1 33.37 94 L 61.82 94 A 84 84 0 0 0 61.82 162 Z"
                          fill="#374151"
                        />
                        {/* Black segment (top-left) */}
                        <path
                          d="M 33.37 94 A 112 112 0 0 1 128 16 L 128 44 A 84 84 0 0 0 61.82 94 Z"
                          fill="#111827"
                        />
                        
                        {/* Small disconnected segment at bottom - bigger */}
                        <path
                          d="M 108 248 A 16 16 0 0 1 148 248 L 148 240 A 8 8 0 0 0 108 240 Z"
                          fill="#9ca3af"
                        />
                      </svg>
                      
                      {/* Center text */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-bold text-gray-900">173</span>
                        <span className="text-base text-gray-600">Visitors</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>


          </div>

          {/* Total Visitors Chart - Interactive with Proper Components */}
          <Card className="mb-8 bg-gradient-to-br from-white via-gray-50/20 to-white border border-gray-200/60 hover:border-blue-300/50 shadow-lg hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base font-medium">TOTAL VISITORS</CardTitle>
                <p className="text-sm text-muted-foreground">{currentChartData.title}</p>
              </div>
              <div className="flex items-center space-x-1">
                <Button 
                  variant={chartTimePeriod === '3months' ? 'outline' : 'ghost'} 
                  size="sm" 
                  className="h-7 gap-1 text-sm"
                  onClick={() => setChartTimePeriod('3months')}
                >
                  LAST 3 MONTHS
                </Button>
                <Button 
                  variant={chartTimePeriod === '30days' ? 'outline' : 'ghost'} 
                  size="sm" 
                  className="h-7 gap-1 text-sm"
                  onClick={() => setChartTimePeriod('30days')}
                >
                  LAST 30 DAYS
                </Button>
                <Button 
                  variant={chartTimePeriod === '7days' ? 'outline' : 'ghost'} 
                  size="sm" 
                  className="h-7 gap-1 text-sm"
                  onClick={() => setChartTimePeriod('7days')}
                >
                  LAST 7 DAYS
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="h-[200px] w-full">
                <svg className="h-full w-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid lines */}
                  <defs>
                    <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 20" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  
                  {/* Area fill - Dynamic based on selected time period */}
                  <path
                    d={currentChartData.areaPath}
                    fill="url(#areaGradient)"
                  />
                  
                  {/* Main line - Dynamic based on selected time period */}
                  <path
                    d={currentChartData.path}
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* X-axis labels INSIDE the chart area */}
                  <g className="text-xs" fill="hsl(var(--muted-foreground))">
                    {currentChartData.labels.map((label, index) => {
                      const x = 20 + (index * (760 / (currentChartData.labels.length - 1)))
                      return (
                        <text 
                          key={index} 
                          x={x} 
                          y="185" 
                          textAnchor="middle" 
                          fontSize="10"
                          fill="hsl(var(--muted-foreground))"
                        >
                          {label}
                        </text>
                      )
                    })}
                  </g>
                </svg>
              </div>
            </CardContent>
          </Card>

      {/* View Controls */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center bg-gradient-to-r from-white via-gray-50/30 to-white rounded-xl border border-gray-200/60 p-3 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
          <Button
            size="lg"
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            onClick={() => setViewMode('grid')}
            className="h-12 px-4 flex items-center space-x-2"
          >
            <Grid3X3 className="h-5 w-5" />
            <span className="font-medium">GRID</span>
          </Button>
          <Button
            size="lg"
            variant={viewMode === 'compact' ? 'default' : 'ghost'}
            onClick={() => setViewMode('compact')}
            className="h-12 px-4 flex items-center space-x-2"
          >
            <LayoutGrid className="h-5 w-5" />
            <span className="font-medium">COMPACT</span>
          </Button>
          <Button
            size="lg"
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            onClick={() => setViewMode('list')}
            className="h-12 px-4 flex items-center space-x-2"
          >
            <List className="h-5 w-5" />
            <span className="font-medium">LIST</span>
          </Button>
          <Button
            size="lg"
            variant={viewMode === 'timeline' ? 'default' : 'ghost'}
            onClick={() => setViewMode('timeline')}
            className="h-12 px-4 flex items-center space-x-2"
          >
            <Clock className="h-5 w-5" />
            <span className="font-medium">TIMELINE</span>
          </Button>
          <Button
            size="lg"
            variant={viewMode === 'folder' ? 'default' : 'ghost'}
            onClick={() => setViewMode('folder')}
            className="h-12 px-4 flex items-center space-x-2"
          >
            <Folder className="h-5 w-5" />
            <span className="font-medium">FOLDER</span>
          </Button>
          <Button
            size="lg"
            variant={viewMode === 'goals' ? 'default' : 'ghost'}
            onClick={() => setViewMode('goals')}
            className="h-12 px-4 flex items-center space-x-2"
          >
            <Target className="h-5 w-5" />
            <span className="font-medium">GOALS</span>
          </Button>
          <Button
            size="lg"
            variant={viewMode === 'kanban' ? 'default' : 'ghost'}
            onClick={() => setViewMode('kanban')}
            className="h-12 px-4 flex items-center space-x-2"
          >
            <Kanban className="h-5 w-5" />
            <span className="font-medium">KANBAN</span>
          </Button>
          <Button
            size="lg"
            variant={viewMode === 'hierarchy' ? 'default' : 'ghost'}
            onClick={() => setViewMode('hierarchy')}
            className="h-12 px-4 flex items-center space-x-2"
          >
            <GitBranch className="h-5 w-5" />
            <span className="font-medium">HIERARCHY</span>
          </Button>
        </div>
      </div>

      {/* Bookmarks */}
      {renderBookmarks()}

      {/* Bookmark Detail Modal - Exact copy from reference website */}
      <Dialog open={isModalOpen} onOpenChange={(open) => {
        setIsModalOpen(open)
        if (!open) {
          // Reset editing state when modal closes
          setEditingField(null)
          setEditingValue('')
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-gray-50/20 to-white border border-gray-200/60 shadow-2xl">
          {selectedBookmark && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={selectedBookmark.favicon} alt={selectedBookmark.title} />
                      <AvatarFallback>{selectedBookmark.title[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <DialogTitle className="text-2xl font-audiowide uppercase">{selectedBookmark.title}</DialogTitle>
                      <p className="text-base text-muted-foreground">{selectedBookmark.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={toggleFavorite}
                      className={selectedBookmark.isFavorite ? "border-red-300 bg-red-50" : ""}
                    >
                      <Heart className={`h-4 w-4 ${selectedBookmark.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500 hover:text-red-500'}`} />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={shareBookmark}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={copyBookmarkUrl}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm"
                      onClick={visitSite}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      VISIT SITE
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="overview" className="mt-6">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">OVERVIEW</TabsTrigger>
                  <TabsTrigger value="notification">NOTIFICATION</TabsTrigger>
                  <TabsTrigger value="timer">TIMER</TabsTrigger>
                  <TabsTrigger value="media">MEDIA</TabsTrigger>
                  <TabsTrigger value="comment">COMMENT</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <div className="relative">
                          <img
                            src={selectedBookmark.circularImage || "/placeholder.svg?height=120&width=120"}
                            alt={`${selectedBookmark.title} image`}
                            className="w-32 h-32 object-cover rounded-full bg-gradient-to-br from-gray-100 to-gray-50 ring-2 ring-gray-200/50 shadow-lg"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0 bg-white shadow-md"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) {
                                  // Validate file size (max 5MB)
                                  if (file.size > 5 * 1024 * 1024) {
                                    alert('File size must be less than 5MB');
                                    return;
                                  }
                                  
                                  // Validate file type
                                  if (!file.type.startsWith('image/')) {
                                    alert('Please select a valid image file');
                                    return;
                                  }
                                  
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    const imageDataUrl = event.target?.result as string;
                                    
                                    // Update the bookmark in the bookmarks array
                                    setBookmarks(prev => prev.map(bookmark => 
                                      bookmark.id === selectedBookmark.id 
                                        ? { ...bookmark, circularImage: imageDataUrl }
                                        : bookmark
                                    ));
                                    
                                    // Update the selected bookmark for immediate UI update
                                    setSelectedBookmark(prev => prev ? { ...prev, circularImage: imageDataUrl } : prev);
                                    
                                    console.log('Image updated successfully for bookmark:', selectedBookmark.id);
                                  };
                                  reader.onerror = () => {
                                    alert('Error reading file. Please try again.');
                                  };
                                  reader.readAsDataURL(file);
                                }
                              };
                              input.click();
                            }}
                          >
                            <Camera className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Click the camera icon to update image</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">DESCRIPTION</h3>
                          {editingField !== 'description' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditing('description', selectedBookmark.description)}
                              className="h-6 w-6 p-0 hover:bg-gray-100"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        {editingField === 'description' ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              onKeyDown={handleKeyDown}
                              className="min-h-[60px]"
                              placeholder="Enter description..."
                              autoFocus
                            />
                            <div className="flex space-x-2">
                              <Button size="sm" onClick={saveEdit} className="h-7">
                                <Check className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                              <Button variant="outline" size="sm" onClick={cancelEditing} className="h-7">
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">{selectedBookmark.description}</p>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">TAGS</h3>
                          {editingField !== 'tags' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditing('tags', selectedBookmark.tags)}
                              className="h-6 w-6 p-0 hover:bg-gray-100"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        {editingField === 'tags' ? (
                          <div className="space-y-2">
                            <Input
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              onKeyDown={handleKeyDown}
                              placeholder="Enter tags separated by commas..."
                              autoFocus
                            />
                            <div className="flex space-x-2">
                              <Button size="sm" onClick={saveEdit} className="h-7">
                                <Check className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                              <Button variant="outline" size="sm" onClick={cancelEditing} className="h-7">
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {selectedBookmark.tags.map((tag: string) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">NOTES</h3>
                          {editingField !== 'notes' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditing('notes', selectedBookmark.notes)}
                              className="h-6 w-6 p-0 hover:bg-gray-100"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        {editingField === 'notes' ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              onKeyDown={handleKeyDown}
                              className="min-h-[80px]"
                              placeholder="Enter notes..."
                              autoFocus
                            />
                            <div className="flex space-x-2">
                              <Button size="sm" onClick={saveEdit} className="h-7">
                                <Check className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                              <Button variant="outline" size="sm" onClick={cancelEditing} className="h-7">
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                            {selectedBookmark.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-white via-blue-50/20 to-white border border-gray-200/60 hover:border-blue-300/50 shadow-sm hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6 text-center">
                        <Eye className="h-7 w-7 mx-auto mb-3 text-blue-600" />
                        <p className="text-3xl font-bold text-gray-900">{selectedBookmark.visits}</p>
                        <p className="text-xs text-muted-foreground font-medium">TOTAL VISITS</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-white via-green-50/20 to-white border border-gray-200/60 hover:border-green-300/50 shadow-sm hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6 text-center">
                        <Clock className="h-7 w-7 mx-auto mb-3 text-green-600" />
                        <p className="text-3xl font-bold text-gray-900">{selectedBookmark.timeSpent}</p>
                        <p className="text-xs text-muted-foreground font-medium">TIME SPENT</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-white via-purple-50/20 to-white border border-gray-200/60 hover:border-purple-300/50 shadow-sm hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6 text-center">
                        <Activity className="h-7 w-7 mx-auto mb-3 text-purple-600" />
                        <p className="text-3xl font-bold text-gray-900">{selectedBookmark.weeklyVisits}</p>
                        <p className="text-xs text-muted-foreground font-medium">THIS WEEK</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-white via-gray-50/20 to-white border border-gray-200/60 hover:border-gray-300/50 shadow-sm hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6 text-center">
                        <Badge className={`${getSiteHealthColor(selectedBookmark.siteHealth)} border-transparent hover:bg-primary/80 shadow-sm`}>
                          {selectedBookmark.siteHealth}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-3 font-medium">SITE HEALTH</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* View Full Analytics Button */}
                  <div className="flex justify-center mt-6">
                    <Button className="px-8 py-3 bg-black hover:bg-gray-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      VIEW FULL ANALYTICS
                    </Button>
                  </div>

                  {/* Related Bookmarks Section */}
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">RELATED BOOKMARKS</h3>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center space-x-2 hover:bg-gray-50"
                        onClick={() => {
                          // Add functionality to add new related bookmark
                          showNotification('Add related bookmark functionality coming soon!')
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        <span>ADD RELATED</span>
                      </Button>
                    </div>

                    {/* Related Bookmarks Grid with Drag and Drop */}
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(event) => {
                        // Handle drag end for related bookmarks
                        const { active, over } = event
                        if (active.id !== over?.id) {
                          showNotification('Related bookmark reordered!')
                        }
                      }}
                    >
                      <SortableContext items={filteredBookmarks.slice(0, 4).map(b => `related-${b.id}`)} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {filteredBookmarks.slice(0, 4).map((bookmark) => (
                            <div key={`related-${bookmark.id}`} className="relative group">
                              {/* Drag Handle for Related Bookmarks */}
                              <div className="absolute top-2 left-2 z-20 p-1.5 rounded-md bg-white/90 hover:bg-white shadow-md border border-gray-300/50 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105">
                                <GripVertical className="h-4 w-4 text-gray-700" />
                              </div>
                              
                              <Card className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-300 hover:border-blue-400 bg-gradient-to-br from-white via-gray-50/20 to-white backdrop-blur-sm shadow-sm hover:shadow-blue-500/10">
                                <div className="flex items-start space-x-3">
                                  {/* Circular Image */}
                                  <div className="flex-shrink-0">
                                    <img
                                      src={bookmark.circularImage || "/placeholder.svg?height=40&width=40"}
                                      alt={`${bookmark.title} image`}
                                      className="w-10 h-10 object-cover rounded-full bg-gradient-to-br from-gray-100 to-gray-50 ring-1 ring-gray-200/50"
                                    />
                                  </div>
                                  
                                  {/* Content */}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm text-gray-900 truncate font-audiowide uppercase mb-1">
                                      {bookmark.title}
                                    </h4>
                                    <p className="text-xs text-gray-600 truncate mb-2">
                                      {bookmark.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                      <Badge variant="outline" className="text-xs bg-white/50 border-gray-300/50">
                                        {bookmark.category}
                                      </Badge>
                                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                                        <Eye className="h-3 w-3" />
                                        <span>{bookmark.visits}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Remove Button */}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      showNotification('Related bookmark removed!')
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </Card>
                            </div>
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>

                    {/* Add More Related Bookmarks */}
                    <div className="mt-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        onClick={() => {
                          showNotification('Browse all bookmarks to add more relations!')
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        BROWSE ALL BOOKMARKS TO ADD MORE
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="notification" className="space-y-6">
                  <NotificationTab 
                    bookmarkId={selectedBookmark.id.toString()} 
                    bookmarkTitle={selectedBookmark.title} 
                  />
                </TabsContent>

                <TabsContent value="timer" className="h-[600px]">
                  <TimerTab />
                </TabsContent>

                <TabsContent value="media" className="h-[600px]">
                  <MediaHub />
                </TabsContent>

                <TabsContent value="comment" className="space-y-6">
                  <div className="py-4">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">COMMENTS & NOTES</h3>
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        ADD COMMENT
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            A
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm">Andrew</span>
                              <span className="text-xs text-gray-500">2 hours ago</span>
                            </div>
                            <p className="text-sm text-gray-700">
                              This bookmark is really useful for my daily workflow. The interface is clean and easy to navigate.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            A
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm">Andrew</span>
                              <span className="text-xs text-gray-500">1 day ago</span>
                            </div>
                            <p className="text-sm text-gray-700">
                              Added this to my favorites. Will definitely be using this frequently for my projects.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 border-t pt-4">
                      <Textarea 
                        placeholder="Add a comment or note..."
                        className="mb-3"
                      />
                      <div className="flex justify-end">
                        <Button size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          POST COMMENT
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Bookmark Modal */}
      <Dialog open={showAddBookmark} onOpenChange={setShowAddBookmark}>
        <DialogContent className="max-w-md bg-gradient-to-br from-white via-gray-50/20 to-white border border-gray-200/60 shadow-2xl">
          <DialogHeader>
            <DialogTitle>ADD NEW BOOKMARK</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">TITLE</label>
              <Input
                placeholder="Enter Bookmark Title"
                value={newBookmark.title}
                onChange={(e) => setNewBookmark({ ...newBookmark, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">URL</label>
              <Input
                placeholder="https://example.com"
                value={newBookmark.url}
                onChange={(e) => setNewBookmark({ ...newBookmark, url: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">DESCRIPTION</label>
              <Textarea
                placeholder="Enter Description"
                value={newBookmark.description}
                onChange={(e) => setNewBookmark({ ...newBookmark, description: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">CATEGORY</label>
              <Select value={newBookmark.category} onValueChange={(value) => setNewBookmark({ ...newBookmark, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Development">Development</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Productivity">Productivity</SelectItem>
                  <SelectItem value="Learning">Learning</SelectItem>
                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">TAGS</label>
              <Input
                placeholder="Enter Tags Separated By Commas"
                value={newBookmark.tags}
                onChange={(e) => setNewBookmark({ ...newBookmark, tags: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">PRIORITY</label>
              <Select value={newBookmark.priority} onValueChange={(value) => setNewBookmark({ ...newBookmark, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">IMAGE</label>
              <div className="space-y-3">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Validate file size (max 5MB)
                      if (file.size > 5 * 1024 * 1024) {
                        alert('File size must be less than 5MB');
                        e.target.value = ''; // Clear the input
                        return;
                      }
                      
                      // Validate file type
                      if (!file.type.startsWith('image/')) {
                        alert('Please select a valid image file');
                        e.target.value = ''; // Clear the input
                        return;
                      }
                      
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setNewBookmark({ ...newBookmark, circularImage: event.target?.result as string });
                      };
                      reader.onerror = () => {
                        alert('Error reading file. Please try again.');
                        e.target.value = ''; // Clear the input
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {newBookmark.circularImage && (
                  <div className="flex items-center space-x-3">
                    <img
                      src={newBookmark.circularImage}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-full border-2 border-gray-200"
                    />
                    <div>
                      <p className="text-sm font-medium text-green-600">✓ Image uploaded successfully</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setNewBookmark({ ...newBookmark, circularImage: '' })}
                        className="mt-1 h-7 text-xs"
                      >
                        Remove Image
                      </Button>
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-500">Upload a circular image for this bookmark (optional - will auto-fetch from website if not provided). Max file size: 5MB</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">NOTES</label>
              <Textarea
                placeholder="Enter Any Notes"
                value={newBookmark.notes}
                onChange={(e) => setNewBookmark({ ...newBookmark, notes: e.target.value })}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddBookmark(false)}>
                CANCEL
              </Button>
              <Button onClick={handleAddBookmark}>
                ADD BOOKMARK
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-in slide-in-from-top-2 duration-300">
          {notification}
        </div>
      )}
        </div>
      </div>
    </div>
  )
} 