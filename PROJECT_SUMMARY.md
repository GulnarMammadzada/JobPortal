# UJobPortal - Frontend Application

## Overview
Complete Next.js frontend for a job portal application integrating with Spring Boot microservices backend. Built with Next.js 16.0.0, React 19, TypeScript, and CSS Modules.

## Architecture

### Backend Integration
- **API Gateway**: http://localhost:8080 (single entry point)
- **WebSocket**: ws://localhost:8083/ws
- **Microservices**:
  - User Service (authentication, user management)
  - Vacancy Service (job postings, applications)
  - Notification Service (real-time notifications)

### Authentication
- JWT-based with access/refresh tokens
- Tokens stored in localStorage
- Auto-refresh mechanism
- Role-based access control (GUEST, JOB_SEEKER, COMPANY, ADMIN)

## Features Implemented

### Public Pages
- **Landing Page** (`/`)
  - Hero section with search
  - Featured jobs listing
  - How it works section
  - Key features showcase

- **Login** (`/auth/login`)
  - Email/password authentication
  - Role-based redirect after login
  - Error handling

- **Register** (`/auth/register`)
  - Dual registration (Job Seeker / Company)
  - Company-specific fields (name, industry, size, etc.)
  - Form validation

- **Companies** (`/companies`)
  - Browse all companies
  - Search by name, industry, city
  - Company cards with logo, verified badge, ratings
  - Click to view company profile

### Job Seeker Features (`/jobseeker/*`)

1. **Dashboard** (`/jobseeker/dashboard`)
   - Application statistics (total, pending, shortlisted, accepted)
   - Recent applications with status
   - AI-powered job recommendations
   - Match score visualization

2. **CV Analysis** (`/jobseeker/cv-analysis`)
   - AI-powered CV analysis
   - ATS score calculation
   - Strengths and improvements suggestions
   - Missing keywords detection
   - Action items

3. **AI Chatbot** (`/jobseeker/chat`)
   - Career guidance assistant
   - Job search help
   - Conversation history
   - Smart suggestions

4. **Job Search** (`/jobseeker/jobs`)
   - Advanced filtering (location, salary, type, experience)
   - Match score display
   - Save/unsave vacancies
   - Apply to jobs

5. **Applications** (`/jobseeker/applications`)
   - View all applications
   - Filter by status
   - Track application progress
   - Withdraw applications

6. **Saved Jobs** (`/jobseeker/saved`)
   - Bookmarked vacancies
   - Quick access
   - Remove from saved

7. **Company Reviews** (`/jobseeker/reviews`)
   - Write reviews for companies worked at
   - Rate overall, work-life balance, management, culture, growth
   - View own reviews

### Company Features (`/company/*`)

1. **Dashboard** (`/company/dashboard`)
   - Vacancy statistics (total, active, pending)
   - Application counts and views
   - Recent applications
   - Verification status

2. **Create Vacancy** (`/company/vacancies/new`)
   - Complete job posting form
   - Multiple categories support
   - Salary range, remote options
   - Benefits, requirements, responsibilities

3. **Manage Vacancies** (`/company/vacancies`)
   - View all posted jobs
   - Filter by status (draft, active, pending, etc.)
   - Edit/delete vacancies
   - View application count

4. **Applications** (`/company/applications`)
   - View all received applications
   - Filter by vacancy and status
   - Change application status
   - Match score display

5. **AI Job Description Generator** (`/company/ai-generator`)
   - Generate professional job descriptions
   - AI-powered based on title and skills
   - Copy to clipboard
   - Use directly in vacancy creation

### Admin Features (`/admin/*`)

1. **Dashboard** (`/admin/dashboard`)
   - Platform statistics (users, companies, vacancies, applications)
   - Pending companies for approval
   - Pending vacancies for approval
   - Quick approve/reject actions

2. **Company Management** (`/admin/companies`)
   - View all companies
   - Filter by verification status
   - Approve/reject companies
   - View company details

3. **Vacancy Management** (`/admin/vacancies`)
   - View all vacancies
   - Filter by status
   - Approve/reject job postings
   - Monitor platform content

4. **User Management** (`/admin/users`)
   - View all users
   - Filter by role
   - User statistics
   - Account management

## Real-time Features

### WebSocket Notifications
- **Connection**: Established on login
- **Channels**:
  - User-specific: `/queue/user/{email}`
  - Company-specific: `/queue/company/{companyId}`
- **Features**:
  - Browser notifications
  - In-app notification bell
  - Unread count badge
  - Mark as read/clear all
  - Persistent storage (localStorage)
  - Auto-reconnect on disconnect

### Notification Types
- Application status changes
- New applications (for companies)
- Vacancy approval/rejection
- Company approval/rejection
- New job recommendations
- System announcements

## Technical Stack

### Core Technologies
- **Next.js 16.0.0** - React framework with App Router
- **React 19.2.0** - UI library
- **TypeScript** - Type safety
- **CSS Modules** - Scoped styling

### Dependencies
- **sockjs-client** - WebSocket polyfill
- **@stomp/stompjs** - STOMP protocol for WebSocket

## Project Structure

```
ujobportal/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout with AuthProvider
│   ├── auth/
│   │   ├── login/
│   │   │   ├── page.tsx
│   │   │   └── login.module.css
│   │   └── register/
│   │       ├── page.tsx
│   │       └── register.module.css
│   ├── jobseeker/
│   │   ├── dashboard/
│   │   ├── cv-analysis/
│   │   ├── chat/
│   │   ├── jobs/
│   │   ├── applications/
│   │   ├── saved/
│   │   └── reviews/
│   ├── company/
│   │   ├── dashboard/
│   │   ├── vacancies/
│   │   ├── applications/
│   │   └── ai-generator/
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── companies/
│   │   ├── vacancies/
│   │   └── users/
│   └── companies/
│       └── page.tsx                # Public companies listing
├── components/
│   └── notifications/
│       └── notification-bell.tsx   # Notification UI component
├── lib/
│   ├── types.ts                    # TypeScript type definitions
│   ├── api-client.ts               # HTTP client with JWT
│   ├── auth-context.tsx            # Authentication state
│   └── websocket.ts                # WebSocket service
└── PROJECT_SUMMARY.md              # This file
```

