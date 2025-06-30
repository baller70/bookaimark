/* eslint-disable react/no-unescaped-entities, @typescript-eslint/no-explicit-any */
'use client'

import React, { useState, useEffect, useRef } from 'react'
import tinycolor from 'tinycolor2';
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import { Switch } from '@/src/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select'
import { Input } from '@/src/components/ui/input'
import { Textarea } from '@/src/components/ui/textarea'
import { Slider } from '@/src/components/ui/slider'
import { Separator } from '@/src/components/ui/separator'
import { Label } from '@/src/components/ui/label'
import { Progress } from '@/src/components/ui/progress'
import { toast } from 'sonner'
import * as Sentry from '@sentry/nextjs'
import { 
  Settings, 
  Palette, 
  Shield, 
  Database,
  Bell,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Eye,
  Lock,
  Globe,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Zap,
  Save,
  RotateCcw,
  ArrowLeft,
  Volume2,
  Key,
  FileText,
  Search,
  Grid,
  List,
  BarChart3,
  PieChart,
  TrendingUp,
  Star,
  Heart,
  Check,
  Plus,
  Cloud,
  CreditCard,
  QrCode,
  Target,
  Store,
  Mail,
  ShieldCheck,
  LogOut
} from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/src/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs'
import { RadioGroup, RadioGroupItem } from '@/src/components/ui/radio-group'
import { supabase } from '@/src/lib/supabase';

