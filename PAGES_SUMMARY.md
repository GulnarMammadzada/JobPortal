# UJobPortal - Səhifələr Siyahısı

## 📊 Ümumi Məlumat
- **Toplam Səhifələr**: 24
- **Backend Integration**: ✅ Hamısı backend API ilə bağlıdır
- **UI Komponentlər**: ✅ Tam funksional

---

## 📄 Səhifələrin Siyahısı

### 🌍 Public Səhifələr (5)

1. **Landing Page** - `/`
   - Backend: `/vacancies?page=0&size=6` (featured jobs)
   - Xüsusiyyətlər: Hero section, search, featured jobs, how it works

2. **Login** - `/auth/login`
   - Backend: `POST /auth/login`
   - Xüsusiyyətlər: Email/password login, role-based redirect

3. **Register** - `/auth/register`
   - Backend: `POST /auth/register`
   - Xüsusiyyətlər: Job seeker və company registration

4. **Forgot Password** - `/auth/forgot-password`
   - Backend: `POST /auth/forgot-password`
   - Xüsusiyyətlər: Password reset

5. **Companies Listing** - `/companies`
   - Backend: `GET /companies?page=0&size=50`
   - Xüsusiyyətlər: Search, filter, company cards

6. **Company Detail** - `/companies/[id]`
   - Backend: `GET /companies/{id}`, `GET /vacancies?companyId={id}`, `GET /reviews/company/{id}`
   - Xüsusiyyətlər: Company info, open positions, reviews (tabs)

---

### 💼 Job Seeker Səhifələri (7)

7. **Dashboard** - `/jobseeker/dashboard`
   - Backend: `GET /applications/my/statistics`, `GET /applications/my`, `GET /vacancies/recommendations`
   - Xüsusiyyətlər: Stats, recent applications, recommendations, match scores

8. **CV Analysis** - `/jobseeker/cv-analysis`
   - Backend: `POST /ai/analyze-cv`
   - Xüsusiyyətlər: AI-powered CV analysis, ATS score, improvements

9. **AI Chatbot** - `/jobseeker/chat`
   - Backend: `POST /ai/chat`
   - Xüsusiyyətlər: Career guidance, job search help

10. **Job Search** - `/jobs`
    - Backend: `GET /vacancies`
    - Xüsusiyyətlər: Search, filters, pagination

11. **Job Detail** - `/jobs/[id]`
    - Backend: `GET /vacancies/{id}`
    - Xüsusiyyətlər: Full job description, company info, apply button

12. **Apply to Job** - `/jobs/[id]/apply`
    - Backend: `POST /applications/{vacancyId}/apply`
    - Xüsusiyyətlər: Application form, resume upload

13. **My Applications** - `/my-applications`
    - Backend: `GET /applications/my`
    - Xüsusiyyətlər: All applications, status filter

14. **Application Detail** - `/my-applications/[id]`
    - Backend: `GET /applications/{id}`
    - Xüsusiyyətlər: Application status, timeline, withdraw option

15. **Saved Jobs** - `/saved-jobs`
    - Backend: `GET /saved-vacancies`, `POST /saved-vacancies/{id}`, `DELETE /saved-vacancies/{id}`
    - Xüsusiyyətlər: Bookmarked jobs, quick access

16. **Recommendations** - `/recommendations`
    - Backend: `GET /vacancies/recommendations`
    - Xüsusiyyətlər: AI-recommended jobs based on profile

17. **Company Reviews** - `/jobseeker/reviews`
    - Backend: `GET /reviews/my`, `POST /reviews`
    - Xüsusiyyətlər: Write reviews, rate companies (5 categories)

---

### 🏢 Company Səhifələri (2)

18. **Company Dashboard** - `/company/dashboard`
    - Backend: `GET /vacancies/my`, `GET /applications`
    - Xüsusiyyətlər: Vacancy stats, applications, verification status

19. **AI Job Description Generator** - `/company/ai-generator`
    - Backend: `GET /ai/generate-job-description`
    - Xüsusiyyətlər: Generate professional job descriptions with AI

---

### 👤 Profile (1)

20. **Profile** - `/profile`
    - Backend: `GET /users/me`
    - Xüsusiyyətlər: View/edit profile (job seeker or company), settings

---

### 👨‍💼 Admin Səhifələri (4)

21. **Admin Dashboard** - `/admin/dashboard`
    - Backend: `GET /admin/statistics`, `GET /admin/companies/pending`, `GET /admin/vacancies/pending`
    - Xüsusiyyətlər: Platform stats, pending approvals, quick actions

22. **Admin Users** - `/admin/users`
    - Backend: `GET /users`
    - Xüsusiyyətlər: User management, filter by role

