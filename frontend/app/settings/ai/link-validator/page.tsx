"use client";

import React, { createContext, useContext, useReducer, useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { 
  ShieldCheck, 
  Clock, 
  Mail, 
  Bug, 
  RefreshCw,
  Play,
  Pause,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
  History,
  Trash2,
  Move,
  RotateCcw,
  Save,
  Calendar,
  Globe,
  Filter
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis } from 'recharts';
import { supabase } from '@/lib/supabase'
import { getAISetting, saveAISetting } from '@/lib/user-settings-service'

// Types
type HealthStatus = 'ok' | 'redirect' | 'broken' | 'timeout' | 'phishing';

interface LinkValidatorPrefs {
  scope: 'all' | 'selected';
  selectedIds: string[];
  schedule: 'off' | 'daily' | 'weekly' | 'monthly';
  emailSummary: boolean;
  autoMoveBroken: boolean;
  lastRunAt?: string;
}

interface ValidatorResult {
  bookmarkId: string;
  url: string;
  status: HealthStatus;
  checkedAt: string;
  redirectTo?: string;
  error?: string;
  title?: string;
  selected: boolean;
}

interface ValidationJob {
  isRunning: boolean;
  total: number;
  completed: number;
  failed: number;
  eta: number;
  startedAt?: string;
}

interface HistoryEntry {
  id: string;
  runAt: string;
  scope: string;
  totalChecked: number;
  results: { [key in HealthStatus]: number };
}

// Default preferences
const defaultPrefs: LinkValidatorPrefs = {
  scope: 'all',
  selectedIds: [],
  schedule: 'off',
  emailSummary: true,
  autoMoveBroken: false
};

// Context
interface LinkValidatorState {
  prefs: LinkValidatorPrefs;
  results: ValidatorResult[];
  linkHealthMap: Map<string, { status: HealthStatus; checkedAt: string; error?: string }>;
  validationJob: ValidationJob;
  history: HistoryEntry[];
  selectedResults: Set<string>;
  hasUnsavedChanges: boolean;
  extraLinks: string;
}

type LinkValidatorAction = 
  | { type: 'SET_PREFS'; payload: Partial<LinkValidatorPrefs> }
  | { type: 'SET_RESULTS'; payload: ValidatorResult[] }
  | { type: 'UPDATE_RESULT'; payload: { id: string; updates: Partial<ValidatorResult> } }
  | { type: 'SET_VALIDATION_JOB'; payload: Partial<ValidationJob> }
  | { type: 'ADD_HISTORY_ENTRY'; payload: HistoryEntry }
  | { type: 'TOGGLE_RESULT_SELECTION'; payload: string }
  | { type: 'SELECT_ALL_RESULTS'; payload: boolean }
  | { type: 'SET_UNSAVED_CHANGES'; payload: boolean }
  | { type: 'SET_EXTRA_LINKS'; payload: string }
  | { type: 'RESET_TO_DEFAULTS' };

const LinkValidatorContext = createContext<{
  state: LinkValidatorState;
  dispatch: React.Dispatch<LinkValidatorAction>;
} | null>(null);

// Helper functions
const generateId = () => Math.random().toString(36).substr(2, 9);

const validateURL = async (url: string): Promise<{ status: HealthStatus; redirectTo?: string; error?: string }> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'manual'
    });

    clearTimeout(timeoutId);

    if (response.status >= 300 && response.status < 400) {
      const redirectTo = response.headers.get('location');
      return { status: 'redirect', redirectTo: redirectTo || undefined };
    }

    if (response.status >= 400) {
      return { status: 'broken', error: `HTTP ${response.status}` };
    }

    return { status: 'ok' };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { status: 'timeout', error: 'Request timeout' };
    }
    return { status: 'broken', error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

const formatTimeAgo = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
};

