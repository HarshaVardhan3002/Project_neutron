# Project Neutron LMS - Complete Documentation

## Overview

Project Neutron is an AI-powered Learning Management System (LMS) built with Next.js frontend, Node.js/Express backend, Supabase for authentication and database, and Google Gemini AI for intelligent tutoring features.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Next.js)     │◄──►│  (Express.js)   │◄──►│   (Supabase)    │
│                 │    │                 │    │   PostgreSQL    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Components │    │   API Routes    │    │   Auth & RLS    │
│   Error Handling│    │   Middleware    │    │   File Storage  │
│   State Mgmt    │    │   AI Integration│    │   Real-time     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Project Structure

```
Project_Neutron/
├── Frontend/                 # Next.js React application
│   ├── src/
│   │   ├── app/             # Next.js 13+ app directory
│   │   ├── components/      # Reusable UI components
│   │   │   ├── ui/          # Base UI components
│   │   │   ├── admin/       # Admin-specific components
│   │   │   ├── ai/          # AI chat components
│   │   │   └── error/       # Error handling components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom React hooks
│   │   └── lib/             # Utility functions
│   ├── public/              # Static assets
│   └── package.json
├── Backend/                 # Express.js API server
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── lib/             # Utility functions
│   │   └── index.js         # Server entry point
│   ├── prisma/              # Database schema
│   ├── generated/           # Generated Prisma client
│   └── package.json
└── PROJECT_DOCUMENTATION.md # This file
```

## Features

### Core LMS Features

- **User Management**: Multi-role system (Student, Instructor, Admin, Super Admin)
- **Course Management**: Create, organize, and deliver courses with modules and lessons
- **Assessment System**: Multiple question types (MCQ, MSQ, Essay, Speaking, Listening)
- **Progress Tracking**: Real-time progress monitoring and analytics
- **File Management**: Support for various media types with cloud storage

### AI-Powered Features

- **AI Tutor**: Intelligent chat-based tutoring using Google Gemini
- **Test Analysis**: AI-powered performance analysis and feedback
- **Personalized Learning**: Adaptive content recommendations
- **Speaking Practice**: AI-assisted pronunciation and fluency training

### Admin Features

- **Theme Management**: Customizable UI themes and branding
- **Website Content**: Dynamic landing page content management
- **User Analytics**: Comprehensive user behavior and performance analytics
- **System Monitoring**: Health checks and system status monitoring

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Google Gemini API key (optional, for AI features)

### 1. Environment Configuration

Create `.env` files in both Frontend and Backend directories:

**Backend/.env:**

```env
# Database
DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[database]"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Authentication
JWT_SECRET="your-jwt-secret-key"

# AI Integration (Optional)
GEMINI_API_KEY="your-gemini-api-key"

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

**Frontend/.env.local:**

```env
# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
```

### 2. Database Setup

1. Create a new Supabase project
2. Run the SQL schema files in your Supabase SQL editor:
   - `supabase-schema_auth.sql` (if needed)
   - `supabase-schema_public.sql`
   - `supabase-additional-tables.sql`

### 3. Backend Setup

```bash
cd Backend
npm install
npx prisma generate
npm run dev
```

### 4. Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

### 5. Verify Installation

1. Backend health check: `http://localhost:3001/api/health`
2. Frontend: `http://localhost:3000`
3. Connection test: `http://localhost:3000/test-connection`

## API Documentation

### Authentication Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-profile` - Update user profile

### Course Management

- `GET /api/courses` - List all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create new course (Admin)
- `PUT /api/courses/:id` - Update course (Admin)
- `DELETE /api/courses/:id` - Delete course (Admin)
- `POST /api/courses/:id/enroll` - Enroll in course

### Assessment System

- `GET /api/tests` - List available tests
- `GET /api/tests/:id` - Get test details
- `POST /api/tests/:id/attempts` - Start test attempt
- `POST /api/tests/:testId/attempts/:attemptId/responses` - Submit answer
- `POST /api/tests/:testId/attempts/:attemptId/submit` - Submit test
- `GET /api/tests/:testId/attempts/:attemptId/results` - Get results

### AI Integration

- `POST /api/ai/chat` - Send message to AI tutor
- `GET /api/ai/chat/sessions` - Get chat sessions
- `POST /api/ai/analyze-test/:attemptId` - Analyze test performance
- `GET /api/ai/usage-stats` - Get AI usage statistics

### Admin Endpoints

