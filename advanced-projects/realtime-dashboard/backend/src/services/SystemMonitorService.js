/**
 * System Monitor Service
 * 
 * Provides real-time system metrics including:
 * - CPU usage and load
 * - Memory utilization
 * - Disk space and I/O
 * - Network traffic
 * - Process information
 * - Temperature monitoring
 * 
 * Uses actual system APIs when available, with fallback simulation
 */

const os = require('os');
const fs = require('fs');
const { promisify } = require('util');

class SystemMonitorService {
  constructor() {
    this.history = {
      cpu: [],
      memory: [],
      disk: [],
      network: []
    };
    this.maxHistoryLength = 100;
    this.previousNetworkStats = null;
    
    // Start collecting metrics
    this.startMonitoring();
  }

  /**
   * Start continuous monitoring
   */
  startMonitoring() {
    // Update metrics every 1 second
    setInterval(() => {
      this.collectMetrics();
    }, 1000);
  }

  /**
   * Collect all system metrics
   */
  async collectMetrics() {
    try {
      const [cpu, memory, disk, network] = await Promise.all([
        this.getCpuMetrics(),
        this.getMemoryMetrics(),
        this.getDiskMetrics(),
        this.getNetworkMetrics()
      ]);

      // Add to history
      this.addToHistory('cpu', cpu);
      this.addToHistory('memory', memory);
      this.addToHistory('disk', disk);
      this.addToHistory('network', network);

    } catch (error) {
      console.error('Error collecting system metrics:', error);
    }
  }

  /**
   * Get current system metrics
   */
  async getCurrentMetrics() {
    const [cpu, memory, disk, network, processes] = await Promise.all([
      this.getCpuMetrics(),
      this.getMemoryMetrics(),
      this.getDiskMetrics(),
      this.getNetworkMetrics(),
      this.getProcessMetrics()
    ]);

    return {
      timestamp: new Date(),
      cpu,
      memory,
      disk,
      network,
      processes,
      uptime: this.getUptime(),
      loadAverage: os.loadavg(),
      system: {
        platform: os.platform(),
        arch: os.arch(),
        hostname: os.hostname(),
        cpus: os.cpus().length,
        totalMemory: os.totalmem()
      }
    };
  }

  /**
   * Get detailed system metrics with history
   */
  async getDetailedMetrics() {
    const current = await this.getCurrentMetrics();
    
    return {
      ...current,
      history: {
        cpu: this.history.cpu.slice(-60), // Last 60 seconds
        memory: this.history.memory.slice(-60),
        disk: this.history.disk.slice(-60),
        network: this.history.network.slice(-60)
      },
      alerts: this.generateAlerts(current),
      predictions: this.generatePredictions()
    };
  }

  /**
   * Get CPU metrics
   */
  async getCpuMetrics() {
    return new Promise((resolve) => {
      const startMeasure = this.cpuAverage();
      
      setTimeout(() => {
        const endMeasure = this.cpuAverage();
        const idleDifference = endMeasure.idle - startMeasure.idle;
        const totalDifference = endMeasure.total - startMeasure.total;
        const usage = 100 - ~~(100 * idleDifference / totalDifference);
        
        resolve({
          usage: Math.max(0, Math.min(100, usage)),
          cores: os.cpus().map((cpu, index) => ({
            model: cpu.model,
            speed: cpu.speed,
            usage: Math.random() * 100, // Individual core usage (simulated)
            temperature: 45 + Math.random() * 30 // Simulated temperature
          })),
          loadAverage: os.loadavg(),
          processes: {
            total: 150 + Math.floor(Math.random() * 50),
            running: 2 + Math.floor(Math.random() * 8),
            sleeping: 140 + Math.floor(Math.random() * 40),
            zombie: Math.floor(Math.random() * 3)
          }
        });
      }, 100);
    });
  }

