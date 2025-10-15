export interface User {
  id: string
  email: string
  name: string
  first_name?: string
  last_name?: string
  role: UserRole
  // Nouvelles propriétés pour le système multi-rôles
  is_student?: boolean
  is_mentor?: boolean
  student_status?: 'pending' | 'active' | 'inactive'
  mentor_status?: 'pending' | 'approved' | 'rejected' | 'inactive'
  mentor_validation_date?: string
  mentor_validation_notes?: string
  // Système de points et niveaux
  points: number
  level: UserLevel
  referral_code?: string
  referred_by?: string
  // Abonnements
  subscription_type: SubscriptionType
  subscription_expires_at?: string
  // Données supplémentaires
  phone?: string
  country_code?: string
  created_at: string
  updated_at?: string
  lastLogin?: string
  isActive: boolean
}

export type UserRole = 'admin' | 'visitor'
export type UserLevel = 'bronze' | 'silver' | 'gold' | 'platinum'
export type SubscriptionType = 'free' | 'plus' | 'pro' | 'premium'

export interface UserProfile {
  id: string
  userId: string
  bio?: string
  avatar?: string
  phone?: string
  location?: string
  dateOfBirth?: string
  education?: string
  experience?: string
  languages?: string[]
  interests?: string[]
  goals?: string[]
  createdAt: string
  updatedAt: string
}

export interface Mentor {
  id: string
  user_id: string
  name: string
  email: string
  bio: string
  specialties: string[]
  hourly_rate: number
  rating: number
  studentsCount: number
  experience: string
  education: string
  languages: string[]
  educationLevels: string[]
  isVerified: boolean
  isAvailable: boolean
  user?: {
    first_name?: string
    last_name?: string
  }
  created_at: string
  updated_at: string
}

export interface MentorProfile {
  id: string
  userId: string
  name: string
  email: string
  bio: string
  specialties: string[]
  hourly_rate: number
  rating: number
  studentsCount: number
  experience: string
  education: string
  languages: string[]
  educationLevels: string[]
  isVerified: boolean
  isAvailable: boolean
  created_at: string
  updated_at: string
}

export interface MentoringSession {
  id: string
  mentorId: string
  studentId: string
  subject: string
  date: string
  time: string
  duration: number
  status: 'scheduled' | 'completed' | 'cancelled' | 'in_progress'
  notes?: string
  rating?: number
  feedback?: string
  created_at: string
  updated_at: string
}