23. **Admin Companies** - `/admin/companies`
    - Backend: `GET /companies`, `GET /admin/companies/pending`, `PUT /admin/companies/{id}/approve`
    - Xüsusiyyətlər: Approve/reject companies, view all companies (tabs)

24. **Admin Vacancies** - `/admin/vacancies`
    - Backend: `GET /admin/vacancies/pending`, `PUT /admin/vacancies/{id}/approve`
    - Xüsusiyyətlər: Approve/reject job postings

---

## 🎨 UI Komponentlər

Bütün səhifələr aşağıdakı UI komponentlərdən istifadə edir:

- **Button** - `components/ui/button.tsx` (variants: default, outline, ghost, destructive)
- **Badge** - `components/ui/badge.tsx` (variants: default, secondary, success, warning, danger)
- **Card** - `components/ui/card.tsx` (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
- **Spinner** - `components/ui/spinner.tsx` (sizes: sm, md, lg)
- **Tabs** - `components/ui/tabs.tsx` (Tabs, TabsList, TabsTrigger, TabsContent)
- **Input** - `components/ui/input.tsx` (label, error support)

---

## 🔗 Backend Endpointləri

### Authentication
- `POST /auth/login` - Login
- `POST /auth/register` - Register
- `POST /auth/refresh` - Refresh token
- `POST /auth/forgot-password` - Password reset

### Users
- `GET /users/me` - Current user
- `GET /users` - All users (admin)

### Vacancies
- `GET /vacancies` - List vacancies
- `GET /vacancies/{id}` - Vacancy detail
- `GET /vacancies/my` - Company vacancies
- `GET /vacancies/recommendations` - Recommended jobs
- `POST /vacancies` - Create vacancy
- `PUT /vacancies/{id}` - Update vacancy
- `DELETE /vacancies/{id}` - Delete vacancy

### Applications
- `GET /applications/my` - My applications
- `GET /applications/my/statistics` - Application stats
- `POST /applications/{vacancyId}/apply` - Apply to job
- `PUT /applications/{id}/withdraw` - Withdraw application
- `PUT /applications/{id}/status` - Update status (company)

### Companies
- `GET /companies` - List companies
- `GET /companies/{id}` - Company detail
- `GET /admin/companies/pending` - Pending companies
- `PUT /admin/companies/{id}/approve` - Approve/reject company

### Saved Vacancies
- `GET /saved-vacancies` - Saved jobs
- `POST /saved-vacancies/{vacancyId}` - Save job
- `DELETE /saved-vacancies/{vacancyId}` - Unsave job

### Reviews
- `GET /reviews/my` - My reviews
- `POST /reviews` - Create review
- `GET /reviews/company/{id}` - Company reviews

### AI Features
- `POST /ai/analyze-cv` - CV analysis
- `POST /ai/chat` - Career chatbot
- `GET /ai/generate-job-description` - Generate job description

### Admin
- `GET /admin/statistics` - Platform statistics
- `GET /admin/vacancies/pending` - Pending vacancies
- `PUT /admin/vacancies/{id}/approve` - Approve/reject vacancy

---

## ✅ Texniki Xüsusiyyətlər

- **Framework**: Next.js 16.0.0 with App Router
- **Language**: TypeScript
- **Styling**: CSS Modules
- **State Management**: React Context (AuthContext)
- **API Client**: Custom ApiClient with JWT support
- **Real-time**: WebSocket (SockJS/STOMP) for notifications
- **Authentication**: JWT (access + refresh tokens)
- **Role-based routing**: GUEST, JOB_SEEKER, COMPANY, ADMIN

---

## 🚀 İstifadə

### Development Server
```bash
npm run dev
```

Server işə düşəcək: **http://localhost:3000**

### Backend Tələbləri
- API Gateway: **http://localhost:8080**
- WebSocket: **ws://localhost:8083/ws**

---

## 📝 Qeydlər

- Bütün səhifələr backend API ilə tam inteqrasiya olunub
- UI komponentlər CSS modules ilə stil verilmişdir
- Login və Register səhifələri sadələşdirilmiş versiyadadır (Radix UI yoxdur)
- WebSocket real-time bildirişlər üçün konfiqurasiya olunub
- Responsive design (mobile-friendly)

---

## 🎯 Test Etmək Üçün

1. Backend servislərini işə salın
2. Frontend serveri başladın: `npm run dev`
3. Brauzerə daxil olun: http://localhost:3000
4. Test hesabları yaradın:
   - Job Seeker account
   - Company account
   - Admin account (backend-də yaradılmalı)

5. Funksionallığı yoxlayın:
   - Login/Register
   - Job seeker flow (browse, apply, CV analysis, chat)
   - Company flow (create vacancy, view applications, AI generator)
   - Admin flow (approve companies, approve vacancies)