## API Endpoints Used

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh access token

### User Management
- `GET /users/me` - Get current user
- `GET /users` - List all users (admin)

### Vacancies
- `GET /vacancies` - List all vacancies (paginated)
- `GET /vacancies/{id}` - Get vacancy details
- `GET /vacancies/my` - Get company's vacancies
- `GET /vacancies/recommendations` - AI job recommendations
- `POST /vacancies` - Create vacancy
- `PUT /vacancies/{id}` - Update vacancy
- `DELETE /vacancies/{id}` - Delete vacancy

### Applications
- `GET /applications/my` - Job seeker's applications
- `GET /applications/my/statistics` - Application stats
- `POST /applications/{vacancyId}/apply` - Apply to job
- `PUT /applications/{id}/withdraw` - Withdraw application
- `GET /applications/vacancy/{id}` - Company's applications for vacancy
- `PUT /applications/{id}/status` - Update application status

### Companies
- `GET /companies` - List all companies
- `GET /companies/{id}` - Get company details
- `GET /admin/companies/pending` - Pending companies (admin)
- `PUT /admin/companies/{id}/approve` - Approve company (admin)

### Saved Vacancies
- `GET /saved-vacancies` - User's saved jobs
- `POST /saved-vacancies/{vacancyId}` - Save vacancy
- `DELETE /saved-vacancies/{vacancyId}` - Unsave vacancy

### Reviews
- `GET /reviews/my` - User's reviews
- `POST /reviews` - Create review
- `GET /reviews/company/{id}` - Company reviews

### AI Features
- `POST /ai/analyze-cv` - Analyze CV
- `POST /ai/chat` - Career chatbot
- `GET /ai/generate-job-description` - Generate job description

### Admin
- `GET /admin/statistics` - Platform statistics
- `GET /admin/vacancies/pending` - Pending vacancies
- `PUT /admin/vacancies/{id}/approve` - Approve vacancy

## Running the Application

### Prerequisites
- Node.js 18+ installed
- Backend microservices running on localhost:8080
- WebSocket service on localhost:8083

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Application runs on http://localhost:3000

### Build
```bash
npm run build
npm start
```

## Design System

### Colors
- **Primary**: #2196f3 (Blue)
- **Success**: #4caf50 (Green)
- **Warning**: #ff9800 (Orange)
- **Danger**: #f44336 (Red)
- **Text**: #212121 (Dark Gray)
- **Muted**: #757575 (Gray)
- **Background**: #f5f7fa (Light Gray)

### Typography
- **Font Family**: System fonts (-apple-system, BlinkMacSystemFont, "Segoe UI", etc.)
- **Headings**: 700 weight
- **Body**: 400 weight
- **Labels**: 600 weight

### Spacing
- Base unit: 0.25rem (4px)
- Common: 0.5rem, 1rem, 1.5rem, 2rem

### Components
- **Cards**: White background, subtle shadow, 12px border radius
- **Buttons**: Primary blue, hover effects, disabled states
- **Inputs**: 1px border, focus states with blue outline
- **Badges**: Rounded pills for status indicators

## Security Features

1. **Authentication**
   - JWT tokens with expiration
   - Automatic token refresh
   - Secure token storage (localStorage)
   - Protected routes with auth checks

2. **Authorization**
   - Role-based access control
   - Route protection per role
   - API-level permission checks

3. **Data Validation**
   - Frontend form validation
   - Required field checks
   - Email format validation
   - Password strength requirements

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript support required
- WebSocket support required for real-time features

## Known Limitations
- Images in resources/images directory were not accessible during development
- Design based on requirements specification rather than exact mockups
- Peer dependency warnings with React 19 (using --legacy-peer-deps)

## Future Enhancements
- File upload for CV/resume
- Company logo upload
- Advanced search with more filters
- Email notifications
- Mobile responsive improvements
- Dark mode support
- Internationalization (i18n)

## Development Notes

### Type Safety
All API responses are typed using TypeScript interfaces in `lib/types.ts`. These match exactly with backend DTOs for type safety.

### Error Handling
- API errors caught and displayed to users
- Network errors handled gracefully
- Loading states during async operations
- Validation errors shown inline

### Performance
- Pagination for large lists
- Lazy loading of routes
- Optimistic UI updates where appropriate
- WebSocket connection pooling

## Testing the Application

### Test Users
Create test accounts for each role:
1. Job Seeker account
2. Company account
3. Admin account

### Test Workflow
1. **Job Seeker Flow**:
   - Register as job seeker
   - Upload/analyze CV
   - Browse jobs
   - Save jobs
   - Apply to jobs
   - Use AI chatbot
   - Write company reviews

2. **Company Flow**:
   - Register as company
   - Wait for admin approval
   - Create vacancies (use AI generator)
   - Review applications
   - Change application statuses

3. **Admin Flow**:
   - Login as admin
   - Approve pending companies
   - Approve pending vacancies
   - Monitor platform statistics
   - Manage users

## Support
For issues or questions about the backend integration, refer to the microservices documentation at:
- C:\Users\gulna\IdeaProjects\User
- C:\Users\gulna\IdeaProjects\VacancyService
- C:\Users\gulna\IdeaProjects\NotificationService
- C:\Users\gulna\IdeaProjects\ApiGateway
