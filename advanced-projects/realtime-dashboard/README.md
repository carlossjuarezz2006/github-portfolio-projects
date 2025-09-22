# 🔥 Real-time Dashboard with WebSockets

A comprehensive real-time dashboard application built with **WebSockets**, **React**, **Node.js**, and **Socket.IO**. Features live data visualization, system monitoring, business analytics, and responsive design with stunning animations.

![Dashboard Preview](https://via.placeholder.com/800x400/667eea/ffffff?text=Real-time+Dashboard+Preview)

## 🚀 Features

### 📊 **Real-time Data Streaming**
- **WebSocket** connections with Socket.IO for instant updates
- Live system metrics (CPU, Memory, Disk, Network)
- Business analytics with real-time events
- Auto-reconnection with exponential backoff
- Connection status monitoring with latency tracking

### 📈 **Interactive Visualizations** 
- Dynamic charts with **Recharts** and **Chart.js**
- Real-time updating line, area, bar, and pie charts
- Smooth animations with **Framer Motion**
- Responsive design for all screen sizes
- Dark/Light theme support

### 🎛️ **Multiple Dashboard Views**
- **Overview**: Key metrics and system health
- **Analytics**: Business metrics and user data  
- **System Monitoring**: Detailed hardware stats
- **Sales Dashboard**: Revenue and order tracking
- **Users Dashboard**: User analytics and demographics
- **Real-time Events**: Live activity feed

### ⚡ **Advanced Features**
- Room-based dashboard subscriptions
- Custom alert configuration and notifications
- Global state management with **Zustand**
- Performance monitoring and optimization
- Error boundaries and graceful error handling
- Progressive Web App (PWA) capabilities

### 🔧 **Technical Excellence**
- **TypeScript-ready** architecture
- Comprehensive error handling
- Memory leak prevention
- Optimized re-rendering with React.memo
- Lazy loading and code splitting
- Production-ready with Docker support

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **Socket.IO** for WebSocket communication  
- **Redis** for session management (optional)
- System monitoring with native APIs
- Data simulation services
- Health check endpoints

### Frontend  
- **React 18** with Hooks and Context
- **Material-UI (MUI)** for components
- **Socket.IO Client** for real-time communication
- **Recharts** for data visualization
- **Framer Motion** for animations
- **Zustand** for state management
- **React Router** for navigation

### DevOps & Tools
- **Docker** and Docker Compose
- **ESLint** and **Prettier** 
- **Jest** for testing
- **GitHub Actions** for CI/CD
- Performance monitoring tools

## 📦 Quick Start

### Prerequisites
- Node.js 18.0 or higher
- npm or yarn
- Redis (optional, for production)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/carlos-alberto-jurez/realtime-dashboard.git
   cd realtime-dashboard
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Create environment file
   cp .env.example .env
   
   # Start development server
   npm run dev
   ```

3. **Frontend Setup** 
   ```bash
   cd frontend
   npm install
   
   # Start development server
   npm start
   ```

4. **Access the Dashboard**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001
   - Health Check: http://localhost:5001/health

### Environment Variables

**Backend (.env)**
```env
PORT=5001
NODE_ENV=development
REDIS_URL=redis://localhost:6379
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env)**
```env
REACT_APP_SOCKET_URL=http://localhost:5001
REACT_APP_API_URL=http://localhost:5001/api
```

## 🐳 Docker Deployment

### Development with Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs  
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Deployment
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 Dashboard Features

### System Monitoring
- **CPU Usage**: Real-time CPU utilization per core
- **Memory**: RAM usage, swap, cached memory
- **Disk I/O**: Storage usage and read/write operations  
- **Network**: Traffic monitoring and connection stats
- **Processes**: Top processes by CPU/memory usage
- **Uptime**: System uptime and load averages

### Business Analytics
- **User Metrics**: Active users, new registrations, demographics
- **Sales Data**: Revenue, orders, conversion rates
- **Traffic Analytics**: Page views, bounce rate, traffic sources
- **Geographic Data**: User distribution by location
- **Real-time Events**: Live activity feed with user actions

### Alert System
- **Custom Thresholds**: Configure alerts for any metric
- **Real-time Notifications**: Instant alerts via WebSocket
- **Alert History**: Track and manage alert lifecycle
- **Multiple Channels**: In-app, email, and push notifications

## 🔄 Real-time Architecture

```
┌─────────────┐    WebSocket    ┌─────────────┐    System APIs    ┌─────────────┐
│             │◄──────────────► │             │◄────────────────► │             │
│   Frontend  │                 │   Backend   │                   │   System    │
│   (React)   │                 │  (Node.js)  │                   │  Monitor    │
│             │                 │             │                   │             │
└─────────────┘                 └─────────────┘                   └─────────────┘
       │                               │
       │                               ▼
       │                        ┌─────────────┐
       │                        │             │
       └───────────────────────►│    Redis    │
                                │  (Sessions) │
                                │             │
                                └─────────────┘
```

### Data Flow
1. **System Monitor** collects metrics every 1-2 seconds
2. **Backend** processes and broadcasts data via Socket.IO
3. **Frontend** receives updates and renders visualizations
4. **Store** manages state with automatic persistence
5. **UI** updates smoothly with optimized re-rendering