// Reducer
const linkValidatorReducer = (state: LinkValidatorState, action: LinkValidatorAction): LinkValidatorState => {
  switch (action.type) {
    case 'SET_PREFS':
      return {
        ...state,
        prefs: { ...state.prefs, ...action.payload },
        hasUnsavedChanges: true
      };
    
    case 'SET_RESULTS':
      return {
        ...state,
        results: action.payload,
        selectedResults: new Set(action.payload.filter(r => r.selected).map(r => r.bookmarkId))
      };
    
    case 'UPDATE_RESULT':
      return {
        ...state,
        results: state.results.map(result => 
          result.bookmarkId === action.payload.id 
            ? { ...result, ...action.payload.updates }
            : result
        )
      };
    
    case 'SET_VALIDATION_JOB':
      return {
        ...state,
        validationJob: { ...state.validationJob, ...action.payload }
      };
    
    case 'ADD_HISTORY_ENTRY':
      return {
        ...state,
        history: [action.payload, ...state.history.slice(0, 9)] // Keep last 10 entries
      };
    
    case 'TOGGLE_RESULT_SELECTION':
      const newSelectedResults = new Set(state.selectedResults);
      if (newSelectedResults.has(action.payload)) {
        newSelectedResults.delete(action.payload);
      } else {
        newSelectedResults.add(action.payload);
      }
      return {
        ...state,
        selectedResults: newSelectedResults,
        results: state.results.map(result => ({
          ...result,
          selected: result.bookmarkId === action.payload ? !result.selected : result.selected
        }))
      };
    
    case 'SELECT_ALL_RESULTS':
      return {
        ...state,
        selectedResults: action.payload ? new Set(state.results.map(r => r.bookmarkId)) : new Set(),
        results: state.results.map(result => ({ ...result, selected: action.payload }))
      };
    
    case 'SET_UNSAVED_CHANGES':
      return {
        ...state,
        hasUnsavedChanges: action.payload
      };
    
    case 'SET_EXTRA_LINKS':
      return {
        ...state,
        extraLinks: action.payload
      };
    
    case 'RESET_TO_DEFAULTS':
      return {
        ...state,
        prefs: defaultPrefs,
        hasUnsavedChanges: false
      };
    
    default:
      return state;
  }
};

// Custom hook
const useLinkValidator = () => {
  const context = useContext(LinkValidatorContext);
  if (!context) {
    throw new Error('useLinkValidator must be used within LinkValidatorProvider');
  }
  return context;
};