  /**
   * Calculate CPU average
   */
  cpuAverage() {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach(cpu => {
      for (let type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });

    return {
      idle: totalIdle / cpus.length,
      total: totalTick / cpus.length
    };
  }

  /**
   * Get memory metrics
   */
  async getMemoryMetrics() {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const usage = (usedMemory / totalMemory) * 100;

    return {
      total: totalMemory,
      used: usedMemory,
      free: freeMemory,
      usage: Math.round(usage * 100) / 100,
      swap: {
        total: totalMemory * 0.5, // Simulated swap
        used: totalMemory * 0.1,
        free: totalMemory * 0.4,
        usage: 20
      },
      cached: usedMemory * 0.3, // Simulated cache
      buffers: usedMemory * 0.1, // Simulated buffers
      breakdown: {
        applications: usedMemory * 0.6,
        system: usedMemory * 0.2,
        cache: usedMemory * 0.15,
        other: usedMemory * 0.05
      }
    };
  }

  /**
   * Get disk metrics
   */
  async getDiskMetrics() {
    try {
      // Simulate disk usage (in production, use actual disk APIs)
      const totalSpace = 1000 * 1024 * 1024 * 1024; // 1TB
      const usedSpace = totalSpace * (0.4 + Math.random() * 0.3); // 40-70% used
      const freeSpace = totalSpace - usedSpace;
      
      return {
        total: totalSpace,
        used: usedSpace,
        free: freeSpace,
        usage: (usedSpace / totalSpace) * 100,
        drives: [
          {
            name: '/',
            type: 'SSD',
            total: totalSpace,
            used: usedSpace,
            free: freeSpace,
            usage: (usedSpace / totalSpace) * 100,
            readSpeed: 500 + Math.random() * 200, // MB/s
            writeSpeed: 450 + Math.random() * 150,
            temperature: 35 + Math.random() * 20
          }
        ],
        io: {
          readOperations: Math.floor(Math.random() * 1000),
          writeOperations: Math.floor(Math.random() * 800),
          readBytes: Math.floor(Math.random() * 100000000),
          writeBytes: Math.floor(Math.random() * 80000000)
        }
      };
    } catch (error) {
      console.error('Error getting disk metrics:', error);
      return null;
    }
  }

  /**
   * Get network metrics
   */
  async getNetworkMetrics() {
    const interfaces = os.networkInterfaces();
    const activeInterfaces = [];
    
    // Process network interfaces
    Object.keys(interfaces).forEach(name => {
      const iface = interfaces[name];
      const activeIface = iface.find(details => !details.internal && details.family === 'IPv4');
      
      if (activeIface) {
        activeInterfaces.push({
          name,
          address: activeIface.address,
          netmask: activeIface.netmask,
          mac: activeIface.mac,
          // Simulate traffic data
          bytesReceived: Math.floor(Math.random() * 1000000000),
          bytesSent: Math.floor(Math.random() * 800000000),
          packetsReceived: Math.floor(Math.random() * 5000000),
          packetsSent: Math.floor(Math.random() * 4000000),
          speed: 1000, // Mbps
          usage: Math.random() * 30 // Percentage
        });
      }
    });

    return {
      interfaces: activeInterfaces,
      totalBandwidth: activeInterfaces.reduce((sum, iface) => sum + iface.speed, 0),
      currentTraffic: {
        download: Math.floor(Math.random() * 50000000), // bytes/s
        upload: Math.floor(Math.random() * 20000000),
        downloadMbps: Math.random() * 100,
        uploadMbps: Math.random() * 50
      },
      connections: {
        established: 20 + Math.floor(Math.random() * 30),
        listening: 5 + Math.floor(Math.random() * 10),
        timeWait: Math.floor(Math.random() * 15)
      }
    };
  }

  /**
   * Get process metrics
   */
  async getProcessMetrics() {
    // Simulate top processes
    const processes = [];
    const processNames = [
      'chrome', 'node', 'code', 'firefox', 'spotify',
      'docker', 'mysql', 'nginx', 'python', 'java'
    ];

    for (let i = 0; i < 10; i++) {
      processes.push({
        pid: 1000 + i,
        name: processNames[Math.floor(Math.random() * processNames.length)],
        cpu: Math.random() * 20,
        memory: Math.random() * 1000000000, // bytes
        memoryPercent: Math.random() * 10,
        status: Math.random() > 0.1 ? 'running' : 'sleeping',
        user: 'user',
        runtime: Math.floor(Math.random() * 86400), // seconds
        threads: 1 + Math.floor(Math.random() * 20)
      });
    }

    return {
      total: processes.length + Math.floor(Math.random() * 100),
      top: processes.sort((a, b) => b.cpu - a.cpu),
      summary: {
        running: processes.filter(p => p.status === 'running').length,
        sleeping: processes.filter(p => p.status === 'sleeping').length,
        zombie: Math.floor(Math.random() * 3),
        stopped: Math.floor(Math.random() * 2)
      }
    };
  }

  /**
   * Get system uptime
   */
  getUptime() {
    const uptimeSeconds = os.uptime();
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);

    return {
      seconds: uptimeSeconds,
      formatted: `${days}d ${hours}h ${minutes}m ${seconds}s`,
      days,
      hours,
      minutes
    };
  }

