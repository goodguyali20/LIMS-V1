import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { Notification, RealtimeUpdate } from '../types';
import { useAuth } from './AuthContext';
import { trackEvent } from '../utils/errorMonitoring';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  isConnected: boolean;
  reconnect: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  // Initialize socket connection
  useEffect(() => {
    if (!user) return;

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';
    const newSocket = io(socketUrl, {
      auth: {
        userId: user.uid,
        token: user.uid, // In real app, use actual JWT token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      trackEvent('socket_connected', { userId: user.uid });
      console.log('Connected to notification server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      trackEvent('socket_disconnected', { userId: user.uid });
      console.log('Disconnected from notification server');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      trackEvent('socket_connection_error', { error: error.message });
    });

    // Listen for real-time updates
    newSocket.on('order_update', (data: RealtimeUpdate) => {
      const notification: Notification = {
        id: `order-${Date.now()}`,
        type: 'info',
        title: 'Order Update',
        message: `Order ${data.data.id} has been ${data.action}`,
        timestamp: new Date(),
        read: false,
        action: {
          label: 'View Order',
          url: `/app/order/${data.data.id}`,
        },
      };
      
      addNotification(notification);
      showToastNotification(notification);
    });

    newSocket.on('test_result', (data: RealtimeUpdate) => {
      const notification: Notification = {
        id: `test-${Date.now()}`,
        type: 'success',
        title: 'Test Result Ready',
        message: `Test results for order ${data.data.orderId} are ready`,
        timestamp: new Date(),
        read: false,
        action: {
          label: 'View Results',
          url: `/app/order/${data.data.orderId}/enter-results`,
        },
      };
      
      addNotification(notification);
      showToastNotification(notification);
    });

    newSocket.on('inventory_alert', (data: RealtimeUpdate) => {
      const notification: Notification = {
        id: `inventory-${Date.now()}`,
        type: 'warning',
        title: 'Inventory Alert',
        message: `${data.data.itemName} is running low (${data.data.quantity} remaining)`,
        timestamp: new Date(),
        read: false,
        action: {
          label: 'View Inventory',
          url: '/app/inventory',
        },
      };
      
      addNotification(notification);
      showToastNotification(notification);
    });

    newSocket.on('qc_alert', (data: RealtimeUpdate) => {
      const notification: Notification = {
        id: `qc-${Date.now()}`,
        type: 'error',
        title: 'QC Alert',
        message: `QC sample ${data.data.sampleId} failed`,
        timestamp: new Date(),
        read: false,
        action: {
          label: 'View QC',
          url: '/app/quality-control',
        },
      };
      
      addNotification(notification);
      showToastNotification(notification);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user]);

  // Show toast notification
  const showToastNotification = useCallback((notification: Notification) => {
    const toastOptions = {
      duration: 5000,
      position: 'top-right' as const,
    };

    switch (notification.type) {
      case 'success':
        toast.success(notification.message, toastOptions);
        break;
      case 'error':
        toast.error(notification.message, toastOptions);
        break;
      case 'warning':
        toast(notification.message, {
          ...toastOptions,
          icon: '⚠️',
          style: {
            background: '#fbbf24',
            color: '#fff',
          },
        });
        break;
      default:
        toast(notification.message, {
          ...toastOptions,
          icon: 'ℹ️',
          style: {
            background: '#3b82f6',
            color: '#fff',
          },
        });
    }
  }, []);

  // Add notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
    };

    setNotifications(prev => [newNotification, ...prev]);
    trackEvent('notification_added', { 
      type: notification.type, 
      title: notification.title 
    });
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
    trackEvent('notification_marked_read', { notificationId });
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
    trackEvent('all_notifications_marked_read');
  }, []);

  // Remove notification
  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    trackEvent('notification_removed', { notificationId });
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    trackEvent('all_notifications_cleared');
  }, []);

  // Reconnect socket
  const reconnect = useCallback(() => {
    if (socket) {
      socket.connect();
    }
  }, [socket]);

  // Calculate unread count
  const unreadCount = useMemo(() => {
    return notifications.filter(notification => !notification.read).length;
  }, [notifications]);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('smartlab-notifications');
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        setNotifications(parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        })));
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    }
  }, []);

  // Save notifications to localStorage
  useEffect(() => {
    localStorage.setItem('smartlab-notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Clean up old notifications (older than 30 days)
  useEffect(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    setNotifications(prev =>
      prev.filter(notification => notification.timestamp > thirtyDaysAgo)
    );
  }, []);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification,
    clearAllNotifications,
    isConnected,
    reconnect,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 