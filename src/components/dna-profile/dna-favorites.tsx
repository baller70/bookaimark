'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { 
  Grid3X3, 
  List, 
  Search, 
  Filter, 
    ArrowUpDown,
  ArrowDownUp,
  Star,
  Heart,
  Bookmark,
  ExternalLink,
  Edit,
  Trash2,
  Copy,
  Share,
  Archive,
  Tag,
  Calendar,
  Globe,
  Sparkles,
  MoreHorizontal,
  Eye,
  Download,
  Move,
  FolderOpen,
  Clock
} from 'lucide-react'
import { toast } from 'sonner'

interface FavoriteItem {
  id: string
  title: string
  url: string
  description: string
  favicon: string
  tags: string[]
  folder: string
  dateAdded: Date
  lastVisited: Date
  visitCount: number
  rating: number
  isStarred: boolean
  isArchived: boolean
  thumbnail?: string
}

interface Folder {
  id: string
  name: string
  color: string
  count: number
}

const mockFavorites: FavoriteItem[] = [
  {
    id: '1',
    title: 'React Documentation',
    url: 'https://react.dev',
    description: 'The official React documentation with hooks, components, and best practices.',
    favicon: '/react-icon.png',
    tags: ['React', 'Documentation', 'Frontend'],
    folder: 'Development',
    dateAdded: new Date('2024-01-15'),
    lastVisited: new Date('2024-01-20'),
    visitCount: 45,
    rating: 5,
    isStarred: true,
    isArchived: false,
    thumbnail: '/thumbnails/react-docs.png'
  },
  {
    id: '2',
    title: 'TypeScript Handbook',
    url: 'https://typescriptlang.org/docs',
    description: 'Complete guide to TypeScript features, types, and advanced patterns.',
    favicon: '/ts-icon.png',
    tags: ['TypeScript', 'Documentation', 'Programming'],
    folder: 'Development',
    dateAdded: new Date('2024-01-10'),
    lastVisited: new Date('2024-01-18'),
    visitCount: 32,
    rating: 5,
    isStarred: true,
    isArchived: false
  },
  {
    id: '3',
    title: 'Dribbble Design Inspiration',
    url: 'https://dribbble.com',
    description: 'Discover the world\'s top designers & creatives on Dribbble.',
    favicon: '/dribbble-icon.png',
    tags: ['Design', 'Inspiration', 'UI/UX'],
    folder: 'Design',
    dateAdded: new Date('2024-01-12'),
    lastVisited: new Date('2024-01-19'),
    visitCount: 28,
    rating: 4,
    isStarred: false,
    isArchived: false
  }
]

const mockFolders: Folder[] = [
  { id: '1', name: 'Development', color: 'blue', count: 15 },
  { id: '2', name: 'Design', color: 'purple', count: 8 },
  { id: '3', name: 'Research', color: 'green', count: 12 },
  { id: '4', name: 'Tools', color: 'orange', count: 6 }
]

