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
    first_name: 'Admin',
    last_name: 'Traillearn',
    role: 'admin',
    profile_completed: true,
    email_verified: true,
    two_factor_enabled: false
  })

  // Créer des mentors
  const mentor1 = localUserAPI.createUser({
    email: 'mentor1@traillearn.com',
    first_name: 'Sarah',
    last_name: 'Johnson',
    role: 'mentor',
    country_code: 'USA',
    profile_completed: true,
    email_verified: true,
    two_factor_enabled: false
  })

  const mentor2 = localUserAPI.createUser({
    email: 'mentor2@traillearn.com',
    first_name: 'Ahmed',
    last_name: 'Benali',
    role: 'mentor',
    country_code: 'FRA',
    profile_completed: true,
    email_verified: true,
    two_factor_enabled: false
  })

  // Créer des étudiants
  const student1 = localUserAPI.createUser({
    email: 'student1@traillearn.com',
    first_name: 'Marie',
    last_name: 'Dubois',
    role: 'student',
    country_code: 'FRA',
    profile_completed: true,
    email_verified: true,
    two_factor_enabled: false
  })

  const student2 = localUserAPI.createUser({
    email: 'student2@traillearn.com',
    first_name: 'John',
    last_name: 'Smith',
    role: 'student',
    country_code: 'USA',
    profile_completed: true,
    email_verified: true,
    two_factor_enabled: false
  })

  // Mettre à jour les profils des mentors
  const mentor1Profile = localProfileAPI.getByUserId(mentor1.id)
  if (mentor1Profile) {
    localProfileAPI.updateProfile(mentor1.id, {
      bio: 'Senior Software Engineer avec 8 ans d\'expérience en développement web',
      current_education_level: 'professional',
      field_of_study: 'Computer Science',
      career_goals: ['Mentor de jeunes développeurs'],
      interests: ['Web Development', 'JavaScript', 'React'],
      languages: [
        { code: 'en', level: 'native' },
        { code: 'fr', level: 'fluent' }
      ],
      skills: [
        { name: 'JavaScript', level: 'expert' },
        { name: 'React', level: 'expert' },
        { name: 'Node.js', level: 'advanced' }
      ]
    })
  }

  const mentor2Profile = localProfileAPI.getByUserId(mentor2.id)
  if (mentor2Profile) {
    localProfileAPI.updateProfile(mentor2.id, {
      bio: 'Consultant en orientation académique et professionnelle',
      current_education_level: 'professional',
      field_of_study: 'Education',
      career_goals: ['Aider les étudiants dans leur orientation'],
      interests: ['Education', 'Career Development', 'International Studies'],
      languages: [
        { code: 'fr', level: 'native' },
        { code: 'en', level: 'fluent' },
        { code: 'ar', level: 'native' }
      ],
      skills: [
        { name: 'Career Counseling', level: 'expert' },
        { name: 'Academic Planning', level: 'expert' },
        { name: 'International Education', level: 'advanced' }
      ]
    })
  }

  // Mettre à jour les mentors
  const mentor1Data = localMentorAPI.getByUserId(mentor1.id)
  if (mentor1Data) {
    localMentorAPI.updateMentor(mentor1.id, {
      expertise_areas: ['Web Development', 'JavaScript', 'React', 'Career Development'],
      experience_years: 8,
      hourly_rate: 50,
      rating: 4.8,
      studentsCount: 45,
      is_verified: true,
      isAvailable: true
    })
  }

  const mentor2Data = localMentorAPI.getByUserId(mentor2.id)
  if (mentor2Data) {
    localMentorAPI.updateMentor(mentor2.id, {
      expertise_areas: ['Academic Orientation', 'Career Development', 'International Studies'],
      experience_years: 12,
      hourly_rate: 40,
      rating: 4.9,
      studentsCount: 78,
      is_verified: true,
      isAvailable: true
    })
  }

  // Créer des sessions de démonstration
  localSessionAPI.createSession({
    mentor_id: mentor1Data?.id || '',
    mentee_id: student1.id,
    title: 'Orientation carrière en Data Science',
    description: 'Discussion sur les opportunités en Data Science',
    scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Demain
    duration_minutes: 60,
    status: 'scheduled'
  })

  localSessionAPI.createSession({
    mentor_id: mentor2Data?.id || '',
    mentee_id: student2.id,
    title: 'Préparation études à l\'étranger',
    description: 'Conseils pour étudier en France',
    scheduled_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Après-demain
    duration_minutes: 45,
    status: 'scheduled'
  })

  console.log('✅ Données de démonstration créées!')
  console.log('👤 Comptes de test:')
  console.log('   Admin: admin@traillearn.com')
  console.log('   Mentor 1: mentor1@traillearn.com')
  console.log('   Mentor 2: mentor2@traillearn.com')
  console.log('   Étudiant 1: student1@traillearn.com')
  console.log('   Étudiant 2: student2@traillearn.com')
  console.log('   Mot de passe pour tous: password123')
}


