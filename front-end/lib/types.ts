<<<<<<< HEAD
export type UserRole = 'student' | 'teacher'

export type OpportunityCategory =
  | 'scholarship'
  | 'internship'
  | 'job'
  | 'competition'
  | 'workshop'
  | 'grant'
  | 'fellowship'
=======
export type UserRole = 'student' | 'teacher' | 'admin' | 'maintainer'

export type OpportunityCategory = 
  | 'scholarship' 
  | 'internship' 
  | 'job' 
  | 'competition' 
  | 'workshop' 
  | 'grant' 
  | 'fellowship' 
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
  | 'other'

export type OpportunityStatus = 'active' | 'closed' | 'draft'

<<<<<<< HEAD
export type ApplicationStatus =
  | 'pending'
  | 'under_review'
  | 'accepted'
  | 'rejected'
=======
export type ApplicationStatus = 
  | 'pending' 
  | 'under_review' 
  | 'accepted' 
  | 'rejected' 
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
  | 'withdrawn'

export interface Profile {
  id: string
  email: string
  name: string
  full_name?: string
  role: UserRole
  institution?: string
  field_of_study?: string
  bio?: string
  avatar_url?: string
<<<<<<< HEAD
=======
  githubUsername?: string
  linkedinUrl?: string
  slackUserId?: string
  isActive?: boolean
  mustChangePassword?: boolean
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
  created_at: string
  updated_at: string
}

export interface Opportunity {
  id: string
  title: string
  description: string
  category: OpportunityCategory
  organization: string
  location?: string
  is_remote: boolean
  deadline: string
  eligibility?: string
  requirements?: string
  benefits?: string
  application_url?: string
  image_url?: string
<<<<<<< HEAD
=======
  preview_title?: string
  preview_description?: string
  application_count?: number
  interested_count?: number
  rating_count?: number
  average_rating?: number
  popularity_score?: number
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
  posted_by?: string
  status: OpportunityStatus
  views_count: number
  created_at: string
  updated_at: string
  // Joined data
  poster?: Profile
}

export interface Application {
  id: string
  opportunity_id: string
  student_id: string
  status: ApplicationStatus
  cover_letter?: string
  resume_url?: string
  notes?: string
  submitted_at: string
  updated_at: string
  // Joined data
  opportunity?: Opportunity
  student?: Profile
}

export interface SavedOpportunity {
  id: string
  opportunity_id: string
  user_id: string
  saved_at: string
  // Joined data
  opportunity?: Opportunity
}

export const CATEGORY_LABELS: Record<OpportunityCategory, string> = {
  scholarship: 'Scholarship',
  internship: 'Internship',
  job: 'Job',
  competition: 'Competition',
  workshop: 'Workshop',
  grant: 'Grant',
  fellowship: 'Fellowship',
  other: 'Other'
}

export const CATEGORY_COLORS: Record<OpportunityCategory, string> = {
  scholarship: 'bg-chart-1/15 text-chart-1 border-chart-1/30',
  internship: 'bg-chart-2/15 text-chart-2 border-chart-2/30',
  job: 'bg-chart-3/15 text-chart-3 border-chart-3/30',
  competition: 'bg-chart-4/15 text-chart-4 border-chart-4/30',
  workshop: 'bg-chart-5/15 text-chart-5 border-chart-5/30',
  grant: 'bg-primary/15 text-primary border-primary/30',
  fellowship: 'bg-success/15 text-success border-success/30',
  other: 'bg-muted text-muted-foreground border-muted-foreground/30'
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: 'Pending',
  under_review: 'Under Review',
  accepted: 'Accepted',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn'
}

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  pending: 'bg-warning/15 text-warning border-warning/30',
  under_review: 'bg-chart-1/15 text-chart-1 border-chart-1/30',
  accepted: 'bg-success/15 text-success border-success/30',
  rejected: 'bg-destructive/15 text-destructive border-destructive/30',
  withdrawn: 'bg-muted text-muted-foreground border-muted-foreground/30'
}

// Notification Types
<<<<<<< HEAD
export type NotificationType = 'deadline_reminder' | 'status_update' | 'application_received' | 'opportunity_verified'
=======
export type NotificationType = 'deadline_reminder' | 'status_update' | 'application_received' | 'opportunity_verified' | 'opportunity_posted' | 'security_alert'
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183

export interface NotificationPreferences {
  id: string
  user_id: string
  deadline_reminders: boolean
  status_updates: boolean
  marketing: boolean
  reminder_frequency: 'daily' | 'weekly' | 'never'
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  opportunity_id?: string
  title: string
  message: string
  read_at?: string
  created_at: string
  // Joined data
  opportunity?: Opportunity
}

<<<<<<< HEAD
// Verification Types
export type VerificationStatus = 'unverified' | 'verified' | 'flagged'

export interface Verification {
  id: string
  opportunity_id: string
  teacher_id: string
  status: VerificationStatus
  notes?: string
  created_at: string
  updated_at: string
  // Joined data
  teacher?: Profile
}

=======
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
// Student Profile Types
export interface StudentProfile {
  id: string
  user_id: string
  skills: string[]
  gpa?: number
  experience_level: 'beginner' | 'intermediate' | 'advanced'
  certifications?: string[]
  career_interests?: string[]
  location_preference?: string
  created_at: string
  updated_at: string
}

// Matching Types
export interface MatchScore {
  overall_score: number
  skills_match: number
  gpa_match: number
  experience_match: number
  location_match: number
  category_match: number
}

// Analytics Types
export interface StudentStats {
  user_id: string
  total_applications: number
  accepted_count: number
  rejected_count: number
  pending_count: number
  success_rate: number
  applications_by_category: Record<OpportunityCategory, number>
  applications_over_time: Array<{ date: string; count: number }>
}

export interface TeacherStats {
  user_id: string
  opportunities_created: number
  total_applications_received: number
  applications_by_status: Record<ApplicationStatus, number>
  most_popular_opportunities: Array<{ id: string; title: string; application_count: number }>
  student_engagement_score: number
}
