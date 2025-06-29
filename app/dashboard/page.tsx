'use client'

/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars, @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
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
  Folder as FolderIcon,
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
  MessageSquare,
  ArrowLeft,
  ChevronRight,
  BookmarkIcon as BookmarkIconLucide,
  Building,
  Columns
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
import { SimpleBoardCanvas } from '@/src/features/simpleBoard/SimpleBoardCanvas'
import { FolderHierarchyManager, FolderHierarchyAssignment } from '@/src/components/hierarchy/Hierarchy'
import { FolderOrgChartView } from '@/src/components/ui/folder-org-chart-view'
import { FolderCard, type BookmarkWithRelations } from '@/src/components/ui/FolderCard'
import { FolderFormDialog, type Folder } from '@/src/components/ui/FolderFormDialog'
import { KanbanView } from '@/src/components/ui/BookmarkKanban'

// Import React Flow components for custom background
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Custom Infinity Board Background Component (no nodes, just background)
const InfinityBoardBackground = () => {
  const [nodes] = useNodesState([]);
  const [edges] = useEdgesState([]);

  return (
    <ReactFlowProvider>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        attributionPosition="bottom-left"
        className="bg-gray-50"
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        zoomOnDoubleClick={true}
      >
        <Background gap={12} color="#e5e7eb" />
        <MiniMap position="bottom-left" />
        <Controls position="bottom-right" />
      </ReactFlow>
    </ReactFlowProvider>
  );
};

// HIERARCHY Infinity Board with Full Editing Capabilities - DEFINITIVE SOLUTION
const KHV1InfinityBoard = ({ folders, bookmarks, onCreateFolder, onAddBookmark, onOpenDetail }: {
  folders: any[];
  bookmarks: any[];
  onCreateFolder: () => void;
  onAddBookmark: () => void;
  onOpenDetail: (bookmark: any) => void;
}) => {
  const [transform, setTransform] = useState({ x: 0, y: 0, zoom: 1 });
  
  return (
    <div className="relative w-full min-h-screen overflow-auto">
      {/* Background Layer: React Flow for infinity board only */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <ReactFlowProvider>
          <ReactFlow
            nodes={[]}
            edges={[]}
            fitView
            attributionPosition="bottom-left"
            className="bg-gray-50"
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            panOnDrag={true}
            zoomOnScroll={true}
            zoomOnPinch={true}
            zoomOnDoubleClick={true}
            minZoom={0.1}
            maxZoom={4}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            onMove={(_, viewport) => {
              setTransform({
                x: viewport.x,
                y: viewport.y,
                zoom: viewport.zoom
              });
            }}
          >
            <Background gap={12} color="#e5e7eb" />
            <Controls position="bottom-right" />
            <MiniMap position="bottom-left" />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
      
      {/* Foreground Layer: Fully Interactive Components */}
      <div 
        className="relative w-full pointer-events-auto z-10"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
          transformOrigin: '0 0',
          transition: 'none', // Disable transitions for smooth interaction
          paddingTop: '40px',
          paddingLeft: '40px',
          paddingBottom: '40px',
          minHeight: 'calc(100vh + 80px)' // Ensure there's room to scroll
        }}
      >
        <div className="w-full max-w-[92vw]">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-gray-200/60 w-full min-h-[80vh]">
            <FolderOrgChartView
              folders={folders}
              bookmarks={bookmarks}
              onCreateFolder={onCreateFolder}
              onEditFolder={() => {}}
              onDeleteFolder={() => {}}
              onAddBookmarkToFolder={() => {}}
              onDropBookmarkToFolder={() => {}}
              onBookmarkUpdated={() => {}}
              onBookmarkDeleted={() => {}}
              onOpenDetail={onOpenDetail}
              currentFolderId={null}
              onFolderNavigate={() => {}}
              selectedFolder={null}
              onAddBookmark={onAddBookmark}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Client-only wrapper to prevent hydration mismatches
function ClientOnlyDndProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Only run on the client after hydration
    setMounted(true)
  }, [])

  // During SSR (and the first client render) render nothing to avoid mismatches
  if (!mounted) {
    return null
  }

  return <>{children}</>
}

