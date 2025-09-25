export interface User {
  id: string
  email: string
  name: string
  first_name?: string
  last_name?: string
  role: UserRole
  created_at: string
  updated_at?: string
  lastLogin?: string
  isActive: boolean
}

export type UserRole = 'admin' | 'mentor' | 'student'

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
  createdAt: string
  updatedAt: string
}