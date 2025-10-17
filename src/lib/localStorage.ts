// Système de stockage local pour le développement
import { User, UserProfile, Mentor, MentoringSession, Community, Event, Scholarship } from '@/types'

// Clés pour localStorage
const KEYS = {
  USERS: 'traillearn_users',
  USER_PROFILES: 'traillearn_user_profiles',
  MENTORS: 'traillearn_mentors',
  SESSIONS: 'traillearn_sessions',
  COMMUNITIES: 'traillearn_communities',
  EVENTS: 'traillearn_events',
  SCHOLARSHIPS: 'traillearn_scholarships',
  CURRENT_USER: 'traillearn_current_user'
}

// Fonctions utilitaires pour localStorage
const getFromStorage = <T>(key: string): T[] => {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

const saveToStorage = <T>(key: string, data: T[]): void => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
  }
}

// Fonction pour initialiser les données de test
export const initDemoData = () => {
  if (typeof window === 'undefined') return
  
  // Vérifier si les données sont déjà initialisées
  const existingUsers = getFromStorage<User>(KEYS.USERS)
  if (existingUsers.length > 0) return
  
  console.log('🎯 Initialisation des données de test Traillearn...')
  
  // Créer les utilisateurs de test
  const testUsers: Omit<User, 'id' | 'created_at' | 'updated_at'>[] = [
    {
      email: 'admin@traillearn.com',
      password: 'AdminTraillearn2024!',
      name: 'Admin Traillearn',
      role: 'admin',
      is_student: true,
      is_mentor: true,
      student_status: 'active',
      mentor_status: 'approved',
      points: 1000,
      level: 'platinum',
      subscription_type: 'premium',
      referral_code: 'ADMIN-001',
      profile_completed: true,
      country_code: 'FR'
    },
    {
      email: 'visitor1@traillearn.com',
      password: 'visitor123',
      name: 'Jean Dupont',
      role: 'visitor',
      is_student: true,
      is_mentor: true,
      student_status: 'active',
      mentor_status: 'approved',
      points: 500,
      level: 'gold',
      subscription_type: 'pro',
      referral_code: 'VISITOR-002',
      profile_completed: true,
      country_code: 'FR'
    },
    {
      email: 'mentor@traillearn.com',
      password: 'mentor123',
      name: 'Marie Martin',
      role: 'visitor',
      is_student: false,
      is_mentor: true,
      student_status: 'inactive',
      mentor_status: 'approved',
      points: 300,
      level: 'silver',
      subscription_type: 'plus',
      referral_code: 'MENTOR-003',
      profile_completed: true,
      country_code: 'FR'
    },
    {
      email: 'student@traillearn.com',
      password: 'student123',
      name: 'Pierre Durand',
      role: 'visitor',
      is_student: true,
      is_mentor: false,
      student_status: 'active',
      mentor_status: 'inactive',
      points: 200,
      level: 'bronze',
      subscription_type: 'free',
      referral_code: 'STUDENT-004',
      profile_completed: true,
      country_code: 'FR'
    },
    {
      email: 'visitor@traillearn.com',
      password: 'visitor123',
      name: 'Sophie Leroy',
      role: 'visitor',
      is_student: false,
      is_mentor: false,
      student_status: 'inactive',
      mentor_status: 'inactive',
      points: 100,
      level: 'bronze',
      subscription_type: 'free',
      referral_code: 'VISITOR-005',
      profile_completed: false,
      country_code: 'FR'
    }
  ]
  
  // Créer les utilisateurs et récupérer leurs IDs
  const createdUsers: User[] = []
  testUsers.forEach(userData => {
    const user = localUserAPI.createUser(userData)
    createdUsers.push(user)
  })
  
  // Créer des mentors de test
  const testMentors: Omit<Mentor, 'id' | 'created_at' | 'updated_at'>[] = [
    {
      user_id: createdUsers.find(u => u.email === 'visitor1@traillearn.com')?.id || '',
      specialties: ['Data Science', 'Machine Learning', 'Intelligence Artificielle'],
      languages: ['French', 'English'],
      timezone: 'Europe/Paris',
      capacity_month: 15,
      hourly_rate: 45,
      currency: 'EUR',
      experience_years: 5,
      education: 'Master en Data Science',
      certifications: ['Certified Data Scientist', 'AWS Certified'],
      bio: 'Expert en data science avec 5 ans d\'expérience dans le machine learning et l\'intelligence artificielle',
      is_verified: true,
      rating: 4.8,
      total_sessions: 120,
      studentsCount: 120,
      isAvailable: true
    },
    {
      user_id: createdUsers.find(u => u.email === 'mentor@traillearn.com')?.id || '',
      specialties: ['Cybersécurité', 'Cloud Computing', 'DevOps'],
      languages: ['French', 'English', 'Spanish'],
      timezone: 'Europe/Paris',
      capacity_month: 12,
      hourly_rate: 50,
      currency: 'EUR',
      experience_years: 7,
      education: 'Master en Cybersécurité',
      certifications: ['CISSP', 'CEH', 'Security+'],
      bio: 'Spécialiste en cybersécurité et sécurité des réseaux avec expertise en cloud computing',
      is_verified: true,
      rating: 4.9,
      total_sessions: 150,
      studentsCount: 150,
      isAvailable: true
    }
  ]
  
  // Ajouter des mentors supplémentaires
  const additionalMentors: Omit<Mentor, 'id' | 'created_at' | 'updated_at'>[] = [
    {
      user_id: createdUsers.find(u => u.email === 'student@traillearn.com')?.id || '',
      specialties: ['Développement Web', 'React', 'Node.js'],
      languages: ['French', 'English'],
      timezone: 'Europe/Paris',
      capacity_month: 10,
      hourly_rate: 35,
      currency: 'EUR',
      experience_years: 3,
      education: 'Développeur Full Stack',
      certifications: ['React Certified', 'Node.js Certified'],
      bio: 'Développeur full stack passionné par les technologies web modernes',
      is_verified: true,
      rating: 4.6,
      total_sessions: 80,
      studentsCount: 80,
      isAvailable: true
    },
    {
      user_id: createdUsers.find(u => u.email === 'visitor@traillearn.com')?.id || '',
      specialties: ['Marketing Digital', 'E-commerce', 'SEO'],
      languages: ['French', 'English', 'German'],
      timezone: 'Europe/Paris',
      capacity_month: 8,
      hourly_rate: 30,
      currency: 'EUR',
      experience_years: 4,
      education: 'Master en Marketing Digital',
      certifications: ['Google Analytics', 'Facebook Ads Certified'],
      bio: 'Expert en marketing digital et stratégies e-commerce',
      is_verified: true,
      rating: 4.5,
      total_sessions: 60,
      studentsCount: 60,
      isAvailable: true
    }
  ]
  
  testMentors.forEach(mentorData => {
    localMentorAPI.createMentor(mentorData)
  })
  
  additionalMentors.forEach(mentorData => {
    localMentorAPI.createMentor(mentorData)
  })
  
  console.log('✅ Données de test initialisées avec succès!')
  console.log('👥 Comptes créés:')
  console.log('• admin@traillearn.com (Admin)')
  console.log('• visitor1@traillearn.com (Double profil)')
  console.log('• mentor@traillearn.com (Mentor)')
  console.log('• student@traillearn.com (Étudiant)')
  console.log('• visitor@traillearn.com (Visiteur)')
}

