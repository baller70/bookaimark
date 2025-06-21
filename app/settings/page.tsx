'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Monitor,
  Database,
  Download,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  Moon,
  Sun,
  Globe,
  Lock,
  Mail,
  Smartphone,
  Volume2,
  Clock,
  Camera,
  Key,
  CreditCard,
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Info,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';

interface UserSettings {
  // General Settings
  profile: {
    name: string;
    email: string;
    username: string;
    bio: string;
    avatar: string;
    website: string;
    location: string;
    timezone: string;
    language: string;
  };
  
  // Appearance Settings
  appearance: {
    theme: 'light' | 'dark' | 'system';
    accentColor: string;
    fontSize: 'small' | 'medium' | 'large';
    compactMode: boolean;
    animations: boolean;
    sidebarCollapsed: boolean;
    defaultView: string;
  };
  
  // Notification Settings
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
    mobile: boolean;
    mentions: boolean;
    comments: boolean;
    updates: boolean;
    marketing: boolean;
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
    digest: 'immediate' | 'hourly' | 'daily' | 'weekly' | 'never';
  };
  
  // Privacy Settings
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    showOnlineStatus: boolean;
    allowDirectMessages: boolean;
    dataCollection: boolean;
    analytics: boolean;
    thirdPartyIntegrations: boolean;
    twoFactorAuth: boolean;
  };
  
  // Account Settings
  account: {
    subscription: 'free' | 'pro' | 'enterprise';
    autoRenewal: boolean;
    backupEnabled: boolean;
    exportFormat: 'json' | 'csv' | 'pdf';
    deleteAccount: boolean;
  };
  
  // Advanced Settings
  advanced: {
    developerMode: boolean;
    betaFeatures: boolean;
    debugMode: boolean;
    apiAccess: boolean;
    webhooks: boolean;
    customDomain: string;
    maxFileSize: number;
    sessionTimeout: number;
  };
}

