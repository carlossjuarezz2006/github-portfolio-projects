/**
 * Real-time Dashboard App
 * 
 * Main application component that orchestrates:
 * - WebSocket connections for real-time data
 * - Dashboard routing and navigation
 * - Global state management
 * - Theme and layout management
 * - Error boundaries and performance monitoring
 */

import React, { useEffect, useState, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Alert, Snackbar } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

// Hooks and Services
import { useWebSocket } from './hooks/useWebSocket';
import { useDashboardStore } from './stores/dashboardStore';

// Components
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';
import ConnectionStatus from './components/common/ConnectionStatus';

// Pages (lazy loaded for better performance)
const Overview = React.lazy(() => import('./pages/Overview'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
const SystemMonitoring = React.lazy(() => import('./pages/SystemMonitoring'));
const Sales = React.lazy(() => import('./pages/Sales'));
const Users = React.lazy(() => import('./pages/Users'));
const RealTime = React.lazy(() => import('./pages/RealTime'));
const Settings = React.lazy(() => import('./pages/Settings'));

// Theme configuration
const createAppTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: mode === 'dark' ? '#667eea' : '#5a67d8',
      light: '#8fa7f0',
      dark: '#4c51bf',
    },
    secondary: {
      main: mode === 'dark' ? '#764ba2' : '#6b46c1',
      light: '#9975c4',
      dark: '#553c9a',
    },
    background: {
      default: mode === 'dark' ? '#0f172a' : '#f8fafc',
      paper: mode === 'dark' ? '#1e293b' : '#ffffff',
    },
    text: {
      primary: mode === 'dark' ? '#f1f5f9' : '#1e293b',
      secondary: mode === 'dark' ? '#cbd5e1' : '#64748b',
    },
    success: {
      main: '#10b981',
    },
    warning: {
      main: '#f59e0b',
    },
    error: {
      main: '#ef4444',
    },
    info: {
      main: '#3b82f6',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.1rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '0.95rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: mode === 'dark' 
    ? [
        'none',
        '0px 2px 4px rgba(0, 0, 0, 0.3)',
        '0px 4px 8px rgba(0, 0, 0, 0.3)',
        '0px 8px 16px rgba(0, 0, 0, 0.3)',
        '0px 16px 32px rgba(0, 0, 0, 0.3)',
        ...Array(20).fill('0px 16px 32px rgba(0, 0, 0, 0.3)')
      ]
    : [
        'none',
        '0px 2px 4px rgba(0, 0, 0, 0.05)',
        '0px 4px 8px rgba(0, 0, 0, 0.08)',
        '0px 8px 16px rgba(0, 0, 0, 0.1)',
        '0px 16px 32px rgba(0, 0, 0, 0.12)',
        ...Array(20).fill('0px 16px 32px rgba(0, 0, 0, 0.12)')
      ],
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 16,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: mode === 'dark' 
              ? '0px 12px 24px rgba(0, 0, 0, 0.4)'
              : '0px 12px 24px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

function App() {
  // State management
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  
  // Store hooks
  const { 
    isConnected,
    connectionError,
    metrics,
    analytics,
    systemStatus
  } = useDashboardStore();

  // WebSocket connection
  const { 
    connected, 
    error: wsError, 
    connect, 
    disconnect 
  } = useWebSocket();

  // Theme
  const theme = createAppTheme(darkMode ? 'dark' : 'light');

  // Effects
  useEffect(() => {
    // Save dark mode preference
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    // Connect to WebSocket on app start
    connect();
    
    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  useEffect(() => {
    // Handle connection errors
    if (wsError || connectionError) {
      const error = wsError || connectionError;
      addNotification({
        type: 'error',
        message: `Connection Error: ${error}`,
        duration: 5000,
      });
    }
  }, [wsError, connectionError]);

  // Handlers
  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const addNotification = (notification) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    setNotifications(prev => [...prev, newNotification]);

    // Auto remove notification
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, notification.duration || 3000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Layout configuration
  const sidebarWidth = 280;
  const navbarHeight = 64;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <ErrorBoundary>
          <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ x: -sidebarWidth }}
                  animate={{ x: 0 }}
                  exit={{ x: -sidebarWidth }}
                  transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    height: '100vh',
                    width: sidebarWidth,
                    zIndex: 1200,
                  }}
                >
                  <Sidebar 
                    width={sidebarWidth}
                    onToggle={toggleSidebar}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Content */}
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                width: '100%',
                minHeight: '100vh',
                transition: 'margin-left 0.3s ease-in-out',
                marginLeft: sidebarOpen ? `${sidebarWidth}px` : 0,
                backgroundColor: 'background.default',
              }}
            >
              {/* Top Navigation */}
              <Navbar
                height={navbarHeight}
                darkMode={darkMode}
                onToggleDarkMode={toggleDarkMode}
                onToggleSidebar={toggleSidebar}
                sidebarOpen={sidebarOpen}
              />

              {/* Connection Status */}
              <ConnectionStatus
                connected={connected}
                error={wsError || connectionError}
              />

              {/* Page Content */}
              <Box
                sx={{
                  padding: 3,
                  paddingTop: 2,
                  minHeight: `calc(100vh - ${navbarHeight}px)`,
                }}
              >
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    <Route path="/" element={<Navigate to="/overview" replace />} />
                    <Route path="/overview" element={<Overview />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/system" element={<SystemMonitoring />} />
                    <Route path="/sales" element={<Sales />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/realtime" element={<RealTime />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/overview" replace />} />
                  </Routes>
                </Suspense>
              </Box>
            </Box>
          </Box>

          {/* Notifications */}
          <Box
            sx={{
              position: 'fixed',
              top: navbarHeight + 16,
              right: 16,
              zIndex: 2000,
              maxWidth: 400,
            }}
          >
            <AnimatePresence>
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: 300, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 300, scale: 0.8 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                  style={{ marginBottom: 8 }}
                >
                  <Alert
                    severity={notification.type}
                    onClose={() => removeNotification(notification.id)}
                    sx={{
                      boxShadow: theme.shadows[4],
                      borderRadius: 2,
                    }}
                  >
                    {notification.message}
                  </Alert>
                </motion.div>
              ))}
            </AnimatePresence>
          </Box>

          {/* Toast Notifications */}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: theme.palette.background.paper,
                color: theme.palette.text.primary,
                borderRadius: '12px',
                boxShadow: theme.shadows[4],
              },
              success: {
                iconTheme: {
                  primary: theme.palette.success.main,
                  secondary: theme.palette.background.paper,
                },
              },
              error: {
                iconTheme: {
                  primary: theme.palette.error.main,
                  secondary: theme.palette.background.paper,
                },
              },
            }}
          />

          {/* Global Snackbar for System Messages */}
          <Snackbar
            open={!connected && !wsError}
            message="Connecting to real-time data..."
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          />
        </ErrorBoundary>
      </Router>
    </ThemeProvider>
  );
}

// Performance monitoring wrapper
const AppWithPerformanceMonitoring = () => {
  useEffect(() => {
    // Monitor app performance
    if ('performance' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log(`%c📊 LCP: ${entry.startTime.toFixed(2)}ms`, 'color: #10b981');
          }
          if (entry.entryType === 'first-input') {
            console.log(`%c📊 FID: ${entry.processingStart - entry.startTime}ms`, 'color: #3b82f6');
          }
          if (entry.entryType === 'layout-shift') {
            console.log(`%c📊 CLS: ${entry.value.toFixed(4)}`, 'color: #f59e0b');
          }
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });

      return () => observer.disconnect();
    }
  }, []);

  return <App />;
};

export default AppWithPerformanceMonitoring;