// API locale pour les utilisateurs
export const localUserAPI = {
  // Créer un utilisateur
  createUser: (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): User => {
    const users = getFromStorage<User>(KEYS.USERS)
    const newUser: User = {
      ...userData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    users.push(newUser)
    saveToStorage(KEYS.USERS, users)
    
    // Créer le profil utilisateur
    const profile: UserProfile = {
      id: crypto.randomUUID(),
      user_id: newUser.id,
      bio: '',
      current_education_level: userData.role === 'student' ? 'high_school' : undefined,
      career_goals: [],
      interests: [],
      languages: [],
      skills: [],
      experience: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const profiles = getFromStorage<UserProfile>(KEYS.USER_PROFILES)
    profiles.push(profile)
    saveToStorage(KEYS.USER_PROFILES, profiles)
    
    // Si c'est un mentor, créer l'entrée mentor
    if (userData.role === 'mentor') {
      const mentor: Mentor = {
        id: crypto.randomUUID(),
        user_id: newUser.id,
        expertise_areas: [],
        experience_years: 0,
        rating: 0,
        studentsCount: 0,
        is_verified: false,
        created_at: new Date().toISOString()
      }
      
      const mentors = getFromStorage<Mentor>(KEYS.MENTORS)
      mentors.push(mentor)
      saveToStorage(KEYS.MENTORS, mentors)
    }
    
    return newUser
  },

  // Trouver un utilisateur par email
  findByEmail: (email: string): User | null => {
    const users = getFromStorage<User>(KEYS.USERS)
    return users.find(user => user.email === email) || null
  },

  // Trouver un utilisateur par ID
  findById: (id: string): User | null => {
    const users = getFromStorage<User>(KEYS.USERS)
    return users.find(user => user.id === id) || null
  },

  // Mettre à jour un utilisateur
  updateUser: (id: string, updates: Partial<User>): User | null => {
    const users = getFromStorage<User>(KEYS.USERS)
    const userIndex = users.findIndex(user => user.id === id)
    
    if (userIndex === -1) return null
    
    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    saveToStorage(KEYS.USERS, users)
    return users[userIndex]
  },

  // Obtenir tous les utilisateurs
  getAllUsers: (): User[] => {
    return getFromStorage<User>(KEYS.USERS)
  },

  // Obtenir les utilisateurs par rôle
  getUsersByRole: (role: 'admin' | 'mentor' | 'student'): User[] => {
    const users = getFromStorage<User>(KEYS.USERS)
    return users.filter(user => user.role === role)
  }
}

// API locale pour les profils
export const localProfileAPI = {
  // Obtenir un profil par user_id
  getByUserId: (userId: string): UserProfile | null => {
    const profiles = getFromStorage<UserProfile>(KEYS.USER_PROFILES)
    return profiles.find(profile => profile.user_id === userId) || null
  },

  // Mettre à jour un profil
  updateProfile: (userId: string, updates: Partial<UserProfile>): UserProfile | null => {
    const profiles = getFromStorage<UserProfile>(KEYS.USER_PROFILES)
    const profileIndex = profiles.findIndex(profile => profile.user_id === userId)
    
    if (profileIndex === -1) return null
    
    profiles[profileIndex] = {
      ...profiles[profileIndex],
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    saveToStorage(KEYS.USER_PROFILES, profiles)
    return profiles[profileIndex]
  }
}

// API locale pour les mentors
export const localMentorAPI = {
  // Obtenir tous les mentors
  getAllMentors: (): Mentor[] => {
    return getFromStorage<Mentor>(KEYS.MENTORS)
  },

  // Obtenir un mentor par user_id
  getByUserId: (userId: string): Mentor | null => {
    const mentors = getFromStorage<Mentor>(KEYS.MENTORS)
    return mentors.find(mentor => mentor.user_id === userId) || null
  },

  // Obtenir un mentor par ID
  getMentorById: (mentorId: string): Mentor | null => {
    const mentors = getFromStorage<Mentor>(KEYS.MENTORS)
    return mentors.find(mentor => mentor.id === mentorId) || null
  },

  // Mettre à jour un mentor
  updateMentor: (userId: string, updates: Partial<Mentor>): Mentor | null => {
    const mentors = getFromStorage<Mentor>(KEYS.MENTORS)
    const mentorIndex = mentors.findIndex(mentor => mentor.user_id === userId)
    
    if (mentorIndex === -1) return null
    
    mentors[mentorIndex] = {
      ...mentors[mentorIndex],
      ...updates
    }
    
    saveToStorage(KEYS.MENTORS, mentors)
    return mentors[mentorIndex]
  }
}

// API locale pour les sessions
export const localSessionAPI = {
  // Créer une session
  createSession: (sessionData: Omit<MentoringSession, 'id' | 'created_at'>): MentoringSession => {
    const sessions = getFromStorage<MentoringSession>(KEYS.SESSIONS)
    const newSession: MentoringSession = {
      ...sessionData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    }
    
    sessions.push(newSession)
    saveToStorage(KEYS.SESSIONS, sessions)
    return newSession
  },

  // Obtenir les sessions d'un utilisateur
  getSessionsByUser: (userId: string, role: 'mentor' | 'mentee'): MentoringSession[] => {
    const sessions = getFromStorage<MentoringSession>(KEYS.SESSIONS)
    return sessions.filter(session => 
      role === 'mentor' ? session.mentor_id === userId : session.mentee_id === userId
    )
  },

  // Mettre à jour une session
  updateSession: (sessionId: string, updates: Partial<MentoringSession>): MentoringSession | null => {
    const sessions = getFromStorage<MentoringSession>(KEYS.SESSIONS)
    const sessionIndex = sessions.findIndex(session => session.id === sessionId)
    
    if (sessionIndex === -1) return null
    
    sessions[sessionIndex] = {
      ...sessions[sessionIndex],
      ...updates
    }
    
    saveToStorage(KEYS.SESSIONS, sessions)
    return sessions[sessionIndex]
  }
}

// Gestion de l'utilisateur actuel
export const localAuthAPI = {
  // Se connecter
  signIn: (email: string, password: string): { user: User | null; error: string | null } => {
    const user = localUserAPI.findByEmail(email)
    
    if (!user) {
      return { user: null, error: 'Utilisateur non trouvé' }
    }
    
    // Pour le développement, on accepte n'importe quel mot de passe
    // En production, il faudrait vérifier le hash du mot de passe
    
    // Sauvegarder l'utilisateur actuel
    if (typeof window !== 'undefined') {
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user))
    }
    
    return { user, error: null }
  },

  // Se déconnecter
  signOut: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(KEYS.CURRENT_USER)
    }
  },

  // Obtenir l'utilisateur actuel
  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null
    
    try {
      const data = localStorage.getItem(KEYS.CURRENT_USER)
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  },

  // S'inscrire
  signUp: (email: string, password: string, userData: {
    firstName: string
    lastName: string
    role: 'admin' | 'mentor' | 'student'
    countryCode?: string
  }): { user: User | null; error: string | null } => {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = localUserAPI.findByEmail(email)
    if (existingUser) {
      return { user: null, error: 'Un utilisateur avec cet email existe déjà' }
    }

    // Créer l'utilisateur
    const newUser = localUserAPI.createUser({
      email,
      first_name: userData.firstName,
      last_name: userData.lastName,
      role: userData.role,
      country_code: userData.countryCode,
      profile_completed: false,
      email_verified: true, // Pour le développement
      two_factor_enabled: false
    })

    // Sauvegarder l'utilisateur actuel
    if (typeof window !== 'undefined') {
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(newUser))
    }

    return { user: newUser, error: null }
  }
}

