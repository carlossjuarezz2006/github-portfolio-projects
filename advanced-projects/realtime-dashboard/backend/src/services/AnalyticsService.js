/**
 * Analytics Service
 * 
 * Provides business analytics and metrics including:
 * - User activity and engagement
 * - Sales and revenue data
 * - Traffic and conversion metrics
 * - Geographic distribution
 * - Real-time events tracking
 * - Growth and trend analysis
 */

const faker = require('faker');
const moment = require('moment');

class AnalyticsService {
  constructor() {
    this.data = {
      users: this.initializeUserData(),
      sales: this.initializeSalesData(),
      traffic: this.initializeTrafficData(),
      events: [],
      geographic: this.initializeGeographicData()
    };
    
    this.startDataGeneration();
  }

  /**
   * Start continuous data generation
   */
  startDataGeneration() {
    // Generate new events every 3 seconds
    setInterval(() => {
      this.generateRealtimeEvent();
    }, 3000);

    // Update metrics every 10 seconds
    setInterval(() => {
      this.updateMetrics();
    }, 10000);
  }

  /**
   * Initialize user data
   */
  initializeUserData() {
    return {
      total: 125847,
      active: 12584,
      online: 1247,
      new: 157,
      returning: 11437,
      growth: {
        daily: 2.3,
        weekly: 8.7,
        monthly: 23.4
      },
      demographics: {
        ageGroups: {
          '18-24': 25.3,
          '25-34': 34.7,
          '35-44': 22.1,
          '45-54': 12.8,
          '55+': 5.1
        },
        gender: {
          male: 52.3,
          female: 45.8,
          other: 1.9
        }
      },
      sessions: {
        averageDuration: 8.5, // minutes
        bounceRate: 32.4,
        pagesPerSession: 4.2
      }
    };
  }

  /**
   * Initialize sales data
   */
  initializeSalesData() {
    return {
      today: {
        revenue: 45678.90,
        orders: 234,
        averageOrderValue: 195.23,
        conversionRate: 3.4
      },
      thisMonth: {
        revenue: 892345.67,
        orders: 4567,
        target: 1000000,
        growth: 15.6
      },
      products: this.generateTopProducts(),
      recentOrders: this.generateRecentOrders(),
      hourlyRevenue: this.generateHourlyRevenue()
    };
  }

  /**
   * Initialize traffic data
   */
  initializeTrafficData() {
    return {
      pageViews: 89234,
      uniqueVisitors: 34567,
      sources: {
        direct: 34.2,
        organic: 28.5,
        social: 15.7,
        referral: 12.3,
        email: 6.8,
        paid: 2.5
      },
      devices: {
        desktop: 52.3,
        mobile: 39.7,
        tablet: 8.0
      },
      browsers: {
        chrome: 65.4,
        firefox: 15.2,
        safari: 12.8,
        edge: 4.3,
        other: 2.3
      },
      topPages: this.generateTopPages()
    };
  }

  /**
   * Initialize geographic data
   */
  initializeGeographicData() {
    return {
      countries: [
        { name: 'United States', users: 15678, revenue: 234567, code: 'US' },
        { name: 'United Kingdom', users: 8934, revenue: 145678, code: 'GB' },
        { name: 'Germany', users: 7234, revenue: 123456, code: 'DE' },
        { name: 'France', users: 6123, revenue: 98765, code: 'FR' },
        { name: 'Canada', users: 5678, revenue: 87654, code: 'CA' },
        { name: 'Australia', users: 4567, revenue: 76543, code: 'AU' },
        { name: 'Japan', users: 3456, revenue: 65432, code: 'JP' },
        { name: 'Spain', users: 3234, revenue: 54321, code: 'ES' },
        { name: 'Italy', users: 2890, revenue: 43210, code: 'IT' },
        { name: 'Netherlands', users: 2567, revenue: 32109, code: 'NL' }
      ],
      cities: [
        { name: 'New York', users: 3456, country: 'US' },
        { name: 'London', users: 2890, country: 'GB' },
        { name: 'San Francisco', users: 2567, country: 'US' },
        { name: 'Berlin', users: 2234, country: 'DE' },
        { name: 'Paris', users: 1890, country: 'FR' }
      ]
    };
  }