export interface Community {
  id: string
  name: string
  description: string
  category: string
  membersCount: number
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  maxParticipants: number
  currentParticipants: number
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface Scholarship {
  id: string
  title: string
  description: string
  amount: number
  deadline: string
  requirements: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: string
  isRead: boolean
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  isRead: boolean
  action_url?: string
  createdAt: string
}

export interface Goal {
  id: string
  userId: string
  title: string
  description: string
  targetDate: string
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled'
  progress: number
  // Nouvelles propriétés pour l'IA
  is_ai_generated?: boolean
  category?: 'academic' | 'career' | 'administrative' | 'personal'
  priority?: 'low' | 'medium' | 'high'
  reminders?: string[]
  createdAt: string
  updatedAt: string
}

// Nouveaux types pour les fonctionnalités étendues

export interface ScholarshipExtended {
  id: string
  title: string
  description: string
  amount: number
  currency: string
  deadline: string
  requirements: string[]
  country: string
  level: string // undergraduate, graduate, phd
  fields_of_study: string[]
  language_requirements: string[]
  application_opening_date?: string
  isActive: boolean
  // Nouvelles propriétés
  university?: string
  program_type?: string
  duration_months?: number
  eligibility_criteria: string[]
  application_process: string[]
  documents_required: string[]
  created_at: string
  updated_at: string
}

export interface ScholarshipFavorite {
  id: string
  userId: string
  scholarshipId: string
  created_at: string
}

export interface ScholarshipAlert {
  id: string
  userId: string
  name: string
  filters: {
    countries?: string[]
    levels?: string[]
    fields?: string[]
    languages?: string[]
    min_amount?: number
    max_amount?: number
    deadline_before?: string
  }
  is_active: boolean
  last_triggered?: string
  created_at: string
  updated_at: string
}

export interface JobAlert {
  id: string
  userId: string
  title: string
  country: string
  domain: string
  experience_level?: string
  salary_range?: {
    min: number
    max: number
    currency: string
  }
  status: 'active' | 'paused' | 'fulfilled' | 'cancelled'
  mentor_id?: string
  mentor_commission?: number
  platform_commission?: number
  created_at: string
  updated_at: string
}

export interface IntegrationAssistance {
  id: string
  userId: string
  destination_country: string
  destination_city: string
  mentor_id?: string
  status: 'requested' | 'assigned' | 'in_progress' | 'completed'
  airport_pickup?: boolean
  accommodation_help?: boolean
  local_contacts_shared?: boolean
  cultural_activities?: boolean
  checklist_items: IntegrationChecklistItem[]
  rating?: number
  feedback?: string
  created_at: string
  updated_at: string
}

export interface IntegrationChecklistItem {
  id: string
  integration_id: string
  title: string
  description: string
  category: 'arrival' | 'accommodation' | 'administrative' | 'cultural' | 'social'
  is_completed: boolean
  completed_by_mentor: boolean
  completed_date?: string
  notes?: string
}

export interface Forum {
  id: string
  name: string
  description: string
  category: 'country' | 'university' | 'field' | 'general'
  category_value: string // nom du pays, université, domaine
  owner_id: string
  moderator_ids: string[]
  is_public: boolean
  status: 'pending' | 'approved' | 'rejected'
  admin_notes?: string
  members_count: number
  posts_count: number
  created_at: string
  updated_at: string
}

export interface ForumPost {
  id: string
  forum_id: string
  author_id: string
  title: string
  content: string
  is_pinned: boolean
  is_locked: boolean
  likes_count: number
  replies_count: number
  status: 'active' | 'hidden' | 'deleted'
  moderation_notes?: string
  created_at: string
  updated_at: string
}

export interface EventExtended {
  id: string
  title: string
  description: string
  type: 'webinar' | 'bootcamp' | 'conference' | 'workshop' | 'networking'
  date: string
  time: string
  duration_minutes: number
  location: string
  is_online: boolean
  meeting_link?: string
  max_participants: number
  current_participants: number
  registration_deadline: string
  is_public: boolean
  organizer_id: string
  // Nouvelles propriétés
  category: string
  target_audience: string[]
  prerequisites?: string[]
  materials_provided?: string[]
  recording_available?: boolean
  recording_url?: string
  created_at: string
  updated_at: string
}

export interface EventRegistration {
  id: string
  event_id: string
  user_id: string
  registration_date: string
  status: 'registered' | 'attended' | 'cancelled' | 'no_show'
  reminder_sent: boolean
  feedback_provided?: boolean
  rating?: number
  feedback?: string
}

export interface MentorProfileExtended {
  id: string
  userId: string
  name: string
  email: string
  bio: string
  specialties: string[]
  hourly_rate: number
  rating: number
  studentsCount: number
  experience: string
  education: string
  languages: string[]
  educationLevels: string[]
  isVerified: boolean
  isAvailable: boolean
  // Nouvelles propriétés
  capacity_per_month: number
  timezone: string
  countries_served: string[]
  integration_services: boolean
  job_assistance: boolean
  academic_coaching: boolean
  career_coaching: boolean
  verification_documents?: string[]
  interview_completed: boolean
  interview_notes?: string
  badges: MentorBadge[]
  referral_code: string
  total_referrals: number
  success_rate: number
  created_at: string
  updated_at: string
}

export interface MentorBadge {
  id: string
  name: string
  level: 'bronze' | 'silver' | 'gold' | 'platinum'
  category: 'mentoring' | 'referrals' | 'events' | 'content' | 'ai_contribution'
  earned_date: string
  description: string
}

export interface MentoringSessionExtended {
  id: string
  mentorId: string
  studentId: string
  subject: string
  date: string
  time: string
  duration: number
  status: 'scheduled' | 'completed' | 'cancelled' | 'in_progress'
  notes?: string
  rating?: number
  feedback?: string
  // Nouvelles propriétés pour le suivi
  session_type: 'academic' | 'career' | 'integration' | 'job_preparation'
  objectives: string[]
  outcomes: string[]
  checklist_items: SessionChecklistItem[]
  follow_up_required: boolean
  follow_up_date?: string
  created_at: string
  updated_at: string
}

export interface SessionChecklistItem {
  id: string
  session_id: string
  title: string
  description: string
  is_completed: boolean
  completed_by: 'mentor' | 'student'
  completed_date?: string
}

export interface AIRecommendation {
  id: string
  userId: string
  type: 'career_path' | 'scholarship' | 'course' | 'certification' | 'mentor' | 'goal'
  title: string
  description: string
  relevance_score: number
  ikigai_factors: {
    passion: number
    mission: number
    profession: number
    vocation: number
  }
  environment_factors: {
    location: string
    language: string
    market_demand: number
    cost_of_living: number
  }
  is_accepted: boolean
  feedback?: string
  created_at: string
  updated_at: string
}

export interface PaymentTransaction {
  id: string
  user_id: string
  type: 'subscription' | 'mentor_payment' | 'commission' | 'bonus'
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  payment_method: 'paypal' | 'stripe' | 'bank_transfer'
  external_transaction_id?: string
  description: string
  metadata?: any
  created_at: string
  updated_at: string
}

export interface FeedbackRating {
  id: string
  from_user_id: string
  to_user_id: string
  type: 'mentor_rating' | 'student_rating' | 'platform_rating'
  rating: number // 1-5
  comment: string
  categories: {
    communication: number
    expertise: number
    helpfulness: number
    punctuality: number
  }
  is_verified: boolean
  created_at: string
  updated_at: string
}