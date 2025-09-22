/**
 * Real-time Dashboard Server
 * 
 * A comprehensive WebSocket-powered server that streams live data including:
 * - System metrics (CPU, RAM, disk usage)
 * - Business analytics (sales, users, revenue)
 * - Real-time notifications
 * - Live chat and activity feeds
 * - Performance monitoring
 * 
 * Features:
 * - Socket.IO for bidirectional communication
 * - Redis for session management and pub/sub
 * - Real-time data simulation
 * - Multiple dashboard types
 * - Authentication and room management
 * - Scalable architecture
 */

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const cron = require('node-cron');
require('dotenv').config();

// Import services
const MetricsService = require('./services/MetricsService');
const AnalyticsService = require('./services/AnalyticsService');
const NotificationService = require('./services/NotificationService');
const SystemMonitorService = require('./services/SystemMonitorService');
const DataSimulatorService = require('./services/DataSimulatorService');

// Import WebSocket handlers
const websocketHandler = require('./websocket/websocketHandler');
const dashboardHandler = require('./websocket/dashboardHandler');
const chatHandler = require('./websocket/chatHandler');

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS configuration
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

// Environment variables
const PORT = process.env.PORT || 5001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const REDIS_URL = process.env.REDIS_URL;

// Middleware setup
app.use(helmet({
  crossOriginEmbedderPolicy: false,
}));

app.use(compression());

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === 'production' ? 100 : 1000,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'));

// Initialize services
const metricsService = new MetricsService();
const analyticsService = new AnalyticsService();
const notificationService = new NotificationService();
const systemMonitor = new SystemMonitorService();
const dataSimulator = new DataSimulatorService();

// Store active connections and rooms
const activeConnections = new Map();
const dashboardRooms = new Set(['overview', 'analytics', 'system', 'sales', 'users']);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  
  // Store connection info
  activeConnections.set(socket.id, {
    id: socket.id,
    connectedAt: new Date(),
    rooms: new Set(),
    user: null
  });

  // Handle authentication
  socket.on('authenticate', async (token) => {
    try {
      // In a real app, verify JWT token here
      const user = { id: socket.id, name: `User_${socket.id.slice(0, 6)}`, role: 'viewer' };
      
      activeConnections.get(socket.id).user = user;
      socket.user = user;
      
      socket.emit('authenticated', { user, status: 'success' });
      
      // Send initial data
      await sendInitialData(socket);
      
    } catch (error) {
      socket.emit('authentication_error', { message: 'Authentication failed' });
    }
  });

  // Handle room joining
  socket.on('join_dashboard', async (dashboardType) => {
    if (!dashboardRooms.has(dashboardType)) {
      socket.emit('error', { message: 'Invalid dashboard type' });
      return;
    }

    socket.join(dashboardType);
    activeConnections.get(socket.id).rooms.add(dashboardType);
    
    console.log(`📊 Client ${socket.id} joined dashboard: ${dashboardType}`);
    
    // Send dashboard-specific data
    await sendDashboardData(socket, dashboardType);
    
    // Notify others in the room
    socket.to(dashboardType).emit('user_joined_dashboard', {
      user: socket.user,
      dashboard: dashboardType,
      timestamp: new Date()
    });
  });

  // Handle leaving dashboard
  socket.on('leave_dashboard', (dashboardType) => {
    socket.leave(dashboardType);
    activeConnections.get(socket.id).rooms.delete(dashboardType);
    
    socket.to(dashboardType).emit('user_left_dashboard', {
      user: socket.user,
      dashboard: dashboardType,
      timestamp: new Date()
    });
  });

  // Handle real-time data requests
  socket.on('request_live_data', async (dataType) => {
    try {
      let data;
      
      switch (dataType) {
        case 'system_metrics':
          data = await systemMonitor.getCurrentMetrics();
          break;
        case 'analytics':
          data = await analyticsService.getCurrentAnalytics();
          break;
        case 'sales':
          data = await analyticsService.getSalesData();
          break;
        case 'users':
          data = await analyticsService.getUsersData();
          break;
        default:
          data = await metricsService.getAllMetrics();
      }
      
      socket.emit('live_data_response', { type: dataType, data, timestamp: new Date() });
      
    } catch (error) {
      socket.emit('error', { message: `Failed to fetch ${dataType}` });
    }
  });

  // Handle custom alerts setup
  socket.on('setup_alert', (alertConfig) => {
    const { metric, threshold, condition } = alertConfig;
    
    // Store alert config for this socket
    if (!socket.alerts) socket.alerts = new Map();
    socket.alerts.set(metric, { threshold, condition, enabled: true });
    
    socket.emit('alert_configured', { metric, threshold, condition });
  });

  // Handle chat messages
  socket.on('chat_message', (data) => {
    const message = {
      id: require('uuid').v4(),
      user: socket.user,
      text: data.message,
      timestamp: new Date(),
      room: data.room || 'general'
    };
    
    // Broadcast to room
    io.to(data.room || 'general').emit('new_chat_message', message);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
    
    const connection = activeConnections.get(socket.id);
    if (connection) {
      // Notify all rooms the user was in
      connection.rooms.forEach(room => {
        socket.to(room).emit('user_disconnected', {
          user: connection.user,
          room,
          timestamp: new Date()
        });
      });
      
      activeConnections.delete(socket.id);
    }
  });
});