const defaultSettings: UserSettings = {
  profile: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    username: 'johndoe',
    bio: '',
    avatar: '',
    website: '',
    location: '',
    timezone: 'America/New_York',
    language: 'en',
  },
  appearance: {
    theme: 'system',
    accentColor: '#3b82f6',
    fontSize: 'medium',
    compactMode: false,
    animations: true,
    sidebarCollapsed: false,
    defaultView: 'grid',
  },
  notifications: {
    email: true,
    push: true,
    desktop: true,
    mobile: true,
    mentions: true,
    comments: true,
    updates: true,
    marketing: false,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
    digest: 'daily',
  },
  privacy: {
    profileVisibility: 'public',
    showOnlineStatus: true,
    allowDirectMessages: true,
    dataCollection: true,
    analytics: true,
    thirdPartyIntegrations: true,
    twoFactorAuth: false,
  },
  account: {
    subscription: 'free',
    autoRenewal: true,
    backupEnabled: true,
    exportFormat: 'json',
    deleteAccount: false,
  },
  advanced: {
    developerMode: false,
    betaFeatures: false,
    debugMode: false,
    apiAccess: false,
    webhooks: false,
    customDomain: '',
    maxFileSize: 10,
    sessionTimeout: 30,
  },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null);

  useEffect(() => {
    // Load settings from localStorage or API - only in browser
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings));
        } catch (err) {
          console.error('Failed to parse saved settings:', err);
          localStorage.removeItem('userSettings');
        }
      }
      setIsLoaded(true);
    }
  }, []);

  const updateSetting = (section: keyof UserSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const updateNestedSetting = (section: keyof UserSettings, nestedKey: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [nestedKey]: {
          ...prev[section][nestedKey],
          [key]: value
        }
      }
    }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Save to localStorage (in real app, would save to API) - only in browser
      if (typeof window !== 'undefined') {
        localStorage.setItem('userSettings', JSON.stringify(settings));
      }
      setHasChanges(false);
      setNotification({type: 'success', message: 'Settings saved successfully!'});
    } catch (error) {
      setNotification({type: 'error', message: 'Failed to save settings. Please try again.'});
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    setHasChanges(true);
    setNotification({type: 'info', message: 'Settings reset to defaults'});
  };

  const exportData = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bookmarkhub-settings.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Show loading state until client-side hydration is complete
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading settings...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Dashboard</span>
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 font-audiowide">SETTINGS</h1>
                <p className="text-gray-600 mt-2">Customize your BookmarkHub experience</p>
              </div>
            </div>
            {hasChanges && (
              <div className="flex space-x-3">
                <Button variant="outline" onClick={resetSettings}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  RESET
                </Button>
                <Button onClick={saveSettings} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'SAVING...' : 'SAVE CHANGES'}
                </Button>
              </div>
            )}
          </div>
          
          {notification && (
            <div className={`mt-4 p-4 rounded-lg flex items-center space-x-2 ${
              notification.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
              notification.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
              'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {notification.type === 'error' && <AlertTriangle className="w-5 h-5" />}
              {notification.type === 'info' && <Info className="w-5 h-5" />}
              <span>{notification.message}</span>
              <Button variant="ghost" size="sm" onClick={() => setNotification(null)}>×</Button>
            </div>
          )}
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white border border-gray-200 rounded-xl p-1">
            <TabsTrigger value="general" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>GENERAL</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center space-x-2">
              <Palette className="w-4 h-4" />
              <span>APPEARANCE</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span>NOTIFICATIONS</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>PRIVACY</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <span>ACCOUNT</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>ADVANCED</span>
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>PROFILE INFORMATION</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={settings.profile.avatar} alt={settings.profile.name} />
                      <AvatarFallback className="text-2xl font-bold">
                        {settings.profile.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
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
                              // Update profile avatar
                              updateSetting('profile', 'avatar', imageDataUrl);
                              // Show success notification
                              setNotification({
                                type: 'success',
                                message: 'Profile photo updated and will be used as default bookmark logo!'
                              });
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
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{settings.profile.name}</h3>
                    <p className="text-gray-600">@{settings.profile.username}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
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
                              // Update profile avatar
                              updateSetting('profile', 'avatar', imageDataUrl);
                              // Show success notification
                              setNotification({
                                type: 'success',
                                message: 'Profile photo updated and will be used as default bookmark logo!'
                              });
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
                      <Upload className="w-4 h-4 mr-2" />
                      UPLOAD PHOTO
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={settings.profile.name}
                      onChange={(e) => updateSetting('profile', 'name', e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={settings.profile.username}
                      onChange={(e) => updateSetting('profile', 'username', e.target.value)}
                      placeholder="Choose a username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.profile.email}
                      onChange={(e) => updateSetting('profile', 'email', e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={settings.profile.website}
                      onChange={(e) => updateSetting('profile', 'website', e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={settings.profile.location}
                      onChange={(e) => updateSetting('profile', 'location', e.target.value)}
                      placeholder="City, Country"
                    />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={settings.profile.timezone} onValueChange={(value) => updateSetting('profile', 'timezone', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time (EST)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CST)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MST)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PST)</SelectItem>
                        <SelectItem value="Europe/London">Greenwich Mean Time (GMT)</SelectItem>
                        <SelectItem value="Europe/Paris">Central European Time (CET)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Japan Standard Time (JST)</SelectItem>
                        <SelectItem value="Asia/Shanghai">China Standard Time (CST)</SelectItem>
                        <SelectItem value="Australia/Sydney">Australian Eastern Time (AEST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={settings.profile.bio}
                    onChange={(e) => updateSetting('profile', 'bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {settings.profile.bio.length}/500 characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={settings.profile.language} onValueChange={(value) => updateSetting('profile', 'language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="it">Italiano</SelectItem>
                      <SelectItem value="pt">Português</SelectItem>
                      <SelectItem value="ru">Русский</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                      <SelectItem value="ko">한국어</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-6">
            {/* Theme Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="w-5 h-5" />
                  <span>THEME & APPEARANCE</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Theme</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        settings.appearance.theme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => updateSetting('appearance', 'theme', 'light')}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <Sun className="w-4 h-4" />
                        <span className="font-medium">Light</span>
                      </div>
                      <div className="w-full h-16 bg-white border rounded flex">
                        <div className="w-1/3 bg-gray-100"></div>
                        <div className="w-2/3 bg-white p-2">
                          <div className="w-full h-2 bg-gray-200 rounded mb-1"></div>
                          <div className="w-3/4 h-2 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        settings.appearance.theme === 'dark' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => updateSetting('appearance', 'theme', 'dark')}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <Moon className="w-4 h-4" />
                        <span className="font-medium">Dark</span>
                      </div>
                      <div className="w-full h-16 bg-gray-900 border rounded flex">
                        <div className="w-1/3 bg-gray-800"></div>
                        <div className="w-2/3 bg-gray-900 p-2">
                          <div className="w-full h-2 bg-gray-700 rounded mb-1"></div>
                          <div className="w-3/4 h-2 bg-gray-700 rounded"></div>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        settings.appearance.theme === 'system' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => updateSetting('appearance', 'theme', 'system')}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <Monitor className="w-4 h-4" />
                        <span className="font-medium">System</span>
                      </div>
                      <div className="w-full h-16 border rounded flex">
                        <div className="w-1/2 bg-white border-r">
                          <div className="w-full h-2 bg-gray-200 rounded m-1"></div>
                        </div>
                        <div className="w-1/2 bg-gray-900">
                          <div className="w-full h-2 bg-gray-700 rounded m-1"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex items-center space-x-4 mt-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={settings.appearance.accentColor}
                      onChange={(e) => updateSetting('appearance', 'accentColor', e.target.value)}
                      className="w-16 h-10 p-1 rounded"
                    />
                    <div className="flex space-x-2">
                      {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'].map((color) => (
                        <button
                          key={color}
                          className={`w-8 h-8 rounded-full border-2 ${
                            settings.appearance.accentColor === color ? 'border-gray-400' : 'border-gray-200'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => updateSetting('appearance', 'accentColor', color)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Font Size</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    {[
                      { value: 'small', label: 'Small', size: 'text-sm' },
                      { value: 'medium', label: 'Medium', size: 'text-base' },
                      { value: 'large', label: 'Large', size: 'text-lg' }
                    ].map((option) => (
                      <div
                        key={option.value}
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${
                          settings.appearance.fontSize === option.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => updateSetting('appearance', 'fontSize', option.value)}
                      >
                        <span className={`font-medium ${option.size}`}>{option.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Layout Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Monitor className="w-5 h-5" />
                  <span>LAYOUT & DISPLAY</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Compact Mode</Label>
                    <p className="text-sm text-gray-500">Reduce spacing and padding for more content</p>
                  </div>
                  <Switch
                    checked={settings.appearance.compactMode}
                    onCheckedChange={(checked) => updateSetting('appearance', 'compactMode', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Animations</Label>
                    <p className="text-sm text-gray-500">Enable smooth transitions and animations</p>
                  </div>
                  <Switch
                    checked={settings.appearance.animations}
                    onCheckedChange={(checked) => updateSetting('appearance', 'animations', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Collapsed Sidebar</Label>
                    <p className="text-sm text-gray-500">Start with sidebar collapsed by default</p>
                  </div>
                  <Switch
                    checked={settings.appearance.sidebarCollapsed}
                    onCheckedChange={(checked) => updateSetting('appearance', 'sidebarCollapsed', checked)}
                  />
                </div>

                <div>
                  <Label htmlFor="defaultView">Default View</Label>
                  <Select value={settings.appearance.defaultView} onValueChange={(value) => updateSetting('appearance', 'defaultView', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Grid View</SelectItem>
                      <SelectItem value="list">List View</SelectItem>
                      <SelectItem value="compact">Compact View</SelectItem>
                      <SelectItem value="folder">Folder View</SelectItem>
                      <SelectItem value="kanban">Kanban View</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-6">
            {/* Email Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="w-5 h-5" />
                  <span>EMAIL NOTIFICATIONS</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Receive Email Notifications</Label>
                    <p className="text-sm text-gray-500">Get notifications via email</p>
                  </div>
                  <Switch
                    checked={settings.notifications.email}
                    onCheckedChange={(checked) => updateSetting('notifications', 'email', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Receive Marketing Emails</Label>
                    <p className="text-sm text-gray-500">Get marketing emails</p>
                  </div>
                  <Switch
                    checked={settings.notifications.marketing}
                    onCheckedChange={(checked) => updateSetting('notifications', 'marketing', checked)}
                  />
                </div>

                <div>
                  <Label htmlFor="quietHours">Quiet Hours</Label>
                  <p className="text-sm text-gray-500">Receive notifications only during these hours</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <Switch
                      checked={settings.notifications.quietHours.enabled}
                      onCheckedChange={(checked) => updateSetting('notifications', 'quietHours', {
                        ...settings.notifications.quietHours,
                        enabled: checked
                      })}
                    />
                    <div className="flex space-x-2">
                      <Input
                        id="quietHoursStart"
                        type="time"
                        value={settings.notifications.quietHours.start}
                        onChange={(e) => updateSetting('notifications', 'quietHours', {
                          ...settings.notifications.quietHours,
                          start: e.target.value
                        })}
                      />
                      <Input
                        id="quietHoursEnd"
                        type="time"
                        value={settings.notifications.quietHours.end}
                        onChange={(e) => updateSetting('notifications', 'quietHours', {
                          ...settings.notifications.quietHours,
                          end: e.target.value
                        })}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="digest">Digest</Label>
                  <Select value={settings.notifications.digest} onValueChange={(value) => updateSetting('notifications', 'digest', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Push Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Smartphone className="w-5 h-5" />
                  <span>PUSH NOTIFICATIONS</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Receive Push Notifications</Label>
                    <p className="text-sm text-gray-500">Get notifications via push notifications</p>
                  </div>
                  <Switch
                    checked={settings.notifications.push}
                    onCheckedChange={(checked) => updateSetting('notifications', 'push', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Receive Desktop Notifications</Label>
                    <p className="text-sm text-gray-500">Get notifications on your desktop</p>
                  </div>
                  <Switch
                    checked={settings.notifications.desktop}
                    onCheckedChange={(checked) => updateSetting('notifications', 'desktop', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Receive Mobile Notifications</Label>
                    <p className="text-sm text-gray-500">Get notifications on your mobile device</p>
                  </div>
                  <Switch
                    checked={settings.notifications.mobile}
                    onCheckedChange={(checked) => updateSetting('notifications', 'mobile', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy" className="space-y-6">
            {/* Profile Visibility */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="w-5 h-5" />
                  <span>PROFILE VISIBILITY</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="font-medium">Profile Visibility</Label>
                  <p className="text-sm text-gray-500">Who can see your profile</p>
                </div>
                <Select value={settings.privacy.profileVisibility} onValueChange={(value) => updateSetting('privacy', 'profileVisibility', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="friends">Friends</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Online Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>ONLINE STATUS</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="font-medium">Show Online Status</Label>
                  <p className="text-sm text-gray-500">Show when you're online</p>
                </div>
                <Switch
                  checked={settings.privacy.showOnlineStatus}
                  onCheckedChange={(checked) => updateSetting('privacy', 'showOnlineStatus', checked)}
                />
              </CardContent>
            </Card>

            {/* Direct Messages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="w-5 h-5" />
                  <span>DIRECT MESSAGES</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="font-medium">Allow Direct Messages</Label>
                  <p className="text-sm text-gray-500">Allow users to send you direct messages</p>
                </div>
                <Switch
                  checked={settings.privacy.allowDirectMessages}
                  onCheckedChange={(checked) => updateSetting('privacy', 'allowDirectMessages', checked)}
                />
              </CardContent>
            </Card>

            {/* Data Collection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="w-5 h-5" />
                  <span>DATA COLLECTION</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="font-medium">Allow Data Collection</Label>
                  <p className="text-sm text-gray-500">Allow us to collect and use your data</p>
                </div>
                <Switch
                  checked={settings.privacy.dataCollection}
                  onCheckedChange={(checked) => updateSetting('privacy', 'dataCollection', checked)}
                />
              </CardContent>
            </Card>

            {/* Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>ANALYTICS</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="font-medium">Allow Analytics</Label>
                  <p className="text-sm text-gray-500">Allow us to collect and analyze usage data</p>
                </div>
                <Switch
                  checked={settings.privacy.analytics}
                  onCheckedChange={(checked) => updateSetting('privacy', 'analytics', checked)}
                />
              </CardContent>
            </Card>

            {/* Third Party Integrations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>THIRD PARTY INTEGRATIONS</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="font-medium">Allow Third Party Integrations</Label>
                  <p className="text-sm text-gray-500">Allow third-party integrations</p>
                </div>
                <Switch
                  checked={settings.privacy.thirdPartyIntegrations}
                  onCheckedChange={(checked) => updateSetting('privacy', 'thirdPartyIntegrations', checked)}
                />
              </CardContent>
            </Card>

            {/* Two Factor Authentication */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="w-5 h-5" />
                  <span>TWO FACTOR AUTHENTICATION</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="font-medium">Enable Two Factor Authentication</Label>
                  <p className="text-sm text-gray-500">Add an extra layer of security</p>
                </div>
                <Switch
                  checked={settings.privacy.twoFactorAuth}
                  onCheckedChange={(checked) => updateSetting('privacy', 'twoFactorAuth', checked)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Settings */}
          <TabsContent value="account" className="space-y-6">
            {/* Subscription */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <span>SUBSCRIPTION</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="font-medium">Subscription Type</Label>
                  <p className="text-sm text-gray-500">Choose your subscription type</p>
                </div>
                <Select value={settings.account.subscription} onValueChange={(value) => updateSetting('account', 'subscription', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Auto Renewal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>AUTO RENEWAL</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="font-medium">Auto Renewal</Label>
                  <p className="text-sm text-gray-500">Automatically renew your subscription</p>
                </div>
                <Switch
                  checked={settings.account.autoRenewal}
                  onCheckedChange={(checked) => updateSetting('account', 'autoRenewal', checked)}
                />
              </CardContent>
            </Card>

            {/* Backup */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="w-5 h-5" />
                  <span>BACKUP</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="font-medium">Enable Backup</Label>
                  <p className="text-sm text-gray-500">Automatically backup your data</p>
                </div>
                <Switch
                  checked={settings.account.backupEnabled}
                  onCheckedChange={(checked) => updateSetting('account', 'backupEnabled', checked)}
                />
              </CardContent>
            </Card>

            {/* Export Format */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Download className="w-5 h-5" />
                  <span>EXPORT</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="font-medium">Export Format</Label>
                  <p className="text-sm text-gray-500">Choose your export format</p>
                </div>
                <Select value={settings.account.exportFormat} onValueChange={(value) => updateSetting('account', 'exportFormat', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Delete Account */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trash2 className="w-5 h-5" />
                  <span>DELETE ACCOUNT</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="font-medium">Delete Account</Label>
                  <p className="text-sm text-gray-500">Permanently delete your account</p>
                </div>
                <Switch
                  checked={settings.account.deleteAccount}
                  onCheckedChange={(checked) => updateSetting('account', 'deleteAccount', checked)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Settings */}
          <TabsContent value="advanced" className="space-y-6">
            {/* Developer Mode */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>DEVELOPER MODE</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="font-medium">Enable Developer Mode</Label>
                  <p className="text-sm text-gray-500">Enable advanced developer features</p>
                </div>
                <Switch
                  checked={settings.advanced.developerMode}
                  onCheckedChange={(checked) => updateSetting('advanced', 'developerMode', checked)}
                />
              </CardContent>
            </Card>

            {/* Beta Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Badge className="w-5 h-5" />
                  <span>BETA FEATURES</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="font-medium">Enable Beta Features</Label>
                  <p className="text-sm text-gray-500">Enable new features before they're released</p>
                </div>
                <Switch
                  checked={settings.advanced.betaFeatures}
                  onCheckedChange={(checked) => updateSetting('advanced', 'betaFeatures', checked)}
                />
              </CardContent>
            </Card>

            {/* Debug Mode */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>DEBUG MODE</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="font-medium">Enable Debug Mode</Label>
                  <p className="text-sm text-gray-500">Enable debugging features</p>
                </div>
                <Switch
                  checked={settings.advanced.debugMode}
                  onCheckedChange={(checked) => updateSetting('advanced', 'debugMode', checked)}
                />
              </CardContent>
            </Card>

            {/* API Access */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="w-5 h-5" />
                  <span>API ACCESS</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="font-medium">Enable API Access</Label>
                  <p className="text-sm text-gray-500">Allow external applications to access your data</p>
                </div>
                <Switch
                  checked={settings.advanced.apiAccess}
                  onCheckedChange={(checked) => updateSetting('advanced', 'apiAccess', checked)}
                />
              </CardContent>
            </Card>

            {/* Webhooks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>WEBHOOKS</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="font-medium">Enable Webhooks</Label>
                  <p className="text-sm text-gray-500">Allow external services to trigger actions</p>
                </div>
                <Switch
                  checked={settings.advanced.webhooks}
                  onCheckedChange={(checked) => updateSetting('advanced', 'webhooks', checked)}
                />
              </CardContent>
            </Card>

            {/* Custom Domain */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>CUSTOM DOMAIN</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="font-medium">Custom Domain</Label>
                  <p className="text-sm text-gray-500">Use a custom domain for your BookmarkHub</p>
                </div>
                <Input
                  id="customDomain"
                  value={settings.advanced.customDomain}
                  onChange={(e) => updateSetting('advanced', 'customDomain', e.target.value)}
                  placeholder="Enter your custom domain"
                />
              </CardContent>
            </Card>

            {/* Max File Size */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Volume2 className="w-5 h-5" />
                  <span>MAX FILE SIZE</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="font-medium">Max File Size</Label>
                  <p className="text-sm text-gray-500">Maximum file size for uploads</p>
                </div>
                <Slider
                  value={[settings.advanced.maxFileSize]}
                  onValueChange={(value) => updateSetting('advanced', 'maxFileSize', value[0])}
                  max={100}
                  min={1}
                  step={1}
                />
              </CardContent>
            </Card>

            {/* Session Timeout */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>SESSION TIMEOUT</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="font-medium">Session Timeout</Label>
                  <p className="text-sm text-gray-500">Time before session expires</p>
                </div>
                <Slider
                  value={[settings.advanced.sessionTimeout]}
                  onValueChange={(value) => updateSetting('advanced', 'sessionTimeout', value[0])}
                  max={60}
                  min={1}
                  step={1}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Export Data Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="w-5 h-5" />
              <span>EXPORT DATA</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Export Your Settings</Label>
                <p className="text-sm text-gray-500">Download all your settings as a JSON file</p>
              </div>
              <Button onClick={exportData} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                EXPORT SETTINGS
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 