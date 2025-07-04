"use client";

import React, { createContext, useContext, useReducer, useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Upload, 
  Clipboard, 
  Settings2, 
  Star, 
  Play, 
  Pause, 
  AlertCircle,
  FileText,
  Video,
  Github,
  Globe,
  FolderOpen,
  Tag,
  Eye,
  EyeOff,
  RotateCcw,
  Save
} from 'lucide-react';
import { supabase } from '@/lib/supabase'
import { getAISetting } from '@/lib/user-settings-service'

// Types
type BulkLinkStatus = 'queued' | 'validating' | 'processing' | 'saved' | 'duplicate' | 'failed';

interface BulkLink {
  id: string;
  url: string;
  title?: string;
  notes?: string;
  linkType?: 'video' | 'doc' | 'pdf' | 'repo' | 'web';
  predictedTags: string[];
  predictedFolder: string;
  status: BulkLinkStatus;
  error?: string;
  selected: boolean;
}

interface Preset {
  name: string;
  batchSize: 10 | 20 | 30 | 40;
  extraTag?: string;
  forceFolderId?: string | null;
  privacy: 'private' | 'public';
  autoCategorize: boolean;
  duplicateHandling: 'skip' | 'overwrite' | 'keepBoth' | 'autoMerge';
}

interface BulkUploaderPrefs {
  defaultBatchSize: 10 | 20 | 30 | 40;
  privacyDefault: 'private' | 'public';
  autoCategorizeDefault: boolean;
  duplicateHandling: 'skip' | 'overwrite' | 'keepBoth' | 'autoMerge';
  backgroundModeDefault: boolean;
  presets: Record<string, Preset>;
}

interface JobState {
  isRunning: boolean;
  total: number;
  completed: number;
  failed: number;
  eta: number;
  logs: string[];
}

// Default preferences
const defaultPrefs: BulkUploaderPrefs = {
  defaultBatchSize: 20,
  privacyDefault: 'private',
  autoCategorizeDefault: true,
  duplicateHandling: 'autoMerge',
  backgroundModeDefault: true,
  presets: {}
};

// Context
interface BulkUploaderState {
  prefs: BulkUploaderPrefs;
  currentSettings: {
    batchSize: 10 | 20 | 30 | 40;
    extraTag: string;
    forceFolderId: string | null;
    privacy: 'private' | 'public';
    autoCategorize: boolean;
    duplicateHandling: 'skip' | 'overwrite' | 'keepBoth' | 'autoMerge';
    backgroundMode: boolean;
  };
  links: BulkLink[];
  selectedLinks: Set<string>;
  jobState: JobState;
  hasUnsavedChanges: boolean;
}

type BulkUploaderAction = 
  | { type: 'SET_PREFS'; payload: Partial<BulkUploaderPrefs> }
  | { type: 'SET_CURRENT_SETTINGS'; payload: Partial<BulkUploaderState['currentSettings']> }
  | { type: 'SET_LINKS'; payload: BulkLink[] }
  | { type: 'UPDATE_LINK'; payload: { id: string; updates: Partial<BulkLink> } }
  | { type: 'TOGGLE_LINK_SELECTION'; payload: string }
  | { type: 'SELECT_ALL_LINKS'; payload: boolean }
  | { type: 'SET_JOB_STATE'; payload: Partial<JobState> }
  | { type: 'SET_UNSAVED_CHANGES'; payload: boolean }
  | { type: 'RESET_TO_DEFAULTS' };

const BulkUploaderContext = createContext<{
  state: BulkUploaderState;
  dispatch: React.Dispatch<BulkUploaderAction>;
} | null>(null);

// Helper functions
const generateId = () => Math.random().toString(36).substr(2, 9);

const detectLinkType = (url: string): 'video' | 'doc' | 'pdf' | 'repo' | 'web' => {
  const urlLower = url.toLowerCase();
  if (urlLower.includes('youtube.com') || urlLower.includes('vimeo.com') || urlLower.includes('twitch.tv')) {
    return 'video';
  }
  if (urlLower.includes('github.com') || urlLower.includes('gitlab.com')) {
    return 'repo';
  }
  if (urlLower.includes('.pdf') || urlLower.includes('pdf')) {
    return 'pdf';
  }
  if (urlLower.includes('docs.google.com') || urlLower.includes('notion.so') || urlLower.includes('.doc')) {
    return 'doc';
  }
  return 'web';
};

