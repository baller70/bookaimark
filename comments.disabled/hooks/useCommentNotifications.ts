'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import { CommentNotification } from '../types';

interface UseCommentNotificationsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableWebSocket?: boolean;
}

interface UseCommentNotificationsReturn {
  notifications: CommentNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (notificationIds: string[]) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  deleteNotification: (notificationId: string) => Promise<boolean>;
  refresh: () => Promise<void>;
  getNotificationsByType: (type: CommentNotification['type']) => CommentNotification[];
  getUnreadNotifications: () => CommentNotification[];
}

export function useCommentNotifications({
  autoRefresh = true,
  refreshInterval = 60000, // 1 minute
  enableWebSocket = true
}: UseCommentNotificationsOptions = {}): UseCommentNotificationsReturn {
  const [notifications, setNotifications] = useState<CommentNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/notifications/comments');
      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.statusText}`);
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load notifications';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark notifications as read
  const markAsRead = useCallback(async (notificationIds: string[]): Promise<boolean> => {
    try {
      const response = await fetch('/api/notifications/comments/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notification_ids: notificationIds }),
      });

      if (!response.ok) {
        throw new Error(`Failed to mark notifications as read: ${response.statusText}`);
      }

      // Update local state
      setNotifications(prev => prev.map(notification =>
        notificationIds.includes(notification.id)
          ? { ...notification, is_read: true }
          : notification
      ));

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark notifications as read';
      setError(errorMessage);
      return false;
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    const unreadIds = notifications
      .filter(n => !n.is_read)
      .map(n => n.id);
    
    if (unreadIds.length === 0) return true;
    
    return markAsRead(unreadIds);
  }, [notifications, markAsRead]);

  // Delete a notification
  const deleteNotification = useCallback(async (notificationId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/notifications/comments/${notificationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete notification: ${response.statusText}`);
      }

      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete notification';
      setError(errorMessage);
      return false;
    }
  }, []);

  // Utility functions
  const refresh = useCallback(() => loadNotifications(), [loadNotifications]);

  const getNotificationsByType = useCallback((type: CommentNotification['type']) => {
    return notifications.filter(notification => notification.type === type);
  }, [notifications]);

  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(notification => !notification.is_read);
  }, [notifications]);

  const unreadCount = getUnreadNotifications().length;

  // WebSocket connection for real-time notifications
  useEffect(() => {
    if (!enableWebSocket) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
    const ws = new WebSocket(`${wsUrl}/notifications`);
    wsRef.current = ws;

    ws.onopen = () => {
      // Subscribe to comment notifications
      ws.send(JSON.stringify({
        type: 'subscribe',
        channel: 'comment_notifications'
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'comment_notification') {
          // Add new notification to the list
          setNotifications(prev => [data.notification, ...prev]);
        } else if (data.type === 'notification_read') {
          // Mark notification as read
          setNotifications(prev => prev.map(notification =>
            notification.id === data.notification_id
              ? { ...notification, is_read: true }
              : notification
          ));
        } else if (data.type === 'notification_deleted') {
          // Remove notification from list
          setNotifications(prev => prev.filter(n => n.id !== data.notification_id));
        }
      } catch (err) {
        console.error('Failed to parse WebSocket notification:', err);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [enableWebSocket]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const startAutoRefresh = () => {
      refreshTimeoutRef.current = setTimeout(() => {
        loadNotifications();
        startAutoRefresh();
      }, refreshInterval);
    };

    startAutoRefresh();

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, loadNotifications]);

  // Initial load
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
    getNotificationsByType,
    getUnreadNotifications
  };
} 