export default function EnhancedBookmarkSettings() {
  const router = useRouter();
  
  // Apply theme selection to document
  // Validate settings structure to prevent corruption
  const validateSettings = (settings: any): boolean => {
    try {
      return !!(
        settings &&
        settings.notifications &&
        settings.notifications.channels &&
        typeof settings.notifications.channels.email !== 'undefined' &&
        settings.appearance &&
        settings.behavior &&
        settings.privacy
      );
    } catch (error) {
      Sentry.captureException(error, {
        tags: { component: 'settings', action: 'validate_settings' },
        extra: { settings }
      });
      return false;
    }
  };

  const applyTheme = (theme: string) => {
    if (typeof window === 'undefined') return;
    const root = window.document.documentElement;
    if (theme === 'system') {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    } else if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };
  
  const [settings, setSettings] = useState({
    // Appearance
    appearance: {
      theme: 'light',
      autoSchedule: false,
      scheduleStart: '19:00',
      scheduleEnd: '07:00',
      accentColor: 'blue',
      customColor: '#3b82f6',
      fontSize: 14,
      dyslexiaFont: false,
      layoutDensity: 'comfortable',
      motionEnabled: true,
      backgroundType: 'none',
      customBackground: '',
      backgroundPattern: 'dots'
    },
    
    // Behavior
    behavior: {
      defaultView: 'grid',
      linkOpening: 'new-tab',
      dragSensitivity: 50,
      autoSave: true,
      draftExpiration: '7days',
      confirmations: 'simple',
      aiSuggestionFrequency: 'on-save',
      defaultSort: 'date-added'
    },
    
    // Notifications
    notifications: {
      channels: {
        email: true,
        inApp: true,
        push: false
      },
      events: {
        aiRecommendations: true,
        weeklyDigest: true,
        timeCapsuleReminders: true,
        collaborativeInvites: true,
        analyticsAlerts: false
      },
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      },
      digest: {
        frequency: 'weekly',
        day: 'monday',
        time: '09:00'
      }
    },
    
    // Privacy & Security
    privacy: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      twoFactor: {
        enabled: false,
        method: 'app',
        phone: '',
        backupCodes: []
      },
      sessions: [],
      dataSharing: false,
      analytics: true,
      oauthConnections: []
    },
    
    // Backup & Export
    backup: {
      scheduledBackups: false,
      frequency: 'weekly',
      cloudProvider: 'none',
      cloudPath: '/bookmarks',
      backupHistory: []
    },
    
    // Performance
    performance: {
      cacheExpiry: '24h',
      prefetchEnabled: true,
      lazyLoadImages: true,
      maxConcurrentRequests: 5,
      debugMode: false,
      resourceUsage: {
        memory: 45,
        cpu: 12
      }
    },
    
    // Accessibility
    accessibility: {
      highContrast: false,
      fontScale: 1.0,
      screenReader: false,
      keyboardNavigation: true,
      dyslexiaFont: false,
      colorBlindMode: 'none',
      focusOutline: true
    },
    
    // Voice Control
    voice: {
      enabled: false,
      language: 'en-US',
      sensitivity: 70,
      noiseReduction: true,
      voiceFeedback: true,
      customCommands: {
        openFavorites: 'open favorites',
        searchBookmarks: 'search bookmarks',
        addBookmark: 'add bookmark',
        deleteBookmark: 'delete bookmark'
      }
    },
    
    // Advanced
    advanced: {
      experimentalFeatures: {
        betaUI: false,
        advancedSearch: false,
        aiEnhancements: false
      },
      apiKeys: [],
      webhooks: [],
      localStorage: {
        size: '2.4 MB',
        items: 156
      },
      devMode: false
    },
    
    // Billing & Subscription
    billing: {
      currentPlan: 'free',
      usage: {
        topics: { current: 1, limit: 1 },
        favorites: { current: 45, limit: 100 },
        capsules: { current: 3, limit: 5 }
      },
      paymentMethods: [],
      invoices: [],
      autoRenew: true,
      promoCode: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeSection, setActiveSection] = useState('appearance');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [testNotificationSent, setTestNotificationSent] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [exportTags, setExportTags] = useState('');
  const importFileInputRef = useRef<HTMLInputElement | null>(null);
  const settingsRef = useRef(settings);
  const [pendingSection, setPendingSection] = useState<string | null>(null);
  const [showSwitchPrompt, setShowSwitchPrompt] = useState(false);
  const autoSaveTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { settingsRef.current = settings; }, [settings]);

  useEffect(() => {
    setMounted(true);
    loadSettings();
  }, []);

  // Apply theme on settings.appearance.theme change
  useEffect(() => {
    if (mounted) applyTheme(settings.appearance.theme);
  }, [settings.appearance.theme, mounted]);

  useEffect(() => {
    if (settings.behavior.autoSave && hasChanges && !loading) {
      if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
      autoSaveTimeout.current = setTimeout(() => {
        saveSettings();
      }, 1000);
    }
    return () => {
      if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, hasChanges]);

  // Move this function above the useEffect that uses it
  const applyThemeAndFont = (theme: string, fontSize: number, dyslexiaFont: boolean) => {
    console.log('[applyThemeAndFont] theme:', theme, 'fontSize:', fontSize, 'dyslexiaFont:', dyslexiaFont);
    if (typeof window === 'undefined') return;
    const root = window.document.documentElement;
    // Theme
    if (theme === 'system') {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    } else if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    // Font size
    root.style.setProperty('--user-font-size', fontSize + 'px');
    // Dyslexia font
    if (dyslexiaFont) {
      root.classList.add('dyslexia-font');
    } else {
      root.classList.remove('dyslexia-font');
    }
    // Debug: log computed style and classList
    console.log('[applyThemeAndFont] computed --user-font-size:', getComputedStyle(root).getPropertyValue('--user-font-size'));
    console.log('[applyThemeAndFont] root classList:', root.classList.value);
    // Check if font is loaded
    if (document.fonts) {
      document.fonts.load('1em OpenDyslexic').then(fonts => {
        if (!fonts || fonts.length === 0) {
          console.warn('OpenDyslexic font did not load!');
        } else {
          console.log('OpenDyslexic font loaded:', fonts);
        }
      });
    }
  };

  // Place this useEffect near the top of the component, after useState/useRef declarations, before any conditional returns
  useEffect(() => {
    if (mounted) {
      const dyslexiaFont = settings.appearance.dyslexiaFont || settings.accessibility.dyslexiaFont;
      applyThemeAndFont(settings.appearance.theme, settings.appearance.fontSize, dyslexiaFont);
    }
  }, [settings.appearance.theme, settings.appearance.fontSize, settings.appearance.dyslexiaFont, settings.accessibility.dyslexiaFont, mounted]);

  useEffect(() => {
    if (!mounted) return;
    const root = window.document.documentElement;
    root.classList.remove('density-compact', 'density-comfortable', 'density-spacious');
    const density = settings.appearance.layoutDensity || 'comfortable';
    root.classList.add(`density-${density}`);
  }, [settings.appearance.layoutDensity, mounted]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      let userId: string | null = null;
      // Try to get user from Supabase Auth
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        userId = user?.id || null;
      } catch (e) {
        userId = null;
      }
      if (userId) {
        // Try to load settings from Supabase
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', userId)
          .single();
        if (error) {
          Sentry.captureException(error, { tags: { component: 'settings', action: 'load_settings_supabase' } });
          // Fallback to localStorage
        } else if (data) {
          setSettings(prev => ({ ...prev, ...data }));
          // Also sync to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('userSettings', JSON.stringify(data));
          }
          return;
        }
      }
      // Fallback: load from localStorage
      if (typeof window !== 'undefined') {
        const savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
          try {
            const parsed = JSON.parse(savedSettings);
            if (!validateSettings(parsed)) {
              localStorage.removeItem('userSettings');
              Sentry.captureMessage('Invalid settings structure detected, clearing localStorage', {
                tags: { component: 'settings', action: 'validate_settings' },
                level: 'warning'
              });
              window.location.reload();
              return;
            }
            setSettings(prev => ({ ...prev, ...parsed }));
          } catch (parseError) {
            console.error('Invalid JSON in localStorage, clearing:', parseError);
            Sentry.captureException(parseError, {
              tags: { component: 'settings', action: 'load_settings' },
              extra: { savedSettings }
            });
            localStorage.removeItem('userSettings');
          }
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      Sentry.captureException(error, {
        tags: { component: 'settings', action: 'load_settings' },
        level: 'error'
      });
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      let userId: string | null = null;
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        userId = user?.id || null;
      } catch (e) {
        userId = null;
      }
      let cloudSuccess = false;
      if (userId) {
        // Save to Supabase
        const { error } = await supabase
          .from('user_settings')
          .upsert({ user_id: userId, ...settingsRef.current }, { onConflict: 'user_id' });
        if (error) {
          Sentry.captureException(error, { tags: { component: 'settings', action: 'save_settings_supabase' } });
          toast.error('Failed to save settings to cloud');
        } else {
          cloudSuccess = true;
        }
      }
      // Always save to localStorage as well
      if (typeof window !== 'undefined') {
        localStorage.setItem('userSettings', JSON.stringify(settingsRef.current));
      }
      setHasChanges(false);
      applyTheme(settingsRef.current.appearance.theme);
      if (cloudSuccess) {
        toast.success('Settings saved to cloud');
      } else {
        toast.success('Settings saved');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      Sentry.captureException(error, {
        tags: { component: 'settings', action: 'save_settings' },
        level: 'error'
      });
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (path: string, value: unknown) => {
    try {
      console.log('Updating setting:', path, 'to:', value);
    setSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
    setHasChanges(true);
      // If changing theme, apply immediately
      if (path === 'appearance.theme') applyTheme(value as string);
    } catch (error) {
      console.error('Failed to update setting:', path, error);
      Sentry.captureException(error, {
        tags: { component: 'settings', action: 'update_setting' },
        extra: { path, value }
      });
      toast.error('Failed to update setting');
    }
  };

  const sendTestNotification = (channel: string) => {
    toast.success(`Test ${channel} notification sent!`);
    setTestNotificationSent(true);
    setTimeout(() => setTestNotificationSent(false), 3000);
  };

  const generateApiKey = () => {
    const newKey = {
      id: Date.now(),
      name: 'New API Key',
      key: 'bk_' + Math.random().toString(36).substr(2, 32),
      created: new Date().toISOString(),
      lastUsed: null
    };
    updateSetting('advanced.apiKeys', [...settings.advanced.apiKeys, newKey]);
  };

  const exportData = (format: string) => {
    if (typeof window !== 'undefined') {
      let dataStr = '';
      if (format === 'json') {
        dataStr = JSON.stringify(settings, null, 2);
      } else if (format === 'csv') {
        const rows = [
          ['Key', 'Value'],
          ...Object.entries(settings).map(([k, v]) => [k, typeof v === 'object' ? JSON.stringify(v) : String(v)])
        ];
        dataStr = rows.map(r => r.join(',')).join('\n');
      } else if (format === 'html') {
        dataStr = `<pre>${JSON.stringify(settings, null, 2)}</pre>`;
      }
      const blob = new Blob([dataStr], { type: format === 'json' ? 'application/json' : format === 'csv' ? 'text/csv' : 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bookmarks-export.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const colorPalettes = [
    { name: 'Blue', value: 'blue', color: '#3b82f6' },
    { name: 'Green', value: 'green', color: '#10b981' },
    { name: 'Purple', value: 'purple', color: '#8b5cf6' },
    { name: 'Red', value: 'red', color: '#ef4444' },
    { name: 'Orange', value: 'orange', color: '#f97316' }
  ];

  const backgroundPatterns = [
    { name: 'None', value: 'none' },
    { name: 'Dots', value: 'dots' },
    { name: 'Grid', value: 'grid' },
    { name: 'Waves', value: 'waves' },
    { name: 'Geometric', value: 'geometric' }
  ];

  // Compute selected accent color directly
  const selectedPalette = colorPalettes.find(p => p.value === settings.appearance.accentColor);
  const selectedAccentColor = selectedPalette?.color ?? settings.appearance.customColor;

  useEffect(() => {
    if (!mounted) return;
    console.log('Accent color effect triggered:', selectedAccentColor);
    const root = window.document.documentElement;
    const base = selectedAccentColor;
    const tc = tinycolor(base);
    const variations = [
      tc.clone().lighten(40).toHexString(),
      tc.clone().lighten(30).toHexString(),
      tc.clone().lighten(20).toHexString(),
      tc.clone().lighten(10).toHexString(),
      base,
      tc.clone().darken(10).toHexString(),
      tc.clone().darken(20).toHexString(),
      tc.clone().darken(30).toHexString(),
      tc.clone().darken(40).toHexString(),
      tc.clone().darken(50).toHexString(),
    ];
    variations.forEach((color, idx) => {
      root.style.setProperty(`--accent-${idx + 1}`, color);
    });
    root.style.setProperty('--accent', base);
    const fg = tinycolor(base).isLight() ? '#000000' : '#FFFFFF';
    root.style.setProperty('--accent-foreground', fg);
    
    // Also update primary colors to match accent for broader theme application
    const hsl = tc.toHsl();
    const primaryHsl = `${Math.round(hsl.h)} ${Math.round(hsl.s * 100)}% ${Math.round(hsl.l * 100)}%`;
    const primaryFgHsl = tinycolor(base).isLight() ? '0 0% 0%' : '0 0% 100%';
    
    root.style.setProperty('--primary', primaryHsl);
    root.style.setProperty('--primary-foreground', primaryFgHsl);
    
    // Update ring color for focus states
    root.style.setProperty('--ring', primaryHsl);
    console.log('CSS variables updated:', {
      accent: base,
      primary: primaryHsl,
      variations: variations.length
    });
  }, [selectedAccentColor, mounted]);

  const handleBackgroundUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleBackgroundFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    let userId: string | null = null;
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      userId = user?.id || null;
    } catch (e) {
      userId = null;
    }
    let imageUrl = '';
    if (userId) {
      // Upload to Supabase Storage
      const filePath = `backgrounds/${userId}/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from('user-assets').upload(filePath, file);
      if (error) {
        Sentry.captureException(error, { tags: { component: 'settings', action: 'upload_background' } });
        toast.error('Failed to upload background image');
        setLoading(false);
        return;
      }
      const { data: publicUrlData } = supabase.storage.from('user-assets').getPublicUrl(filePath);
      imageUrl = publicUrlData?.publicUrl || '';
    } else {
      // Use local object URL
      imageUrl = URL.createObjectURL(file);
    }
    updateSetting('appearance.customBackground', imageUrl);
    setLoading(false);
  };

  const handleImportFileClick = () => {
    importFileInputRef.current?.click();
  };

  const handleImportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // TODO: Implement import logic
    toast.success('Import from file (stub)');
  };

  const handleRestoreFromBackup = () => {
    toast.info('Restore from backup (stub)');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && hasChanges && !loading) {
        e.preventDefault();
        saveSettings();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasChanges, loading]);

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const signOutSession = async () => {
    // For now, just sign out the current user (Supabase does not support per-session sign-out client-side)
    await supabase.auth.signOut();
    window.location.reload();
  };

  const signOutAllSessions = async () => {
    // Supabase does not support sign out all sessions from client, so just sign out current
    await supabase.auth.signOut();
    window.location.reload();
  };

  const requestAccountDeletion = async () => {
    if (!window.confirm('Are you sure you want to request account deletion? This action is irreversible.')) return;
    // TODO: Call backend API to delete user account
    toast.success('Account deletion requested (stub).');
  };

  const handleSectionChange = (section: string) => {
    if (hasChanges) {
      setPendingSection(section);
      setShowSwitchPrompt(true);
    } else {
      setActiveSection(section);
    }
  };

  const handlePromptSave = async () => {
    await saveSettings();
    setShowSwitchPrompt(false);
    if (pendingSection) setActiveSection(pendingSection);
    setPendingSection(null);
  };

  const handlePromptDiscard = () => {
    setShowSwitchPrompt(false);
    if (pendingSection) setActiveSection(pendingSection);
    setPendingSection(null);
    setHasChanges(false);
    loadSettings(); // reload from persisted
  };

  const handlePromptCancel = () => {
    setShowSwitchPrompt(false);
    setPendingSection(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-card backdrop-blur-sm border-b border-gray-200 dark:border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-2">
                <Settings className="h-6 w-6" />
                <h1 className="text-xl font-bold">Settings</h1>
              </div>
        </div>
        
            <div className="flex items-center space-x-2">
              {hasChanges && (
                <Badge variant="secondary" className="animate-pulse">
                  Unsaved Changes
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                disabled={loading}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                onClick={saveSettings}
                disabled={loading || !hasChanges}
                style={{ backgroundColor: selectedAccentColor }}
                className="text-white hover:opacity-90 flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-2">
              <div className="bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-border p-4">
                <nav className="space-y-1">
                  {[
                    { id: 'appearance', label: 'Appearance', icon: Palette },
                    { id: 'behavior', label: 'Behavior', icon: Settings },
                    { id: 'notifications', label: 'Notifications', icon: Bell },
                    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
                    { id: 'backup', label: 'Backup & Export', icon: Database },
                    { id: 'performance', label: 'Performance', icon: Zap },
                    { id: 'accessibility', label: 'Accessibility', icon: Eye },
                    { id: 'voice', label: 'Voice Control', icon: Volume2 },
                    { id: 'advanced', label: 'Advanced', icon: Key },
                    { id: 'billing', label: 'Billing & Subscription', icon: CreditCard },
                    { id: 'marketplace', label: 'Bookmark Marketplace 2.0', icon: Store }
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => handleSectionChange(id)}
                      className={`w-full flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeSection === id
                          ? 'bg-primary/10 text-primary border-l-2 border-primary'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Appearance Section */}
            {activeSection === 'appearance' && (
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Palette className="h-5 w-5 text-primary" />
                    <CardTitle>Appearance</CardTitle>
                  </div>
                  <CardDescription>
                    Personalize the look and feel to match your taste and environment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Theme Selection */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Theme Selection</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Theme</Label>
                        <Select value={settings.appearance.theme} onValueChange={(value) => updateSetting('appearance.theme', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">
                              <div className="flex items-center space-x-2">
                                <Sun className="h-4 w-4" />
                                <span>Light</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="dark">
                              <div className="flex items-center space-x-2">
                                <Moon className="h-4 w-4" />
                                <span>Dark</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="system">
                              <div className="flex items-center space-x-2">
                                <Monitor className="h-4 w-4" />
                                <span>System</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Auto-schedule themes</Label>
                        <p className="text-sm text-muted-foreground">Switch themes on a custom time schedule</p>
                      </div>
                      <Switch
                        checked={settings.appearance.autoSchedule}
                        onCheckedChange={(checked) => updateSetting('appearance.autoSchedule', checked)}
                      />
                    </div>
                    
                    {settings.appearance.autoSchedule && (
                      <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-gray-200">
                        <div>
                          <Label>Dark theme starts</Label>
                          <Input
                            type="time"
                            value={settings.appearance.scheduleStart}
                            onChange={(e) => updateSetting('appearance.scheduleStart', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Light theme starts</Label>
                          <Input
                            type="time"
                            value={settings.appearance.scheduleEnd}
                            onChange={(e) => updateSetting('appearance.scheduleEnd', e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Accent & Highlight Colors */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Accent & Highlight Colors</Label>
                    <div className="space-y-4">
                      <div>
                        <Label>Color Palette</Label>
                        <div className="flex space-x-2 mt-2">
                          {colorPalettes.map((palette) => {
                            const isSelected = settings.appearance.accentColor === palette.value;
                            return (
                              <button
                                key={palette.value}
                                onClick={() => updateSetting('appearance.accentColor', palette.value)}
                                className="w-12 h-12 rounded-lg border-2 border-gray-300 transition-all hover:border-gray-400"
                                style={{
                                  backgroundColor: palette.color,
                                  borderColor: isSelected ? selectedAccentColor : undefined,
                                  transform: isSelected ? 'scale(1.1)' : undefined
                                }}
                                title={palette.name}
                              />
                            );
                          })}
                          <div className="flex flex-col items-center space-y-1">
                            <Input
                              type="color"
                              value={settings.appearance.customColor}
                              onChange={(e) => updateSetting('appearance.customColor', e.target.value)}
                              className="w-12 h-8 p-0 border-0"
                            />
                            <span className="text-xs text-gray-500">Custom</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Font & Text Size */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Font & Text Size</Label>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label>Font Size</Label>
                          <span className="text-sm text-gray-500">{settings.appearance.fontSize}px</span>
                        </div>
                        <Slider
                          value={[settings.appearance.fontSize]}
                          onValueChange={([value]) => updateSetting('appearance.fontSize', value)}
                          min={12}
                          max={20}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Small</span>
                          <span>Large</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Dyslexia-friendly font</Label>
                          <p className="text-sm text-muted-foreground">Use OpenDyslexic font for better readability</p>
                        </div>
                        <Switch
                          checked={settings.appearance.dyslexiaFont}
                          onCheckedChange={(checked) => updateSetting('appearance.dyslexiaFont', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Layout Density */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Layout Density</Label>
                    <RadioGroup
                      value={settings.appearance.layoutDensity}
                      onValueChange={(value) => updateSetting('appearance.layoutDensity', value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="compact" id="compact" />
                        <Label htmlFor="compact">Compact - More items in less space</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="comfortable" id="comfortable" />
                        <Label htmlFor="comfortable">Comfortable - Balanced spacing</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="spacious" id="spacious" />
                        <Label htmlFor="spacious">Spacious - Extra padding and margins</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator />

                  {/* Motion & Animations */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Motion & Animations</Label>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Enable motion</Label>
                        <p className="text-sm text-gray-500">Smooth transitions and animations (disable for reduced motion)</p>
                      </div>
                      <Switch
                        checked={settings.appearance.motionEnabled}
                        onCheckedChange={(checked) => updateSetting('appearance.motionEnabled', checked)}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Backgrounds & Wallpapers */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Backgrounds & Wallpapers</Label>
                    <div className="space-y-4">
                      <div>
                        <Label>Background Pattern</Label>
                        <Select value={settings.appearance.backgroundPattern} onValueChange={(value) => updateSetting('appearance.backgroundPattern', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {backgroundPatterns.map((pattern) => (
                              <SelectItem key={pattern.value} value={pattern.value}>
                                {pattern.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Custom Background Image</Label>
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Enter image URL or upload file"
                            value={settings.appearance.customBackground}
                            onChange={(e) => updateSetting('appearance.customBackground', e.target.value)}
                          />
                          <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleBackgroundFileChange}
                          />
                          <Button variant="outline" size="sm" onClick={handleBackgroundUploadClick}>
                            <Upload className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Behavior Section */}
            {activeSection === 'behavior' && (
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Settings className="h-5 w-5 text-blue-600" />
                    <CardTitle>Behavior</CardTitle>
                  </div>
                  <CardDescription>
                    Define how the app responds to user actions for a smoother workflow
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Default View */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Default View</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Favorites View</Label>
                        <Select value={settings.behavior.defaultView} onValueChange={(value) => updateSetting('behavior.defaultView', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="grid">
                              <div className="flex items-center space-x-2">
                                <Grid className="h-4 w-4" />
                                <span>Grid</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="list">
                              <div className="flex items-center space-x-2">
                                <List className="h-4 w-4" />
                                <span>List</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Link Opening */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Link Opening</Label>
                    <RadioGroup
                      value={settings.behavior.linkOpening}
                      onValueChange={(value) => updateSetting('behavior.linkOpening', value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="same-tab" id="same-tab" />
                        <Label htmlFor="same-tab">Same tab</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="new-tab" id="new-tab" />
                        <Label htmlFor="new-tab">New tab</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="new-window" id="new-window" />
                        <Label htmlFor="new-window">New window</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator />

                  {/* Drag & Drop */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Drag & Drop</Label>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label>Drag Sensitivity</Label>
                        <span className="text-sm text-gray-500">{settings.behavior.dragSensitivity}%</span>
                      </div>
                      <Slider
                        value={[settings.behavior.dragSensitivity]}
                        onValueChange={([value]) => updateSetting('behavior.dragSensitivity', value)}
                        min={10}
                        max={100}
                        step={10}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Low</span>
                        <span>High</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Auto-save */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Auto-save</Label>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Enable auto-save</Label>
                        <p className="text-sm text-gray-500">Automatically save changes as you make them</p>
                      </div>
                      <Switch
                        checked={settings.behavior.autoSave}
                        onCheckedChange={(checked) => updateSetting('behavior.autoSave', checked)}
                      />
                    </div>
                    
                    {settings.behavior.autoSave && (
                      <div className="pl-4 border-l-2 border-gray-200">
                        <Label>Draft Expiration</Label>
                        <Select value={settings.behavior.draftExpiration} onValueChange={(value) => updateSetting('behavior.draftExpiration', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1day">1 Day</SelectItem>
                            <SelectItem value="7days">7 Days</SelectItem>
                            <SelectItem value="30days">30 Days</SelectItem>
                            <SelectItem value="never">Never</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Confirmations */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Confirmations</Label>
                    <RadioGroup
                      value={settings.behavior.confirmations}
                      onValueChange={(value) => updateSetting('behavior.confirmations', value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="none" id="none" />
                        <Label htmlFor="none">None - No confirmation dialogs</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="simple" id="simple" />
                        <Label htmlFor="simple">Simple - Only for destructive actions</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="detailed" id="detailed" />
                        <Label htmlFor="detailed">Detailed - All important actions</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator />

                  {/* AI Suggestions */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">AI Suggestions</Label>
                    <div>
                      <Label>Suggestion Frequency</Label>
                      <Select value={settings.behavior.aiSuggestionFrequency} onValueChange={(value) => updateSetting('behavior.aiSuggestionFrequency', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="never">Never</SelectItem>
                          <SelectItem value="on-save">On Save</SelectItem>
                          <SelectItem value="real-time">Real-time</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  {/* Default Sort */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Default Sort</Label>
                    <Select value={settings.behavior.defaultSort} onValueChange={(value) => updateSetting('behavior.defaultSort', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date-added">Date Added</SelectItem>
                        <SelectItem value="alphabetical">Alphabetical</SelectItem>
                        <SelectItem value="most-visited">Most Visited</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-primary" />
                    <CardTitle>Notifications</CardTitle>
                  </div>
                  <CardDescription>
                    Manage how and when the app communicates updates, reminders, and alerts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Channels */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Notification Channels</Label>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4" />
                          <div>
                            <Label>Email</Label>
                            <p className="text-sm text-gray-500">Receive notifications via email</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={settings.notifications?.channels?.email ?? false}
                            onCheckedChange={(checked) => updateSetting('notifications.channels.email', checked)}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => sendTestNotification('email')}
                            disabled={!settings.notifications?.channels?.email}
                          >
                            Test
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Bell className="h-4 w-4" />
                          <div>
                            <Label>In-app</Label>
                            <p className="text-sm text-gray-500">Show badges and toast notifications</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={settings.notifications.channels.inApp}
                            onCheckedChange={(checked) => updateSetting('notifications.channels.inApp', checked)}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => sendTestNotification('in-app')}
                            disabled={!settings.notifications.channels.inApp}
                          >
                            Test
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Smartphone className="h-4 w-4" />
                          <div>
                            <Label>Push (Mobile)</Label>
                            <p className="text-sm text-gray-500">Push notifications on mobile devices</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={settings.notifications.channels.push}
                            onCheckedChange={(checked) => updateSetting('notifications.channels.push', checked)}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => sendTestNotification('push')}
                            disabled={!settings.notifications.channels.push}
                          >
                            Test
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Event Types */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Event Types</Label>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>New AI Recommendations</Label>
                          <p className="text-sm text-gray-500">When AI suggests new bookmarks or insights</p>
                        </div>
                        <Switch
                          checked={settings.notifications.events.aiRecommendations}
                          onCheckedChange={(checked) => updateSetting('notifications.events.aiRecommendations', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Weekly Digest</Label>
                          <p className="text-sm text-gray-500">Summary of your activity and insights</p>
                        </div>
                        <Switch
                          checked={settings.notifications.events.weeklyDigest}
                          onCheckedChange={(checked) => updateSetting('notifications.events.weeklyDigest', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Time Capsule Reminders</Label>
                          <p className="text-sm text-gray-500">Reminders to create or review time capsules</p>
                        </div>
                        <Switch
                          checked={settings.notifications.events.timeCapsuleReminders}
                          onCheckedChange={(checked) => updateSetting('notifications.events.timeCapsuleReminders', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Collaborative Playlist Invites</Label>
                          <p className="text-sm text-gray-500">When someone invites you to collaborate</p>
                        </div>
                        <Switch
                          checked={settings.notifications.events.collaborativeInvites}
                          onCheckedChange={(checked) => updateSetting('notifications.events.collaborativeInvites', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Analytics Alerts</Label>
                          <p className="text-sm text-gray-500">Traffic spikes and unusual activity</p>
                        </div>
                        <Switch
                          checked={settings.notifications.events.analyticsAlerts}
                          onCheckedChange={(checked) => updateSetting('notifications.events.analyticsAlerts', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Quiet Hours */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Quiet Hours</Label>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Enable Quiet Hours</Label>
                          <p className="text-sm text-gray-500">Silence non-critical alerts during specified times</p>
                        </div>
                        <Switch
                          checked={settings.notifications.quietHours.enabled}
                          onCheckedChange={(checked) => updateSetting('notifications.quietHours.enabled', checked)}
                        />
                      </div>
                      
                      {settings.notifications.quietHours.enabled && (
                        <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-gray-200">
                          <div>
                            <Label>Start Time</Label>
                            <Input
                              type="time"
                              value={settings.notifications.quietHours.start}
                              onChange={(e) => updateSetting('notifications.quietHours.start', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>End Time</Label>
                            <Input
                              type="time"
                              value={settings.notifications.quietHours.end}
                              onChange={(e) => updateSetting('notifications.quietHours.end', e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Digest Scheduling */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Digest Scheduling</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Frequency</Label>
                        <Select value={settings.notifications.digest.frequency} onValueChange={(value) => updateSetting('notifications.digest.frequency', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {settings.notifications.digest.frequency === 'weekly' && (
                        <div>
                          <Label>Day</Label>
                          <Select value={settings.notifications.digest.day} onValueChange={(value) => updateSetting('notifications.digest.day', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monday">Monday</SelectItem>
                              <SelectItem value="tuesday">Tuesday</SelectItem>
                              <SelectItem value="wednesday">Wednesday</SelectItem>
                              <SelectItem value="thursday">Thursday</SelectItem>
                              <SelectItem value="friday">Friday</SelectItem>
                              <SelectItem value="saturday">Saturday</SelectItem>
                              <SelectItem value="sunday">Sunday</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      
                      <div>
                        <Label>Time</Label>
                        <Input
                          type="time"
                          value={settings.notifications.digest.time}
                          onChange={(e) => updateSetting('notifications.digest.time', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {testNotificationSent && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-green-800">Test notification sent successfully!</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Privacy & Security Section */}
            {activeSection === 'privacy' && (
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <CardTitle>Privacy & Security</CardTitle>
                  </div>
                  <CardDescription>
                    Control your data, sessions, and account safety
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Password Management */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Password Management</Label>
                    <Button
                      variant="outline"
                      onClick={() => setShowPasswordDialog(true)}
                      className="w-full sm:w-auto"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </div>

                  <Separator />

                  {/* Two-Factor Authentication */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Two-Factor Authentication</Label>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Enable 2FA</Label>
                          <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={settings.privacy.twoFactor.enabled}
                            onCheckedChange={(checked) => {
                              updateSetting('privacy.twoFactor.enabled', checked);
                              if (checked) setShow2FADialog(true);
                            }}
                          />
                          {settings.privacy.twoFactor.enabled && (
                            <Badge variant="secondary" className="text-green-700 bg-green-100">
                              <ShieldCheck className="h-3 w-3 mr-1" />
                              Enabled
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {settings.privacy.twoFactor.enabled && (
                        <div className="pl-4 border-l-2 border-gray-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Method: Authenticator App</span>
                            <Button variant="outline" size="sm" onClick={() => setShow2FADialog(true)}>
                              <QrCode className="h-4 w-4 mr-1" />
                              View QR Code
                            </Button>
                          </div>
                          <div className="text-sm text-gray-500">
                            Recovery codes: 8 remaining
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Session Management */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Session & Device Management</Label>
                    <div className="space-y-3">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Current Session</div>
                            <div className="text-sm text-gray-500">
                              MacBook Pro • Chrome • 192.168.1.200 • Active now
                            </div>
                          </div>
                          <Badge variant="default">Current</Badge>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">iPhone 15 Pro</div>
                            <div className="text-sm text-gray-500">
                              Safari • 192.168.1.156 • 2 hours ago
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={signOutSession}>
                            <LogOut className="h-4 w-4 mr-1" />
                            Sign Out
                          </Button>
                        </div>
                      </div>
                      
                      <Button variant="destructive" size="sm" onClick={signOutAllSessions}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out All Other Sessions
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Data Sharing */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Data Sharing & Analytics</Label>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Share anonymized usage data</Label>
                          <p className="text-sm text-gray-500">Help improve the product with anonymous analytics</p>
                        </div>
                        <Switch
                          checked={settings.privacy.dataSharing}
                          onCheckedChange={(checked) => updateSetting('privacy.dataSharing', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Analytics tracking</Label>
                          <p className="text-sm text-gray-500">Allow tracking for performance insights</p>
                        </div>
                        <Switch
                          checked={settings.privacy.analytics}
                          onCheckedChange={(checked) => updateSetting('privacy.analytics', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Data Export */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Privacy Policy & Data Export</Label>
                    <div className="space-y-2">
                      <Button variant="outline" onClick={() => exportData('json')}>
                        <Download className="h-4 w-4 mr-2" />
                        Download My Data (JSON)
                      </Button>
                      <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={requestAccountDeletion}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Request Account Deletion
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Backup & Export Section */}
            {activeSection === 'backup' && (
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Database className="h-5 w-5 text-blue-600" />
                    <CardTitle>Backup & Export</CardTitle>
                  </div>
                  <CardDescription>
                    Ensure your data is safe and can be moved freely
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Manual Export */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Manual Export</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button variant="outline" onClick={() => exportData('json')}>
                        <Download className="h-4 w-4 mr-2" />
                        Export JSON
                      </Button>
                      <Button variant="outline" onClick={() => exportData('csv')}>
                        <FileText className="h-4 w-4 mr-2" />
                        Export CSV
                      </Button>
                      <Button variant="outline" onClick={() => exportData('html')}>
                        <Globe className="h-4 w-4 mr-2" />
                        Export HTML
                      </Button>
                    </div>
                    
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <Label className="text-sm font-medium">Select Date Range</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <Input type="date" placeholder="Start date" value={exportStartDate} onChange={e => setExportStartDate(e.target.value)} />
                        <Input type="date" placeholder="End date" value={exportEndDate} onChange={e => setExportEndDate(e.target.value)} />
                      </div>
                      <div className="mt-2">
                        <Label className="text-sm">Filter by tags:</Label>
                        <Input placeholder="Enter tags separated by commas" className="mt-1" value={exportTags} onChange={e => setExportTags(e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Scheduled Backups */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Scheduled Backups</Label>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Enable automatic backups</Label>
                          <p className="text-sm text-gray-500">Schedule regular exports to email or cloud</p>
                        </div>
                        <Switch
                          checked={settings.backup.scheduledBackups}
                          onCheckedChange={(checked) => updateSetting('backup.scheduledBackups', checked)}
                        />
                      </div>
                      
                      {settings.backup.scheduledBackups && (
                        <div className="pl-4 border-l-2 border-gray-200 space-y-4">
                          <div>
                            <Label>Backup Frequency</Label>
                            <Select value={settings.backup.frequency} onValueChange={(value) => updateSetting('backup.frequency', value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Cloud Sync */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Cloud Sync Destinations</Label>
                    <div className="space-y-4">
                      <div>
                        <Label>Cloud Provider</Label>
                        <Select value={settings.backup.cloudProvider} onValueChange={(value) => updateSetting('backup.cloudProvider', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="dropbox">Dropbox</SelectItem>
                            <SelectItem value="google-drive">Google Drive</SelectItem>
                            <SelectItem value="onedrive">OneDrive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {settings.backup.cloudProvider !== 'none' && (
                        <div className="pl-4 border-l-2 border-gray-200">
                          <Label>Folder Path</Label>
                          <Input
                            value={settings.backup.cloudPath}
                            onChange={(e) => updateSetting('backup.cloudPath', e.target.value)}
                            placeholder="/bookmarks"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Import & Restore */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Import & Restore</Label>
                    <div className="space-y-2">
                      <Button variant="outline" onClick={handleImportFileClick}>
                        <Upload className="h-4 w-4 mr-2" />
                        Import from File
                      </Button>
                      <input type="file" accept=".json,.csv" ref={importFileInputRef} style={{ display: 'none' }} onChange={handleImportFileChange} />
                      <Button variant="outline" onClick={handleRestoreFromBackup}>
                        <Cloud className="h-4 w-4 mr-2" />
                        Restore from Backup
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Performance Section */}
            {activeSection === 'performance' && (
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-blue-600" />
                    <CardTitle>Performance</CardTitle>
                  </div>
                  <CardDescription>
                    Optimize app speed and resource usage
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Cache Settings */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Cache Settings</Label>
                    <div>
                      <Label>Cache Expiry</Label>
                      <Select value={settings.performance.cacheExpiry} onValueChange={(value) => updateSetting('performance.cacheExpiry', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1h">1 hour</SelectItem>
                          <SelectItem value="6h">6 hours</SelectItem>
                          <SelectItem value="24h">24 hours</SelectItem>
                          <SelectItem value="7d">7 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  {/* Loading Optimizations */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Loading Optimizations</Label>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Enable prefetching</Label>
                          <p className="text-sm text-gray-500">Preload content for faster navigation</p>
                        </div>
                        <Switch
                          checked={settings.performance.prefetchEnabled}
                          onCheckedChange={(checked) => updateSetting('performance.prefetchEnabled', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Lazy load images</Label>
                          <p className="text-sm text-gray-500">Load images only when needed</p>
                        </div>
                        <Switch
                          checked={settings.performance.lazyLoadImages}
                          onCheckedChange={(checked) => updateSetting('performance.lazyLoadImages', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Resource Usage */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Resource Usage</Label>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label>Memory Usage</Label>
                          <span className="text-sm text-gray-500">{settings.performance.resourceUsage.memory}%</span>
                        </div>
                        <Progress value={settings.performance.resourceUsage.memory} className="w-full" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label>CPU Usage</Label>
                          <span className="text-sm text-gray-500">{settings.performance.resourceUsage.cpu}%</span>
                        </div>
                        <Progress value={settings.performance.resourceUsage.cpu} className="w-full" />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Debug Mode */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Debug & Development</Label>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Debug Mode</Label>
                        <p className="text-sm text-gray-500">Show performance metrics and debug info</p>
                      </div>
                      <Switch
                        checked={settings.performance.debugMode}
                        onCheckedChange={(checked) => updateSetting('performance.debugMode', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Accessibility Section */}
            {activeSection === 'accessibility' && (
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Eye className="h-5 w-5 text-blue-600" />
                    <CardTitle>Accessibility</CardTitle>
                  </div>
                  <CardDescription>
                    Make the app more accessible and comfortable to use
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Visual Accessibility */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Visual Accessibility</Label>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>High contrast mode</Label>
                          <p className="text-sm text-gray-500">Increase contrast for better visibility</p>
                        </div>
                        <Switch
                          checked={settings.accessibility.highContrast}
                          onCheckedChange={(checked) => updateSetting('accessibility.highContrast', checked)}
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label>Font scale</Label>
                          <span className="text-sm text-gray-500">{settings.accessibility.fontScale}x</span>
                        </div>
                        <Slider
                          value={[settings.accessibility.fontScale]}
                          onValueChange={([value]) => updateSetting('accessibility.fontScale', value)}
                          min={0.8}
                          max={2.0}
                          step={0.1}
                          className="w-full"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Dyslexia-friendly font</Label>
                          <p className="text-sm text-muted-foreground">Use OpenDyslexic font for better readability</p>
                        </div>
                        <Switch
                          checked={settings.accessibility.dyslexiaFont}
                          onCheckedChange={(checked) => updateSetting('accessibility.dyslexiaFont', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Navigation Accessibility */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Navigation & Interaction</Label>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Keyboard navigation</Label>
                          <p className="text-sm text-gray-500">Enable full keyboard navigation support</p>
                        </div>
                        <Switch
                          checked={settings.accessibility.keyboardNavigation}
                          onCheckedChange={(checked) => updateSetting('accessibility.keyboardNavigation', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Focus outline</Label>
                          <p className="text-sm text-gray-500">Show focus indicators for interactive elements</p>
                        </div>
                        <Switch
                          checked={settings.accessibility.focusOutline}
                          onCheckedChange={(checked) => updateSetting('accessibility.focusOutline', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Screen reader support</Label>
                          <p className="text-sm text-gray-500">Optimize for screen reader compatibility</p>
                        </div>
                        <Switch
                          checked={settings.accessibility.screenReader}
                          onCheckedChange={(checked) => updateSetting('accessibility.screenReader', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Color Accessibility */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Color Accessibility</Label>
                    <div>
                      <Label>Color blind mode</Label>
                      <Select value={settings.accessibility.colorBlindMode} onValueChange={(value) => updateSetting('accessibility.colorBlindMode', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="protanopia">Protanopia (Red-blind)</SelectItem>
                          <SelectItem value="deuteranopia">Deuteranopia (Green-blind)</SelectItem>
                          <SelectItem value="tritanopia">Tritanopia (Blue-blind)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Voice Control Section */}
            {activeSection === 'voice' && (
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Volume2 className="h-5 w-5 text-blue-600" />
                    <CardTitle>Voice Control</CardTitle>
                  </div>
                  <CardDescription>
                    Control the app using voice commands
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Voice Settings */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Voice Recognition</Label>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Enable voice control</Label>
                          <p className="text-sm text-gray-500">Use voice commands to navigate and control the app</p>
                        </div>
                        <Switch
                          checked={settings.voice.enabled}
                          onCheckedChange={(checked) => updateSetting('voice.enabled', checked)}
                        />
                      </div>
                      
                      {settings.voice.enabled && (
                        <div className="pl-4 border-l-2 border-gray-200 space-y-4">
                          <div>
                            <Label>Language</Label>
                            <Select value={settings.voice.language} onValueChange={(value) => updateSetting('voice.language', value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="en-US">English (US)</SelectItem>
                                <SelectItem value="en-GB">English (UK)</SelectItem>
                                <SelectItem value="es-ES">Spanish</SelectItem>
                                <SelectItem value="fr-FR">French</SelectItem>
                                <SelectItem value="de-DE">German</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <Label>Sensitivity</Label>
                              <span className="text-sm text-gray-500">{settings.voice.sensitivity}%</span>
                            </div>
                            <Slider
                              value={[settings.voice.sensitivity]}
                              onValueChange={([value]) => updateSetting('voice.sensitivity', value)}
                              min={10}
                              max={100}
                              step={5}
                              className="w-full"
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Noise reduction</Label>
                              <p className="text-sm text-gray-500">Filter background noise for better recognition</p>
                            </div>
                            <Switch
                              checked={settings.voice.noiseReduction}
                              onCheckedChange={(checked) => updateSetting('voice.noiseReduction', checked)}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Voice feedback</Label>
                              <p className="text-sm text-gray-500">Speak confirmations and responses</p>
                            </div>
                            <Switch
                              checked={settings.voice.voiceFeedback}
                              onCheckedChange={(checked) => updateSetting('voice.voiceFeedback', checked)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {settings.voice.enabled && (
                    <>
                      <Separator />
                      
                      {/* Custom Commands */}
                      <div className="space-y-3">
                        <Label className="text-base font-medium">Custom Commands</Label>
                        <div className="space-y-3">
                          {Object.entries(settings.voice.customCommands).map(([action, command]) => (
                            <div key={action} className="flex items-center space-x-3">
                              <Label className="w-32 text-sm">{action.replace(/([A-Z])/g, ' $1').toLowerCase()}:</Label>
                              <Input
                                value={command}
                                onChange={(e) => updateSetting(`voice.customCommands.${action}`, e.target.value)}
                                placeholder={`Say "${command}"`}
                                className="flex-1"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Advanced Section */}
            {activeSection === 'advanced' && (
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Key className="h-5 w-5 text-blue-600" />
                    <CardTitle>Advanced</CardTitle>
                  </div>
                  <CardDescription>
                    Developer tools, experimental features, and advanced configuration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Experimental Features */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Experimental Features</Label>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Beta UI components</Label>
                          <p className="text-sm text-gray-500">Try new interface elements before release</p>
                        </div>
                        <Switch
                          checked={settings.advanced.experimentalFeatures.betaUI}
                          onCheckedChange={(checked) => updateSetting('advanced.experimentalFeatures.betaUI', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Advanced search</Label>
                          <p className="text-sm text-gray-500">Enhanced search with natural language processing</p>
                        </div>
                        <Switch
                          checked={settings.advanced.experimentalFeatures.advancedSearch}
                          onCheckedChange={(checked) => updateSetting('advanced.experimentalFeatures.advancedSearch', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>AI enhancements</Label>
                          <p className="text-sm text-gray-500">Latest AI-powered features and improvements</p>
                        </div>
                        <Switch
                          checked={settings.advanced.experimentalFeatures.aiEnhancements}
                          onCheckedChange={(checked) => updateSetting('advanced.experimentalFeatures.aiEnhancements', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* API Keys */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">API Keys</Label>
                    <div className="space-y-3">
                      <Button variant="outline" onClick={generateApiKey}>
                        <Plus className="h-4 w-4 mr-2" />
                        Generate New API Key
                      </Button>
                      
                      {settings.advanced.apiKeys.length > 0 && (
                        <div className="space-y-2">
                          {settings.advanced.apiKeys.map((key: any) => (
                            <div key={key.id} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">{key.name}</div>
                                  <div className="text-sm text-gray-500 font-mono">{key.key}</div>
                                </div>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Local Storage */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Local Storage</Label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm">Storage Used</Label>
                          <div className="text-lg font-semibold">{settings.advanced.localStorage.size}</div>
                        </div>
                        <div>
                          <Label className="text-sm">Items Stored</Label>
                          <div className="text-lg font-semibold">{settings.advanced.localStorage.items}</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="mt-3">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear Local Storage
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Developer Mode */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Developer Tools</Label>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Developer mode</Label>
                        <p className="text-sm text-gray-500">Enable developer tools and debugging features</p>
                      </div>
                      <Switch
                        checked={settings.advanced.devMode}
                        onCheckedChange={(checked) => updateSetting('advanced.devMode', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Billing & Subscription Section */}
            {activeSection === 'billing' && (
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <CardTitle>Billing & Subscription</CardTitle>
                  </div>
                  <CardDescription>
                    Manage your subscription, usage, and billing information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Current Plan */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Current Plan</Label>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-blue-900">Free Plan</div>
                          <div className="text-sm text-blue-700">Perfect for getting started</div>
                        </div>
                        <Button>
                          <Star className="h-4 w-4 mr-2" />
                          Upgrade to Pro
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Usage Stats */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Usage Statistics</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm">Topics</Label>
                          <span className="text-sm text-gray-500">
                            {settings.billing.usage.topics.current}/{settings.billing.usage.topics.limit}
                          </span>
                        </div>
                        <Progress 
                          value={(settings.billing.usage.topics.current / settings.billing.usage.topics.limit) * 100} 
                          className="w-full"
                        />
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm">Favorites</Label>
                          <span className="text-sm text-gray-500">
                            {settings.billing.usage.favorites.current}/{settings.billing.usage.favorites.limit}
                          </span>
                        </div>
                        <Progress 
                          value={(settings.billing.usage.favorites.current / settings.billing.usage.favorites.limit) * 100} 
                          className="w-full"
                        />
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm">Time Capsules</Label>
                          <span className="text-sm text-gray-500">
                            {settings.billing.usage.capsules.current}/{settings.billing.usage.capsules.limit}
                          </span>
                        </div>
                        <Progress 
                          value={(settings.billing.usage.capsules.current / settings.billing.usage.capsules.limit) * 100} 
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Plan Comparison */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Available Plans</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border rounded-lg p-4">
                        <div className="text-center">
                          <div className="font-semibold">Free</div>
                          <div className="text-2xl font-bold">$0</div>
                          <div className="text-sm text-gray-500">per month</div>
                        </div>
                        <ul className="mt-4 space-y-2 text-sm">
                          <li>• 1 topic</li>
                          <li>• 100 favorites</li>
                          <li>• 5 time capsules</li>
                          <li>• Basic analytics</li>
                        </ul>
                        <Button variant="outline" className="w-full mt-4" disabled>
                          Current Plan
                        </Button>
                      </div>
                      
                      <div className="border-2 border-blue-500 rounded-lg p-4 relative">
                        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
                          Popular
                        </Badge>
                        <div className="text-center">
                          <div className="font-semibold">Pro</div>
                          <div className="text-2xl font-bold">$9</div>
                          <div className="text-sm text-gray-500">per month</div>
                        </div>
                        <ul className="mt-4 space-y-2 text-sm">
                          <li>• 3 topics</li>
                          <li>• Unlimited favorites</li>
                          <li>• Unlimited capsules</li>
                          <li>• Advanced analytics</li>
                          <li>• Priority support</li>
                        </ul>
                        <Button className="w-full mt-4">
                          Upgrade to Pro
                        </Button>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <div className="text-center">
                          <div className="font-semibold">Elite</div>
                          <div className="text-2xl font-bold">$19</div>
                          <div className="text-sm text-gray-500">per month</div>
                        </div>
                        <ul className="mt-4 space-y-2 text-sm">
                          <li>• 5 topics</li>
                          <li>• Everything in Pro</li>
                          <li>• Custom AI models</li>
                          <li>• API access</li>
                          <li>• White-label options</li>
                        </ul>
                        <Button variant="outline" className="w-full mt-4">
                          Upgrade to Elite
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Billing Settings */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Billing Settings</Label>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Auto-renewal</Label>
                          <p className="text-sm text-gray-500">Automatically renew subscription</p>
                        </div>
                        <Switch
                          checked={settings.billing.autoRenew}
                          onCheckedChange={(checked) => updateSetting('billing.autoRenew', checked)}
                        />
                      </div>
                      
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Enter promo code"
                          value={settings.billing.promoCode}
                          onChange={(e) => updateSetting('billing.promoCode', e.target.value)}
                        />
                        <Button variant="outline">Apply</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bookmark Marketplace 2.0 Section */}
            {activeSection === 'marketplace' && (
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Store className="h-5 w-5 text-blue-600" />
                    <CardTitle>Bookmark Marketplace 2.0</CardTitle>
                  </div>
                  <CardDescription>
                    Buy, sell, and manage bookmark collections in our comprehensive marketplace
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="marketplace-home" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9">
                      <TabsTrigger value="marketplace-home">Home</TabsTrigger>
                      <TabsTrigger value="browse-listings">Browse</TabsTrigger>
                      <TabsTrigger value="create-listing">Create</TabsTrigger>
                      <TabsTrigger value="my-listings">My Listings</TabsTrigger>
                      <TabsTrigger value="sales-analytics">Analytics</TabsTrigger>
                      <TabsTrigger value="transactions">Transactions</TabsTrigger>
                      <TabsTrigger value="messaging">Messages</TabsTrigger>
                      <TabsTrigger value="payouts">Payouts</TabsTrigger>
                      <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    </TabsList>

                    {/* Marketplace Home */}
                    <TabsContent value="marketplace-home" className="space-y-6">
                      <div className="space-y-4">
                        {/* Hero Carousel */}
                        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="text-2xl font-bold mb-2">Featured Bookmark Bundle</h3>
                              <p className="text-blue-100 mb-4">Ultimate UI/UX Design Resources - 500+ curated bookmarks</p>
                              <Button variant="secondary" size="sm">
                                View Details
                              </Button>
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-bold">$29.99</div>
                              <div className="text-blue-200">⭐ 4.9 (234 reviews)</div>
                            </div>
                          </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <Input 
                            placeholder="Find bookmark bundles..." 
                            className="pl-10 py-3 text-lg"
                          />
                        </div>

                        {/* Category Tiles */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {['UI/UX', 'AI Tools', 'Productivity', 'Development', 'Marketing', 'Design', 'Business', 'Learning'].map((category) => (
                            <div key={category} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                              <div className="text-center">
                                <div className="text-lg font-semibold">{category}</div>
                                <div className="text-sm text-gray-500">120+ bundles</div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Trending Tags */}
                        <div className="space-y-3">
                          <h4 className="font-semibold">Trending Tags</h4>
                          <div className="flex flex-wrap gap-2">
                            {['react', 'figma', 'productivity', 'ai-tools', 'design-system', 'templates', 'icons', 'fonts'].map((tag) => (
                              <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-blue-100">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Recommended for You */}
                        <div className="space-y-3">
                          <h4 className="font-semibold">Recommended for You</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3].map((item) => (
                              <div key={item} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="aspect-video bg-gray-100 rounded mb-3"></div>
                                <h5 className="font-medium mb-1">Design System Resources</h5>
                                <p className="text-sm text-gray-600 mb-2">Complete design system with components...</p>
                                <div className="flex justify-between items-center">
                                  <span className="font-semibold text-green-600">$19.99</span>
                                  <div className="flex items-center space-x-1">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span className="text-sm">4.8</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* List Yours CTA */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                          <h4 className="font-semibold text-green-900 mb-2">Start Selling Your Bookmarks</h4>
                          <p className="text-green-700 mb-4">Turn your curated bookmark collections into income</p>
                          <Button className="bg-green-600 hover:bg-green-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Your First Listing
                          </Button>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Browse Listings */}
                    <TabsContent value="browse-listings" className="space-y-4">
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Filter Panel */}
                        <div className="lg:w-64 space-y-4">
                          <div className="bg-white border rounded-lg p-4">
                            <h4 className="font-semibold mb-3">Filters</h4>
                            
                            {/* Price Range */}
                            <div className="space-y-2 mb-4">
                              <Label>Price Range</Label>
                              <div className="px-2">
                                <Slider
                                  value={[0, 100]}
                                  max={100}
                                  step={1}
                                  className="w-full"
                                />
                                <div className="flex justify-between text-sm text-gray-500 mt-1">
                                  <span>$0</span>
                                  <span>$100+</span>
                                </div>
                              </div>
                            </div>

                            {/* Categories */}
                            <div className="space-y-2 mb-4">
                              <Label>Categories</Label>
                              <div className="space-y-2">
                                {['UI/UX', 'Development', 'Marketing', 'Business'].map((cat) => (
                                  <div key={cat} className="flex items-center space-x-2">
                                    <input type="checkbox" className="rounded" />
                                    <span className="text-sm">{cat}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Seller Rating */}
                            <div className="space-y-2">
                              <Label>Minimum Rating</Label>
                              <div className="px-2">
                                <Slider
                                  value={[4]}
                                  max={5}
                                  step={0.5}
                                  className="w-full"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Results */}
                        <div className="flex-1 space-y-4">
                          {/* Sort & View Controls */}
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">1,234 results</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Select defaultValue="newest">
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="newest">Newest</SelectItem>
                                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                                  <SelectItem value="popular">Most Popular</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button variant="outline" size="sm">
                                <Grid className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <List className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Listing Cards */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6].map((item) => (
                              <div key={item} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="aspect-video bg-gray-100 rounded mb-3"></div>
                                <h5 className="font-medium mb-1">Premium Design Resources #{item}</h5>
                                <p className="text-sm text-gray-600 mb-2">Curated collection of design tools and resources...</p>
                                <div className="flex justify-between items-center mb-3">
                                  <span className="font-semibold text-green-600">$24.99</span>
                                  <div className="flex items-center space-x-1">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span className="text-sm">4.7</span>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <Button size="sm" className="flex-1">Buy Now</Button>
                                  <Button variant="outline" size="sm">
                                    <Heart className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Create Listing */}
                    <TabsContent value="create-listing" className="space-y-6">
                      <div className="max-w-2xl">
                        <div className="space-y-6">
                          {/* Basic Info */}
                          <div className="space-y-4">
                            <h4 className="font-semibold">Basic Information</h4>
                            <div className="space-y-3">
                              <div>
                                <Label>Title</Label>
                                <Input placeholder="Give your bundle a compelling title..." />
                              </div>
                              <div>
                                <Label>Short Description</Label>
                                <Textarea placeholder="Briefly describe what buyers will get..." rows={3} />
                              </div>
                              <div>
                                <Label>Category</Label>
                                <Select>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="ui-ux">UI/UX</SelectItem>
                                    <SelectItem value="development">Development</SelectItem>
                                    <SelectItem value="marketing">Marketing</SelectItem>
                                    <SelectItem value="business">Business</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>

                          {/* Content Selection */}
                          <div className="space-y-4">
                            <h4 className="font-semibold">Content Selection</h4>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-600">Drag and drop URLs or select from your bookmarks</p>
                              <Button variant="outline" className="mt-2">
                                Select from Bookmarks
                              </Button>
                            </div>
                          </div>

                          {/* Pricing */}
                          <div className="space-y-4">
                            <h4 className="font-semibold">Pricing & Licensing</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Price ($)</Label>
                                <Input type="number" placeholder="29.99" />
                              </div>
                              <div>
                                <Label>License Type</Label>
                                <Select>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select license" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="personal">Personal Use</SelectItem>
                                    <SelectItem value="commercial">Commercial Use</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex space-x-3">
                            <Button className="flex-1">
                              Publish Listing
                            </Button>
                            <Button variant="outline">
                              Save Draft
                            </Button>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* My Listings */}
                    <TabsContent value="my-listings" className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold">My Listings</h4>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          New Listing
                        </Button>
                      </div>

                      <div className="bg-white border rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Title</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Price</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Sales</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Views</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {[1, 2, 3].map((item) => (
                                <tr key={item}>
                                  <td className="px-4 py-3">
                                    <div className="font-medium">Design Resources Bundle #{item}</div>
                                    <div className="text-sm text-gray-500">Created 2 days ago</div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <Badge variant="secondary">Active</Badge>
                                  </td>
                                  <td className="px-4 py-3 font-medium">$29.99</td>
                                  <td className="px-4 py-3">12</td>
                                  <td className="px-4 py-3">456</td>
                                  <td className="px-4 py-3">
                                    <div className="flex space-x-2">
                                      <Button variant="outline" size="sm">Edit</Button>
                                      <Button variant="outline" size="sm">Pause</Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Sales Analytics */}
                    <TabsContent value="sales-analytics" className="space-y-6">
                      {/* Summary Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-600">Total Revenue</p>
                                <p className="text-2xl font-bold">$2,847</p>
                              </div>
                              <TrendingUp className="h-8 w-8 text-green-600" />
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-600">Items Sold</p>
                                <p className="text-2xl font-bold">94</p>
                              </div>
                              <BarChart3 className="h-8 w-8 text-blue-600" />
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-600">Avg. Price</p>
                                <p className="text-2xl font-bold">$30.29</p>
                              </div>
                              <PieChart className="h-8 w-8 text-purple-600" />
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-600">Conversion</p>
                                <p className="text-2xl font-bold">3.2%</p>
                              </div>
                              <Target className="h-8 w-8 text-orange-600" />
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Charts Placeholder */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>Sales Over Time</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                              <BarChart3 className="h-16 w-16 text-gray-400" />
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle>Top Categories</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                              <PieChart className="h-16 w-16 text-gray-400" />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    {/* Transactions */}
                    <TabsContent value="transactions" className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Tabs defaultValue="all" className="w-auto">
                          <TabsList>
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="purchases">Purchases</TabsTrigger>
                            <TabsTrigger value="sales">Sales</TabsTrigger>
                          </TabsList>
                        </Tabs>
                        <Button variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>

                      <div className="bg-white border rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Date</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Listing</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Type</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Amount</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {[1, 2, 3, 4, 5].map((item) => (
                                <tr key={item}>
                                  <td className="px-4 py-3 text-sm">Dec 15, 2024</td>
                                  <td className="px-4 py-3">
                                    <div className="font-medium">Design Resources Bundle</div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <Badge variant={item % 2 === 0 ? "default" : "secondary"}>
                                      {item % 2 === 0 ? "Sale" : "Purchase"}
                                    </Badge>
                                  </td>
                                  <td className="px-4 py-3 font-medium">$29.99</td>
                                  <td className="px-4 py-3">
                                    <Badge variant="secondary">Completed</Badge>
                                  </td>
                                  <td className="px-4 py-3">
                                    <Button variant="outline" size="sm">
                                      View Receipt
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Messaging */}
                    <TabsContent value="messaging" className="space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Conversations List */}
                        <div className="space-y-2">
                          <h4 className="font-semibold">Conversations</h4>
                          <div className="space-y-2">
                            {[1, 2, 3].map((item) => (
                              <div key={item} className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-medium">John Doe</div>
                                    <div className="text-sm text-gray-600">About: Design Bundle #1</div>
                                    <div className="text-xs text-gray-500">2 hours ago</div>
                                  </div>
                                  <Badge variant="secondary" className="text-xs">2</Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Chat Window */}
                        <div className="lg:col-span-2 border rounded-lg">
                          <div className="p-4 border-b">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">John Doe</div>
                                <div className="text-sm text-gray-600">About: Design Bundle #1</div>
                              </div>
                              <Button variant="outline" size="sm">
                                Block User
                              </Button>
                            </div>
                          </div>
                          <div className="p-4 h-64 overflow-y-auto space-y-3">
                            <div className="flex justify-start">
                              <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                                <p className="text-sm">Hi, I'm interested in your design bundle. Can you provide more details?</p>
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <div className="bg-blue-600 text-white rounded-lg p-3 max-w-xs">
                                <p className="text-sm">Sure! It includes 200+ curated design resources including UI kits, icons, and templates.</p>
                              </div>
                            </div>
                          </div>
                          <div className="p-4 border-t">
                            <div className="flex space-x-2">
                              <Input placeholder="Type your message..." className="flex-1" />
                              <Button>Send</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Payouts */}
                    <TabsContent value="payouts" className="space-y-6">
                      {/* Balance Card */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Available Balance</p>
                              <p className="text-3xl font-bold text-green-600">$1,247.50</p>
                              <Button className="mt-2 w-full">Withdraw</Button>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Pending</p>
                              <p className="text-3xl font-bold text-yellow-600">$89.99</p>
                              <p className="text-xs text-gray-500 mt-2">Clears in 3 days</p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-center">
                              <p className="text-sm text-gray-600">On Hold</p>
                              <p className="text-3xl font-bold text-red-600">$0.00</p>
                              <p className="text-xs text-gray-500 mt-2">No disputes</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Payout Methods */}
                      <div className="space-y-4">
                        <h4 className="font-semibold">Payout Methods</h4>
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <CreditCard className="h-6 w-6 text-gray-400" />
                              <div>
                                <div className="font-medium">Bank Account</div>
                                <div className="text-sm text-gray-600">••••••••1234</div>
                              </div>
                            </div>
                            <Badge variant="secondary">Primary</Badge>
                          </div>
                        </div>
                        <Button variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Payment Method
                        </Button>
                      </div>

                      {/* Payout History */}
                      <div className="space-y-4">
                        <h4 className="font-semibold">Payout History</h4>
                        <div className="bg-white border rounded-lg overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Date</th>
                                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Amount</th>
                                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Fees</th>
                                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {[1, 2, 3].map((item) => (
                                  <tr key={item}>
                                    <td className="px-4 py-3 text-sm">Dec 10, 2024</td>
                                    <td className="px-4 py-3 font-medium">$500.00</td>
                                    <td className="px-4 py-3 text-sm">$15.00</td>
                                    <td className="px-4 py-3">
                                      <Badge variant="secondary">Completed</Badge>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Reviews */}
                    <TabsContent value="reviews" className="space-y-6">
                      {/* Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-3xl font-bold">4.8</div>
                            <div className="flex justify-center my-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                            <div className="text-sm text-gray-600">Average Rating</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-3xl font-bold">147</div>
                            <div className="text-sm text-gray-600 mt-2">Total Reviews</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-3xl font-bold">98%</div>
                            <div className="text-sm text-gray-600 mt-2">Response Rate</div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Reviews List */}
                      <div className="space-y-4">
                        <h4 className="font-semibold">Recent Reviews</h4>
                        <div className="space-y-4">
                          {[1, 2, 3].map((item) => (
                            <div key={item} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <div className="font-medium">Sarah Johnson</div>
                                  <div className="flex items-center space-x-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    ))}
                                    <span className="text-sm text-gray-600 ml-2">5 days ago</span>
                                  </div>
                                </div>
                                <Badge variant="outline">Design Bundle #1</Badge>
                              </div>
                              <p className="text-gray-700 mb-3">Excellent collection of design resources! Very well organized and exactly what I needed for my projects.</p>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">Reply</Button>
                                <Button variant="outline" size="sm">Report</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {/* Password Change Dialog */}
            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    Enter your current password and choose a new one
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Current Password</Label>
                    <Input
                      type="password"
                      value={settings.privacy.currentPassword}
                      onChange={(e) => updateSetting('privacy.currentPassword', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>New Password</Label>
                    <Input
                      type="password"
                      value={settings.privacy.newPassword}
                      onChange={(e) => updateSetting('privacy.newPassword', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Confirm New Password</Label>
                    <Input
                      type="password"
                      value={settings.privacy.confirmPassword}
                      onChange={(e) => updateSetting('privacy.confirmPassword', e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => {
                      toast.success('Password changed successfully');
                      setShowPasswordDialog(false);
                    }}>
                      Change Password
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* 2FA Setup Dialog */}
            <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
                  <DialogDescription>
                    Scan the QR code with your authenticator app
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                      <QrCode className="h-24 w-24 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <Label>Verification Code</Label>
                    <Input placeholder="Enter 6-digit code from your app" />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShow2FADialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => {
                      toast.success('Two-factor authentication enabled');
                      setShow2FADialog(false);
                    }}>
                      Enable 2FA
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      <Dialog open={showSwitchPrompt} onOpenChange={setShowSwitchPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
          </DialogHeader>
          <div className="py-2">You have unsaved changes. Save before switching?</div>
          <DialogFooter className="flex gap-2">
            <Button onClick={handlePromptSave} disabled={loading}>Save & Switch</Button>
            <Button variant="destructive" onClick={handlePromptDiscard}>Discard Changes</Button>
            <Button variant="outline" onClick={handlePromptCancel}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
