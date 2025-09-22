/**
 * Dashboard Store
 * 
 * Global state management using Zustand for the real-time dashboard
 * Manages all application state including:
 * - Connection status and errors
 * - Real-time metrics and analytics
 * - Dashboard data and configurations  
 * - Notifications and alerts
 * - User preferences and settings
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export const useDashboardStore = create(
  persist(
    immer((set, get) => ({
      // Connection State
      connection: {
        isConnected: false,
        error: null,
        latency: null,
        lastConnected: null,
        reconnectAttempts: 0,
      },

      // System Metrics
      systemMetrics: {
        cpu: {
          usage: 0,
          cores: [],
          loadAverage: [0, 0, 0],
          processes: { total: 0, running: 0, sleeping: 0, zombie: 0 }
        },
        memory: {
          total: 0,
          used: 0,
          free: 0,
          usage: 0,
          swap: { total: 0, used: 0, free: 0, usage: 0 },
          cached: 0,
          buffers: 0
        },
        disk: {
          total: 0,
          used: 0,
          free: 0,
          usage: 0,
          drives: [],
          io: { readOperations: 0, writeOperations: 0, readBytes: 0, writeBytes: 0 }
        },
        network: {
          interfaces: [],
          totalBandwidth: 0,
          currentTraffic: { download: 0, upload: 0, downloadMbps: 0, uploadMbps: 0 },
          connections: { established: 0, listening: 0, timeWait: 0 }
        },
        uptime: { seconds: 0, formatted: '', days: 0, hours: 0, minutes: 0 },
        timestamp: null,
      },

      // Business Analytics
      analytics: {
        users: {
          total: 0,
          active: 0,
          online: 0,
          new: 0,
          returning: 0,
          growth: { daily: 0, weekly: 0, monthly: 0 },
          demographics: { ageGroups: {}, gender: {} },
          sessions: { averageDuration: 0, bounceRate: 0, pagesPerSession: 0 }
        },
        sales: {
          today: { revenue: 0, orders: 0, averageOrderValue: 0, conversionRate: 0 },
          thisMonth: { revenue: 0, orders: 0, target: 0, growth: 0 },
          products: [],
          recentOrders: [],
          hourlyRevenue: []
        },
        traffic: {
          pageViews: 0,
          uniqueVisitors: 0,
          sources: {},
          devices: {},
          browsers: {},
          topPages: []
        },
        kpis: {
          customerLifetimeValue: 0,
          customerAcquisitionCost: 0,
          monthlyRecurringRevenue: 0,
          churnRate: 0,
          netPromoterScore: 0,
          customerSatisfaction: 0
        },
        trends: {},
        timestamp: null,
      },

      // Dashboard Data (for different dashboard types)
      dashboardData: {
        overview: {},
        analytics: {},
        system: {},
        sales: {},
        users: {},
        realtime: {}
      },

      // Notifications and Alerts
      notifications: [],
      alerts: [],
      
      // Real-time Events
      realtimeEvents: [],
      
      // User Settings and Preferences
      settings: {
        theme: 'light',
        refreshInterval: 2000,
        autoRefresh: true,
        notificationsEnabled: true,
        soundEnabled: false,
        compactMode: false,
        selectedDashboards: ['overview', 'analytics', 'system'],
        chartTypes: {
          cpu: 'line',
          memory: 'area',
          sales: 'bar'
        },
        alertThresholds: {
          cpu: 80,
          memory: 85,
          disk: 90
        }
      },

      // UI State
      ui: {
        sidebarOpen: true,
        selectedDashboard: 'overview',
        loading: false,
        error: null,
        lastRefresh: null,
        gridLayout: {},
        widgetConfigs: {}
      },

      // Performance Data
      performance: {
        renderTimes: [],
        dataUpdateTimes: [],
        memoryUsage: []
      },

      // Actions

      // Connection Actions
      setConnectionStatus: (isConnected, error = null) => {
        set((state) => {
          state.connection.isConnected = isConnected;
          state.connection.error = error;
          if (isConnected) {
            state.connection.lastConnected = new Date();
            state.connection.reconnectAttempts = 0;
          }
        });
      },

      setLatency: (latency) => {
        set((state) => {
          state.connection.latency = latency;
        });
      },

      incrementReconnectAttempts: () => {
        set((state) => {
          state.connection.reconnectAttempts += 1;
        });
      },

      // System Metrics Actions
      updateSystemMetrics: (metrics) => {
        set((state) => {
          state.systemMetrics = { ...metrics, timestamp: new Date() };
        });
      },

      updateMetrics: (metrics) => {
        set((state) => {
          if (metrics) {
            state.systemMetrics = { ...metrics, timestamp: new Date() };
          }
        });
      },

      // Analytics Actions
      updateAnalytics: (analytics) => {
        set((state) => {
          if (analytics) {
            state.analytics = { ...analytics, timestamp: new Date() };
          }
        });
      },

      // Dashboard Data Actions
      updateDashboardData: (dashboardType, data) => {
        set((state) => {
          state.dashboardData[dashboardType] = {
            ...data,
            lastUpdated: new Date()
          };
        });
      },

      clearDashboardData: (dashboardType) => {
        set((state) => {
          state.dashboardData[dashboardType] = {};
        });
      },

      // Notification Actions
      addNotification: (notification) => {
        set((state) => {
          const id = Math.random().toString(36).substr(2, 9);
          const newNotification = {
            ...notification,
            id,
            timestamp: notification.timestamp || new Date(),
            read: false
          };
          
          state.notifications.unshift(newNotification);
          
          // Keep only the last 50 notifications
          if (state.notifications.length > 50) {
            state.notifications = state.notifications.slice(0, 50);
          }
        });
      },

      removeNotification: (id) => {
        set((state) => {
          state.notifications = state.notifications.filter(n => n.id !== id);
        });
      },

      markNotificationAsRead: (id) => {
        set((state) => {
          const notification = state.notifications.find(n => n.id === id);
          if (notification) {
            notification.read = true;
          }
        });
      },

      clearAllNotifications: () => {
        set((state) => {
          state.notifications = [];
        });
      },

      // Alert Actions
      addAlert: (alert) => {
        set((state) => {
          const id = Math.random().toString(36).substr(2, 9);
          const newAlert = {
            ...alert,
            id,
            timestamp: alert.timestamp || new Date(),
            active: true
          };
          
          state.alerts.unshift(newAlert);
          
          // Keep only the last 20 alerts
          if (state.alerts.length > 20) {
            state.alerts = state.alerts.slice(0, 20);
          }
        });
      },

      dismissAlert: (id) => {
        set((state) => {
          const alert = state.alerts.find(a => a.id === id);
          if (alert) {
            alert.active = false;
          }
        });
      },

      // Real-time Events Actions
      addRealtimeEvent: (event) => {
        set((state) => {
          state.realtimeEvents.unshift({
            ...event,
            timestamp: event.timestamp || new Date()
          });
          
          // Keep only the last 100 events
          if (state.realtimeEvents.length > 100) {
            state.realtimeEvents = state.realtimeEvents.slice(0, 100);
          }
        });
      },

      clearRealtimeEvents: () => {
        set((state) => {
          state.realtimeEvents = [];
        });
      },

      // Settings Actions
      updateSettings: (newSettings) => {
        set((state) => {
          state.settings = { ...state.settings, ...newSettings };
        });
      },

      updateAlertThresholds: (thresholds) => {
        set((state) => {
          state.settings.alertThresholds = { 
            ...state.settings.alertThresholds, 
            ...thresholds 
          };
        });
      },

      toggleTheme: () => {
        set((state) => {
          state.settings.theme = state.settings.theme === 'light' ? 'dark' : 'light';
        });
      },

      // UI Actions
      setSelectedDashboard: (dashboard) => {
        set((state) => {
          state.ui.selectedDashboard = dashboard;
        });
      },

      toggleSidebar: () => {
        set((state) => {
          state.ui.sidebarOpen = !state.ui.sidebarOpen;
        });
      },

      setLoading: (loading) => {
        set((state) => {
          state.ui.loading = loading;
        });
      },

      setError: (error) => {
        set((state) => {
          state.ui.error = error;
        });
      },

      updateGridLayout: (layout) => {
        set((state) => {
          state.ui.gridLayout = { ...state.ui.gridLayout, ...layout };
        });
      },

      updateWidgetConfig: (widgetId, config) => {
        set((state) => {
          state.ui.widgetConfigs[widgetId] = { 
            ...state.ui.widgetConfigs[widgetId], 
            ...config 
          };
        });
      },

      setLastRefresh: () => {
        set((state) => {
          state.ui.lastRefresh = new Date();
        });
      },

      // Performance Tracking
      addRenderTime: (time) => {
        set((state) => {
          state.performance.renderTimes.push({
            time,
            timestamp: new Date()
          });
          
          // Keep only the last 100 render times
          if (state.performance.renderTimes.length > 100) {
            state.performance.renderTimes.shift();
          }
        });
      },

      addDataUpdateTime: (time) => {
        set((state) => {
          state.performance.dataUpdateTimes.push({
            time,
            timestamp: new Date()
          });
          
          // Keep only the last 100 update times
          if (state.performance.dataUpdateTimes.length > 100) {
            state.performance.dataUpdateTimes.shift();
          }
        });
      },

      // Utility Actions
      resetStore: () => {
        set((state) => {
          // Reset everything except user settings
          const settings = state.settings;
          const ui = { ...state.ui, loading: false, error: null };
          
          return {
            ...get(),
            connection: {
              isConnected: false,
              error: null,
              latency: null,
              lastConnected: null,
              reconnectAttempts: 0,
            },
            systemMetrics: {
              cpu: { usage: 0, cores: [], loadAverage: [0, 0, 0], processes: {} },
              memory: { total: 0, used: 0, free: 0, usage: 0, swap: {}, cached: 0, buffers: 0 },
              disk: { total: 0, used: 0, free: 0, usage: 0, drives: [], io: {} },
              network: { interfaces: [], totalBandwidth: 0, currentTraffic: {}, connections: {} },
              uptime: { seconds: 0, formatted: '', days: 0, hours: 0, minutes: 0 },
              timestamp: null,
            },
            analytics: {
              users: { total: 0, active: 0, online: 0, new: 0, returning: 0, growth: {}, demographics: {}, sessions: {} },
              sales: { today: {}, thisMonth: {}, products: [], recentOrders: [], hourlyRevenue: [] },
              traffic: { pageViews: 0, uniqueVisitors: 0, sources: {}, devices: {}, browsers: {}, topPages: [] },
              kpis: {},
              trends: {},
              timestamp: null,
            },
            dashboardData: {},
            notifications: [],
            alerts: [],
            realtimeEvents: [],
            settings,
            ui,
            performance: { renderTimes: [], dataUpdateTimes: [], memoryUsage: [] }
          };
        });
      },

      // Selectors (computed values)
      getUnreadNotifications: () => {
        const state = get();
        return state.notifications.filter(n => !n.read);
      },

      getActiveAlerts: () => {
        const state = get();
        return state.alerts.filter(a => a.active);
      },

      getConnectionHealth: () => {
        const state = get();
        const { isConnected, error, latency, reconnectAttempts } = state.connection;
        
        if (!isConnected) return 'disconnected';
        if (error) return 'error';
        if (latency > 1000) return 'slow';
        if (reconnectAttempts > 0) return 'unstable';
        return 'good';
      },

      getSystemHealth: () => {
        const state = get();
        const { cpu, memory, disk } = state.systemMetrics;
        
        if (cpu.usage > 90 || memory.usage > 95 || (disk.usage && disk.usage > 95)) {
          return 'critical';
        }
        if (cpu.usage > 70 || memory.usage > 80 || (disk.usage && disk.usage > 85)) {
          return 'warning';
        }
        return 'good';
      }
    })),
    {
      name: 'dashboard-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist user settings and preferences
        settings: state.settings,
        ui: {
          sidebarOpen: state.ui.sidebarOpen,
          gridLayout: state.ui.gridLayout,
          widgetConfigs: state.ui.widgetConfigs
        }
      }),
    }
  )
);