- `GET /api/admin/dashboard` - Admin dashboard data
- `GET /api/admin/users` - User management
- `GET /api/admin/analytics` - System analytics
- `POST /api/themes` - Theme management
- `POST /api/website-content` - Content management

### Health & Monitoring

- `GET /api/health` - Basic health check
- `GET /api/health/ping` - Simple ping
- `GET /api/health/detailed` - Detailed system information

## User Roles & Permissions

### Student

- Enroll in courses
- Take tests and quizzes
- View progress and results
- Use AI tutor
- Access learning materials

### Instructor

- Create and manage courses
- Create tests and assignments
- View student progress
- Grade submissions
- Access course analytics

### Admin

- All instructor permissions
- User management
- System configuration
- View system analytics
- Manage themes and content

### Super Admin

- All admin permissions
- Full system access
- Database management
- Advanced configuration
- System monitoring

## Error Handling

The application includes comprehensive error handling:

### Frontend Error Handling

- **Error Boundaries**: Catch and display React component errors
- **API Error Handling**: Centralized API error processing
- **Form Validation**: Real-time form validation with user feedback
- **Network Error Recovery**: Automatic retry mechanisms
- **User-Friendly Messages**: Clear, actionable error messages

### Backend Error Handling

- **Global Error Handler**: Centralized error processing
- **Validation Middleware**: Input validation and sanitization
- **Database Error Handling**: Proper database error management
- **Rate Limiting**: Protection against abuse
- **Logging**: Comprehensive error logging

## Testing

### Backend Testing

```bash
cd Backend
npm test                    # Basic connection test
npm run test:full          # Comprehensive system test
```

### Frontend Testing

```bash
cd Frontend
npm run test               # Run test suite
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

### Test User Accounts

For testing purposes, the following accounts are available:

- **Super Admin**: `superadmin@test.com` / `password123`
- **Admin**: `admin@test.com` / `password123`
- **Instructor**: `instructor@test.com` / `password123`
- **Student**: `student@test.com` / `password123`

## Deployment

### Backend Deployment

1. Set production environment variables
2. Build the application: `npm run build`
3. Deploy to your hosting platform (Vercel, Railway, etc.)
4. Ensure database migrations are run

### Frontend Deployment

1. Set production environment variables
2. Build the application: `npm run build`
3. Deploy to Vercel or similar platform
4. Configure custom domain if needed

### Environment-Specific Configuration

- **Development**: Local database, detailed error messages
- **Staging**: Production-like environment for testing
- **Production**: Optimized build, error reporting, monitoring

## Monitoring & Analytics

### Health Monitoring

- Real-time system health checks
- Database connection monitoring
- API response time tracking
- Error rate monitoring

### User Analytics

- User engagement metrics
- Course completion rates
- Test performance analytics
- AI usage statistics

### Performance Monitoring

- API response times
- Database query performance
- Frontend loading times
- Error tracking and reporting

## Security

### Authentication & Authorization

- JWT-based authentication
- Role-based access control (RBAC)
- Row-level security (RLS) in database
- Secure password handling

### Data Protection

- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting

### File Security

- Secure file upload validation
- Virus scanning (recommended)
- Access control for stored files
- Signed URLs for file access

## Troubleshooting

### Common Issues

1. **Database Connection Failed**

   - Check DATABASE_URL in .env
   - Verify Supabase project is active
   - Ensure network connectivity

2. **Authentication Errors**

   - Verify JWT_SECRET is set
   - Check Supabase keys are correct
   - Ensure user has proper permissions

3. **AI Features Not Working**

   - Check GEMINI_API_KEY is set
   - Verify API key has proper permissions
   - Check rate limits

4. **Frontend-Backend Connection Issues**
   - Verify API URLs in environment variables
   - Check CORS configuration
   - Ensure both servers are running

### Debug Mode

Enable detailed logging by setting:

```env
NODE_ENV=development
NEXT_PUBLIC_ENABLE_DETAILED_ERRORS=true
```

## Contributing

### Development Workflow

1. Create feature branch from main
2. Implement changes with tests
3. Update documentation
4. Submit pull request
5. Code review and merge

### Code Standards

- Use TypeScript for type safety
- Follow ESLint configuration
- Write comprehensive tests
- Document API changes
- Follow semantic versioning

## Support

For issues and questions:

1. Check this documentation
2. Review error logs
3. Check GitHub issues
4. Contact development team

## License

This project is licensed under the MIT License. See LICENSE file for details.

---

**Last Updated**: September 2025
**Version**: 1.0.0
**Maintainers**: Project Neutron Team