const predictTagsAndFolder = (url: string): { tags: string[]; folder: string } => {
  const urlLower = url.toLowerCase();
  const tags: string[] = [];
  let folder = 'General';

  if (urlLower.includes('github.com')) {
    tags.push('development', 'code');
    folder = 'Development';
  } else if (urlLower.includes('youtube.com')) {
    tags.push('video', 'tutorial');
    folder = 'Videos';
  } else if (urlLower.includes('medium.com') || urlLower.includes('dev.to')) {
    tags.push('article', 'blog');
    folder = 'Articles';
  } else if (urlLower.includes('stackoverflow.com')) {
    tags.push('qa', 'programming');
    folder = 'Development';
  }

  return { tags, folder };
};

const parseCsv = (csvText: string): BulkLink[] => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
  
  const urlIndex = headers.findIndex(h => h.includes('url'));
  const titleIndex = headers.findIndex(h => h.includes('title'));
  const notesIndex = headers.findIndex(h => h.includes('notes') || h.includes('description'));

  if (urlIndex === -1) {
    throw new Error('CSV must contain a URL column');
  }

  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const url = values[urlIndex];
    
    if (!url) return null;

    const linkType = detectLinkType(url);
    const { tags, folder } = predictTagsAndFolder(url);

    return {
      id: generateId(),
      url,
      title: titleIndex >= 0 ? values[titleIndex] : undefined,
      notes: notesIndex >= 0 ? values[notesIndex] : undefined,
      linkType,
      predictedTags: tags,
      predictedFolder: folder,
      status: 'queued' as BulkLinkStatus,
      selected: true
    };
  }).filter(Boolean) as BulkLink[];
};

const parseTextLinks = (text: string): BulkLink[] => {
  const urlRegex = /https?:\/\/[^\s]+/g;
  const urls = text.match(urlRegex) || [];
  
  return urls.map(url => {
    const linkType = detectLinkType(url);
    const { tags, folder } = predictTagsAndFolder(url);

    return {
      id: generateId(),
      url,
      linkType,
      predictedTags: tags,
      predictedFolder: folder,
      status: 'queued' as BulkLinkStatus,
      selected: true
    };
  });
};

// Helper function for merging duplicates (currently unused but available for future use)
// const mergeDuplicates = (existing: BulkLink, incoming: BulkLink): BulkLink => {
//   // Remove UTM parameters for comparison
//   const cleanUrl = (url: string) => url.split('?')[0].toLowerCase();
//   
//   if (cleanUrl(existing.url) === cleanUrl(incoming.url)) {
//     return {
//       ...existing,
//       title: incoming.title || existing.title,
//       notes: [existing.notes, incoming.notes].filter(Boolean).join(' | '),
//       predictedTags: [...new Set([...existing.predictedTags, ...incoming.predictedTags])]
//     };
//   }
//   
//   return incoming;
// };