export default function DnaFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(mockFavorites)
  const [folders] = useState<Folder[]>(mockFolders)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFolder, setSelectedFolder] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'dateAdded' | 'title' | 'visitCount' | 'rating'>('dateAdded')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [detailItem, setDetailItem] = useState<FavoriteItem | null>(null)

  // Filter and sort favorites
  const filteredFavorites = favorites
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesFolder = selectedFolder === 'all' || item.folder === selectedFolder
      
      const matchesTags = selectedTags.length === 0 || 
                         selectedTags.some(tag => item.tags.includes(tag))
      
      return matchesSearch && matchesFolder && matchesTags && !item.isArchived
    })
    .sort((a, b) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]
      
      if (sortBy === 'dateAdded' || sortBy === 'lastVisited') {
        return sortOrder === 'desc' 
          ? new Date(bValue as Date).getTime() - new Date(aValue as Date).getTime()
          : new Date(aValue as Date).getTime() - new Date(bValue as Date).getTime()
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'desc' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue)
      }
      
      return sortOrder === 'desc' ? (bValue as number) - (aValue as number) : (aValue as number) - (bValue as number)
    })

  // Get all unique tags
  const allTags = Array.from(new Set(favorites.flatMap(item => item.tags)))

  const handleBulkAction = (action: string) => {
    if (selectedItems.length === 0) {
      toast.error('Please select items first')
      return
    }

    switch (action) {
      case 'delete':
        setFavorites(prev => prev.filter(item => !selectedItems.includes(item.id)))
        toast.success(`Deleted ${selectedItems.length} items`)
        break
      case 'archive':
        setFavorites(prev => prev.map(item => 
          selectedItems.includes(item.id) ? { ...item, isArchived: true } : item
        ))
        toast.success(`Archived ${selectedItems.length} items`)
        break
      case 'star':
        setFavorites(prev => prev.map(item => 
          selectedItems.includes(item.id) ? { ...item, isStarred: true } : item
        ))
        toast.success(`Starred ${selectedItems.length} items`)
        break
    }
    setSelectedItems([])
  }

  const handleSmartOrganize = () => {
    toast.loading('AI is organizing your favorites...')
    setTimeout(() => {
      toast.success('Favorites organized by AI based on your interests!')
    }, 2000)
  }

  const FavoriteCard = ({ item }: { item: FavoriteItem }) => (
    <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Checkbox 
              checked={selectedItems.includes(item.id)}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedItems(prev => [...prev, item.id])
                } else {
                  setSelectedItems(prev => prev.filter(id => id !== item.id))
                }
              }}
            />
            <img src={item.favicon} alt="" className="w-4 h-4" />
            {item.isStarred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
          </div>
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" onClick={() => setDetailItem(item)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium text-sm line-clamp-2">{item.title}</h3>
          <p className="text-xs text-gray-600 line-clamp-2">{item.description}</p>
          
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {item.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{item.tags.length - 3}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{item.visitCount} visits</span>
            <div className="flex items-center space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-3 w-3 ${i < item.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const FavoriteListItem = ({ item }: { item: FavoriteItem }) => (
    <Card className="group hover:shadow-sm transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <Checkbox 
            checked={selectedItems.includes(item.id)}
            onCheckedChange={(checked) => {
              if (checked) {
                setSelectedItems(prev => [...prev, item.id])
              } else {
                setSelectedItems(prev => prev.filter(id => id !== item.id))
              }
            }}
          />
          
          <div className="flex items-center space-x-2">
            <img src={item.favicon} alt="" className="w-4 h-4" />
            {item.isStarred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{item.title}</h3>
            <p className="text-xs text-gray-600 truncate">{item.description}</p>
          </div>
          
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>{item.visitCount} visits</span>
            <span>{item.folder}</span>
            <span>{item.dateAdded.toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" onClick={() => setDetailItem(item)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Favorites</h2>
          <p className="text-gray-600">Manage your bookmarked content</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleSmartOrganize}>
            <Sparkles className="h-4 w-4 mr-2" />
            AI Organize
          </Button>
          <Button>
            <Bookmark className="h-4 w-4 mr-2" />
            Add Bookmark
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search favorites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-2">
              <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Folders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Folders</SelectItem>
                  {folders.map(folder => (
                    <SelectItem key={folder.id} value={folder.name}>
                      {folder.name} ({folder.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dateAdded">Date Added</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="visitCount">Visit Count</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <ArrowUpDown className="h-4 w-4" /> : <ArrowDownUp className="h-4 w-4" />}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
              </Button>

              <div className="flex items-center space-x-1 border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map(tag => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => {
                          if (selectedTags.includes(tag)) {
                            setSelectedTags(prev => prev.filter(t => t !== tag))
                          } else {
                            setSelectedTags(prev => [...prev, tag])
                          }
                        }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {selectedItems.length} items selected
                </span>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction('star')}>
                    <Star className="h-4 w-4 mr-1" />
                    Star
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction('archive')}>
                    <Archive className="h-4 w-4 mr-1" />
                    Archive
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction('delete')}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content */}
      <div className="space-y-4">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFavorites.map(item => (
              <FavoriteCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFavorites.map(item => (
              <FavoriteListItem key={item.id} item={item} />
            ))}
          </div>
        )}

        {filteredFavorites.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || selectedFolder !== 'all' || selectedTags.length > 0
                  ? 'Try adjusting your filters or search query.'
                  : 'Start bookmarking your favorite content to see it here.'}
              </p>
              <Button>
                <Bookmark className="h-4 w-4 mr-2" />
                Add Your First Bookmark
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detail Drawer */}
      <Sheet open={!!detailItem} onOpenChange={() => setDetailItem(null)}>
        <SheetContent className="w-96">
          {detailItem && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center space-x-2">
                  <img src={detailItem.favicon} alt="" className="w-5 h-5" />
                  <span className="truncate">{detailItem.title}</span>
                </SheetTitle>
              </SheetHeader>
              
              <div className="space-y-6 mt-6">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-gray-600">{detailItem.description}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {detailItem.tags.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-1">Folder</h4>
                    <p className="text-gray-600">{detailItem.folder}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Rating</h4>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < detailItem.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Visits</h4>
                    <p className="text-gray-600">{detailItem.visitCount}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Added</h4>
                    <p className="text-gray-600">{detailItem.dateAdded.toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <Button className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Site
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Bookmark
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
} 