export default function Dashboard() {
  const [isClient, setIsClient] = useState(false)
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
    circularImage: '',
    logo: ''
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState<string>('')
  const [notification, setNotification] = useState<string | null>(null)
  const [userDefaultLogo, setUserDefaultLogo] = useState<string>('')
  const [showDefaultLogoModal, setShowDefaultLogoModal] = useState(false)
  const [newDefaultLogo, setNewDefaultLogo] = useState('')
  // New states for folder-based compact view
  const [compactViewMode, setCompactViewMode] = useState<'folders' | 'bookmarks'>('folders')
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  // near top state declarations after other states
  const [folderAssignments, setFolderAssignments] = useState<FolderHierarchyAssignment[]>([]);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [selectedGoalFolder, setSelectedGoalFolder] = useState<Folder | null>(null);
  // Folder creation states
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [newFolder, setNewFolder] = useState({
    name: '',
    color: '#3b82f6', // Default blue color
    description: ''
  });

  // Add Bookmark modal states
  const [addBookmarkTab, setAddBookmarkTab] = useState<'new' | 'existing'>('new');
  const [selectedExistingBookmarks, setSelectedExistingBookmarks] = useState<number[]>([]);
  const [existingBookmarksSearch, setExistingBookmarksSearch] = useState('');

  // HIERARCHY view mode state
  const [khV1ViewMode, setKhV1ViewMode] = useState<'chart' | 'timeline'>('chart');

  // Reset compact view mode when switching away from compact/list view
  useEffect(() => {
    if (viewMode !== 'compact' && viewMode !== 'list') {
      setCompactViewMode('folders')
      setSelectedFolder(null)
    }
  }, [viewMode])

  // Client-side only effect
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load user profile picture as default logo from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Always check for the latest profile avatar from settings
      const savedSettings = localStorage.getItem('userSettings')
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings)
          if (settings.profile?.avatar) {
            setUserDefaultLogo(settings.profile.avatar)
            console.log('Profile avatar loaded as default bookmark logo:', settings.profile.avatar)
          }
        } catch (error) {
          console.log('Error loading profile avatar as default logo:', error)
        }
      }
      
      // Listen for storage changes to update when settings change
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'userSettings' && e.newValue) {
          try {
            const settings = JSON.parse(e.newValue)
            if (settings.profile?.avatar) {
              setUserDefaultLogo(settings.profile.avatar)
              console.log('Profile avatar updated from settings change:', settings.profile.avatar)
            }
          } catch (error) {
            console.log('Error updating profile avatar from storage change:', error)
          }
        }
      }
      
      window.addEventListener('storage', handleStorageChange)
      return () => window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

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
      title: "GITHUB",
      url: "https://github.com",
      description: "Development platform for version control and collaboration",
      category: "Development",
      tags: [], // REMOVED ALL TAGS
      priority: "high",
      isFavorite: true,
      visits: 45,
      lastVisited: "2024-01-15",
      dateAdded: "2024-01-10",
      favicon: "G",
      screenshot: "/placeholder.svg",
      circularImage: "/placeholder.svg",
      logo: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png", // Background logo
      notes: "Main repository hosting platform for all projects. Contains personal and work repositories.",
      timeSpent: "2h 30m",
      weeklyVisits: 45,
      siteHealth: "excellent",
      project: {
        name: "Web Development",
        progress: 75,
        status: "Active"
      }
    },
    {
      id: 2,
      title: "FIGMA",
      url: "https://figma.com",
      description: "Collaborative design tool for UI/UX design",
      category: "Design",
      tags: [], // REMOVED ALL TAGS
      priority: "high",
      isFavorite: false,
      visits: 32,
      lastVisited: "2024-01-14",
      dateAdded: "2024-01-08",
      favicon: "F",
      screenshot: "/placeholder.svg",
      circularImage: "/placeholder.svg",
      logo: "https://cdn.sanity.io/images/599r6htc/localized/46a76c802176eb17b04e12108de7e7e0f3736dc6-1024x1024.png?w=804&h=804&q=75&fit=max&auto=format", // Background logo
      notes: "Primary design tool for creating wireframes, prototypes, and design systems.",
      timeSpent: "1h 45m",
      weeklyVisits: 32,
      siteHealth: "good",
      project: {
        name: "Design System",
        progress: 60,
        status: "Active"
      }
    },
    {
      id: 3,
      title: "STACK OVERFLOW",
      url: "https://stackoverflow.com",
      description: "Q&A platform for developers",
      category: "Development",
      tags: [], // REMOVED ALL TAGS
      priority: "medium",
      isFavorite: true,
      visits: 28,
      lastVisited: "2024-01-13",
      dateAdded: "2024-01-05",
      favicon: "SO",
      screenshot: "/placeholder.svg",
      circularImage: "/placeholder.svg",
      logo: "https://cdn.sstatic.net/Sites/stackoverflow/Img/apple-touch-icon.png", // Background logo
      notes: "Go-to resource for programming questions and solutions. Excellent community support.",
      timeSpent: "3h 15m",
      weeklyVisits: 28,
      siteHealth: "excellent",
      project: {
        name: "Learning Hub",
        progress: 40,
        status: "Active"
      }
    },
    {
      id: 4,
      title: "NOTION",
      url: "https://notion.so",
      description: "All-in-one workspace for notes and project management",
      category: "Productivity",
      tags: [], // REMOVED ALL TAGS
      priority: "high",
      isFavorite: false,
      visits: 67,
      lastVisited: "2024-01-16",
      dateAdded: "2024-01-02",
      favicon: "N",
      screenshot: "/placeholder.svg",
      circularImage: "/placeholder.svg",
      logo: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png", // Background logo
      notes: "Central hub for project documentation, meeting notes, and task management.",
      timeSpent: "4h 20m",
      weeklyVisits: 67,
      siteHealth: "excellent",
      project: {
        name: "Project Management",
        progress: 85,
        status: "Active"
      }
    },
    {
      id: 5,
      title: "DRIBBBLE",
      url: "https://dribbble.com",
      description: "Design inspiration and portfolio showcase",
      category: "Design",
      tags: [], // REMOVED ALL TAGS
      priority: "low",
      isFavorite: false,
      visits: 15,
      lastVisited: "2024-01-12",
      dateAdded: "2024-01-07",
      favicon: "D",
      screenshot: "/placeholder.svg",
      circularImage: "/placeholder.svg",
      logo: "https://cdn.dribbble.com/assets/dribbble-ball-mark-2bd45f09c2fb58dbbfb44766d5d1d07c5a12972d602ef8b32204d28fa3dda554.svg", // Background logo
      notes: "Source of design inspiration and trends. Great for discovering new design patterns.",
      timeSpent: "45m",
      weeklyVisits: 15,
      siteHealth: "good",
      project: {
        name: "Design Inspiration",
        progress: 25,
        status: "Active"
      }
    },
    {
      id: 6,
      title: "LINEAR",
      url: "https://linear.app",
      description: "Modern issue tracking for software teams",
      category: "Development",
      tags: [], // REMOVED ALL TAGS
      priority: "medium",
      isFavorite: true,
      visits: 23,
      lastVisited: "2024-01-11",
      dateAdded: "2024-01-04",
      favicon: "L",
      screenshot: "/placeholder.svg",
      circularImage: "/placeholder.svg",
      logo: "https://asset.brandfetch.io/idZAyF9rlg/idkmvDNPVH.png", // Background logo
      notes: "Issue tracking for development projects. Clean interface and fast performance.",
      timeSpent: "1h 30m",
      weeklyVisits: 23,
      siteHealth: "excellent",
      project: {
        name: "Bug Tracking",
        progress: 50,
        status: "Active"
      }
    }
  ])

  // Available bookmarks that can be added to the workspace
  const availableBookmarks = [
    {
      id: 101,
      title: "YOUTUBE",
      url: "https://youtube.com",
      description: "Video sharing and streaming platform",
      category: "Entertainment",
      tags: ["VIDEO", "STREAMING", "CONTENT"],
      priority: "medium",
      logo: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo.png",
      circularImage: "/placeholder.svg"
    },
    {
      id: 102,
      title: "TWITTER",
      url: "https://twitter.com",
      description: "Social media and microblogging platform",
      category: "Social",
      tags: ["SOCIAL", "NEWS", "NETWORKING"],
      priority: "low",
      logo: "https://abs.twimg.com/icons/apple-touch-icon-192x192.png",
      circularImage: "/placeholder.svg"
    },
    {
      id: 103,
      title: "LINKEDIN",
      url: "https://linkedin.com",
      description: "Professional networking platform",
      category: "Professional",
      tags: ["NETWORKING", "CAREER", "BUSINESS"],
      priority: "medium",
      logo: "https://static.licdn.com/sc/h/al2o9zrvru7aqj8e1x2rzsrca",
      circularImage: "/placeholder.svg"
    },
    {
      id: 104,
      title: "CODEPEN",
      url: "https://codepen.io",
      description: "Online code editor and frontend showcase",
      category: "Development",
      tags: ["CODE", "FRONTEND", "DEMO"],
      priority: "medium",
      logo: "https://cpwebassets.codepen.io/assets/favicon/apple-touch-icon-5ae1a0698dcc2402e9712f7d01ed509a57814f994c660df9f7a952f3060705ee.png",
      circularImage: "/placeholder.svg"
    },
    {
      id: 105,
      title: "MEDIUM",
      url: "https://medium.com",
      description: "Online publishing platform for articles and blogs",
      category: "Learning",
      tags: ["BLOG", "ARTICLES", "WRITING"],
      priority: "low",
      logo: "https://miro.medium.com/v2/resize:fill:152:152/1*sHhtYhaCe2Uc3IU0IgKwIQ.png",
      circularImage: "/placeholder.svg"
    },
    {
      id: 106,
      title: "BEHANCE",
      url: "https://behance.net",
      description: "Creative portfolio showcase platform",
      category: "Design",
      tags: ["PORTFOLIO", "CREATIVE", "SHOWCASE"],
      priority: "medium",
      logo: "https://a5.behance.net/2acd763a-9c19-4ac0-9c1e-6d2b2c0e5e0a/img/site/apple-touch-icon.png",
      circularImage: "/placeholder.svg"
    },
    {
      id: 107,
      title: "SLACK",
      url: "https://slack.com",
      description: "Team collaboration and messaging platform",
      category: "Productivity",
      tags: ["TEAM", "COMMUNICATION", "WORKSPACE"],
      priority: "high",
      logo: "https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png",
      circularImage: "/placeholder.svg"
    },
    {
      id: 108,
      title: "TRELLO",
      url: "https://trello.com",
      description: "Visual project management with boards and cards",
      category: "Productivity",
      tags: ["PROJECT", "KANBAN", "ORGANIZATION"],
      priority: "medium",
      logo: "https://d2k1ftgv7pobq7.cloudfront.net/meta/c/p/res/images/trello-meta-logo.png",
      circularImage: "/placeholder.svg"
    }
  ];

  // Ensure any legacy bookmark objects that may still contain tags don't render them on the cards
  useEffect(() => {
    setBookmarks(prev => prev.map(b => ({ ...b, tags: Array.isArray(b.tags) ? b.tags : [] })))
  }, [])

  // Create folders for hierarchy after bookmarks are loaded
  const foldersForHierarchyV1 = useMemo(() => {
    const categories = [...new Set(bookmarks.map((b) => b.category))];
    return categories.map((cat) => ({
      id: cat,
      name: cat,
      color: '#6b7280',
      bookmark_count: bookmarks.filter((b) => b.category === cat).length,
    }));
  }, [bookmarks]);

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
      title: newBookmark.title.toUpperCase(),
      url: newBookmark.url,
      description: newBookmark.description || 'No description provided',
      category: newBookmark.category,
      tags: newBookmark.tags ? newBookmark.tags.split(',').map(tag => tag.trim().toUpperCase()) : [],
      priority: newBookmark.priority,
      isFavorite: false,
      visits: 0,
      lastVisited: new Date().toLocaleDateString(),
      dateAdded: new Date().toLocaleDateString(),
      favicon: newBookmark.title.charAt(0).toUpperCase(), // Use first letter as fallback
      screenshot: "/placeholder.svg",
      circularImage: newBookmark.circularImage || userDefaultLogo || "/placeholder.svg",
      logo: newBookmark.logo || "", // Background logo
      notes: newBookmark.notes || 'No notes added',
      timeSpent: '0m',
      weeklyVisits: 0,
      siteHealth: 'good',
      project: {
        name: "NEW PROJECT",
        progress: 0,
        status: "Planning"
      }
    }
    
    console.log('New bookmark created with circularImage:', bookmark.circularImage)
    
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
      circularImage: '',
      logo: ''
    })
  }

  const handleAddFolder = () => {
    if (newFolder.name.trim()) {
      // For now, we'll just show a notification that the folder was created
      // In a real app, this would save to a database
      showNotification(`Folder "${newFolder.name}" created successfully!`)
      
      // Reset the form
      setNewFolder({
        name: '',
        color: '#3b82f6',
        description: ''
      })
      
      // Close the modal
      setShowAddFolder(false)
    }
  }

  const resetAddFolderForm = () => {
    setNewFolder({
      name: '',
      color: '#3b82f6',
      description: ''
    })
  }

  // Existing bookmarks handlers
  const handleExistingBookmarkSelect = (bookmarkId: number) => {
    setSelectedExistingBookmarks(prev => 
      prev.includes(bookmarkId) 
        ? prev.filter(id => id !== bookmarkId)
        : [...prev, bookmarkId]
    )
  }

  const handleAddExistingBookmarks = () => {
    if (selectedExistingBookmarks.length === 0) {
      showNotification('Please select at least one bookmark to add')
      return
    }

    const bookmarksToAdd = availableBookmarks.filter(bookmark => 
      selectedExistingBookmarks.includes(bookmark.id)
    ).map(bookmark => ({
      ...bookmark,
      id: bookmarks.length + bookmark.id, // Ensure unique IDs
      isFavorite: false,
      visits: 0,
      lastVisited: new Date().toLocaleDateString(),
      dateAdded: new Date().toLocaleDateString(),
      favicon: bookmark.title.charAt(0).toUpperCase(),
      screenshot: "/placeholder.svg",
      notes: 'Added from available bookmarks',
      timeSpent: '0m',
      weeklyVisits: 0,
      siteHealth: 'good',
      project: {
        name: "IMPORTED",
        progress: 0,
        status: "New"
      }
    }))

    setBookmarks(prev => [...prev, ...bookmarksToAdd])
    setSelectedExistingBookmarks([])
    setShowAddBookmark(false)
    showNotification(`Added ${bookmarksToAdd.length} bookmark(s) successfully!`)
  }

  const resetAddBookmarkModal = () => {
    setAddBookmarkTab('new')
    setSelectedExistingBookmarks([])
    setExistingBookmarksSearch('')
    resetAddBookmarkForm()
  }

  // Filter available bookmarks for search
  const filteredAvailableBookmarks = availableBookmarks.filter(bookmark => {
    const searchLower = existingBookmarksSearch.toLowerCase()
    return bookmark.title.toLowerCase().includes(searchLower) ||
           bookmark.description.toLowerCase().includes(searchLower) ||
           bookmark.category.toLowerCase().includes(searchLower) ||
           bookmark.tags.some((tag: string) => tag.toLowerCase().includes(searchLower))
  }).filter(availableBookmark => 
    // Only show bookmarks that aren't already added to the workspace
    !bookmarks.some(existingBookmark => existingBookmark.url === availableBookmark.url)
  )

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
      newValue = editingValue.split(',').map(tag => tag.trim().toUpperCase()).filter(tag => tag.length > 0)
    } else if (editingField === 'title') {
      newValue = editingValue.toUpperCase()
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

  const handleSetDefaultLogo = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userDefaultLogo', newDefaultLogo)
      setUserDefaultLogo(newDefaultLogo)
      setShowDefaultLogoModal(false)
      setNewDefaultLogo('')
      showNotification('Default logo updated successfully!')
    }
  }

  const openDefaultLogoModal = () => {
    setNewDefaultLogo(userDefaultLogo)
    setShowDefaultLogoModal(true)
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

  // Get category color for folder icons
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Development': 'text-red-500',
      'Design': 'text-blue-500',
      'Productivity': 'text-green-500',
      'Entertainment': 'text-purple-500',
      'Social': 'text-yellow-500',
      'Education': 'text-indigo-500',
      'News': 'text-orange-500',
      'Shopping': 'text-pink-500',
      'Finance': 'text-teal-500',
      'Health': 'text-emerald-500'
    }
    return colors[category] || 'text-gray-600'
  }

  // Get percentage color based on usage level
  const getPercentageColor = (percentage: number) => {
    if (percentage < 25) return '#dc2626' // red-600
    if (percentage < 50) return '#2563eb' // blue-600
    if (percentage < 75) return '#ea580c' // orange-600
    return '#16a34a' // green-600
  }

  // Hexagon component for displaying usage percentage
  const UsageHexagon = ({ percentage }: { percentage: number }) => {
    const color = getPercentageColor(percentage)
    return (
      <div className="absolute bottom-2 right-2 flex items-center justify-center">
        <svg width="80" height="70" viewBox="0 0 80 70" className="drop-shadow-sm">
          {/* Hexagon shape */}
          <path
            d="M40 5 L65 18 L65 47 L40 60 L15 47 L15 18 Z"
            fill="white"
            stroke={color}
            strokeWidth="2"
          />
          {/* Percentage text */}
          <text
            x="40"
            y="35"
            textAnchor="middle"
            dominantBaseline="middle"
            fill={color}
            fontSize="18"
            fontWeight="bold"
          >
            {percentage}%
          </text>
        </svg>
      </div>
    )
  }

  // Action icons component for top right corner
  const BookmarkActionIcons = ({ bookmark }: { bookmark: any }) => (
    <TooltipProvider>
      <div className="absolute top-12 right-2 flex flex-col items-center space-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
        {/* Drag Handle - Top Right Corner */}
        <div 
          {...listeners} 
          className="absolute top-2 right-2 z-20 p-1.5 rounded-md bg-white/90 hover:bg-white shadow-md border border-gray-300/50 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105"
        >
          <GripVertical className="h-4 w-4 text-gray-700" />
        </div>
        <GridBookmarkCard bookmark={bookmark} />
      </div>
    )
  }

  const GridBookmarkCard = ({ bookmark }: { bookmark: any }) => (
    <Card 
      className="group hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 cursor-pointer bg-white border border-gray-300 hover:border-blue-600 backdrop-blur-sm relative overflow-hidden"
      onClick={() => handleBookmarkClick(bookmark)}
    >
      {/* Background Logo with 12% opacity */}
      {bookmark.logo && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
          style={{
            backgroundImage: `url(${bookmark.logo})`,
            opacity: 0.05
          }}
        />
      )}
      
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 via-transparent to-purple-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardContent className="p-6 relative z-20">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center text-white font-bold text-xl ring-2 ring-gray-300/50 group-hover:ring-gray-400 transition-all duration-300 shadow-sm">
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
              src={userDefaultLogo || bookmark.circularImage || "/placeholder.svg"} 
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

        <div className="flex items-center justify-between pt-4 border-t border-gray-100/80 mb-6 relative">
          <div className="flex items-center space-x-2 bg-gray-50/80 rounded-full px-3 py-1.5">
            <Eye className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600 font-medium">{bookmark.visits} VISITS</span>
          </div>
          {/* Usage Percentage Hexagon - Moved here to be even with visits */}
          <div className="flex items-center justify-center">
            <svg width="70" height="62" viewBox="0 0 70 62" className="drop-shadow-sm">
              <path
                d="M35 4 L55 15 L55 40 L35 51 L15 40 L15 15 Z"
                fill="white"
                stroke={getPercentageColor(getUsagePercentage(bookmark.visits))}
                strokeWidth="2"
              />
              <text
                x="35"
                y="30"
                textAnchor="middle"
                dominantBaseline="middle"
                fill={getPercentageColor(getUsagePercentage(bookmark.visits))}
                fontSize="16"
                fontWeight="bold"
              >
                {getUsagePercentage(bookmark.visits)}%
              </text>
            </svg>
          </div>
        </div>

        {/* Project Information Section - Moved to bottom and separated */}
        <div className="border-t border-gray-200/60 pt-3 mt-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">{bookmark.project?.name || "PROJECT"}</span>
            </div>
            <span className="text-xs text-gray-500 font-medium">{bookmark.project?.status || "Active"}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-black h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${bookmark.project?.progress || 0}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">Progress</span>
            <span className="text-xs font-semibold text-green-600">{bookmark.project?.progress || 0}%</span>
          </div>
        </div>
      </CardContent>
      
      {/* Action Icons */}
      <BookmarkActionIcons bookmark={bookmark} />
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
      <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative group">
        <CompactBookmarkCard bookmark={bookmark} />
      </div>
    )
  }

  const CompactBookmarkCard = ({ bookmark }: { bookmark: any }) => (
    <div 
      className="group cursor-pointer"
      onClick={() => handleBookmarkClick(bookmark)}
    >
      {/* Square Box Design matching folder cards - SAME SIZE */}
      <div className="aspect-square w-full bg-white border border-black relative overflow-hidden rounded-lg">
        {/* Background Default Logo with 5% opacity */}
        {userDefaultLogo && (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${userDefaultLogo})`,
              opacity: 0.05
            }}
          />
        )}
        <div className="p-2 h-full flex flex-col justify-between relative z-10">
          {/* Top section with favicon and title */}
          <div>
            <div className="mb-1">
              <div className="w-12 h-12">
                <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center text-white font-bold text-sm ring-1 ring-gray-300/50 group-hover:ring-gray-400 transition-all duration-300 shadow-sm m-1">
                  {bookmark.favicon}
                </div>
              </div>
            </div>
            <h3 className="font-bold text-gray-900 font-audiowide uppercase text-base leading-tight ml-1 truncate">
              {bookmark.title}
            </h3>
            <p className="text-xs text-blue-600 truncate ml-1 mt-1">{bookmark.url}</p>
          </div>
          
          {/* Middle section with badges */}
          <div className="flex flex-col space-y-1 ml-1">
            <Badge className={`text-xs border shadow-sm w-fit ${getPriorityColor(bookmark.priority)}`}>
              {bookmark.priority}
            </Badge>
          </div>
          
          {/* Bottom section with visits and profile image */}
          <div className="flex justify-between items-end">
            <div className="flex items-center space-x-1.5">
              <Eye className="h-4 w-4 text-gray-600" />
              <p className="text-sm text-gray-600 font-semibold">
                {bookmark.visits}
              </p>
              <span className="text-sm text-gray-500 font-medium uppercase">Visits</span>
            </div>
            <img 
              src={userDefaultLogo || bookmark.circularImage || "/placeholder.svg"} 
              alt={`${bookmark.title} image`}
              className="w-16 h-16 object-cover rounded-full border border-gray-300"
            />
          </div>
        </div>
        
        {/* Drag Icon - positioned at top right corner next to border */}
        <div className="absolute top-0.5 right-0.5">
          <div className="opacity-50 hover:opacity-100 transition-opacity duration-200">
            <GripVertical className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </div>
        </div>
        
        {/* Usage Percentage Hexagon - positioned diagonally (Much Bigger) */}
        <div className="absolute top-2 right-2">
          <svg width="70" height="60" viewBox="0 0 70 60" className="drop-shadow-lg">
            <path
              d="M35 5 L55 15 L55 38 L35 48 L15 38 L15 15 Z"
              fill="white"
              stroke={getPercentageColor(getUsagePercentage(bookmark.visits))}
              strokeWidth="3"
            />
            <text
              x="35"
              y="26"
              textAnchor="middle"
              dominantBaseline="middle"
              fill={getPercentageColor(getUsagePercentage(bookmark.visits))}
              fontSize="16"
              fontWeight="bold"
            >
              {getUsagePercentage(bookmark.visits)}%
            </text>
          </svg>
        </div>
        
        {/* Action Icons - positioned at bottom right corner */}
        <div className="absolute bottom-1 right-1">
          <BookmarkActionIcons bookmark={bookmark} />
        </div>
      </div>
    </div>
  )

    const CompactFolderCard = ({ category, bookmarkCount }: { category: string, bookmarkCount: number }) => (
    <div 
      className="group cursor-pointer"
      onClick={() => {
        setSelectedFolder(category)
        setCompactViewMode('bookmarks')
      }}
    >
      {/* Simple Square Box Design */}
      <div className="aspect-square w-full bg-white border border-black relative overflow-hidden rounded-lg">
        {/* Background Default Logo with 5% opacity */}
        {userDefaultLogo && (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${userDefaultLogo})`,
              opacity: 0.05
            }}
          />
        )}
        <div className="p-2 h-full flex flex-col justify-between relative z-10">
          {/* Top section with folder icon and title */}
          <div>
            <div className="mb-2">
              <div className="w-20 h-20">
                <FolderIcon className={`h-16 w-16 ${getCategoryColor(category)} m-2`} />
              </div>
            </div>
            <h3 className="font-bold text-gray-900 font-audiowide uppercase text-lg leading-tight ml-2">
              {category}
            </h3>
          </div>
          
          {/* Bottom section with item count and profile image */}
          <div className="flex justify-between items-end">
            <div className="flex items-center space-x-2">
              <Bookmark className="h-4 w-4 text-gray-600" />
              <p className="text-sm text-gray-600">
                {bookmarkCount} BOOKMARKS
              </p>
            </div>
            <img 
              src={userDefaultLogo || "/placeholder.svg"} 
              alt={`${category} owner`}
              className="w-16 h-16 object-cover rounded-full border border-gray-300"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const ListFolderCard = ({ category, bookmarkCount }: { category: string, bookmarkCount: number }) => (
    <div 
      className="group cursor-pointer"
      onClick={() => {
        setSelectedFolder(category)
        setCompactViewMode('bookmarks')
      }}
    >
      {/* Horizontal List Design */}
      <div className="w-full bg-white border border-black relative overflow-hidden rounded-lg hover:shadow-lg transition-all duration-300">
        {/* Background Default Logo with 5% opacity */}
        {userDefaultLogo && (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${userDefaultLogo})`,
              opacity: 0.05
            }}
          />
        )}
        <div className="p-4 flex items-center justify-between relative z-10">
          {/* Left section with folder icon and title */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16">
              <FolderIcon className={`h-12 w-12 ${getCategoryColor(category)} m-2`} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 font-audiowide uppercase text-xl leading-tight">
                {category}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <Bookmark className="h-4 w-4 text-gray-600" />
                <p className="text-sm text-gray-600">
                  {bookmarkCount} BOOKMARKS
                </p>
              </div>
            </div>
          </div>
          
          {/* Right section with profile image */}
          <div className="flex items-center space-x-4">
            <img 
              src={userDefaultLogo || "/placeholder.svg"} 
              alt={`${category} owner`}
              className="w-16 h-16 object-cover rounded-full border border-gray-300"
            />
            <ArrowLeft className="h-6 w-6 text-gray-400 rotate-180" />
          </div>
        </div>
      </div>
    </div>
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
      className="group hover:shadow-xl hover:shadow-blue-500/15 transition-all duration-400 cursor-pointer bg-white border border-black hover:border-blue-600 backdrop-blur-sm relative overflow-hidden rounded-lg"
      onClick={() => handleBookmarkClick(bookmark)}
    >
      {/* Background Default Logo with 5% opacity */}
      {userDefaultLogo && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${userDefaultLogo})`,
            opacity: 0.05
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/2 via-transparent to-purple-500/2 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
      
      <CardContent className="p-6 relative z-10">
        {/* Top Section: Title and Category */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-2">
              <div className="w-14 h-14 rounded-xl bg-black flex items-center justify-center text-white font-bold text-xl ring-2 ring-gray-300/50 group-hover:ring-gray-400 transition-all duration-300 shadow-sm">
                {bookmark.favicon}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-1">
                  <h3 className="font-bold text-gray-900 font-audiowide uppercase text-lg group-hover:text-blue-900 transition-colors duration-300">{bookmark.title}</h3>
                  <Badge className={`text-sm border-2 shadow-sm px-3 py-1 ${getPriorityColor(bookmark.priority)}`}>
                    {bookmark.priority}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <FolderIcon className={`h-4 w-4 ${getCategoryColor(bookmark.category)}`} />
                  <span className={`text-sm font-bold uppercase ${getCategoryColor(bookmark.category)}`}>
                    {bookmark.category}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Top Right: Profile Image */}
          <div className="flex-shrink-0">
            <img 
              src={userDefaultLogo || bookmark.circularImage || "/placeholder.svg"} 
              alt={`${bookmark.title} image`}
              className="w-16 h-16 object-cover rounded-full bg-gradient-to-br from-gray-100 to-gray-50 ring-2 ring-gray-200/50 group-hover:ring-blue-300/60 transition-all duration-300 shadow-md"
            />
          </div>
        </div>
        
        {/* Middle Section: URL and Description */}
        <div className="mb-4">
          <p className="text-sm text-blue-600 hover:underline font-medium mb-2">{bookmark.url}</p>
          <p className="text-sm text-gray-600 leading-relaxed">{bookmark.description}</p>
        </div>
        
        {/* Bottom Section: Visits and Usage */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center space-x-2 bg-gray-50/80 rounded-full px-3 py-1.5">
              <Bookmark className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 font-medium uppercase">{bookmark.visits} VISITS</span>
            </div>
          </div>
          
          {/* Bottom Right: Usage Hexagon */}
          <div className="flex items-center space-x-4">
            <UsageHexagon percentage={getUsagePercentage(bookmark.visits)} />
          </div>
        </div>
      </CardContent>
      
      {/* Drag Icon - Positioned at top right corner */}
      <div className="absolute top-2 right-2">
        <div className="opacity-50 hover:opacity-100 transition-opacity duration-200">
          <GripVertical className="h-5 w-5 text-gray-400 hover:text-gray-600" />
        </div>
      </div>
      
      {/* Action Icons - Positioned at bottom right corner */}
      <div className="absolute bottom-4 right-4">
        <BookmarkActionIcons bookmark={bookmark} />
      </div>
    </Card>
  )



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
              <FolderIcon className="h-5 w-5 text-blue-600" />
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
        {/* Drag Handle - Left Side */}
        <div 
          {...listeners} 
          className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 p-1.5 rounded-md bg-white/90 hover:bg-white shadow-md border border-gray-300/50 cursor-grab active:cursor-grabbing opacity-60 hover:opacity-100 transition-all duration-200 hover:scale-105"
        >
          <GripVertical className="h-4 w-4 text-gray-700" />
        </div>
        <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer relative border border-gray-200 hover:border-blue-600 bg-white" onClick={() => handleBookmarkClick(bookmark)}>
          <div className="flex items-center space-x-4 ml-8">
            <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
              {bookmark.logo ? (
                <img src={bookmark.logo} alt={bookmark.title} className="h-8 w-8 object-contain" />
              ) : (
                <GitBranch className="h-6 w-6 text-blue-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate text-gray-900">{bookmark.title}</h3>
              <p className="text-sm text-gray-500 truncate">{bookmark.description}</p>
              <div className="flex items-center space-x-4 mt-2">
                <Badge className={`${getCategoryColor(bookmark.category)} text-xs`}>
                  {bookmark.category}
                </Badge>
                <span className="text-xs text-gray-400">{bookmark.visits} visits</span>
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

  const renderBookmarks = () => {
    const bookmarkIds = filteredBookmarks.map(bookmark => bookmark.id)
    
    switch (viewMode) {
      case 'compact':
        if (compactViewMode === 'folders') {
          // Show folder view - group bookmarks by category
          const categories = [...new Set(bookmarks.map(bookmark => bookmark.category))]
          return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {categories.map((category) => {
                const categoryBookmarks = bookmarks.filter(bookmark => bookmark.category === category)
                return (
                  <CompactFolderCard 
                    key={category} 
                    category={category} 
                    bookmarkCount={categoryBookmarks.length} 
                  />
                )
              })}
            </div>
          )
        } else {
          // Show bookmarks within selected folder
          const folderBookmarks = filteredBookmarks.filter(bookmark => bookmark.category === selectedFolder)
          const folderBookmarkIds = folderBookmarks.map(bookmark => bookmark.id)
          
          return (
            <div className="space-y-4">
              {/* Back Button */}
              <div className="flex items-center space-x-4 mb-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCompactViewMode('folders')
                    setSelectedFolder(null)
                  }}
                  className="flex items-center space-x-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Folders</span>
                </Button>
                <div className="flex items-center space-x-2">
                  <FolderIcon className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900 font-audiowide uppercase">{selectedFolder}</h2>
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                    {folderBookmarks.length} bookmarks
                  </Badge>
                </div>
              </div>
              
              {/* Bookmarks Grid */}
              <ClientOnlyDndProvider>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={folderBookmarkIds} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      {folderBookmarks.map((bookmark) => (
                        <SortableCompactBookmarkCard key={bookmark.id} bookmark={bookmark} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </ClientOnlyDndProvider>
            </div>
          )
        }
      case 'list':
        if (compactViewMode === 'folders') {
          // Show folder view for list - group bookmarks by category
          const categories = [...new Set(bookmarks.map(bookmark => bookmark.category))]
          return (
            <div className="space-y-4">
              {categories.map((category) => {
                const categoryBookmarks = bookmarks.filter(bookmark => bookmark.category === category)
                return (
                  <ListFolderCard 
                    key={category} 
                    category={category} 
                    bookmarkCount={categoryBookmarks.length} 
                  />
                )
              })}
            </div>
          )
        }
        
        // Show individual bookmarks in selected folder or all bookmarks
        const bookmarksToShow = selectedFolder 
          ? filteredBookmarks.filter(bookmark => bookmark.category === selectedFolder)
          : filteredBookmarks
        const listBookmarkIds = bookmarksToShow.map(bookmark => bookmark.id)
        
        return (
          <div>
            {selectedFolder && (
              <div className="mb-6 flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedFolder(null)
                    setCompactViewMode('folders')
                  }}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Folders</span>
                </Button>
                <h2 className="text-xl font-bold text-gray-900 font-audiowide uppercase">
                  {selectedFolder} ({bookmarksToShow.length} Bookmarks)
                </h2>
              </div>
            )}
            <ClientOnlyDndProvider>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={listBookmarkIds} strategy={verticalListSortingStrategy}>
                  <div className="space-y-4">
                    {bookmarksToShow.map((bookmark) => (
                      <SortableListBookmarkCard key={bookmark.id} bookmark={bookmark} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </ClientOnlyDndProvider>
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
                  <ClientOnlyDndProvider>
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
                  </ClientOnlyDndProvider>
                </div>
              )
            })}
          </div>
        )
      case 'timeline':
        return (
          <div className="w-full h-screen">
            <SimpleBoardCanvas onBookmarkClick={handleBookmarkClick} />
          </div>
        )
      case 'hierarchyV1':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Hierarchy V1 - Simple View</h2>
              <p className="text-gray-600">Basic hierarchical organization of your bookmarks</p>
            </div>
            {['Development', 'Design', 'Productivity'].map((category) => {
              const categoryBookmarks = filteredBookmarks.filter((bookmark) => bookmark.category === category)
              const categoryBookmarkIds = categoryBookmarks.map(bookmark => bookmark.id)
              
              return (
                <div key={category} className="border border-gray-200/60 rounded-xl p-8 bg-gradient-to-br from-white via-gray-50/20 to-white shadow-sm hover:shadow-lg transition-all duration-300">
                  <h3 className="font-bold text-2xl mb-6 flex items-center text-gray-900">
                    <GitBranch className="h-7 w-7 mr-4 text-gray-700" />
                    {category}
                    <Badge className="ml-3 bg-blue-50 text-blue-700 border-blue-200">
                      {categoryBookmarks.length} bookmarks
                    </Badge>
                  </h3>
                  <ClientOnlyDndProvider>
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
                  </ClientOnlyDndProvider>
                </div>
              )
            })}
          </div>
        )
      case 'khV1':
        return (
          <ClientOnlyDndProvider>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <div className="w-full h-screen">
                <KHV1InfinityBoard 
                  folders={foldersForHierarchyV1}
                  bookmarks={bookmarks}
                  onCreateFolder={() => setShowAddFolder(true)}
                  onAddBookmark={() => setShowAddBookmark(true)}
                  onOpenDetail={handleBookmarkClick}
                />
              </div>
            </DndContext>
          </ClientOnlyDndProvider>
        )
      case 'folder2':
        // Create mock folders for demonstration
        const mockFolders: Folder[] = [
          {
            id: '1',
            name: 'Development',
            description: 'All development related bookmarks and resources',
            color: '#3b82f6'
          },
          {
            id: '2', 
            name: 'Design',
            description: 'Design tools, inspiration, and creative resources',
            color: '#ef4444'
          },
          {
            id: '3',
            name: 'Productivity',
            description: 'Tools and apps to boost productivity',
            color: '#10b981'
          },
          {
            id: '4',
            name: 'Learning',
            description: 'Educational content and learning platforms',
            color: '#f59e0b'
          }
        ];

        const handleFolderEdit = (folder: Folder) => {
          console.log('Edit folder:', folder);
          showNotification(`Edit folder: ${folder.name}`);
        };

        const handleFolderDelete = (folderId: string) => {
          console.log('Delete folder:', folderId);
          showNotification(`Delete folder: ${folderId}`);
        };

        const handleFolderAddBookmark = (folderId: string) => {
          console.log('Add bookmark to folder:', folderId);
          showNotification(`Add bookmark to folder: ${folderId}`);
        };

        const handleFolderDrop = (folderId: string, bookmark: BookmarkWithRelations) => {
          console.log('Drop bookmark to folder:', folderId, bookmark);
          showNotification(`Moved "${bookmark.title}" to folder`);
        };

        const handleFolderDragOver = (event: React.DragEvent) => {
          event.preventDefault();
        };

        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Folder 2.0</h2>
              <p className="text-gray-600">Advanced folder management with drag-and-drop functionality</p>
            </div>
            
            <ClientOnlyDndProvider>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {mockFolders.map((folder) => {
                    const folderBookmarks = bookmarks.filter(bookmark => 
                      bookmark.category.toLowerCase() === folder.name.toLowerCase()
                    );
                    
                    return (
                      <FolderCard
                        key={folder.id}
                        folder={folder}
                        bookmarkCount={folderBookmarks.length}
                        onEdit={handleFolderEdit}
                        onDelete={handleFolderDelete}
                        onAddBookmark={handleFolderAddBookmark}
                        onDrop={handleFolderDrop}
                        onDragOver={handleFolderDragOver}
                        disableLink={true}
                        onClick={() => {
                          console.log('Folder clicked:', folder);
                          showNotification(`Opened folder: ${folder.name}`);
                        }}
                      />
                    );
                  })}
                </div>
              </DndContext>
            </ClientOnlyDndProvider>
          </div>
        )
      case 'goal2':
        // Create mock goal folders for demonstration
        const mockGoalFolders: Folder[] = [
          {
            id: '1',
            name: 'Q1 Learning Goals',
            description: 'Complete React and TypeScript courses',
            color: '#3b82f6',
            deadline_date: '2024-03-31',
            goal_type: 'learn_category',
            goal_description: 'Master React hooks and TypeScript fundamentals',
            goal_status: 'in_progress',
            goal_priority: 'high',
            goal_progress: 65,
            goal_notes: 'Making good progress on React hooks'
          },
          {
            id: '2',
            name: 'Project Organization',
            description: 'Organize all development resources',
            color: '#10b981',
            deadline_date: '2024-02-15',
            goal_type: 'organize',
            goal_description: 'Create a systematic approach to project management',
            goal_status: 'pending',
            goal_priority: 'medium',
            goal_progress: 25,
            goal_notes: 'Need to start organizing soon'
          },
          {
            id: '3',
            name: 'Research New Technologies',
            description: 'Explore emerging web technologies',
            color: '#f59e0b',
            deadline_date: '2024-04-30',
            goal_type: 'research_topic',
            goal_description: 'Research and evaluate new frameworks and tools',
            goal_status: 'in_progress',
            goal_priority: 'low',
            goal_progress: 40,
            goal_notes: 'Focusing on Next.js 14 and React Server Components'
          }
        ];

        const handleGoalSubmit = (data: { name: string; description?: string; color?: string; reminder_at?: string | null }) => {
          console.log('Goal folder submitted:', data);
          showNotification(`Goal folder "${data.name}" ${selectedGoalFolder ? 'updated' : 'created'} successfully!`);
          setSelectedGoalFolder(null);
        };

        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Goal 2.0</h2>
              <p className="text-gray-600">Advanced goal management with deadline tracking and progress monitoring</p>
            </div>
            
            <div className="flex justify-end mb-6">
              <Button
                onClick={() => {
                  setSelectedGoalFolder(null);
                  setGoalDialogOpen(true);
                }}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create New Goal</span>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockGoalFolders.map((folder) => {
                const folderBookmarks = bookmarks.filter(bookmark => 
                  bookmark.category.toLowerCase().includes(folder.name.toLowerCase().split(' ')[0])
                );
                
                return (
                  <div key={folder.id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: folder.color }}
                        >
                          <Target className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{folder.name}</h3>
                          <p className="text-sm text-gray-600">{folder.description}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedGoalFolder(folder);
                          setGoalDialogOpen(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Progress</span>
                        <span className="font-medium">{folder.goal_progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${folder.goal_progress}%` }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Deadline</span>
                        <span className="font-medium">
                          {folder.deadline_date ? new Date(folder.deadline_date).toLocaleDateString() : 'No deadline'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Priority</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          folder.goal_priority === 'high' ? 'bg-red-100 text-red-800' :
                          folder.goal_priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {folder.goal_priority}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Status</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          folder.goal_status === 'completed' ? 'bg-green-100 text-green-800' :
                          folder.goal_status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          folder.goal_status === 'overdue' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {folder.goal_status?.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Bookmarks</span>
                        <span className="font-medium">{folderBookmarks.length}</span>
                      </div>
                    </div>
                    
                    {folder.goal_notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">{folder.goal_notes}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <FolderFormDialog
              open={goalDialogOpen}
              onOpenChange={setGoalDialogOpen}
              folder={selectedGoalFolder}
              onSubmit={handleGoalSubmit}
            />
          </div>
        )
      case 'kanban2':
        // Create mock folders for kanban demo
        const kanbanFolders: Folder[] = [
          {
            id: '1',
            name: 'Development',
            description: 'All development related bookmarks and resources',
            color: '#3b82f6'
          },
          {
            id: '2', 
            name: 'Design',
            description: 'Design tools, inspiration, and creative resources',
            color: '#ef4444'
          },
          {
            id: '3',
            name: 'Productivity',
            description: 'Tools and apps to boost productivity',
            color: '#10b981'
          }
        ];

        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Kanban 2.0</h2>
              <p className="text-gray-600">Advanced drag-and-drop kanban board for bookmark organization</p>
            </div>
            
            <KanbanView
              bookmarks={filteredBookmarks as any}
              onBookmarkClick={(bookmark) => {
                setSelectedBookmark(bookmark as any);
                setIsModalOpen(true);
              }}
              onFavorite={(bookmark) => {
                const updatedBookmark = { ...bookmark };
                setBookmarks(prev => prev.map(b => b.id === (bookmark as any).id ? updatedBookmark as any : b));
                showNotification('Bookmark updated successfully!');
              }}
              loading={false}
              selectedCategory={undefined}
              selectedFolder={undefined}
              onCategoryChange={undefined}
            />
          </div>
        )
      default: // grid
        return (
          <ClientOnlyDndProvider>
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
          </ClientOnlyDndProvider>
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
            variant={viewMode === 'khV1' ? 'default' : 'ghost'}
            onClick={() => setViewMode('khV1')}
            className="h-12 px-4 flex items-center space-x-2"
          >
            <Building className="h-5 w-5" />
            <span className="font-medium">HIERARCHY</span>
          </Button>
          <Button
            size="lg"
            variant={viewMode === 'folder2' ? 'default' : 'ghost'}
            onClick={() => setViewMode('folder2')}
            className="h-12 px-4 flex items-center space-x-2"
          >
            <FolderIcon className="h-5 w-5" />
            <span className="font-medium">FOLDER 2.0</span>
          </Button>
          <Button
            size="lg"
            variant={viewMode === 'goal2' ? 'default' : 'ghost'}
            onClick={() => setViewMode('goal2')}
            className="h-12 px-4 flex items-center space-x-2"
          >
            <Target className="h-5 w-5" />
            <span className="font-medium">GOAL 2.0</span>
          </Button>
          <Button
            size="lg"
            variant={viewMode === 'kanban2' ? 'default' : 'ghost'}
            onClick={() => setViewMode('kanban2')}
            className="h-12 px-4 flex items-center space-x-2"
          >
            <Columns className="h-5 w-5" />
            <span className="font-medium">KANBAN 2.0</span>
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
                      <AvatarFallback className="bg-black text-white">{selectedBookmark.title[0]}</AvatarFallback>
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
                            src={userDefaultLogo || selectedBookmark.circularImage || "/placeholder.svg"}
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
                      <div className="text-center space-y-2">
                        <p className="text-sm text-gray-600">Click the camera icon to update image</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={openDefaultLogoModal}
                          className="text-xs"
                        >
                          <ImageIcon className="h-3 w-3 mr-2" />
                          Set Default Logo
                        </Button>
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
                                {tag.toUpperCase()}
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
                    <ClientOnlyDndProvider>
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
                                        src={userDefaultLogo || bookmark.circularImage || "/placeholder.svg"}
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
                    </ClientOnlyDndProvider>

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
      <Dialog open={showAddBookmark} onOpenChange={(open) => {
        setShowAddBookmark(open)
        if (!open) resetAddBookmarkModal()
      }}>
        <DialogContent className="max-w-2xl bg-gradient-to-br from-white via-gray-50/20 to-white border border-gray-200/60 shadow-2xl">
          <DialogHeader>
            <DialogTitle>ADD BOOKMARKS</DialogTitle>
          </DialogHeader>
          
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <Button
              variant={addBookmarkTab === 'new' ? 'default' : 'ghost'}
              onClick={() => setAddBookmarkTab('new')}
              className="flex-1"
            >
              New Bookmark
            </Button>
            <Button
              variant={addBookmarkTab === 'existing' ? 'default' : 'ghost'}
              onClick={() => setAddBookmarkTab('existing')}
              className="flex-1"
            >
              Existing Bookmarks
            </Button>
          </div>

          {/* Tab Content */}
          {addBookmarkTab === 'new' ? (
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
          ) : (
            <div className="space-y-4">
              {/* Search Bar */}
              <div>
                <label className="text-sm font-medium">SEARCH AVAILABLE BOOKMARKS</label>
                <Input
                  placeholder="Search by name, description, or category..."
                  value={existingBookmarksSearch}
                  onChange={(e) => setExistingBookmarksSearch(e.target.value)}
                />
              </div>
              
              {/* Available Bookmarks List */}
              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredAvailableBookmarks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {existingBookmarksSearch ? 'No bookmarks match your search' : 'All available bookmarks have been added'}
                  </div>
                ) : (
                  filteredAvailableBookmarks.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedExistingBookmarks.includes(bookmark.id)
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => handleExistingBookmarkSelect(bookmark.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {bookmark.logo ? (
                            <img
                              src={bookmark.logo}
                              alt={bookmark.title}
                              className="w-10 h-10 rounded-lg object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                e.currentTarget.nextElementSibling?.classList.remove('hidden')
                              }}
                            />
                          ) : null}
                          <div className={`w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-sm font-medium text-blue-600 ${bookmark.logo ? 'hidden' : ''}`}>
                            {bookmark.title.charAt(0)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-sm">{bookmark.title}</h3>
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              {bookmark.category}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{bookmark.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            {bookmark.tags.slice(0, 3).map((tag, index) => (
                              <span key={index} className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-600 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <div className={`w-5 h-5 rounded border-2 ${
                            selectedExistingBookmarks.includes(bookmark.id)
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-300'
                          } flex items-center justify-center`}>
                            {selectedExistingBookmarks.includes(bookmark.id) && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {selectedExistingBookmarks.length} bookmark(s) selected
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setShowAddBookmark(false)}>
                    CANCEL
                  </Button>
                  <Button 
                    onClick={handleAddExistingBookmarks}
                    disabled={selectedExistingBookmarks.length === 0}
                  >
                    ADD SELECTED ({selectedExistingBookmarks.length})
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Folder Modal */}
      <Dialog open={showAddFolder} onOpenChange={setShowAddFolder}>
        <DialogContent className="max-w-md bg-gradient-to-br from-white via-gray-50/20 to-white border border-gray-200/60 shadow-2xl">
          <DialogHeader>
            <DialogTitle>ADD NEW FOLDER</DialogTitle>
            <DialogDescription>
              Create a new folder to organize your bookmarks.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">FOLDER NAME</label>
              <Input
                placeholder="Enter folder name"
                value={newFolder.name}
                onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleAddFolder()}
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-medium">FOLDER COLOR</label>
              <div className="flex items-center space-x-3">
                <Input
                  type="color"
                  value={newFolder.color}
                  onChange={(e) => setNewFolder({ ...newFolder, color: e.target.value })}
                  className="w-16 h-10 p-1 rounded-lg"
                />
                <div className="flex-1">
                  <Input
                    placeholder="#3b82f6"
                    value={newFolder.color}
                    onChange={(e) => setNewFolder({ ...newFolder, color: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">DESCRIPTION (OPTIONAL)</label>
              <Textarea
                placeholder="Enter folder description"
                value={newFolder.description}
                onChange={(e) => setNewFolder({ ...newFolder, description: e.target.value })}
                rows={3}
              />
            </div>
            
            {/* Preview */}
            {newFolder.name && (
              <div className="space-y-2">
                <label className="text-sm font-medium">PREVIEW</label>
                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div 
                    className="h-12 w-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: newFolder.color + '20' }}
                  >
                    <FolderIcon className="h-6 w-6" style={{ color: newFolder.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{newFolder.name}</p>
                    {newFolder.description && (
                      <p className="text-xs text-gray-500">{newFolder.description}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setShowAddFolder(false)
                resetAddFolderForm()
              }}>
                CANCEL
              </Button>
              <Button onClick={handleAddFolder} disabled={!newFolder.name.trim()}>
                CREATE FOLDER
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Default Logo Modal */}
      <Dialog open={showDefaultLogoModal} onOpenChange={setShowDefaultLogoModal}>
        <DialogContent className="max-w-md bg-gradient-to-br from-white via-gray-50/20 to-white border border-gray-200/60 shadow-2xl">
          <DialogHeader>
            <DialogTitle>SET DEFAULT LOGO</DialogTitle>
            <DialogDescription>
              Set a default logo that will be used as placeholder for all bookmarks instead of letters.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">LOGO URL</label>
              <Input
                placeholder="https://example.com/logo.png"
                value={newDefaultLogo}
                onChange={(e) => setNewDefaultLogo(e.target.value)}
              />
            </div>
            
            {/* Preview */}
            {newDefaultLogo && (
              <div className="space-y-2">
                <label className="text-sm font-medium">PREVIEW</label>
                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center text-white font-bold text-xl ring-2 ring-gray-300/50 transition-all duration-300 shadow-sm overflow-hidden">
                    <img 
                      src={newDefaultLogo} 
                      alt="Default logo preview" 
                      className="w-full h-full object-cover rounded-xl"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).parentElement!.innerHTML = 'ERROR';
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">This logo will appear on all bookmark cards</p>
                    <p className="text-xs text-gray-500">Individual bookmarks can still override this default</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Current Default */}
            {userDefaultLogo && (
              <div className="space-y-2">
                <label className="text-sm font-medium">CURRENT DEFAULT</label>
                <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                  <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center text-white font-bold text-xl ring-2 ring-gray-300/50 transition-all duration-300 shadow-sm overflow-hidden">
                    <img 
                      src={userDefaultLogo} 
                      alt="Current default logo" 
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Currently active default logo</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setUserDefaultLogo('')
                        localStorage.removeItem('userDefaultLogo')
                        setShowDefaultLogoModal(false)
                        showNotification('Default logo removed!')
                      }}
                      className="mt-1 h-7 text-xs"
                    >
                      Remove Default
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowDefaultLogoModal(false)}>
                CANCEL
              </Button>
              <Button onClick={handleSetDefaultLogo} disabled={!newDefaultLogo}>
                SET DEFAULT
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