// Reducer
const bulkUploaderReducer = (state: BulkUploaderState, action: BulkUploaderAction): BulkUploaderState => {
  switch (action.type) {
    case 'SET_PREFS':
      return {
        ...state,
        prefs: { ...state.prefs, ...action.payload },
        hasUnsavedChanges: true
      };
    
    case 'SET_CURRENT_SETTINGS':
      return {
        ...state,
        currentSettings: { ...state.currentSettings, ...action.payload },
        hasUnsavedChanges: true
      };
    
    case 'SET_LINKS':
      return {
        ...state,
        links: action.payload,
        selectedLinks: new Set(action.payload.filter(l => l.selected).map(l => l.id))
      };
    
    case 'UPDATE_LINK':
      return {
        ...state,
        links: state.links.map(link => 
          link.id === action.payload.id 
            ? { ...link, ...action.payload.updates }
            : link
        )
      };
    
    case 'TOGGLE_LINK_SELECTION':
      const newSelectedLinks = new Set(state.selectedLinks);
      if (newSelectedLinks.has(action.payload)) {
        newSelectedLinks.delete(action.payload);
      } else {
        newSelectedLinks.add(action.payload);
      }
      return {
        ...state,
        selectedLinks: newSelectedLinks,
        links: state.links.map(link => ({
          ...link,
          selected: link.id === action.payload ? !link.selected : link.selected
        }))
      };
    
    case 'SELECT_ALL_LINKS':
      return {
        ...state,
        selectedLinks: action.payload ? new Set(state.links.map(l => l.id)) : new Set(),
        links: state.links.map(link => ({ ...link, selected: action.payload }))
      };
    
    case 'SET_JOB_STATE':
      return {
        ...state,
        jobState: { ...state.jobState, ...action.payload }
      };
    
    case 'SET_UNSAVED_CHANGES':
      return {
        ...state,
        hasUnsavedChanges: action.payload
      };
    
    case 'RESET_TO_DEFAULTS':
      return {
        ...state,
        currentSettings: {
          batchSize: state.prefs.defaultBatchSize,
          extraTag: '',
          forceFolderId: null,
          privacy: state.prefs.privacyDefault,
          autoCategorize: state.prefs.autoCategorizeDefault,
          duplicateHandling: state.prefs.duplicateHandling,
          backgroundMode: state.prefs.backgroundModeDefault
        },
        hasUnsavedChanges: false
      };
    
    default:
      return state;
  }
};

// Custom hook
const useBulkUploaderPrefs = () => {
  const context = useContext(BulkUploaderContext);
  if (!context) {
    throw new Error('useBulkUploaderPrefs must be used within BulkUploaderProvider');
  }
  return context;
};

// Components
const UnsavedChangesBar: React.FC = () => {
  const { state, dispatch } = useBulkUploaderPrefs();

  if (!state.hasUnsavedChanges) return null;

  const handleReset = () => {
    dispatch({ type: 'RESET_TO_DEFAULTS' });
    toast.success('Settings reset to defaults');
  };

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem('bulkUploaderPrefs', JSON.stringify(state.prefs));
    dispatch({ type: 'SET_UNSAVED_CHANGES', payload: false });
    toast.success('Settings saved successfully');
  };

  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6" role="alert" aria-live="polite">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-amber-400 mr-2" />
          <span className="text-sm font-medium text-amber-800">
            You have unsaved changes
          </span>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReset}
            className="text-amber-800 border-amber-300 hover:bg-amber-100"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
          <Button 
            size="sm" 
            onClick={handleSave}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Save className="h-4 w-4 mr-1" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

