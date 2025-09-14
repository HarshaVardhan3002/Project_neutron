# Project Neutron LMS - Complete Setup Instructions

## 🚀 Quick Start Guide

### Prerequisites

- Node.js 18+ installed
- Supabase account
- Gemini API key from Google AI Studio

### 1. Database Setup (Supabase)

1. **Create a new Supabase project**

   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and anon key

2. **Run the main database schema**

   - Go to Supabase SQL Editor
   - Copy and paste the contents of `supabase-schema.sql`
   - Execute the SQL

3. **Run additional tables for super admin features**

   - In Supabase SQL Editor
   - Copy and paste the contents of `supabase-additional-tables.sql`
   - Execute the SQL

4. **Create test user accounts**
   - Go to Supabase Auth > Users
   - Create these test accounts manually:
     - **Super Admin**: `superadmin@test.com` (password: `SuperAdmin123!`)
     - **Admin**: `admin@test.com` (password: `Admin123!`)
     - **Instructor**: `instructor@test.com` (password: `Instructor123!`)
     - **Student**: `student@test.com` (password: `Student123!`)
5. **Update test user profiles**

   - Note down the UUIDs of the created users
   - Update the UUIDs in the `create_test_users()` function in `supabase-additional-tables.sql`
   - Run: `SELECT create_test_users();` in SQL Editor

6. **Set up Storage Buckets**
   - Go to Supabase Storage
   - Create these buckets:
     - `course-content` (private)
     - `user-avatars` (public)
     - `test-media` (private)
     - `system-assets` (public)
     - `assignments` (private)

### 2. Backend Setup

1. **Install dependencies**

   ```bash
   cd Backend
   npm install
   ```

2. **Environment configuration**
   ```bash
   cp .env.example .env
   ```
3. **Update .env file with your values:**

   ```env
   DATABASE_URL="your-supabase-database-url"
   SUPABASE_URL="your-supabase-project-url"
   SUPABASE_ANON_KEY="your-supabase-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
   JWT_SECRET="your-super-secret-jwt-key"
   GEMINI_API_KEY="your-gemini-api-key"
   ```

4. **Introspect and generate Prisma client**

   ```bash
   # First, introspect the database to update the schema
   npm run db:pull

   # Then generate the Prisma client
   npm run db:generate
   ```

5. **Start the backend server**

   ```bash
   npm run dev
   ```

   The backend will run on `http://localhost:3001`

### 3. Frontend Setup

1. **Install dependencies**

   ```bash
   cd Frontend
   npm install
   ```

2. **Environment configuration**

   ```bash
   cp .env.example .env.local
   ```

3. **Update .env.local file:**

   ```env
   NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
   NEXT_PUBLIC_API_URL="http://localhost:3001/api"
   ```

4. **Start the frontend server**

   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:3000`

### 4. Getting Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key and add it to your backend `.env` file

### 5. Test the Setup

1. **Test Database Connection**

   ```bash
   cd Backend
   node test-db-connection.js
   ```

2. **Test User Accounts**

   - Visit `http://localhost:3000`
   - Try logging in with the test accounts:
     - Super Admin: `superadmin@test.com` / `SuperAdmin123!`
     - Admin: `admin@test.com` / `Admin123!`
     - Instructor: `instructor@test.com` / `Instructor123!`
     - Student: `student@test.com` / `Student123!`

3. **Test AI Features**
   - Log in as any user
   - Navigate to "AI Tutor" in the dashboard
   - Send a test message to verify Gemini AI integration

## 🎯 Feature Overview

### Super Admin Features

- **Theme Management**: Customize website themes for different occasions
- **Website Content Management**: Edit landing page content and images
- **Test Builder**: Create comprehensive tests for IELTS, TOEFL, PTE, GRE
- **Course Builder**: Build complete courses with modules and lessons
- **User Management**: Manage all users with advanced analytics
- **System Analytics**: Monitor platform health and usage

### AI Features

- **AI Tutor Chat**: Context-aware conversations with Gemini AI
- **Test Performance Analysis**: Detailed AI analysis of test results
- **Personalized Recommendations**: AI-powered study suggestions
- **Smart Context**: AI remembers conversation history and adapts to user level

### User Roles

- **Student**: Access courses, take tests, use AI tutor
- **Instructor**: Create and manage courses, view student progress
- **Admin**: Manage users, courses, and platform settings
- **Super Admin**: Complete platform control and customization

## 🔧 Development Commands

### Backend

```bash
npm run dev          # Start development server
npm run start        # Start production server
npm run db:pull      # Introspect database and update Prisma schema
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Prisma Studio
```

### Frontend

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
```

## 📝 Important Notes

### Database Schema Management

- **After running SQL scripts**: Always run `npm run db:pull` to introspect the database and update your Prisma schema
- **Before making changes**: The Prisma schema will be automatically updated to match your Supabase database structure
- **No manual schema editing needed**: Prisma will generate the correct models based on your database tables

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**

   - Verify your DATABASE_URL in .env
   - Check if Supabase project is active
   - Ensure IP is whitelisted in Supabase

2. **AI Features Not Working**

   - Verify GEMINI_API_KEY is correct
   - Check if you have API quota remaining
   - Ensure backend server is running

3. **Authentication Issues**

   - Verify Supabase keys are correct
   - Check if test users were created properly
   - Ensure RLS policies are set up correctly

4. **File Upload Issues**
   - Verify storage buckets are created
   - Check storage policies are set up
   - Ensure file size limits are appropriate

### Getting Help

If you encounter issues:

1. Check the browser console for errors
2. Check backend server logs
3. Verify all environment variables are set
4. Ensure all SQL scripts were executed successfully

## 🚀 Production Deployment

### Backend Deployment

1. Set up production database
2. Update environment variables for production
3. Deploy to your preferred platform (Vercel, Railway, etc.)

### Frontend Deployment

1. Update API URLs for production
2. Build the application: `npm run build`
3. Deploy to Vercel or your preferred platform

### Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS in production
- [ ] Set up proper CORS policies
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Gemini AI Documentation](https://ai.google.dev/docs)

---

**🎉 Congratulations! Your Project Neutron LMS is now ready to use!**

The platform includes everything you need for a modern, AI-powered learning management system with comprehensive admin controls and intelligent tutoring capabilities.