## 🎨 UI/UX Features

### Design System
- **Material Design 3** principles
- **Consistent spacing** and typography
- **Accessible colors** with high contrast ratios
- **Responsive breakpoints** for all devices

### Animations & Interactions
- **Smooth transitions** with Framer Motion
- **Loading states** and skeleton screens
- **Hover effects** and interactive elements
- **Progress indicators** for real-time metrics

### Performance Optimizations
- **Virtualized lists** for large datasets  
- **Memoized components** to prevent re-renders
- **Debounced updates** for smooth animations
- **Lazy loading** for dashboard sections

## 📱 Progressive Web App

The dashboard is PWA-ready with:
- **Offline support** with service workers
- **App-like experience** on mobile devices
- **Push notifications** for critical alerts
- **Background sync** for data persistence

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test              # Run all tests
npm run test:watch    # Watch mode  
npm run test:coverage # Coverage report
```

### Frontend Testing  
```bash
cd frontend
npm test              # Run tests
npm run test:coverage # Coverage report
```

### Integration Testing
```bash
# Test WebSocket connections
npm run test:integration

# Performance testing
npm run test:performance
```

## 📊 Performance Metrics

### Real-time Capabilities
- **Sub-second latency** for data updates
- **1000+ concurrent connections** supported
- **60 FPS** smooth animations
- **< 100ms** response times

### Resource Usage
- **Backend**: ~50MB RAM for basic setup
- **Frontend**: Optimized bundle size < 2MB
- **Network**: Efficient WebSocket protocol
- **Database**: Optional Redis for scaling

## 🔐 Security Features

- **CORS protection** with configurable origins
- **Rate limiting** to prevent abuse  
- **Input validation** and sanitization
- **Secure WebSocket** connections (WSS)
- **Environment variable** protection
- **Error handling** without data leaks

## 🚀 Production Deployment

### Cloud Platforms
- **Heroku**: Ready with Procfile
- **Vercel**: Frontend deployment
- **DigitalOcean**: Full-stack with Docker
- **AWS**: ECS/Fargate deployment
- **GCP**: Cloud Run deployment

### Monitoring & Observability
- **Health check endpoints** for load balancers
- **Metrics collection** with Prometheus
- **Error tracking** with Sentry
- **Performance monitoring** with APM tools
- **Log aggregation** with ELK stack

## 🔧 Customization

### Adding New Metrics
1. Create service in `backend/src/services/`
2. Add WebSocket events in server
3. Create dashboard component
4. Update store with new data structure

### Custom Dashboards
```javascript
// Add new dashboard type
const CustomDashboard = () => {
  const { joinDashboard } = useWebSocket();
  
  useEffect(() => {
    joinDashboard('custom');
  }, []);
  
  return (
    // Your custom dashboard UI
  );
};
```

### Theming
```javascript
// Customize theme in App.js  
const customTheme = createTheme({
  palette: {
    primary: { main: '#your-color' },
    secondary: { main: '#your-secondary' },
  }
});
```

## 📚 API Documentation

### WebSocket Events

#### Client → Server
- `authenticate` - Authenticate user
- `join_dashboard` - Join dashboard room
- `request_live_data` - Request specific data
- `setup_alert` - Configure alerts

#### Server → Client  
- `authenticated` - Authentication success
- `system_metrics_update` - System data
- `analytics_update` - Business metrics
- `new_notification` - Real-time alerts
- `alert_triggered` - Threshold alerts

### REST Endpoints
- `GET /health` - Health check
- `GET /api/metrics` - Current metrics
- `GET /api/analytics` - Analytics data
- `GET /api/connections` - Active connections

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`  
5. Open Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write tests for new features
- Update documentation
- Ensure mobile responsiveness

## 🆘 Troubleshooting

### Common Issues

**WebSocket Connection Failed**
```bash
# Check if backend is running
curl http://localhost:5001/health

# Check firewall settings
telnet localhost 5001
```

**High Memory Usage**
```javascript
// Enable production optimizations
NODE_ENV=production npm start
```

**Slow Performance**  
```javascript
// Enable React DevTools Profiler
npm install --save-dev @welldone-software/why-did-you-render
```

## 📈 Roadmap

- [ ] **Mobile Apps** with React Native
- [ ] **Advanced Analytics** with ML predictions
- [ ] **Multi-tenant** dashboard support
- [ ] **Plugin System** for custom widgets
- [ ] **Real-time Collaboration** features
- [ ] **Advanced Alerting** with PagerDuty integration
- [ ] **Data Export** capabilities (PDF, CSV)
- [ ] **A/B Testing** for dashboard layouts

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Acknowledgments

- **Socket.IO** team for excellent WebSocket library
- **Material-UI** for beautiful React components
- **Recharts** for powerful data visualization
- **Framer Motion** for smooth animations
- **React** team for the amazing framework

---

⭐ **If you find this dashboard useful, please give it a star!** ⭐

![Made with ❤️](https://img.shields.io/badge/Made%20with-❤️-red.svg)
![Author](https://img.shields.io/badge/Author-Carlos%20Alberto%20Jurez-blue.svg)
![WebSockets](https://img.shields.io/badge/WebSockets-Socket.IO-blue.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
