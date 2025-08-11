import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { Notification, RealtimeUpdate } from '../types';
import { useAuth } from './AuthContext';
import { trackEvent } from '../utils/monitoring/errorMonitoring';

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
  // --- Added for global flash messages ---
  currentNotification: Omit<Notification, 'id' | 'timestamp'> | null;
  showNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
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
  const [currentNotification, setCurrentNotification] = useState<Omit<Notification, 'id' | 'timestamp'> | null>(null);
  const notificationTimeout = React.useRef<NodeJS.Timeout | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!user) return;

    // Only connect if VITE_SOCKET_URL is explicitly set
    const socketUrl = import.meta.env.VITE_SOCKET_URL;
    if (!socketUrl) {
      console.log('Socket URL not configured, skipping real-time notifications');
      return;
    }

    const newSocket = io(socketUrl, {
      auth: {
        userId: user.uid,
        token: user.uid, // In real app, use actual JWT token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 3,
      timeout: 5000,
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
      
      // Don't show error to user if socket URL is not configured
      if (!import.meta.env.VITE_SOCKET_URL) {
        return;
      }
      
      // Show a user-friendly error message
      showFlashMessage({ type: 'error', title: 'Connection Error', message: 'Real-time notifications are currently unavailable' });
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
      showFlashMessage(notification);
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
      showFlashMessage(notification);
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
      showFlashMessage(notification);
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
      showFlashMessage(notification);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user]);

  // Show a global flash message
  const showNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    setCurrentNotification(notification);
    if (notificationTimeout.current) clearTimeout(notificationTimeout.current);
    notificationTimeout.current = setTimeout(() => {
      setCurrentNotification(null);
    }, 5000);
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

  // Listen for 'show-flash-message' events
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      showNotification(e.detail);
    };
    window.addEventListener('show-flash-message', handler);
    return () => window.removeEventListener('show-flash-message', handler);
  }, [showNotification]);

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
    // --- Added for global flash messages ---
    currentNotification,
    showNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 

export function showFlashMessage({ type = 'info', title, message }) {
  // Use the global notification context if available
  const event = new CustomEvent('show-flash-message', {
    detail: { type, title, message },
  });
  window.dispatchEvent(event);
} 