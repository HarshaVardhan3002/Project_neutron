# Project_Neutron LMS Backend

Advanced Learning Management System Backend API built with Node.js, Express, Prisma, and Supabase.

## 🚀 Features

- **Authentication & Authorization**: Supabase Auth integration with role-based access control
- **Database**: PostgreSQL with Prisma ORM for type-safe database operations
- **File Storage**: Supabase Storage for handling course materials and user uploads
- **RESTful API**: Comprehensive REST API for all LMS functionality
- **Real-time Features**: Ready for WebSocket integration
- **Admin Dashboard**: Complete admin management system
- **Security**: Rate limiting, CORS, helmet, and input validation

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database (Supabase)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone and navigate to backend directory**

   ```bash
   cd Backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   - Copy `.env.example` to `.env`
   - Update the environment variables with your Supabase credentials:

   ```env
   DATABASE_URL="your_supabase_database_url"
   SUPABASE_URL="your_supabase_project_url"
   SUPABASE_ANON_KEY="your_supabase_anon_key"
   SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"
   ```

4. **Generate Prisma Client**

   ```bash
   npm run db:generate
   ```

5. **Test Database Connection**
   ```bash
   node src/scripts/test-connection.js
   ```

## 🏃‍♂️ Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The API will be available at `http://localhost:3001`

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `PUT /api/auth/update-profile` - Update user profile

### Course Management

- `GET /api/courses` - Get all published courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create new course (instructor/admin)
- `PUT /api/courses/:id` - Update course (instructor/admin)
- `DELETE /api/courses/:id` - Delete course (instructor/admin)
- `GET /api/courses/:id/modules` - Get course modules

### Enrollment Management

- `GET /api/enrollments` - Get user enrollments
- `POST /api/enrollments` - Enroll in course
- `GET /api/enrollments/:id` - Get enrollment details
- `PUT /api/enrollments/:id` - Update enrollment status
- `GET /api/enrollments/:id/progress` - Get learning progress

### Test & Assessment System

- `GET /api/tests` - Get available tests
- `GET /api/tests/:id` - Get test details
- `POST /api/tests/:id/attempts` - Start test attempt
- `GET /api/tests/:testId/attempts/:attemptId` - Get attempt details
- `POST /api/tests/:testId/attempts/:attemptId/responses` - Submit answer
- `POST /api/tests/:testId/attempts/:attemptId/submit` - Submit test
- `GET /api/tests/:id/attempts` - Get user's test attempts

### User Profile & Dashboard

- `GET /api/profile/dashboard` - Get dashboard data
- `GET /api/profile/progress` - Get learning progress
- `GET /api/profile/certificates` - Get user certificates
- `GET /api/profile/activity` - Get activity feed
- `GET /api/profile/stats` - Get user statistics
- `PUT /api/profile/notifications/:id/read` - Mark notification as read

### Admin Management

- `GET /api/admin/dashboard` - Admin dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user details
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/courses` - Get all courses (admin view)
- `PUT /api/admin/courses/:id/publish` - Publish/unpublish course
- `GET /api/admin/analytics` - Platform analytics
- `GET /api/admin/system-settings` - Get system settings
- `PUT /api/admin/system-settings` - Update system settings

## 🗄️ Database Schema

The application uses a comprehensive database schema with 32 tables including:

- **User Management**: profiles, organizations, tutors
- **Course Structure**: courses, modules, lessons, assignments
- **Assessment System**: tests, questions, question_options, test_attempts
- **Learning Progress**: enrollments, module_progress
- **Communication**: notifications, calendar_events, live_class_sessions
- **Payment System**: payments, invoices, refunds
- **File Management**: files, embeddings
- **AI Integration**: ai_feedback, ai_usage, speaking_sessions, transcripts
- **System**: system_settings, webhooks

## 🔧 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:pull` - Pull schema from database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

## 🛡️ Security Features

- **Authentication**: Supabase Auth with JWT tokens
- **Authorization**: Role-based access control (user, instructor, admin)
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS**: Configured for frontend domain
- **Helmet**: Security headers
- **Input Validation**: Zod schema validation
- **SQL Injection Protection**: Prisma ORM with parameterized queries

## 🔄 Database Operations

### Connecting to Database

```javascript
const prisma = require("./src/lib/prisma");

// Example query
const users = await prisma.profile.findMany();
```

### Supabase Integration

```javascript
const { supabaseAdmin } = require("./src/lib/supabase");

// Upload file
const result = await uploadFile("course-materials", "video.mp4", fileBuffer);
```

## 📊 Monitoring & Logging

- Database query logging in development mode
- Error tracking and logging
- Performance monitoring ready
- Health check endpoint: `GET /health`

## 🚀 Deployment

1. **Environment Variables**: Set all required environment variables
2. **Database**: Ensure Supabase database is accessible
3. **Build**: Run `npm run db:generate`
4. **Start**: Run `npm start`

## 🤝 Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include input validation
4. Write comprehensive tests
5. Update documentation

## 📝 Next Steps

1. **Complete Supabase Setup**: Add your actual Supabase keys to `.env`
2. **Frontend Integration**: Connect the frontend to these API endpoints
3. **File Upload**: Implement file upload endpoints for course materials
4. **Real-time Features**: Add WebSocket support for live classes
5. **Email Notifications**: Implement email service integration
6. **Payment Integration**: Add payment gateway integration
7. **AI Features**: Implement AI-powered features for assessments
8. **Testing**: Add comprehensive test suite
9. **Documentation**: Generate API documentation with Swagger
10. **Monitoring**: Add application monitoring and logging

## 🔗 Related

- Frontend: `../Frontend` - Next.js frontend application
- Database: Supabase PostgreSQL database
- Storage: Supabase Storage for file management
- Auth: Supabase Auth for user management

---

**Project_Neutron LMS Backend** - Empowering education through intelligent learning management.
