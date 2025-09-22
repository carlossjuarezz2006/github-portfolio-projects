/**
 * WebSocket Hook
 * 
 * Custom React hook that manages WebSocket connections using Socket.IO
 * Provides real-time communication capabilities for the dashboard
 * 
 * Features:
 * - Automatic connection management
 * - Event handling and data streaming
 * - Connection status monitoring
 * - Error handling and reconnection
 * - Room management for different dashboard types
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import io from 'socket.io-client';
import toast from 'react-hot-toast';
import { useDashboardStore } from '../stores/dashboardStore';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001';

export const useWebSocket = () => {
  // State
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [latency, setLatency] = useState(null);
  
  // Refs
  const socketRef = useRef(null);
  const pingIntervalRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);

  // Store actions
  const {
    setConnectionStatus,
    updateMetrics,
    updateAnalytics,
    updateSystemMetrics,
    addNotification,
    addRealtimeEvent,
    updateDashboardData,
  } = useDashboardStore();

  // Connection management
  const connect = useCallback(() => {
    if (socketRef.current?.connected || connecting) return;

    setConnecting(true);
    setError(null);

    try {
      socketRef.current = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: false,
        autoConnect: true,
      });

      const socket = socketRef.current;

      // Connection events
      socket.on('connect', () => {
        console.log('🔌 Connected to WebSocket server');
        setConnected(true);
        setConnecting(false);
        setError(null);
        reconnectAttemptsRef.current = 0;
        
        setConnectionStatus(true);
        toast.success('Connected to real-time data stream');
        
        // Authenticate after connection
        socket.emit('authenticate', 'demo-token'); // In real app, use actual JWT
        
        // Start ping monitoring
        startPingMonitoring();
      });

      socket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from WebSocket server:', reason);
        setConnected(false);
        setConnectionStatus(false);
        
        if (reason === 'io server disconnect') {
          // Server disconnected, need to reconnect manually
          scheduleReconnect();
        }
        
        // Stop ping monitoring
        stopPingMonitoring();
      });

      socket.on('connect_error', (err) => {
        console.error('❌ Connection error:', err);
        setConnecting(false);
        setError(err.message);
        setConnectionStatus(false, err.message);
        
        scheduleReconnect();
      });

      // Authentication events
      socket.on('authenticated', (data) => {
        console.log('✅ Authenticated:', data);
        // Join default dashboard room
        socket.emit('join_dashboard', 'overview');
      });

      socket.on('authentication_error', (data) => {
        console.error('❌ Authentication failed:', data);
        setError('Authentication failed');
        toast.error('Authentication failed');
      });

      // Data events
      socket.on('initial_data', (data) => {
        console.log('📊 Initial data received:', data);
        updateMetrics(data.systemMetrics);
        updateAnalytics(data.analytics);
        
        data.notifications?.forEach(notification => {
          addNotification(notification);
        });
      });

      socket.on('system_metrics_update', (data) => {
        updateSystemMetrics(data);
      });

      socket.on('analytics_update', (data) => {
        updateAnalytics(data);
      });

      socket.on('overview_update', (data) => {
        updateMetrics(data.system);
        updateAnalytics(data.analytics);
        updateDashboardData('overview', data);
      });

      socket.on('dashboard_data', (data) => {
        updateDashboardData(data.dashboard, data.data);
      });

      socket.on('live_data_response', (data) => {
        // Handle specific data requests
        switch (data.type) {
          case 'system_metrics':
            updateSystemMetrics(data.data);
            break;
          case 'analytics':
            updateAnalytics(data.data);
            break;
          default:
            updateDashboardData(data.type, data.data);
        }
      });

      // Real-time events
      socket.on('new_notification', (notification) => {
        addNotification(notification);
        toast(notification.message, {
          icon: getNotificationIcon(notification.type),
        });
      });

      socket.on('new_realtime_event', (event) => {
        addRealtimeEvent(event);
      });

      socket.on('alert_triggered', (alert) => {
        addNotification({
          type: 'warning',
          title: 'System Alert',
          message: `${alert.metric} is ${alert.condition} ${alert.threshold}. Current value: ${alert.currentValue}`,
          timestamp: new Date(alert.timestamp),
        });
        
        toast.error(`Alert: ${alert.metric} is ${alert.condition} threshold`);
      });

      // User events
      socket.on('user_joined_dashboard', (data) => {
        console.log('👤 User joined dashboard:', data);
        addNotification({
          type: 'info',
          message: `${data.user.name} joined ${data.dashboard} dashboard`,
          timestamp: new Date(data.timestamp),
        });
      });

      socket.on('user_left_dashboard', (data) => {
        console.log('👤 User left dashboard:', data);
      });

      // Error handling
      socket.on('error', (data) => {
        console.error('⚠️ Socket error:', data);
        setError(data.message);
        toast.error(data.message);
      });

      // Ping/Pong for latency monitoring
      socket.on('pong', (timestamp) => {
        const now = Date.now();
        const pingLatency = now - timestamp;
        setLatency(pingLatency);
      });

    } catch (err) {
      console.error('❌ Socket connection error:', err);
      setConnecting(false);
      setError(err.message);
    }
  }, [connecting, setConnectionStatus, updateMetrics, updateAnalytics, updateSystemMetrics, addNotification, addRealtimeEvent, updateDashboardData]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setConnected(false);
    setConnecting(false);
    setError(null);
    setLatency(null);
    
    stopPingMonitoring();
    clearReconnectTimeout();
  }, []);

  // Ping monitoring for latency
  const startPingMonitoring = useCallback(() => {
    if (pingIntervalRef.current) return;
    
    pingIntervalRef.current = setInterval(() => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('ping', Date.now());
      }
    }, 5000); // Ping every 5 seconds
  }, []);

  const stopPingMonitoring = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  }, []);

  // Reconnection logic
  const scheduleReconnect = useCallback(() => {
    const maxAttempts = 10;
    const baseDelay = 1000;
    const maxDelay = 30000;
    
    if (reconnectAttemptsRef.current >= maxAttempts) {
      console.log('❌ Max reconnection attempts reached');
      setError('Unable to connect to server. Please refresh the page.');
      return;
    }
    
    const delay = Math.min(
      baseDelay * Math.pow(2, reconnectAttemptsRef.current),
      maxDelay
    );
    
    console.log(`🔄 Scheduling reconnection attempt ${reconnectAttemptsRef.current + 1} in ${delay}ms`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectAttemptsRef.current += 1;
      connect();
    }, delay);
  }, [connect]);

  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Room management
  const joinDashboard = useCallback((dashboardType) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_dashboard', dashboardType);
    }
  }, []);

  const leaveDashboard = useCallback((dashboardType) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave_dashboard', dashboardType);
    }
  }, []);

  // Data requests
  const requestLiveData = useCallback((dataType) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('request_live_data', dataType);
    }
  }, []);

  // Alert configuration
  const setupAlert = useCallback((alertConfig) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('setup_alert', alertConfig);
    }
  }, []);

  // Send chat message
  const sendChatMessage = useCallback((message, room = 'general') => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('chat_message', { message, room });
    }
  }, []);

  // Emit custom events
  const emit = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  // Listen to custom events
  const on = useCallback((event, handler) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);
      
      return () => {
        if (socketRef.current) {
          socketRef.current.off(event, handler);
        }
      };
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    // Connection state
    connected,
    connecting,
    error,
    latency,
    
    // Connection methods
    connect,
    disconnect,
    
    // Dashboard methods
    joinDashboard,
    leaveDashboard,
    requestLiveData,
    
    // Alert methods
    setupAlert,
    
    // Communication methods
    sendChatMessage,
    emit,
    on,
    
    // Connection info
    reconnectAttempts: reconnectAttemptsRef.current,
    socket: socketRef.current,
  };
};

// Helper function to get notification icons
const getNotificationIcon = (type) => {
  switch (type) {
    case 'success':
      return '✅';
    case 'warning':
      return '⚠️';
    case 'error':
      return '❌';
    case 'info':
      return 'ℹ️';
    default:
      return '📢';
  }
};

export default useWebSocket;