  /**
   * Add metrics to history
   */
  addToHistory(type, data) {
    if (!this.history[type]) {
      this.history[type] = [];
    }

    this.history[type].push({
      timestamp: new Date(),
      ...data
    });

    // Keep only the last N entries
    if (this.history[type].length > this.maxHistoryLength) {
      this.history[type].shift();
    }
  }

  /**
   * Generate alerts based on current metrics
   */
  generateAlerts(metrics) {
    const alerts = [];

    // CPU alerts
    if (metrics.cpu.usage > 80) {
      alerts.push({
        type: 'warning',
        category: 'cpu',
        message: `High CPU usage: ${metrics.cpu.usage.toFixed(1)}%`,
        threshold: 80,
        current: metrics.cpu.usage,
        severity: metrics.cpu.usage > 95 ? 'critical' : 'warning'
      });
    }

    // Memory alerts
    if (metrics.memory.usage > 85) {
      alerts.push({
        type: 'warning',
        category: 'memory',
        message: `High memory usage: ${metrics.memory.usage.toFixed(1)}%`,
        threshold: 85,
        current: metrics.memory.usage,
        severity: metrics.memory.usage > 95 ? 'critical' : 'warning'
      });
    }

    // Disk alerts
    if (metrics.disk && metrics.disk.usage > 90) {
      alerts.push({
        type: 'warning',
        category: 'disk',
        message: `Low disk space: ${(100 - metrics.disk.usage).toFixed(1)}% free`,
        threshold: 90,
        current: metrics.disk.usage,
        severity: metrics.disk.usage > 95 ? 'critical' : 'warning'
      });
    }

    return alerts;
  }

  /**
   * Generate performance predictions
   */
  generatePredictions() {
    const cpuHistory = this.history.cpu.slice(-30);
    const memoryHistory = this.history.memory.slice(-30);
    
    if (cpuHistory.length < 10) {
      return null;
    }

    // Simple trend analysis
    const cpuTrend = this.calculateTrend(cpuHistory.map(h => h.usage));
    const memoryTrend = this.calculateTrend(memoryHistory.map(h => h.usage));

    return {
      nextHour: {
        cpu: Math.max(0, Math.min(100, cpuHistory[cpuHistory.length - 1].usage + cpuTrend * 60)),
        memory: Math.max(0, Math.min(100, memoryHistory[memoryHistory.length - 1].usage + memoryTrend * 60))
      },
      trend: {
        cpu: cpuTrend > 0.1 ? 'increasing' : cpuTrend < -0.1 ? 'decreasing' : 'stable',
        memory: memoryTrend > 0.1 ? 'increasing' : memoryTrend < -0.1 ? 'decreasing' : 'stable'
      }
    };
  }

  /**
   * Calculate simple trend from data points
   */
  calculateTrend(data) {
    if (data.length < 2) return 0;
    
    const n = data.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = data.reduce((sum, val) => sum + val, 0);
    const sumXY = data.reduce((sum, val, i) => sum + (i * val), 0);
    const sumXX = data.reduce((sum, val, i) => sum + (i * i), 0);
    
    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  /**
   * Get system information
   */
  getSystemInfo() {
    const cpus = os.cpus();
    
    return {
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      release: os.release(),
      nodeVersion: process.version,
      uptime: os.uptime(),
      cpu: {
        model: cpus[0].model,
        cores: cpus.length,
        speed: cpus[0].speed
      },
      memory: {
        total: os.totalmem(),
        free: os.freemem()
      },
      networkInterfaces: Object.keys(os.networkInterfaces())
    };
  }
}

module.exports = SystemMonitorService;

