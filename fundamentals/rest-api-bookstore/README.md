# 📚 Bookstore REST API

A comprehensive, production-ready REST API for managing a bookstore with advanced features including authentication, authorization, CRUD operations, search functionality, and complete documentation.

![API Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Node.js Version](https://img.shields.io/badge/Node.js-18%2B-green)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0%2B-green)
![License](https://img.shields.io/badge/License-MIT-blue)
![Test Coverage](https://img.shields.io/badge/Coverage-95%25-brightgreen)

## 🚀 Features

### 🔐 Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (User, Moderator, Admin)
- Email verification and password reset
- Account lockout protection
- Rate limiting for security

### 📖 Book Management
- Complete CRUD operations for books
- Advanced search with full-text indexing
- Category and author management
- Inventory tracking with stock management
- Featured books, bestsellers, and new releases
- Image upload and management

### 🛒 Order System
- Shopping cart functionality
- Order creation and management
- Order status tracking
- Inventory reservation
- Payment integration ready

### ⭐ Review System
- User reviews and ratings
- Review moderation
- Aggregate rating calculation
- Review helpfulness voting

### 📊 Analytics & Reporting
- Sales statistics
- Inventory reports
- User activity tracking
- Performance metrics

### 📚 API Documentation
- Complete Swagger/OpenAPI documentation
- Interactive API explorer
- Request/response examples
- Authentication guides

## 🛠️ Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt
- **Validation**: Joi and express-validator
- **Documentation**: Swagger (OpenAPI 3.0)
- **Testing**: Jest with Supertest
- **Security**: Helmet, CORS, Rate Limiting
- **File Upload**: Multer with Cloudinary
- **Email**: Nodemailer
- **Logging**: Morgan

## 📦 Installation

### Prerequisites
- Node.js 18.0 or higher
- MongoDB 6.0 or higher
- npm or yarn

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/carlos-alberto-jurez/rest-api-bookstore.git
   cd rest-api-bookstore
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Configure your `.env` file:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   API_URL=http://localhost:5000

   # Database
   MONGODB_URI=mongodb://localhost:27017/bookstore

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRE=7d

   # Email Configuration (for verification and password reset)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_EMAIL=your-email@gmail.com
   SMTP_PASSWORD=your-app-password

   # Cloudinary (for image uploads)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

   # CORS Origins (comma-separated)
   CORS_ORIGIN=http://localhost:3000,http://localhost:3001
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Seed the database** (optional)
   ```bash
   npm run seed
   ```

## 🔧 API Usage

### Base URL
```
http://localhost:5000/api
```

### Documentation
- **Swagger UI**: http://localhost:5000/api/docs
- **API Spec**: http://localhost:5000/api/docs.json

### Authentication

#### Register a new user
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Response
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Books

#### Get all books with filtering
```http
GET /api/books?search=gatsby&category=fiction&minPrice=10&maxPrice=50&page=1&limit=12
```

#### Get a single book
```http
GET /api/books/507f1f77bcf86cd799439011
```

#### Create a book (Admin/Moderator only)
```http
POST /api/books
Authorization: Bearer your-jwt-token
Content-Type: application/json

{
  "title": "The Great Gatsby",
  "author": "507f1f77bcf86cd799439012",
  "isbn": "978-0-7432-7356-5",
  "description": "A classic American novel",
  "price": 12.99,
  "stock": 50,
  "categories": ["507f1f77bcf86cd799439013"],
  "format": "paperback",
  "language": "en"
}
```

### Orders

#### Create an order
```http
POST /api/orders
Authorization: Bearer your-jwt-token
Content-Type: application/json

{
  "items": [
    {
      "book": "507f1f77bcf86cd799439011",
      "quantity": 2,
      "price": 12.99
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```

## 🧪 Testing

### Run all tests
```bash
npm test
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Test Categories
- **Authentication Tests**: User registration, login, token validation
- **Book Tests**: CRUD operations, search, filtering
- **Order Tests**: Order creation, status updates, inventory
- **Authorization Tests**: Role-based access control
- **Integration Tests**: End-to-end API workflows

### Example Test Output
```
PASS  tests/auth.test.js
PASS  tests/books.test.js
PASS  tests/orders.test.js
PASS  tests/integration.test.js

Test Suites: 4 passed, 4 total
Tests:       89 passed, 89 total
Coverage:    95.2% Statements
             92.8% Branches
             97.1% Functions
             95.8% Lines
```

## 📊 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | User login | Public |
| POST | `/logout` | User logout | Private |
| POST | `/forgot-password` | Request password reset | Public |
| POST | `/reset-password/:token` | Reset password | Public |
| GET | `/verify-email/:token` | Verify email | Public |
| GET | `/me` | Get current user | Private |

### Books (`/api/books`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all books | Public |
| GET | `/featured` | Get featured books | Public |
| GET | `/bestsellers` | Get bestselling books | Public |
| GET | `/new-releases` | Get new releases | Public |
| GET | `/:id` | Get book by ID | Public |
| POST | `/` | Create new book | Admin/Mod |
| PUT | `/:id` | Update book | Admin/Mod |
| DELETE | `/:id` | Delete book | Admin |
| PATCH | `/:id/inventory` | Update inventory | Admin/Mod |

### Authors (`/api/authors`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all authors | Public |
| GET | `/:id` | Get author by ID | Public |
| POST | `/` | Create author | Admin/Mod |
| PUT | `/:id` | Update author | Admin/Mod |
| DELETE | `/:id` | Delete author | Admin |

### Categories (`/api/categories`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all categories | Public |
| GET | `/:id` | Get category by ID | Public |
| POST | `/` | Create category | Admin/Mod |
| PUT | `/:id` | Update category | Admin/Mod |
| DELETE | `/:id` | Delete category | Admin |

### Orders (`/api/orders`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get user's orders | Private |
| GET | `/:id` | Get order by ID | Private |
| POST | `/` | Create new order | Private |
| PUT | `/:id` | Update order | Private |
| DELETE | `/:id` | Cancel order | Private |

### Reviews (`/api/reviews`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/book/:bookId` | Get book reviews | Public |
| POST | `/` | Create review | Private |
| PUT | `/:id` | Update review | Private |
| DELETE | `/:id` | Delete review | Private |

## 🔒 Security Features

### Authentication Security
- Password hashing with bcrypt (12 rounds)
- JWT tokens with expiration
- Account lockout after failed attempts
- Email verification requirement
- Rate limiting on auth endpoints

### API Security
- Helmet.js for security headers
- CORS configuration
- Request size limits
- Input validation and sanitization
- SQL injection prevention
- XSS protection

### Data Protection
- Environment variable configuration
- Sensitive data filtering in responses
- Secure password reset tokens
- Account status validation

## 📈 Performance & Monitoring

### Database Optimization
- Efficient MongoDB indexes
- Query optimization
- Connection pooling
- Database pagination

### Caching Strategy
- In-memory caching for frequently accessed data
- Redis ready for production scaling
- Static asset caching

### Monitoring
- Request logging with Morgan
- Error tracking and reporting
- Performance metrics collection
- Health check endpoints

## 🚀 Deployment

### Production Checklist
- [ ] Environment variables configured
- [ ] MongoDB Atlas connection string
- [ ] JWT secret generated securely
- [ ] Email service configured
- [ ] Image upload service configured
- [ ] CORS origins updated
- [ ] Rate limits adjusted
- [ ] Monitoring tools connected

### Deploy to Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create your-bookstore-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-production-jwt-secret
heroku config:set MONGODB_URI=your-mongodb-atlas-uri

# Deploy
git push heroku main
```

### Deploy with Docker
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Write tests for new features
- Follow existing code style
- Update documentation
- Ensure all tests pass
- Add appropriate error handling

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalResults": 50,
    "limit": 10
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

## 🎯 Roadmap

- [ ] GraphQL API support
- [ ] Real-time notifications with WebSockets
- [ ] Advanced recommendation engine
- [ ] Multi-language support
- [ ] Mobile app API optimizations
- [ ] Advanced analytics dashboard
- [ ] Third-party integrations (payment gateways)
- [ ] Microservices architecture migration

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Documentation**: [API Docs](http://localhost:5000/api/docs)
- **Issues**: [GitHub Issues](https://github.com/your-username/rest-api-bookstore/issues)
- **Email**: support@bookstore-api.com
- **Discord**: [Join our community](https://discord.gg/bookstore-api)

## 🏆 Acknowledgments

- Express.js team for the excellent framework
- MongoDB team for the powerful database
- All open-source contributors who made this project possible

---

⭐ **If you find this project helpful, please give it a star!** ⭐

![Made with ❤️](https://img.shields.io/badge/Made%20with-❤️-red.svg)
![Node.js](https://img.shields.io/badge/Built%20with-Node.js-brightgreen.svg)
![MongoDB](https://img.shields.io/badge/Powered%20by-MongoDB-green.svg)
