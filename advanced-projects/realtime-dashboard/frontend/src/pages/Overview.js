/**
 * Overview Dashboard Page
 * 
 * Main dashboard view that displays key metrics and real-time data
 * including system performance, business analytics, and live updates
 */

import React, { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Avatar,
  Chip,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Computer,
  People,
  AttachMoney,
  Speed,
  Memory,
  Storage,
  NetworkCheck,
  Refresh,
  Warning,
  CheckCircle
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

import { useDashboardStore } from '../stores/dashboardStore';
import { useWebSocket } from '../hooks/useWebSocket';

const Overview = () => {
  const {
    systemMetrics,
    analytics,
    connection,
    getSystemHealth,
    getConnectionHealth,
    getActiveAlerts,
    getUnreadNotifications,
    setLastRefresh
  } = useDashboardStore();

  const { requestLiveData, joinDashboard } = useWebSocket();
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    // Join overview dashboard room
    joinDashboard('overview');
    
    // Request initial data
    requestLiveData('overview');
    
    // Set up auto-refresh
    const interval = setInterval(() => {
      requestLiveData('overview');
      setLastUpdate(new Date());
      setLastRefresh();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [joinDashboard, requestLiveData, setLastRefresh]);

  const handleRefresh = () => {
    requestLiveData('overview');
    setLastUpdate(new Date());
    setLastRefresh();
  };

  // Data for charts
  const systemUsageData = [
    { name: 'CPU', value: systemMetrics.cpu.usage, color: '#8884d8' },
    { name: 'Memory', value: systemMetrics.memory.usage, color: '#82ca9d' },
    { name: 'Disk', value: systemMetrics.disk.usage || 0, color: '#ffc658' }
  ];

  const trafficData = analytics.sales?.hourlyRevenue?.slice(-12) || [];

  const systemHealth = getSystemHealth();
  const connectionHealth = getConnectionHealth();
  const activeAlerts = getActiveAlerts();
  const unreadNotifications = getUnreadNotifications();

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const numberVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 200 }
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            📊 Dashboard Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time system monitoring and business analytics
          </Typography>
        </Box>
        
        <Box display="flex" alignItems="center" gap={2}>
          {/* Connection Status */}
          <Chip
            icon={connectionHealth === 'good' ? <CheckCircle /> : <Warning />}
            label={`Connection: ${connectionHealth}`}
            color={connectionHealth === 'good' ? 'success' : 'warning'}
            variant="outlined"
          />
          
          {/* Last Update */}
          <Typography variant="caption" color="text.secondary">
            Last update: {lastUpdate.toLocaleTimeString()}
          </Typography>
          
          {/* Refresh Button */}
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Alert Banner */}
      {activeAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          style={{ marginBottom: 16 }}
        >
          <Alert 
            severity="warning" 
            action={
              <Chip label={`${activeAlerts.length} alert${activeAlerts.length > 1 ? 's' : ''}`} size="small" />
            }
          >
            System alerts detected. Check system monitoring for details.
          </Alert>
        </motion.div>
      )}

      <Grid container spacing={3}>
        {/* Key Metrics Row */}
        <Grid item xs={12} md={3}>
          <motion.div variants={cardVariants} initial="hidden" animate="visible">
            <StatsCard
              title="CPU Usage"
              value={`${systemMetrics.cpu.usage.toFixed(1)}%`}
              change={2.3}
              icon={<Speed sx={{ color: '#8884d8' }} />}
              color="#8884d8"
            />
          </motion.div>
        </Grid>

        <Grid item xs={12} md={3}>
          <motion.div variants={cardVariants} initial="hidden" animate="visible" style={{ animationDelay: '0.1s' }}>
            <StatsCard
              title="Memory Usage"
              value={`${systemMetrics.memory.usage.toFixed(1)}%`}
              change={-1.2}
              icon={<Memory sx={{ color: '#82ca9d' }} />}
              color="#82ca9d"
            />
          </motion.div>
        </Grid>

        <Grid item xs={12} md={3}>
          <motion.div variants={cardVariants} initial="hidden" animate="visible" style={{ animationDelay: '0.2s' }}>
            <StatsCard
              title="Active Users"
              value={analytics.users.active.toLocaleString()}
              change={8.7}
              icon={<People sx={{ color: '#ffc658' }} />}
              color="#ffc658"
            />
          </motion.div>
        </Grid>

        <Grid item xs={12} md={3}>
          <motion.div variants={cardVariants} initial="hidden" animate="visible" style={{ animationDelay: '0.3s' }}>
            <StatsCard
              title="Today's Revenue"
              value={`$${analytics.sales.today.revenue?.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              change={15.3}
              icon={<AttachMoney sx={{ color: '#ff7c7c' }} />}
              color="#ff7c7c"
            />
          </motion.div>
        </Grid>

        {/* System Usage Chart */}
        <Grid item xs={12} md={8}>
          <motion.div variants={cardVariants} initial="hidden" animate="visible" style={{ animationDelay: '0.4s' }}>
            <Card sx={{ height: 400 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  System Resource Usage
                </Typography>
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={systemUsageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <ChartTooltip />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#8884d8"
                      fillOpacity={0.6}
                      fill="url(#colorGradient)"
                    />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* System Health */}
        <Grid item xs={12} md={4}>
          <motion.div variants={cardVariants} initial="hidden" animate="visible" style={{ animationDelay: '0.5s' }}>
            <Card sx={{ height: 400 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  System Health
                </Typography>
                
                <Box mb={3}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Computer sx={{ mr: 2, color: getHealthColor(systemHealth) }} />
                    <Box>
                      <Typography variant="body2">Overall System</Typography>
                      <Chip 
                        label={systemHealth.toUpperCase()} 
                        color={getHealthChipColor(systemHealth)}
                        size="small"
                      />
                    </Box>
                  </Box>
                </Box>

                {/* Resource Bars */}
                <Box mb={2}>
                  <Typography variant="body2" gutterBottom>
                    CPU: {systemMetrics.cpu.usage.toFixed(1)}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={systemMetrics.cpu.usage} 
                    sx={{ height: 8, borderRadius: 4, mb: 2 }}
                    color={getProgressColor(systemMetrics.cpu.usage)}
                  />
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" gutterBottom>
                    Memory: {systemMetrics.memory.usage.toFixed(1)}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={systemMetrics.memory.usage} 
                    sx={{ height: 8, borderRadius: 4, mb: 2 }}
                    color={getProgressColor(systemMetrics.memory.usage)}
                  />
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" gutterBottom>
                    Disk: {(systemMetrics.disk.usage || 0).toFixed(1)}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={systemMetrics.disk.usage || 0} 
                    sx={{ height: 8, borderRadius: 4 }}
                    color={getProgressColor(systemMetrics.disk.usage || 0)}
                  />
                </Box>

                {/* System Info */}
                <Box mt={3} p={2} bgcolor="background.paper" borderRadius={2}>
                  <Typography variant="caption" display="block">
                    Uptime: {systemMetrics.uptime.formatted}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Load Average: {systemMetrics.cpu.loadAverage?.join(', ')}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Traffic/Revenue Chart */}
        <Grid item xs={12} md={8}>
          <motion.div variants={cardVariants} initial="hidden" animate="visible" style={{ animationDelay: '0.6s' }}>
            <Card sx={{ height: 350 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Hourly Revenue Trend
                </Typography>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={trafficData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" tickFormatter={(hour) => `${hour}:00`} />
                    <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
                    <ChartTooltip 
                      labelFormatter={(hour) => `${hour}:00`}
                      formatter={(value, name) => [`$${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#8884d8" 
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} md={4}>
          <motion.div variants={cardVariants} initial="hidden" animate="visible" style={{ animationDelay: '0.7s' }}>
            <Card sx={{ height: 350 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Stats
                </Typography>
                
                <Box mb={2} p={2} bgcolor="primary.main" color="primary.contrastText" borderRadius={2}>
                  <Typography variant="body2" gutterBottom>
                    Online Users
                  </Typography>
                  <motion.div variants={numberVariants}>
                    <Typography variant="h4" fontWeight="bold">
                      {analytics.users.online.toLocaleString()}
                    </Typography>
                  </motion.div>
                </Box>

                <Box mb={2} p={2} bgcolor="success.main" color="success.contrastText" borderRadius={2}>
                  <Typography variant="body2" gutterBottom>
                    Orders Today
                  </Typography>
                  <motion.div variants={numberVariants}>
                    <Typography variant="h4" fontWeight="bold">
                      {analytics.sales.today.orders || 0}
                    </Typography>
                  </motion.div>
                </Box>

                <Box mb={2} p={2} bgcolor="warning.main" color="warning.contrastText" borderRadius={2}>
                  <Typography variant="body2" gutterBottom>
                    Conversion Rate
                  </Typography>
                  <motion.div variants={numberVariants}>
                    <Typography variant="h4" fontWeight="bold">
                      {(analytics.sales.today.conversionRate || 0).toFixed(1)}%
                    </Typography>
                  </motion.div>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, change, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <Typography variant="h4" fontWeight="bold">
              {value}
            </Typography>
          </motion.div>
          <Box display="flex" alignItems="center" mt={1}>
            {change > 0 ? (
              <TrendingUp sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
            ) : (
              <TrendingDown sx={{ color: 'error.main', fontSize: 16, mr: 0.5 }} />
            )}
            <Typography 
              variant="body2" 
              color={change > 0 ? 'success.main' : 'error.main'}
            >
              {Math.abs(change)}%
            </Typography>
          </Box>
        </Box>
        <Avatar sx={{ bgcolor: color + '20', width: 56, height: 56 }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

// Helper functions
const getHealthColor = (health) => {
  switch (health) {
    case 'good': return 'success.main';
    case 'warning': return 'warning.main';
    case 'critical': return 'error.main';
    default: return 'text.secondary';
  }
};

const getHealthChipColor = (health) => {
  switch (health) {
    case 'good': return 'success';
    case 'warning': return 'warning';
    case 'critical': return 'error';
    default: return 'default';
  }
};

const getProgressColor = (value) => {
  if (value > 90) return 'error';
  if (value > 70) return 'warning';
  return 'primary';
};

export default Overview;