  /**
   * Generate top products
   */
  generateTopProducts() {
    return Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      name: faker.commerce.productName(),
      sales: Math.floor(Math.random() * 500) + 100,
      revenue: (Math.random() * 10000 + 1000).toFixed(2),
      growth: (Math.random() * 40 - 20).toFixed(1) // -20% to +20%
    }));
  }

  /**
   * Generate recent orders
   */
  generateRecentOrders() {
    return Array.from({ length: 15 }, () => ({
      id: faker.random.alphaNumeric(8).toUpperCase(),
      customer: faker.name.findName(),
      amount: (Math.random() * 500 + 50).toFixed(2),
      status: faker.random.arrayElement(['pending', 'processing', 'shipped', 'delivered']),
      timestamp: faker.date.recent(),
      items: Math.floor(Math.random() * 5) + 1
    }));
  }

  /**
   * Generate hourly revenue data
   */
  generateHourlyRevenue() {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push({
        hour: i,
        revenue: Math.random() * 5000 + 1000,
        orders: Math.floor(Math.random() * 50) + 10,
        visitors: Math.floor(Math.random() * 500) + 100
      });
    }
    return hours;
  }

  /**
   * Generate top pages
   */
  generateTopPages() {
    const pages = [
      '/home', '/products', '/about', '/contact', '/blog',
      '/pricing', '/features', '/support', '/login', '/dashboard'
    ];
    
    return pages.map(page => ({
      path: page,
      views: Math.floor(Math.random() * 10000) + 1000,
      uniqueViews: Math.floor(Math.random() * 5000) + 500,
      bounceRate: (Math.random() * 50 + 20).toFixed(1),
      avgTimeOnPage: (Math.random() * 300 + 60).toFixed(0) // seconds
    }));
  }

  /**
   * Generate a real-time event
   */
  generateRealtimeEvent() {
    const eventTypes = [
      'user_signup', 'user_login', 'purchase', 'page_view',
      'download', 'subscription', 'support_ticket', 'review'
    ];

    const event = {
      id: faker.random.uuid(),
      type: faker.random.arrayElement(eventTypes),
      user: {
        id: faker.random.uuid(),
        name: faker.name.findName(),
        location: faker.address.city() + ', ' + faker.address.countryCode()
      },
      data: this.generateEventData(faker.random.arrayElement(eventTypes)),
      timestamp: new Date()
    };

    this.data.events.unshift(event);
    
    // Keep only the last 100 events
    if (this.data.events.length > 100) {
      this.data.events = this.data.events.slice(0, 100);
    }

    return event;
  }

  /**
   * Generate event-specific data
   */
  generateEventData(eventType) {
    switch (eventType) {
      case 'purchase':
        return {
          amount: (Math.random() * 500 + 50).toFixed(2),
          items: Math.floor(Math.random() * 5) + 1,
          category: faker.commerce.department()
        };
      case 'page_view':
        return {
          page: faker.random.arrayElement(['/home', '/products', '/about', '/blog']),
          referrer: faker.internet.url(),
          device: faker.random.arrayElement(['desktop', 'mobile', 'tablet'])
        };
      case 'user_signup':
        return {
          source: faker.random.arrayElement(['organic', 'social', 'referral', 'direct']),
          plan: faker.random.arrayElement(['free', 'basic', 'premium'])
        };
      default:
        return {
          value: Math.random() * 100,
          category: faker.random.word()
        };
    }
  }

  /**
   * Update metrics with simulated changes
   */
  updateMetrics() {
    // Update user counts
    this.data.users.active += Math.floor(Math.random() * 20 - 10);
    this.data.users.online += Math.floor(Math.random() * 10 - 5);
    this.data.users.new += Math.floor(Math.random() * 5);

    // Update sales
    const newOrder = (Math.random() * 300 + 50).toFixed(2);
    this.data.sales.today.revenue += parseFloat(newOrder);
    this.data.sales.today.orders += 1;

    // Update traffic
    this.data.traffic.pageViews += Math.floor(Math.random() * 50) + 10;
    this.data.traffic.uniqueVisitors += Math.floor(Math.random() * 20) + 5;

    // Ensure reasonable bounds
    this.data.users.active = Math.max(1000, Math.min(20000, this.data.users.active));
    this.data.users.online = Math.max(100, Math.min(2000, this.data.users.online));
  }

  /**
   * Get current analytics data
   */
  async getCurrentAnalytics() {
    return {
      timestamp: new Date(),
      users: this.data.users,
      sales: this.data.sales,
      traffic: this.data.traffic,
      recentEvents: this.data.events.slice(0, 10),
      kpis: this.calculateKPIs(),
      trends: this.calculateTrends()
    };
  }

  /**
   * Get analytics dashboard data
   */
  async getAnalyticsData() {
    return {
      overview: await this.getOverviewMetrics(),
      users: await this.getUsersData(),
      sales: await this.getSalesData(),
      traffic: this.data.traffic,
      geographic: this.data.geographic,
      realtime: {
        events: this.data.events.slice(0, 20),
        activeUsers: this.data.users.online,
        currentRevenue: this.data.sales.today.revenue
      }
    };
  }

  /**
   * Get overview metrics
   */
  async getOverviewMetrics() {
    return {
      totalUsers: this.data.users.total,
      activeUsers: this.data.users.active,
      todayRevenue: this.data.sales.today.revenue,
      monthlyRevenue: this.data.sales.thisMonth.revenue,
      conversionRate: this.data.sales.today.conversionRate,
      bounceRate: this.data.users.sessions.bounceRate,
      pageViews: this.data.traffic.pageViews,
      averageOrderValue: this.data.sales.today.averageOrderValue
    };
  }

  /**
   * Get users data
   */
  async getUsersData() {
    return {
      summary: this.data.users,
      demographics: this.data.users.demographics,
      growth: this.generateUserGrowthData(),
      retention: this.generateRetentionData(),
      cohorts: this.generateCohortData()
    };
  }

  /**
   * Get sales data
   */
  async getSalesData() {
    return {
      summary: this.data.sales,
      trends: this.generateSalesTrends(),
      products: this.data.sales.products,
      orders: this.data.sales.recentOrders,
      forecasting: this.generateSalesForecasting()
    };
  }

  /**
   * Calculate KPIs
   */
  calculateKPIs() {
    return {
      customerLifetimeValue: 1250.75,
      customerAcquisitionCost: 45.50,
      monthlyRecurringRevenue: 89234.56,
      churnRate: 3.2,
      netPromoterScore: 67,
      customerSatisfaction: 4.3
    };
  }

  /**
   * Calculate trends
   */
  calculateTrends() {
    return {
      users: {
        direction: 'up',
        percentage: 12.5,
        period: 'week'
      },
      revenue: {
        direction: 'up',
        percentage: 8.7,
        period: 'month'
      },
      conversion: {
        direction: 'down',
        percentage: 2.1,
        period: 'week'
      }
    };
  }

  /**
   * Generate user growth data
   */
  generateUserGrowthData() {
    const days = [];
    const startDate = moment().subtract(30, 'days');
    
    for (let i = 0; i < 30; i++) {
      days.push({
        date: startDate.clone().add(i, 'days').format('YYYY-MM-DD'),
        newUsers: Math.floor(Math.random() * 200) + 100,
        activeUsers: Math.floor(Math.random() * 15000) + 10000,
        returningUsers: Math.floor(Math.random() * 8000) + 5000
      });
    }
    
    return days;
  }

  /**
   * Generate retention data
   */
  generateRetentionData() {
    const periods = ['Day 1', 'Day 7', 'Day 14', 'Day 30', 'Day 60', 'Day 90'];
    
    return periods.map((period, index) => ({
      period,
      rate: Math.max(10, 95 - (index * 15) + Math.random() * 10)
    }));
  }

  /**
   * Generate cohort data
   */
  generateCohortData() {
    const cohorts = [];
    const startDate = moment().subtract(12, 'months');
    
    for (let i = 0; i < 12; i++) {
      const cohortDate = startDate.clone().add(i, 'months');
      const retention = [];
      
      for (let j = 0; j < 12 - i; j++) {
        retention.push({
          period: j,
          rate: Math.max(5, 100 - (j * 10) + Math.random() * 15)
        });
      }
      
      cohorts.push({
        cohort: cohortDate.format('YYYY-MM'),
        size: Math.floor(Math.random() * 1000) + 500,
        retention
      });
    }
    
    return cohorts;
  }

  /**
   * Generate sales trends
   */
  generateSalesTrends() {
    const days = [];
    const startDate = moment().subtract(30, 'days');
    
    for (let i = 0; i < 30; i++) {
      days.push({
        date: startDate.clone().add(i, 'days').format('YYYY-MM-DD'),
        revenue: Math.floor(Math.random() * 50000) + 20000,
        orders: Math.floor(Math.random() * 200) + 100,
        averageOrderValue: Math.floor(Math.random() * 100) + 150
      });
    }
    
    return days;
  }

  /**
   * Generate sales forecasting
   */
  generateSalesForecasting() {
    const forecast = [];
    const startDate = moment().add(1, 'day');
    
    for (let i = 0; i < 30; i++) {
      forecast.push({
        date: startDate.clone().add(i, 'days').format('YYYY-MM-DD'),
        predictedRevenue: Math.floor(Math.random() * 60000) + 25000,
        confidence: Math.random() * 20 + 70, // 70-90% confidence
        lowerBound: Math.floor(Math.random() * 40000) + 15000,
        upperBound: Math.floor(Math.random() * 80000) + 35000
      });
    }
    
    return forecast;
  }

  /**
   * Get real-time statistics
   */
  getRealtimeStats() {
    return {
      onlineUsers: this.data.users.online,
      activeUsers: this.data.users.active,
      pageViews: this.data.traffic.pageViews,
      currentRevenue: this.data.sales.today.revenue,
      conversionRate: this.data.sales.today.conversionRate,
      recentEvents: this.data.events.slice(0, 5)
    };
  }
}

module.exports = AnalyticsService;