// Send initial data to newly connected clients
async function sendInitialData(socket) {
  try {
    const [systemMetrics, analytics, notifications] = await Promise.all([
      systemMonitor.getCurrentMetrics(),
      analyticsService.getCurrentAnalytics(),
      notificationService.getRecentNotifications(10)
    ]);

    socket.emit('initial_data', {
      systemMetrics,
      analytics,
      notifications,
      connectionInfo: {
        connectedAt: new Date(),
        totalConnections: activeConnections.size
      }
    });
  } catch (error) {
    console.error('Error sending initial data:', error);
    socket.emit('error', { message: 'Failed to load initial data' });
  }
}

// Send dashboard-specific data
async function sendDashboardData(socket, dashboardType) {
  try {
    let data;
    
    switch (dashboardType) {
      case 'overview':
        data = await metricsService.getOverviewData();
        break;
      case 'analytics':
        data = await analyticsService.getAnalyticsData();
        break;
      case 'system':
        data = await systemMonitor.getDetailedMetrics();
        break;
      case 'sales':
        data = await analyticsService.getSalesData();
        break;
      case 'users':
        data = await analyticsService.getUsersData();
        break;
      default:
        data = {};
    }
    
    socket.emit('dashboard_data', { 
      dashboard: dashboardType, 
      data, 
      timestamp: new Date() 
    });
    
  } catch (error) {
    console.error(`Error sending ${dashboardType} data:`, error);
  }
}

// Broadcast live data to all connected clients
function broadcastLiveData() {
  if (activeConnections.size === 0) return;

  Promise.all([
    systemMonitor.getCurrentMetrics(),
    analyticsService.getCurrentAnalytics(),
    dataSimulator.generateRealtimeData()
  ]).then(([systemMetrics, analytics, simulatedData]) => {
    
    // Broadcast to specific dashboard rooms
    io.to('system').emit('system_metrics_update', systemMetrics);
    io.to('analytics').emit('analytics_update', analytics);
    io.to('overview').emit('overview_update', {
      system: systemMetrics,
      analytics: analytics,
      simulated: simulatedData
    });
    
    // Check for alerts
    checkAndSendAlerts(systemMetrics, analytics);
    
  }).catch(error => {
    console.error('Error broadcasting live data:', error);
  });
}

// Check for alerts and send notifications
function checkAndSendAlerts(systemMetrics, analytics) {
  activeConnections.forEach((connection, socketId) => {
    const socket = io.sockets.sockets.get(socketId);
    if (!socket || !socket.alerts) return;

    socket.alerts.forEach((alert, metric) => {
      if (!alert.enabled) return;

      let currentValue;
      switch (metric) {
        case 'cpu_usage':
          currentValue = systemMetrics.cpu.usage;
          break;
        case 'memory_usage':
          currentValue = systemMetrics.memory.usage;
          break;
        case 'active_users':
          currentValue = analytics.users.active;
          break;
        default:
          return;
      }

      const shouldAlert = alert.condition === 'above' 
        ? currentValue > alert.threshold 
        : currentValue < alert.threshold;

      if (shouldAlert) {
        socket.emit('alert_triggered', {
          metric,
          currentValue,
          threshold: alert.threshold,
          condition: alert.condition,
          timestamp: new Date()
        });
      }
    });
  });
}

// Schedule periodic data broadcasts
cron.schedule('*/2 * * * * *', broadcastLiveData); // Every 2 seconds

// Schedule notification generation
cron.schedule('*/10 * * * * *', async () => {
  const notification = await notificationService.generateRandomNotification();
  io.emit('new_notification', notification);
});

// REST API endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    connections: activeConnections.size,
    rooms: Array.from(dashboardRooms),
    memory: process.memoryUsage()
  });
});

app.get('/api/metrics', async (req, res) => {
  try {
    const metrics = await metricsService.getAllMetrics();
    res.json({ success: true, data: metrics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/analytics', async (req, res) => {
  try {
    const analytics = await analyticsService.getCurrentAnalytics();
    res.json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/connections', (req, res) => {
  const connections = Array.from(activeConnections.values()).map(conn => ({
    id: conn.id,
    connectedAt: conn.connectedAt,
    rooms: Array.from(conn.rooms),
    user: conn.user
  }));
  
  res.json({ success: true, data: { total: connections.length, connections } });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: NODE_ENV === 'development' ? err.message : 'Internal server error' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Real-time Dashboard Server running on port ${PORT}`);
  console.log(`📊 Environment: ${NODE_ENV}`);
  console.log(`🔌 WebSocket server ready`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  
  // Start data simulation
  dataSimulator.start();
});

module.exports = { app, server, io };

