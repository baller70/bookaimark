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
  Lock,
  Globe,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Save,
  RotateCcw,
  ArrowLeft,
  Volume2,
  FileText,
  Mail,
  ShieldCheck,
  LogOut,
  Star
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/src/components/ui/dialog'
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
  const [testNotificationSent, setTestNotificationSent] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [notificationSupported, setNotificationSupported] = useState(false);

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
    
    // Check notification support and permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationSupported(true);
      setNotificationPermission(Notification.permission);
      
      // If push notifications are enabled but permission is denied, disable them
      if (Notification.permission === 'denied' && settings.notifications.channels.push) {
        updateSetting('notifications.channels.push', false);
      }
    } else {
      setNotificationSupported(false);
      // Disable push notifications if not supported
      if (settings.notifications.channels.push) {
        updateSetting('notifications.channels.push', false);
      }
    }
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

  useEffect(() => {
    if (!mounted) return;
    const root = window.document.documentElement;
    if (settings.appearance.motionEnabled === false) {
      root.classList.add('motion-disabled');
    } else {
      root.classList.remove('motion-disabled');
    }
  }, [settings.appearance.motionEnabled, mounted]);

  // Background patterns are handled globally by GlobalSettingsProvider

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
        try {
          // Try to load general settings from Supabase
          const { data, error } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', userId)
            .single();
          
          // Load notification settings separately
          const { data: { session } } = await supabase.auth.getSession();
          let notificationSettings = null;
          
          if (session?.access_token) {
            try {
              const notificationResponse = await fetch('/api/notifications/settings', {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${session.access_token}`
                }
              });
              
              if (notificationResponse.ok) {
                notificationSettings = await notificationResponse.json();
              }
            } catch (notificationError) {
              console.error('Failed to load notification settings:', notificationError);
            }
          }
          
          if (error) {
            Sentry.captureException(error, { tags: { component: 'settings', action: 'load_settings_supabase' } });
            // Fallback to localStorage
          } else if (data) {
            const mergedSettings = { ...data };
            
            // Merge notification settings if available
            if (notificationSettings) {
              mergedSettings.notifications = notificationSettings;
            }
            
            setSettings(prev => ({ ...prev, ...mergedSettings }));
            // Also sync to localStorage
            if (typeof window !== 'undefined') {
              localStorage.setItem('userSettings', JSON.stringify(mergedSettings));
            }
            return;
          }
        } catch (loadError) {
          console.error('Error loading settings from cloud:', loadError);
          Sentry.captureException(loadError, { tags: { component: 'settings', action: 'load_settings_cloud' } });
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
        try {
          // Save general settings to Supabase
          const { error: settingsError } = await supabase
            .from('user_settings')
            .upsert({ user_id: userId, ...settingsRef.current }, { onConflict: 'user_id' });
          
          if (settingsError) {
            console.error('Settings save error:', settingsError);
          }

          // Save notification settings separately
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token) {
            const notificationResponse = await fetch('/api/notifications/settings', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
              },
              body: JSON.stringify(settingsRef.current.notifications)
            });
            
            if (!notificationResponse.ok) {
              console.error('Failed to save notification settings');
            }
          }
          
          cloudSuccess = true;
        } catch (error) {
          Sentry.captureException(error, { tags: { component: 'settings', action: 'save_settings_supabase' } });
          toast.error('Failed to save settings to cloud');
        }
      }
      // Always save to localStorage as well
      if (typeof window !== 'undefined') {
        localStorage.setItem('userSettings', JSON.stringify(settingsRef.current));
        // Dispatch custom event to notify global settings provider
        window.dispatchEvent(new CustomEvent('userSettingsUpdated'));
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
      // If changing background pattern, trigger global settings update
      if (path === 'appearance.backgroundPattern') {
        // Dispatch custom event to notify global settings provider
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('userSettingsUpdated'));
        }
      }
    } catch (error) {
      console.error('Failed to update setting:', path, error);
      Sentry.captureException(error, {
        tags: { component: 'settings', action: 'update_setting' },
        extra: { path, value }
      });
      toast.error('Failed to update setting');
    }
  };

  const sendTestNotification = async (channel: string) => {
    return Sentry.startSpan(
      {
        op: "ui.click",
        name: `Test ${channel} Notification`,
      },
      async (span) => {
        try {
          console.log('Starting test notification for channel:', channel);
          
          // Metrics can be added to the span
          span.setAttribute("channel", channel);
          span.setAttribute("quietHoursEnabled", settings.notifications.quietHours.enabled);
      
      // Check if we're in quiet hours
      if (settings.notifications.quietHours.enabled && isInQuietHours()) {
        toast.info('Notifications are currently silenced due to quiet hours settings.');
        return;
      }
      
      if (channel === 'push') {
        // Request permission for browser notifications if not already granted
        if ('Notification' in window) {
          let permission = Notification.permission;
          
          if (permission === 'default') {
            permission = await Notification.requestPermission();
            setNotificationPermission(permission);
          }
          
          if (permission === 'granted') {
            // Call API to log the notification
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.access_token) {
              try {
                const response = await fetch('/api/notifications/test', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                  },
                  body: JSON.stringify({ channel })
                });
                
                const result = await response.json();
                
                if (result.success) {
                  // Show browser notification
                  new Notification(result.data.title, {
                    body: result.data.message,
                    icon: result.data.metadata.icon,
                    tag: result.data.metadata.tag
                  });
                  toast.success('Push notification sent successfully!');
                } else {
                  toast.info(result.message);
                }
              } catch (apiError) {
                console.error('API error:', apiError);
                // Fallback to local notification
                new Notification('Test Notification', {
                  body: 'This is a test push notification from your bookmark manager.',
                  icon: '/favicon.ico',
                  tag: 'test-notification'
                });
                toast.success('Push notification sent successfully!');
              }
            }
          } else if (permission === 'denied') {
            toast.error('Push notifications are blocked. Please enable them in your browser settings.');
            // Automatically disable push notifications in settings
            updateSetting('notifications.channels.push', false);
          } else {
            toast.error('Push notification permission was not granted.');
          }
        } else {
          toast.error('Push notifications are not supported in this browser.');
          updateSetting('notifications.channels.push', false);
        }
      } else {
        // Call API for email and in-app notifications
        const { data: { session } } = await supabase.auth.getSession();
        
        // Try authenticated API first, then fall back to simple API
        let apiEndpoint = '/api/notifications/test';
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };
        
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        } else {
          // Use simple API for unauthenticated users
          apiEndpoint = '/api/notifications/test-simple';
        }
        
        try {
          console.log('Making API request to:', apiEndpoint, 'with headers:', headers);
          
          const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify({ channel })
          });
          
          console.log('API response status:', response.status);
          
          const result = await response.json();
          console.log('API response data:', result);
          
          if (result.success) {
            if (channel === 'email') {
              toast.success('Test email notification queued! Check your inbox in a few minutes.');
            } else if (channel === 'inApp') {
              toast.info(result.data.message, {
                duration: result.data.metadata.duration || 5000,
              });
            }
          } else {
            toast.info(result.message || 'Notification test completed');
          }
        } catch (apiError) {
          console.error('API error:', apiError);
          Sentry.captureException(apiError, { 
            tags: { 
              component: 'settings', 
              action: 'test_notification',
              channel 
            },
            extra: { 
              apiEndpoint,
              headers,
              channel 
            }
          });
          
          // Final fallback for any API errors
          if (channel === 'email') {
            toast.success('Test email notification queued! Check your inbox in a few minutes.');
          } else if (channel === 'inApp') {
            toast.info('🔔 Test in-app notification: Your bookmark insights are ready!', {
              duration: 5000,
            });
          }
        }
      }
      
          setTestNotificationSent(true);
          setTimeout(() => setTestNotificationSent(false), 3000);
          
        } catch (error) {
          console.error('Failed to send test notification:', error);
          Sentry.captureException(error, { 
            tags: { 
              component: 'settings', 
              action: 'test_notification_error',
              channel 
            },
            extra: { 
              channel,
              settings: settings.notifications
            }
          });
          toast.error(`Failed to send test ${channel} notification. Please try again.`);
        }
      }
    );
  };

  // Utility function to check if current time is within quiet hours
  const isInQuietHours = (): boolean => {
    if (!settings.notifications.quietHours.enabled) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMinute] = settings.notifications.quietHours.start.split(':').map(Number);
    const [endHour, endMinute] = settings.notifications.quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime;
    } else {
      return currentTime >= startTime && currentTime <= endTime;
    }
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

  const signOutSession = async (sessionId?: string) => {
    return Sentry.startSpan(
      {
        op: "ui.click",
        name: "Sign Out Session",
      },
      async (span) => {
        try {
          span.setAttribute("sessionId", sessionId || "current")
          
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.access_token) {
            const url = sessionId 
              ? `/api/auth/sessions?sessionId=${sessionId}`
              : '/api/auth/sessions?all=false'
              
            const response = await fetch(url, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${session.access_token}`
              }
            })
            
            const result = await response.json()
            
            if (result.success) {
              if (!sessionId) {
                // If signing out current session, also sign out locally
                await supabase.auth.signOut()
                window.location.reload()
              } else {
                toast.success(result.message || 'Session signed out successfully')
              }
            } else {
              toast.error(result.error || 'Failed to sign out')
            }
          } else {
            // Fallback to local signout
            await supabase.auth.signOut()
            window.location.reload()
          }
        } catch (error) {
          console.error('Sign out error:', error)
          Sentry.captureException(error, {
            tags: { component: 'settings', action: 'sign_out_session' },
            extra: { sessionId }
          })
          toast.error('Failed to sign out')
        }
      }
    )
  }

  const signOutAllSessions = async () => {
    return Sentry.startSpan(
      {
        op: "ui.click",
        name: "Sign Out All Sessions",
      },
      async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.access_token) {
            const response = await fetch('/api/auth/sessions?all=true', {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${session.access_token}`
              }
            })
            
            const result = await response.json()
            
            if (result.success) {
              // Also sign out locally
              await supabase.auth.signOut()
              window.location.reload()
            } else {
              toast.error(result.error || 'Failed to sign out from all sessions')
            }
          } else {
            // Fallback to local signout
            await supabase.auth.signOut()
            window.location.reload()
          }
        } catch (error) {
          console.error('Sign out all sessions error:', error)
          Sentry.captureException(error, {
            tags: { component: 'settings', action: 'sign_out_all_sessions' }
          })
          toast.error('Failed to sign out from all sessions')
        }
      }
    )
  }

  const requestAccountDeletion = async () => {
    if (!window.confirm('Are you sure you want to request account deletion? This action is irreversible.')) return
    
    return Sentry.startSpan(
      {
        op: "ui.click",
        name: "Request Account Deletion",
      },
      async (span) => {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.access_token) {
            const response = await fetch('/api/auth/delete-account', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
              },
              body: JSON.stringify({
                reason: 'User requested deletion from settings',
                feedback: ''
              })
            })
            
            const result = await response.json()
            
            if (result.success) {
              toast.success(result.message)
              span.setAttribute("deletion_requested", true)
            } else {
              toast.error(result.error || 'Failed to submit account deletion request')
              span.setAttribute("deletion_failed", true)
            }
          } else {
            toast.error('Please sign in to request account deletion')
          }
        } catch (error) {
          console.error('Account deletion request error:', error)
          Sentry.captureException(error, {
            tags: { component: 'settings', action: 'request_account_deletion' }
          })
          toast.error('Failed to submit account deletion request')
        }
      }
    )
  }

  const handleSectionChange = (section: string) => {
    // Special handling for Oracle - navigate directly to Oracle settings
    if (section === 'oracle') {
      router.push('/settings/oracle');
      return;
    }
    
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
                    { id: 'notifications', label: 'Notifications', icon: Bell },
                    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
                    { id: 'backup', label: 'Backup & Export', icon: Database },
                    { id: 'billing', label: 'Billing & Subscription', icon: Star },
                    { id: 'oracle', label: 'Oracle AI Chat Bot', icon: Settings }
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
                            onClick={() => sendTestNotification('inApp')}
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
                            <Label>Push (Browser)</Label>
                            <p className="text-sm text-gray-500">
                              {!notificationSupported 
                                ? "Browser notifications not supported" 
                                : notificationPermission === 'denied' 
                                  ? "Permission denied - enable in browser settings"
                                  : notificationPermission === 'granted'
                                    ? "Browser notifications enabled"
                                    : "Browser notifications (permission required)"
                              }
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={settings.notifications.channels.push && notificationSupported && notificationPermission !== 'denied'}
                            onCheckedChange={(checked) => updateSetting('notifications.channels.push', checked)}
                            disabled={!notificationSupported || notificationPermission === 'denied'}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => sendTestNotification('push')}
                            disabled={!settings.notifications.channels.push || !notificationSupported}
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
                          <Label>Collaborative Playbook Invites</Label>
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
                        <span className="text-green-600">✔️</span>
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
                              <span className="h-4 w-4 mr-1">🔑</span>
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
                          <Button variant="outline" size="sm" onClick={() => signOutSession()}>
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
                        <span className="h-4 w-4 mr-2">☁️</span>
                        Restore from Backup
                      </Button>
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

            {/* Billing & Subscription Section */}
            {activeSection === 'billing' && (
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <span className="h-5 w-5 text-blue-600">💳</span>
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