// Components
const HealthBadge: React.FC<{ 
  status: HealthStatus; 
  checkedAt?: string; 
  redirectTo?: string; 
  error?: string;
  size?: 'sm' | 'md';
}> = ({ status, checkedAt, redirectTo, error, size = 'md' }) => {
  const getStatusConfig = (status: HealthStatus) => {
    switch (status) {
      case 'ok':
        return { 
          color: 'bg-green-500', 
          label: 'Link OK', 
          icon: CheckCircle,
          variant: 'default' as const
        };
      case 'redirect':
        return { 
          color: 'bg-yellow-500', 
          label: 'Redirect', 
          icon: ArrowRight,
          variant: 'secondary' as const
        };
      case 'broken':
        return { 
          color: 'bg-red-500', 
          label: 'Broken', 
          icon: XCircle,
          variant: 'destructive' as const
        };
      case 'timeout':
        return { 
          color: 'bg-orange-500', 
          label: 'Timeout', 
          icon: Clock,
          variant: 'outline' as const
        };
      case 'phishing':
        return { 
          color: 'bg-purple-500', 
          label: 'Phishing', 
          icon: Bug,
          variant: 'destructive' as const
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;
  
  const tooltipContent = () => {
    if (status === 'redirect' && redirectTo) {
      return `Redirects to: ${redirectTo}`;
    }
    if (error) {
      return `${config.label}: ${error}`;
    }
    if (checkedAt) {
      return `${config.label} - Checked ${formatTimeAgo(checkedAt)}`;
    }
    return config.label;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={config.variant} 
            className={`flex items-center gap-1 ${size === 'sm' ? 'text-xs px-1.5 py-0.5' : ''}`}
            aria-label={config.label}
          >
            <div className={`w-2 h-2 rounded-full ${config.color}`} />
            {size === 'md' && <Icon className="h-3 w-3" />}
            <span className="capitalize">{status}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipContent()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const UnsavedChangesBar: React.FC = () => {
  const { state, dispatch } = useLinkValidator();

  if (!state.hasUnsavedChanges) return null;

  const handleReset = () => {
    dispatch({ type: 'RESET_TO_DEFAULTS' });
    toast.success('Settings reset to defaults');
  };

  const handleSave = () => {
    savePreferences(state.prefs);
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

const ScopePanel: React.FC = () => {
  const { state, dispatch } = useLinkValidator();

  const handleScopeChange = (scope: 'all' | 'selected') => {
    dispatch({ type: 'SET_PREFS', payload: { scope } });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Scope & Input
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Validation Scope</Label>
          <RadioGroup 
            value={state.prefs.scope} 
            onValueChange={handleScopeChange}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="scope-all" />
              <Label htmlFor="scope-all">All links in my bookmarks</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="selected" id="scope-selected" />
              <Label htmlFor="scope-selected">Select specific folders/bookmarks</Label>
            </div>
          </RadioGroup>
        </div>

        {state.prefs.scope === 'selected' && (
          <div>
            <Label>Selected Items</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Choose folders and bookmarks..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="folder-1">📁 Development</SelectItem>
                <SelectItem value="folder-2">📁 Articles</SelectItem>
                <SelectItem value="folder-3">📁 Videos</SelectItem>
                <SelectItem value="bookmark-1">🔗 GitHub Repository</SelectItem>
                <SelectItem value="bookmark-2">🔗 Documentation Site</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">
              {state.prefs.selectedIds.length} items selected
            </p>
          </div>
        )}

        <div>
          <Label htmlFor="extra-links">Add extra links (optional)</Label>
          <Textarea
            id="extra-links"
            placeholder="https://example.com&#10;https://another-site.com"
            value={state.extraLinks}
            onChange={(e) => dispatch({ type: 'SET_EXTRA_LINKS', payload: e.target.value })}
            className="mt-1"
            rows={3}
          />
          <p className="text-sm text-muted-foreground mt-1">
            One URL per line. Valid URLs will be added as new bookmarks.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const SchedulePanel: React.FC = () => {
  const { state, dispatch } = useLinkValidator();

  const handleScheduleChange = (schedule: LinkValidatorPrefs['schedule']) => {
    dispatch({ type: 'SET_PREFS', payload: { schedule } });
  };

  const handleToggle = (key: keyof LinkValidatorPrefs, value: boolean) => {
    dispatch({ type: 'SET_PREFS', payload: { [key]: value } });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Schedule & Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Automatic Schedule</Label>
          <Select value={state.prefs.schedule} onValueChange={handleScheduleChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="off">Off (manual only)</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <Label htmlFor="email-summary">Email me summary</Label>
            </div>
            <Switch
              id="email-summary"
              checked={state.prefs.emailSummary}
              onCheckedChange={(checked) => handleToggle('emailSummary', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Move className="h-4 w-4" />
              <Label htmlFor="auto-move-broken">Auto-move broken links to "Broken" folder</Label>
            </div>
            <Switch
              id="auto-move-broken"
              checked={state.prefs.autoMoveBroken}
              onCheckedChange={(checked) => handleToggle('autoMoveBroken', checked)}
            />
          </div>
        </div>

        {state.prefs.lastRunAt && (
          <div className="text-sm text-muted-foreground">
            <Clock className="h-4 w-4 inline mr-1" />
            Last run: {formatTimeAgo(state.prefs.lastRunAt)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ProgressDonut: React.FC = () => {
  const { state } = useLinkValidator();
  const { validationJob } = state;
  
  if (!validationJob.isRunning && validationJob.completed === 0) return null;

  const percentage = validationJob.total > 0 ? (validationJob.completed / validationJob.total) * 100 : 0;
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
              {validationJob.completed} / {validationJob.total}
            </div>
            <div className="text-muted-foreground">
              ETA: {Math.round(validationJob.eta)}s
            </div>
            {validationJob.failed > 0 && (
              <div className="text-red-600">
                {validationJob.failed} failed
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

const ResultsTable: React.FC = () => {
  const { state, dispatch } = useLinkValidator();
  const [statusFilter, setStatusFilter] = useState<HealthStatus | 'all'>('all');

  const filteredResults = useMemo(() => {
    if (statusFilter === 'all') return state.results;
    return state.results.filter(result => result.status === statusFilter);
  }, [state.results, statusFilter]);

  const handleSelectAll = (checked: boolean) => {
    dispatch({ type: 'SELECT_ALL_RESULTS', payload: checked });
  };

  const handleBulkAction = (action: 'update' | 'move' | 'delete') => {
    const selectedCount = state.selectedResults.size;
    if (selectedCount === 0) return;

    switch (action) {
      case 'update':
        toast.success(`Updated ${selectedCount} redirect URLs`);
        break;
      case 'move':
        toast.success(`Moved ${selectedCount} links to Broken folder`);
        break;
      case 'delete':
        toast.success(`Deleted ${selectedCount} broken links`);
        break;
    }
  };

  if (state.results.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <ShieldCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No validation results yet. Run a scan to see link health status.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Validation Results</CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={statusFilter} onValueChange={(value: HealthStatus | 'all') => setStatusFilter(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ({state.results.length})</SelectItem>
                <SelectItem value="ok">OK ({state.results.filter(r => r.status === 'ok').length})</SelectItem>
                <SelectItem value="redirect">Redirects ({state.results.filter(r => r.status === 'redirect').length})</SelectItem>
                <SelectItem value="broken">Broken ({state.results.filter(r => r.status === 'broken').length})</SelectItem>
                <SelectItem value="timeout">Timeout ({state.results.filter(r => r.status === 'timeout').length})</SelectItem>
                <SelectItem value="phishing">Phishing ({state.results.filter(r => r.status === 'phishing').length})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {state.selectedResults.size > 0 && (
          <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
            <span className="text-sm font-medium">
              {state.selectedResults.size} selected
            </span>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('update')}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Update redirects
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('move')}>
                <Move className="h-4 w-4 mr-1" />
                Move to Broken
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleBulkAction('delete')}>
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={state.selectedResults.size === state.results.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Checked</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResults.map((result) => (
              <TableRow key={result.bookmarkId}>
                <TableCell>
                  <Checkbox
                    checked={result.selected}
                    onCheckedChange={() => dispatch({ type: 'TOGGLE_RESULT_SELECTION', payload: result.bookmarkId })}
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium truncate max-w-xs">
                      {result.title || new URL(result.url).hostname}
                    </div>
                    <div className="text-sm text-muted-foreground truncate max-w-xs">
                      {result.url}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <HealthBadge 
                    status={result.status}
                    checkedAt={result.checkedAt}
                    redirectTo={result.redirectTo}
                    error={result.error}
                  />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatTimeAgo(result.checkedAt)}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    {result.status === 'redirect' && (
                      <Button size="sm" variant="outline">
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    )}
                    {(result.status === 'broken' || result.status === 'timeout') && (
                      <Button size="sm" variant="outline">
                        <Move className="h-3 w-3" />
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Globe className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const ChartsSidebar: React.FC = () => {
  const { state } = useLinkValidator();

  const statusData = useMemo(() => {
    const statusCounts = state.results.reduce((acc, result) => {
      acc[result.status] = (acc[result.status] || 0) + 1;
      return acc;
    }, {} as Record<HealthStatus, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
      color: {
        ok: '#22c55e',
        redirect: '#eab308',
        broken: '#ef4444',
        timeout: '#f97316',
        phishing: '#a855f7'
      }[status as HealthStatus]
    }));
  }, [state.results]);

  const trendData = useMemo(() => {
    return state.history.slice(0, 7).reverse().map((entry, index) => ({
      run: `Run ${index + 1}`,
      broken: entry.results.broken || 0,
      total: entry.totalChecked
    }));
  }, [state.history]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {statusData.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
          
          {statusData.length > 0 && (
            <div className="mt-4 space-y-2">
              {statusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="capitalize">{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Broken Links Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {trendData.length > 0 ? (
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <XAxis dataKey="run" hide />
                  <YAxis hide />
                  <Line 
                    type="monotone" 
                    dataKey="broken" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    dot={{ fill: '#ef4444', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-muted-foreground">
              No trend data yet
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <History className="h-4 w-4 mr-2" />
            Recent Scans
          </CardTitle>
        </CardHeader>
        <CardContent>
          {state.history.length > 0 ? (
            <div className="space-y-3">
              {state.history.slice(0, 5).map((entry) => (
                <div key={entry.id} className="text-sm">
                  <div className="font-medium">
                    {formatTimeAgo(entry.runAt)}
                  </div>
                  <div className="text-muted-foreground">
                    {entry.totalChecked} links • {entry.results.broken || 0} broken
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No scan history yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const ScanButton: React.FC = () => {
  const { state, dispatch } = useLinkValidator();

  const handleScan = async () => {
    // Mock data for demonstration
    const mockBookmarks = [
      { id: '1', url: 'https://github.com/vercel/next.js', title: 'Next.js Repository' },
      { id: '2', url: 'https://reactjs.org', title: 'React Documentation' },
      { id: '3', url: 'https://invalid-url-example.com', title: 'Broken Link' },
      { id: '4', url: 'https://httpbin.org/redirect/1', title: 'Redirect Test' },
      { id: '5', url: 'https://httpbin.org/delay/10', title: 'Timeout Test' }
    ];

    const totalLinks = mockBookmarks.length;
    
    dispatch({ 
      type: 'SET_VALIDATION_JOB', 
      payload: { 
        isRunning: true, 
        total: totalLinks, 
        completed: 0, 
        failed: 0,
        eta: totalLinks * 2,
        startedAt: new Date().toISOString()
      } 
    });

    const results: ValidatorResult[] = [];

    for (let i = 0; i < mockBookmarks.length; i++) {
      const bookmark = mockBookmarks[i];
      
      // Simulate validation
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      // Mock different results
      let status: HealthStatus;
      let redirectTo: string | undefined;
      let error: string | undefined;

      if (bookmark.url.includes('invalid-url')) {
        status = 'broken';
        error = 'HTTP 404';
      } else if (bookmark.url.includes('redirect')) {
        status = 'redirect';
        redirectTo = 'https://httpbin.org/get';
      } else if (bookmark.url.includes('delay')) {
        status = 'timeout';
        error = 'Request timeout';
      } else {
        status = 'ok';
      }

      const result: ValidatorResult = {
        bookmarkId: bookmark.id,
        url: bookmark.url,
        title: bookmark.title,
        status,
        checkedAt: new Date().toISOString(),
        redirectTo,
        error,
        selected: false
      };

      results.push(result);

      dispatch({ 
        type: 'SET_VALIDATION_JOB', 
        payload: { 
          completed: i + 1,
          failed: results.filter(r => r.status === 'broken' || r.status === 'timeout').length,
          eta: (totalLinks - i - 1) * 2
        } 
      });
    }

    dispatch({ type: 'SET_RESULTS', payload: results });
    dispatch({ 
      type: 'SET_VALIDATION_JOB', 
      payload: { isRunning: false } 
    });

    // Add to history
    const historyEntry: HistoryEntry = {
      id: generateId(),
      runAt: new Date().toISOString(),
      scope: state.prefs.scope,
      totalChecked: totalLinks,
      results: results.reduce((acc, result) => {
        acc[result.status] = (acc[result.status] || 0) + 1;
        return acc;
      }, {} as Record<HealthStatus, number>)
    };

    dispatch({ type: 'ADD_HISTORY_ENTRY', payload: historyEntry });
    dispatch({ type: 'SET_PREFS', payload: { lastRunAt: new Date().toISOString() } });

    const brokenCount = results.filter(r => r.status === 'broken').length;
    const redirectCount = results.filter(r => r.status === 'redirect').length;
    
    toast.success(
      `Scan completed! ${results.length - brokenCount - redirectCount} OK, ${redirectCount} redirects, ${brokenCount} broken`,
      {
        action: {
          label: 'View Results',
          onClick: () => {
            document.getElementById('results-table')?.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    );
  };

  return (
    <Button 
      onClick={handleScan} 
      disabled={state.validationJob.isRunning}
      size="lg"
      className="w-full"
    >
      {state.validationJob.isRunning ? (
        <>
          <Pause className="h-4 w-4 mr-2" />
          Scanning...
        </>
      ) : (
        <>
          <Play className="h-4 w-4 mr-2" />
          Scan Now
        </>
      )}
    </Button>
  );
};

// Provider component
const LinkValidatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(linkValidatorReducer, {
    prefs: defaultPrefs,
    results: [],
    linkHealthMap: new Map(),
    validationJob: {
      isRunning: false,
      total: 0,
      completed: 0,
      failed: 0,
      eta: 0
    },
    history: [],
    selectedResults: new Set(),
    hasUnsavedChanges: false,
    extraLinks: ''
  });

  // Load preferences from localStorage on mount
  useEffect(() => {
    ;(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        try {
          const remote = await getOracleSetting<LinkValidatorPrefs>(user.id, 'link_validator', defaultPrefs)
          dispatch({ type: 'SET_PREFS', payload: remote })
        } catch (error) {
          console.error('Failed to load link validator settings:', error)
        }
      }
    })()
  }, [])

  const savePreferences = async (prefs: LinkValidatorPrefs) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      try {
        await saveAISetting<LinkValidatorPrefs>(user.id, 'link_validator', prefs)
        toast.success('Link validator preferences saved')
      } catch (error) {
        console.error('Failed to save link validator preferences:', error)
        toast.error('Failed to save preferences')
      }
    }
  }

  return (
    <LinkValidatorContext.Provider value={{ state, dispatch }}>
      {children}
    </LinkValidatorContext.Provider>
  );
};

// Main component
export default function LinkValidatorPage() {
  return (
    <LinkValidatorProvider>
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Link Validator</h1>
          <p className="text-muted-foreground">
            Monitor and maintain the health of your bookmarked links with automated validation
          </p>
        </div>

        <UnsavedChangesBar />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ScopePanel />
              <SchedulePanel />
            </div>

            <ScanButton />

            <div id="results-table">
              <ResultsTable />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ChartsSidebar />
          </div>
        </div>

        <ProgressDonut />
      </div>
    </LinkValidatorProvider>
  );
} 