const InputTabs: React.FC = () => {
  const { dispatch } = useBulkUploaderPrefs();
  const [pasteText, setPasteText] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const handlePaste = useCallback(() => {
    if (!pasteText.trim()) return;
    
    try {
      const links = parseTextLinks(pasteText);
      dispatch({ type: 'SET_LINKS', payload: links });
      toast.success(`Parsed ${links.length} links from text`);
    } catch (error) {
      toast.error('Failed to parse links from text');
    }
  }, [pasteText, dispatch]);

  const handleCsvUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const links = parseCsv(csvText);
        dispatch({ type: 'SET_LINKS', payload: links });
        toast.success(`Parsed ${links.length} links from CSV`);
      } catch (error) {
        toast.error(`CSV parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    reader.readAsText(file);
  }, [dispatch]);

  return (
    <Tabs defaultValue="paste" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="paste" className="flex items-center">
          <Clipboard className="h-4 w-4 mr-2" />
          Paste Links
        </TabsTrigger>
        <TabsTrigger value="csv" className="flex items-center">
          <Upload className="h-4 w-4 mr-2" />
          Upload CSV
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="paste" className="space-y-4">
        <div>
          <Label htmlFor="paste-textarea">Paste URLs (one per line or space-separated)</Label>
          <Textarea
            id="paste-textarea"
            placeholder="https://example.com&#10;https://github.com/user/repo&#10;https://youtube.com/watch?v=..."
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            className="min-h-[120px] mt-2"
          />
        </div>
        <Button onClick={handlePaste} disabled={!pasteText.trim()}>
          <Clipboard className="h-4 w-4 mr-2" />
          Parse Links
        </Button>
      </TabsContent>
      
      <TabsContent value="csv" className="space-y-4">
        <div>
          <Label htmlFor="csv-upload">Upload CSV file (columns: url, title, notes)</Label>
          <Input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setCsvFile(file);
                handleCsvUpload(file);
              }
            }}
            className="mt-2"
          />
        </div>
        {csvFile && (
          <div className="text-sm text-muted-foreground">
            Selected: {csvFile.name} ({(csvFile.size / 1024).toFixed(1)} KB)
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

const LinkTypeIcon: React.FC<{ type: BulkLink['linkType'] }> = ({ type }) => {
  const iconClass = "h-4 w-4";
  
  switch (type) {
    case 'video': return <Video className={iconClass} />;
    case 'doc': return <FileText className={iconClass} />;
    case 'pdf': return <FileText className={iconClass} />;
    case 'repo': return <Github className={iconClass} />;
    default: return <Globe className={iconClass} />;
  }
};

const StatusBadge: React.FC<{ status: BulkLinkStatus }> = ({ status }) => {
  const variants = {
    queued: 'secondary',
    validating: 'outline',
    processing: 'outline',
    saved: 'default',
    duplicate: 'secondary',
    failed: 'destructive'
  } as const;

  return (
    <Badge variant={variants[status]} className="text-xs">
      {status}
    </Badge>
  );
};

const PreviewGrid: React.FC = () => {
  const { state, dispatch } = useBulkUploaderPrefs();
  const [filterType, setFilterType] = useState<string>('all');

  const filteredLinks = useMemo(() => {
    if (filterType === 'all') return state.links;
    return state.links.filter(link => link.linkType === filterType);
  }, [state.links, filterType]);

  const linkTypes = useMemo(() => {
    const types = [...new Set(state.links.map(link => link.linkType))];
    return types;
  }, [state.links]);

  const handleSelectAll = (checked: boolean) => {
    dispatch({ type: 'SELECT_ALL_LINKS', payload: checked });
  };

  if (state.links.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No links added yet. Use the tabs above to import links.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('all')}
          >
            All ({state.links.length})
          </Button>
          {linkTypes.map(type => (
            <Button
              key={type}
              variant={filterType === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType(type)}
              className="flex items-center"
            >
              <LinkTypeIcon type={type} />
              <span className="ml-1 capitalize">{type}</span>
                             <span className="ml-1">
                 ({state.links.filter(link => link.linkType === type).length})
               </span>
            </Button>
          ))}
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="select-all"
            checked={state.selectedLinks.size === state.links.length}
            onCheckedChange={handleSelectAll}
          />
          <Label htmlFor="select-all" className="text-sm">
            Select all ({state.selectedLinks.size} selected)
          </Label>
        </div>
      </div>

      {/* Links grid */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredLinks.map((link) => (
          <Card key={link.id} className="p-3">
            <div className="flex items-start space-x-3">
              <Checkbox
                checked={link.selected}
                onCheckedChange={() => dispatch({ type: 'TOGGLE_LINK_SELECTION', payload: link.id })}
              />
              
              <img 
                src={`https://www.google.com/s2/favicons?domain=${new URL(link.url).hostname}&sz=32`}
                alt=""
                className="h-6 w-6 rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/favicon.ico';
                }}
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <LinkTypeIcon type={link.linkType} />
                  <span className="font-medium text-sm truncate">
                    {link.title || new URL(link.url).hostname}
                  </span>
                  <StatusBadge status={link.status} />
                </div>
                
                <p className="text-xs text-muted-foreground truncate mb-2">
                  {link.url}
                </p>
                
                <div className="flex items-center space-x-4 text-xs">
                  <div className="flex items-center">
                    <FolderOpen className="h-3 w-3 mr-1" />
                    <span>{link.predictedFolder}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Tag className="h-3 w-3" />
                    {link.predictedTags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs py-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {link.error && (
                  <p className="text-xs text-red-600 mt-1">{link.error}</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const SidebarControls: React.FC = () => {
  const { state, dispatch } = useBulkUploaderPrefs();
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  const handleSettingChange = <K extends keyof BulkUploaderState['currentSettings']>(
    key: K,
    value: BulkUploaderState['currentSettings'][K]
  ) => {
    dispatch({ type: 'SET_CURRENT_SETTINGS', payload: { [key]: value } });
  };

  const handleSavePreset = () => {
    if (!newPresetName.trim()) return;
    
    const preset: Preset = {
      name: newPresetName,
      batchSize: state.currentSettings.batchSize,
      extraTag: state.currentSettings.extraTag,
      forceFolderId: state.currentSettings.forceFolderId,
      privacy: state.currentSettings.privacy,
      autoCategorize: state.currentSettings.autoCategorize,
      duplicateHandling: state.currentSettings.duplicateHandling
    };

    dispatch({ 
      type: 'SET_PREFS', 
      payload: { 
        presets: { 
          ...state.prefs.presets, 
          [newPresetName]: preset 
        } 
      } 
    });
    
    setNewPresetName('');
    setShowPresetModal(false);
    toast.success(`Preset "${newPresetName}" saved`);
  };

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Settings2 className="h-5 w-5 mr-2" />
          Batch Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Batch Size */}
        <div>
          <Label>Batch Size</Label>
          <Select 
            value={state.currentSettings.batchSize.toString()} 
            onValueChange={(value) => handleSettingChange('batchSize', parseInt(value) as 10|20|30|40)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 links</SelectItem>
              <SelectItem value="20">20 links</SelectItem>
              <SelectItem value="30">30 links</SelectItem>
              <SelectItem value="40">40 links</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Presets */}
        <div>
          <Label>Import Preset</Label>
          <div className="flex space-x-2 mt-2">
            <Select>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select preset..." />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(state.prefs.presets).map(presetName => (
                  <SelectItem key={presetName} value={presetName}>
                    {presetName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Dialog open={showPresetModal} onOpenChange={setShowPresetModal}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Star className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Current Settings as Preset</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="preset-name">Preset Name</Label>
                    <Input
                      id="preset-name"
                      value={newPresetName}
                      onChange={(e) => setNewPresetName(e.target.value)}
                      placeholder="e.g., Dev Resources"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowPresetModal(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSavePreset} disabled={!newPresetName.trim()}>
                      Save Preset
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Separator />

        {/* Overrides */}
        <div>
          <h4 className="font-medium mb-3">Overrides</h4>
          <div className="space-y-4">
            <div>
              <Label htmlFor="extra-tag">Extra tag for all</Label>
              <Input
                id="extra-tag"
                value={state.currentSettings.extraTag}
                onChange={(e) => handleSettingChange('extraTag', e.target.value)}
                placeholder="e.g., imported-2024"
              />
            </div>
            
            <div>
              <Label>Force into folder</Label>
                             <Select 
                 value={state.currentSettings.forceFolderId || 'auto'} 
                 onValueChange={(value) => handleSettingChange('forceFolderId', value === 'auto' ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Auto-categorize" />
                </SelectTrigger>
                                 <SelectContent>
                   <SelectItem value="auto">Auto-categorize</SelectItem>
                   <SelectItem value="general">General</SelectItem>
                   <SelectItem value="development">Development</SelectItem>
                   <SelectItem value="articles">Articles</SelectItem>
                   <SelectItem value="videos">Videos</SelectItem>
                 </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        {/* Privacy */}
        <div>
          <Label>Privacy</Label>
          <RadioGroup 
            value={state.currentSettings.privacy} 
            onValueChange={(value: 'private' | 'public') => handleSettingChange('privacy', value)}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="private" id="private" />
              <Label htmlFor="private" className="flex items-center">
                <EyeOff className="h-4 w-4 mr-1" />
                Private
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="public" id="public" />
              <Label htmlFor="public" className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                Public
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Toggles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-categorize">Auto-categorize</Label>
            <Switch
              id="auto-categorize"
              checked={state.currentSettings.autoCategorize}
              onCheckedChange={(checked) => handleSettingChange('autoCategorize', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="background-mode">Run in background</Label>
            <Switch
              id="background-mode"
              checked={state.currentSettings.backgroundMode}
              onCheckedChange={(checked) => handleSettingChange('backgroundMode', checked)}
            />
          </div>
        </div>

        {/* Duplicate Handling */}
        <div>
          <Label>Duplicate strategy</Label>
          <Select 
            value={state.currentSettings.duplicateHandling} 
            onValueChange={(value: typeof state.currentSettings.duplicateHandling) => 
              handleSettingChange('duplicateHandling', value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="skip">Skip duplicates</SelectItem>
              <SelectItem value="overwrite">Overwrite existing</SelectItem>
              <SelectItem value="keepBoth">Keep both</SelectItem>
              <SelectItem value="autoMerge">Auto-merge</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

const ProgressDonut: React.FC = () => {
  const { state } = useBulkUploaderPrefs();
  const { jobState } = state;
  
  if (!jobState.isRunning && jobState.completed === 0) return null;

  const percentage = jobState.total > 0 ? (jobState.completed / jobState.total) * 100 : 0;
  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="p-4 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="text-muted-foreground"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={strokeDasharray}
                className="text-primary transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium">{Math.round(percentage)}%</span>
            </div>
          </div>
          
          <div className="text-sm">
            <div className="font-medium">
              {jobState.completed} / {jobState.total}
            </div>
            <div className="text-muted-foreground">
              ETA: {Math.round(jobState.eta)}s
            </div>
            {jobState.failed > 0 && (
              <div className="text-red-600">
                {jobState.failed} failed
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

const ImportButton: React.FC = () => {
  const { state, dispatch } = useBulkUploaderPrefs();
  const selectedCount = state.selectedLinks.size;
  
  const handleImport = async () => {
    if (selectedCount === 0) {
      toast.error('Please select links to import');
      return;
    }

    const selectedLinks = state.links.filter(link => link.selected);
    
    dispatch({ 
      type: 'SET_JOB_STATE', 
      payload: { 
        isRunning: true, 
        total: selectedCount, 
        completed: 0, 
        failed: 0,
        eta: selectedCount * 2, // 2 seconds per link estimate
        logs: [`Starting import of ${selectedCount} links...`]
      } 
    });

    try {
      // Prepare API request
      const apiRequest = {
        links: selectedLinks.map(link => ({
          url: link.url,
          title: link.title,
          notes: link.notes
        })),
        settings: {
          batchSize: state.currentSettings.batchSize,
          extraTag: state.currentSettings.extraTag,
          forceFolderId: state.currentSettings.forceFolderId,
          privacy: state.currentSettings.privacy,
          autoCategorize: state.currentSettings.autoCategorize,
          duplicateHandling: state.currentSettings.duplicateHandling,
          backgroundMode: state.currentSettings.backgroundMode,
          language: 'english' // TODO: Get from user settings
        }
      };

      // Update all selected links to processing status
      selectedLinks.forEach(link => {
        dispatch({ 
          type: 'UPDATE_LINK', 
          payload: { 
            id: link.id, 
            updates: { status: 'processing' } 
          } 
        });
      });

      dispatch({ 
        type: 'SET_JOB_STATE', 
        payload: { 
          logs: [...state.jobState.logs, '🔗 Sending links to AI processing...']
        } 
      });

      // Call the bulk uploader API
      const response = await fetch('/api/ai/bulk-uploader', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiRequest),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'API processing failed');
      }

             // Update links with API results
       result.processedLinks.forEach((processedLink: BulkLink) => {
        const originalLink = selectedLinks.find(l => l.url === processedLink.url);
        if (originalLink) {
          dispatch({ 
            type: 'UPDATE_LINK', 
            payload: { 
              id: originalLink.id, 
              updates: {
                status: processedLink.status,
                title: processedLink.title || originalLink.title,
                notes: processedLink.notes || originalLink.notes,
                predictedTags: processedLink.predictedTags || originalLink.predictedTags,
                predictedFolder: processedLink.predictedFolder || originalLink.predictedFolder,
                error: processedLink.error
              }
            } 
          });
        }
      });

      dispatch({ 
        type: 'SET_JOB_STATE', 
        payload: { 
          isRunning: false,
          completed: result.totalProcessed,
          failed: result.totalFailed,
          logs: [
            ...state.jobState.logs,
            `✅ Processing completed in ${result.processingTime}ms`,
            `📊 Results: ${result.totalSuccessful} successful, ${result.totalFailed} failed`,
            ...result.warnings.map((w: string) => `⚠️ ${w}`),
            ...result.errors.map((e: string) => `❌ ${e}`)
          ]
        } 
      });

      // Show success toast
      const successMessage = `✅ ${result.totalSuccessful} links processed successfully`;
      const failureMessage = result.totalFailed > 0 ? ` · ${result.totalFailed} failed` : '';
      
      toast.success(`${successMessage}${failureMessage}`, {
        action: {
          label: 'View Details',
          onClick: () => {
            // Could open a detailed report modal
            console.log('Full processing result:', result);
          }
        }
      });

    } catch (error) {
      console.error('Bulk import error:', error);
      
      // Update all processing links to failed
      selectedLinks.forEach(link => {
        if (link.status === 'processing') {
          dispatch({ 
            type: 'UPDATE_LINK', 
            payload: { 
              id: link.id, 
              updates: { 
                status: 'failed',
                error: error instanceof Error ? error.message : 'Unknown error'
              } 
            } 
          });
        }
      });

      dispatch({ 
        type: 'SET_JOB_STATE', 
        payload: { 
          isRunning: false,
          failed: selectedCount,
          logs: [
            ...state.jobState.logs,
            `❌ Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          ]
        } 
      });

      toast.error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Button 
      onClick={handleImport} 
      disabled={selectedCount === 0 || state.jobState.isRunning}
      size="lg"
      className="w-full"
    >
      {state.jobState.isRunning ? (
        <>
          <Pause className="h-4 w-4 mr-2" />
          Processing...
        </>
      ) : (
        <>
          <Play className="h-4 w-4 mr-2" />
          Import {selectedCount} Link{selectedCount !== 1 ? 's' : ''}
        </>
      )}
    </Button>
  );
};

// Provider component
const BulkUploaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(bulkUploaderReducer, {
    prefs: defaultPrefs,
    currentSettings: {
      batchSize: defaultPrefs.defaultBatchSize,
      extraTag: '',
      forceFolderId: null,
      privacy: defaultPrefs.privacyDefault,
      autoCategorize: defaultPrefs.autoCategorizeDefault,
      duplicateHandling: defaultPrefs.duplicateHandling,
      backgroundMode: defaultPrefs.backgroundModeDefault
    },
    links: [],
    selectedLinks: new Set<string>(),
    jobState: {
      isRunning: false,
      total: 0,
      completed: 0,
      failed: 0,
      eta: 0,
      logs: []
    },
    hasUnsavedChanges: false
  });

  // Load preferences from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('bulkUploaderPrefs');
    if (saved) {
      try {
        const prefs = JSON.parse(saved);
        dispatch({ type: 'SET_PREFS', payload: prefs });
      } catch (error) {
        console.error('Failed to load bulk uploader preferences:', error);
      }
    }
  }, []);

  useEffect(() => {
    ;(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        try {
          const remote = await getAISetting<BulkUploaderPrefs>(user.id, 'bulk_uploader', defaultPrefs)
          dispatch({ type: 'SET_PREFS', payload: remote })
        } catch (error) {
          console.error('Failed to load bulk uploader settings:', error)
        }
      }
    })()
  }, [])



  return (
    <BulkUploaderContext.Provider value={{ state, dispatch }}>
      {children}
    </BulkUploaderContext.Provider>
  );
};

// Main component
export default function BulkUploaderPage() {
  return (
    <BulkUploaderProvider>
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Magic Bulk Link Uploader</h1>
          <p className="text-muted-foreground">
            Import multiple links at once with intelligent categorization and batch processing
          </p>
        </div>

        <UnsavedChangesBar />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Import Links</CardTitle>
              </CardHeader>
              <CardContent>
                <InputTabs />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preview & Edit</CardTitle>
              </CardHeader>
              <CardContent>
                <PreviewGrid />
              </CardContent>
            </Card>

            <ImportButton />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <SidebarControls />
          </div>
        </div>

        <ProgressDonut />
      </div>
    </BulkUploaderProvider>
  );
} 