// Données de démonstration
export const seedDemoData = () => {
  // Vérifier si les données existent déjà
  if (getFromStorage<User>(KEYS.USERS).length > 0) {
    return
  }

  console.log('🌱 Création des données de démonstration...')

  // Créer un admin
  const admin = localUserAPI.createUser({
    email: 'admin@traillearn.com',
    password: 'AdminTraillearn2024!',
    name: 'Admin Traillearn',
    role: 'admin',
    is_student: true,
    is_mentor: true,
    student_status: 'active',
    mentor_status: 'approved',
    points: 1000,
    level: 'platinum',
    subscription_type: 'premium',
    referral_code: 'ADMIN-001',
    profile_completed: true,
    country_code: 'FR'
  })

  // Créer visitor1 (double profil)
  const visitor1 = localUserAPI.createUser({
    email: 'visitor1@traillearn.com',
    password: 'visitor123',
    name: 'Jean Dupont',
    role: 'visitor',
    is_student: true,
    is_mentor: true,
    student_status: 'active',
    mentor_status: 'approved',
    points: 500,
    level: 'gold',
    subscription_type: 'pro',
    referral_code: 'VISITOR-002',
    profile_completed: true,
    country_code: 'FR'
  })

  // Créer mentor
  const mentor = localUserAPI.createUser({
    email: 'mentor@traillearn.com',
    password: 'mentor123',
    name: 'Marie Martin',
    role: 'visitor',
    is_student: false,
    is_mentor: true,
    student_status: 'inactive',
    mentor_status: 'approved',
    points: 300,
    level: 'silver',
    subscription_type: 'plus',
    referral_code: 'MENTOR-003',
    profile_completed: true,
    country_code: 'FR'
  })

  // Créer student
  const student = localUserAPI.createUser({
    email: 'student@traillearn.com',
    password: 'student123',
    name: 'Pierre Durand',
    role: 'visitor',
    is_student: true,
    is_mentor: false,
    student_status: 'active',
    mentor_status: 'inactive',
    points: 200,
    level: 'bronze',
    subscription_type: 'free',
    referral_code: 'STUDENT-004',
    profile_completed: true,
    country_code: 'FR'
  })

  // Créer visitor
  const visitor = localUserAPI.createUser({
    email: 'visitor@traillearn.com',
    password: 'visitor123',
    name: 'Sophie Leroy',
    role: 'visitor',
    is_student: false,
    is_mentor: false,
    student_status: 'inactive',
    mentor_status: 'inactive',
    points: 100,
    level: 'bronze',
    subscription_type: 'free',
    referral_code: 'VISITOR-005',
    profile_completed: false,
    country_code: 'FR'
  })

  console.log('✅ Données de démonstration créées!')
  console.log('👤 Comptes de test:')
  console.log('   Admin: admin@traillearn.com (AdminTraillearn2024!)')
  console.log('   Visitor1: visitor1@traillearn.com (visitor123)')
  console.log('   Mentor: mentor@traillearn.com (mentor123)')
  console.log('   Student: student@traillearn.com (student123)')
  console.log('   Visitor: visitor@traillearn.com (visitor123)')
}


