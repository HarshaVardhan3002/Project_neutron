# Admin Interface Guide - Project Neutron LMS

## Overview

The Project Neutron LMS now includes a comprehensive admin interface that allows super administrators to manage all aspects of the platform without needing to access the database directly through Supabase.

## Features

### 🎓 Course Management

- **Create Courses**: Add new courses with titles, descriptions, difficulty levels, and test types
- **Edit Courses**: Update course information, publish/unpublish courses
- **Delete Courses**: Remove courses from the platform
- **Course Analytics**: View enrollment counts and module statistics

### 📝 Test & Quiz Management

- **Create Tests**: Build comprehensive tests with multiple question types
- **Question Builder**: Add multiple choice, true/false, short answer, essay, and fill-in-the-blank questions
- **Test Settings**: Configure duration, passing scores, and test types (practice, mock, assessment)
- **Question Management**: Edit, reorder, and delete questions within tests

### 📚 Chapter & Module Management

- **Create Chapters**: Organize course content into structured chapters
- **Content Types**: Add text content, videos, external links, and file uploads
- **Reorder Content**: Drag and drop functionality for organizing content
- **Chapter Settings**: Publish/unpublish chapters and modules

### 👥 User Management

- **Create Users**: Add new users with different roles (student, instructor, admin, super_admin)
- **Edit Profiles**: Update user information, roles, and permissions
- **User Status**: Activate/deactivate user accounts
- **Password Reset**: Send password reset emails to users
- **Role Management**: Assign appropriate permissions based on user roles

## Access Levels

### Super Admin

- Full access to all admin features
- Can create, edit, and delete all content
- User management capabilities
- System settings access

### Admin

- Course and content management
- Limited user management
- Analytics access

### Instructor

- Course creation and editing (own courses)
- Test and quiz management
- Student progress monitoring

### Student

- No admin access
- Standard LMS functionality only

## Getting Started

### 1. Access the Admin Panel

Navigate to `/admin` in your browser after logging in with an admin account.

### 2. Dashboard Overview

The admin dashboard provides:

- Platform statistics (courses, tests, users, enrollments)
- Quick action buttons for common tasks
- System status monitoring
- Management area shortcuts

### 3. Content Management

Access `/admin/content` to manage:

- **Courses Tab**: Create and manage courses
- **Tests Tab**: Build and edit tests/quizzes
- **Chapters Tab**: Organize course content
- **Users Tab**: Manage user accounts

## Key Features

### 🔧 No-Code Interface

- Visual course builder
- Drag-and-drop content organization
- Form-based test creation
- Point-and-click user management

### 🎯 Question Types Supported

1. **Multiple Choice**: Up to 4 options with single correct answer
2. **True/False**: Simple boolean questions
3. **Short Answer**: Text-based responses
4. **Essay**: Long-form written responses
5. **Fill in the Blank**: Complete the sentence questions

### 📊 Content Organization

- Hierarchical structure: Courses → Chapters → Content
- Flexible content types: Text, Video, Links, Files
- Order management with visual controls
- Publish/draft status for all content

### 🔐 Security Features

- Role-based access control
- JWT token authentication
- Secure API endpoints
- Input validation and sanitization

## API Endpoints

The admin interface uses these key API endpoints:

### Course Management

- `POST /api/admin/content/courses` - Create course
- `PUT /api/admin/content/courses/:id` - Update course
- `DELETE /api/admin/content/courses/:id` - Delete course

### Test Management

- `POST /api/admin/content/tests` - Create test
- `POST /api/admin/content/tests/:id/questions` - Add question
- `PUT /api/admin/content/tests/:id` - Update test

### User Management

- `POST /api/admin/content/users` - Create user
- `PUT /api/admin/users/:id` - Update user
- `POST /api/admin/content/users/:id/password-reset` - Reset password

### Chapter Management

- `POST /api/admin/content/chapters` - Create chapter
- `POST /api/admin/content/chapters/:id/contents` - Add content
- `PUT /api/admin/content/chapters/:id/reorder` - Reorder chapters

## Environment Setup

Ensure these environment variables are configured:

### Backend (.env)

```
JWT_SECRET=your_jwt_secret_key
DATABASE_URL=your_supabase_database_url
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Usage Examples

### Creating a Course

1. Navigate to Admin → Content Management
2. Click "Create Course" button
3. Fill in course details:
   - Title: "IELTS Preparation Course"
   - Description: "Comprehensive IELTS test preparation"
   - Test Type: "IELTS"
   - Difficulty: "Intermediate"
4. Click "Create Course"

### Building a Test

1. Go to Tests tab in Content Management
2. Click "Create Test"
3. Configure test settings:
   - Title: "IELTS Practice Test 1"
   - Type: "Practice"
   - Duration: 120 minutes
   - Passing Score: 70%
4. Add questions using the question builder
5. Publish when ready

### Managing Users

1. Access Users tab in Content Management
2. Click "Create User" for new accounts
3. Set appropriate roles and permissions
4. Use filters to find specific users
5. Edit profiles or reset passwords as needed

## Best Practices

### Content Organization

- Use clear, descriptive titles for courses and chapters
- Organize content in logical progression
- Set appropriate difficulty levels
- Include comprehensive descriptions

### Test Creation

- Mix question types for engaging assessments
- Provide clear explanations for correct answers
- Set realistic time limits
- Test your tests before publishing

### User Management

- Assign minimal necessary permissions
- Regularly review user roles
- Use strong password policies
- Monitor user activity

## Troubleshooting

### Common Issues

1. **Build Errors**: Ensure all TypeScript types are properly defined
2. **API Errors**: Check JWT token validity and API endpoint availability
3. **Permission Errors**: Verify user roles and authentication status
4. **Database Errors**: Confirm Supabase connection and schema integrity

### Support

For technical support or feature requests, please refer to the development team or create an issue in the project repository.

## Future Enhancements

Planned features for future releases:

- Bulk content import/export
- Advanced analytics dashboard
- Email notification system
- Content versioning
- Multi-language support
- Advanced question types (drag-and-drop, matching, etc.)
- Automated grading for essay questions
- Integration with external learning tools

---

This admin interface provides a complete solution for managing your LMS platform without requiring direct database access, making it easy for non-technical administrators to maintain and grow your educational platform.
