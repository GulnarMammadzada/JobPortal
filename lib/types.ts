// Authentication types
export interface AuthResponse {
    accessToken: string
    refreshToken: string
    tokenType: string
    user: UserDto
}

export interface LoginRequest {
    email: string
    password: string
}

export interface RegisterRequest {
    email: string
    password: string
    fullName: string
    phone: string
    role: "JOB_SEEKER" | "COMPANY"
    // Company-specific fields (only for COMPANY role)
    companyName?: string
    description?: string
    industry?: string
    companySize?: string
    website?: string
    city?: string
}

export interface UserDto {
    id: number
    email: string
    fullName: string
    phone: string
    role: "JOB_SEEKER" | "COMPANY" | "ADMIN"
    isActive: boolean
    emailVerified: boolean
    company?: CompanyDto
    jobSeeker?: JobSeekerDto
    createdAt: string
}

export interface CompanyDto {
    id: number
    userId: number
    companyName: string
    description: string
    industry: string
    companySize: string
    website?: string
    address?: string
    city: string
    logoUrl?: string
    isVerified: boolean
    verificationStatus: "PENDING" | "APPROVED" | "REJECTED"
    averageRating?: number
    totalReviews?: number
    createdAt: string
    updatedAt: string
}

export interface JobSeekerDto {
    id: number
    userId: number
    dateOfBirth?: string
    gender?: string
    city?: string
    address?: string
    educationLevel?: string
    education?: string
    experienceYears?: number
    experience?: string
    skills: string[]
    linkedinUrl?: string
    githubUrl?: string
    portfolio?: string
    cvFileUrl?: string
    createdAt: string
    updatedAt: string
}

export interface UpdateJobSeekerProfileRequest {
    dateOfBirth?: string
    gender?: string
    city?: string
    address?: string
    educationLevel?: string
    education?: string
    experienceYears?: number
    experience?: string
    cvUrl?: string
    linkedinUrl?: string
    githubUrl?: string
    portfolio?: string
}

export interface UpdateJobSeekerSkillsRequest {
    skills: string[]
}

// Vacancy types
export interface VacancyDto {
    id: number
    companyId: number
    title: string
    description: string
    requirements: string
    responsibilities: string
    salaryMin: number
    salaryMax: number
    salaryCurrency: string
    employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP"
    experienceLevel: "ENTRY" | "JUNIOR" | "MID" | "SENIOR" | "LEAD"
    category: string
    city: string
    isRemote: boolean
    status: "DRAFT" | "PENDING_APPROVAL" | "ACTIVE" | "REJECTED" | "CLOSED" | "DELETED"
    viewCount: number
    applicationCount: number
    deadline: string
    skills: string[]
    company?: CompanyBasicDto
    createdAt: string
    updatedAt: string
}

export interface CompanyBasicDto {
    id: number
    companyName: string
    logoUrl?: string
    industry: string
    city: string
}

// Application types
export interface InterviewDetails {
    date?: string
    time?: string
    location?: string
    meetingLink?: string
}

export interface ApplicationDto {
    id: number
    vacancyId: number
    vacancyTitle?: string
    userId: number
    fullName: string
    email: string
    phone: string
    cvFileUrl: string
    coverLetter?: string
    parsedSkills?: string
    experienceYears?: number
    matchScore: number
    status: "PENDING" | "REVIEWED" | "SHORTLISTED" | "INTERVIEW_SCHEDULED" | "INTERVIEWED" | "OFFER_SENT" | "ACCEPTED" | "REJECTED"
    reviewedAt?: string
    notes?: string
    interviewDetails?: InterviewDetails // Added interview details
    createdAt: string
}

export interface UpdateApplicationStatusRequest {
    status: "PENDING" | "REVIEWED" | "SHORTLISTED" | "INTERVIEW_SCHEDULED" | "INTERVIEWED" | "OFFER_SENT" | "ACCEPTED" | "REJECTED"
    notes?: string
    interviewDetails?: InterviewDetails
}

export interface ApplicationWithHistoryDto extends ApplicationDto {
    statusHistory: StatusChange[]
}

export interface StatusChange {
    status: string
    changedAt: string
    changedBy?: string
    notes?: string
}

export interface ApplicationStatisticsDto {
    totalApplications: number
    pending: number
    reviewed: number
    shortlisted: number
    interviewScheduled: number
    interviewed: number
    offerSent: number
    rejected: number
    accepted: number
}

export interface SavedVacancyResponse {
    id: number
    vacancyId: number
    vacancy?: VacancyDto | null
    savedAt: string
}

export interface CompanyReviewDto {
    id: number
    companyId: number
    userId: number
    reviewerName: string
    rating: number
    title: string
    comment: string
    isCurrentEmployee: boolean
    createdAt: string
    updatedAt: string
}

export interface CompanyReviewStatsDto {
    averageRating: number
    totalReviews: number
    ratingDistribution: {
        "5": number
        "4": number
        "3": number
        "2": number
        "1": number
    }
}

export interface CreateCompanyReviewRequest {
    companyId: number
    rating: number
    title: string
    comment: string
    isCurrentEmployee: boolean
}

// Recommendation types
export interface VacancyRecommendationDto extends VacancyDto {
    matchScore: number
    matchedSkills: string[]
    missingSkills: string[]
    matchReason: string
    experienceLevelMatch: boolean
    locationMatch: boolean
}

// AI Feature types
export interface CVAnalysisRequest {
    cvText: string
    targetJobTitle?: string
    targetJobDescription?: string
}

export interface CVAnalysisResponse {
    overallScore: number
    strengths: string[]
    improvements: string[]
    missingKeywords: string[]
    detailedFeedback: string
    atsScore: number
    actionItems: string[]
}

export interface ChatRequest {
    message: string
    conversationId?: string
}

export interface ChatResponse {
    message: string
    conversationId: string
    timestamp: string
    suggestions?: string[]
    relatedVacancyIds?: number[]
    intent?: string
}

// Notification types
export interface NotificationDto {
    id: string
    type: string
    title: string
    message: string
    link?: string
    read: boolean
    timestamp: string
}

// Admin Statistics
export interface AdminStatisticsDto {
    totalUsers: number
    totalCompanies: number
    totalJobSeekers: number
    pendingCompanies: number
    activeCompanies: number
}

export interface VacancyStatisticsDto {
    totalVacancies: number
    activeVacancies: number
    pendingVacancies: number
    closedVacancies: number
    totalApplications: number
}

// Page response
export interface PageResponse<T> {
    content: T[]
    pageable: {
        sort: { sorted: boolean; unsorted: boolean; empty: boolean }
        offset: number
        pageNumber: number
        pageSize: number
        paged: boolean
        unpaged: boolean
    }
    totalPages: number
    totalElements: number
    last: boolean
    size: number
    number: number
    numberOfElements: number
    first: boolean
    empty: boolean
}

// Company Review types
export interface CompanyReviewDto {
    id: number
    companyId: number
    companyName: string
    userId: number
    reviewerName: string
    rating: number
    title?: string
    comment: string
    isCurrentEmployee?: boolean
    helpfulCount?: number
    createdAt: string
    updatedAt?: string
}

export interface CreateCompanyReviewRequest {
    companyId: number
    rating: number
    title?: string
    comment: string
    isCurrentEmployee?: boolean
}

export interface CompanyRatingStatsDto {
    averageRating: number
    totalReviews: number
    ratingDistribution: {
        [key: number]: number // 1-5 stars
    }
}
