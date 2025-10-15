import { AIRecommendation } from '@/types'

export interface IKIGAIFactors {
  passion: number // 1-10
  mission: number // 1-10
  profession: number // 1-10
  vocation: number // 1-10
}

export interface EnvironmentFactors {
  location: string
  language: string
  market_demand: number // 1-10
  cost_of_living: number // 1-10
  cultural_fit: number // 1-10
}

export interface UserProfile {
  interests: string[]
  skills: string[]
  experience: string[]
  goals: string[]
  preferred_location?: string
  preferred_language?: string
  budget_range?: {
    min: number
    max: number
  }
  timeline?: string
}

export interface CareerPath {
  id: string
  title: string
  description: string
  requirements: string[]
  salary_range: {
    min: number
    max: number
    currency: string
  }
  growth_potential: number // 1-10
  difficulty: number // 1-10
  ikigai_score: number
  environment_score: number
  total_score: number
}

export interface CourseRecommendation {
  id: string
  title: string
  provider: string
  duration: string
  cost: number
  level: string
  skills_gained: string[]
  relevance_score: number
  ikigai_alignment: number
}

export interface MentorRecommendation {
  id: string
  name: string
  expertise: string[]
  experience: string
  rating: number
  match_score: number
  availability: boolean
  location: string
  languages: string[]
}

export const aiService = {
  // Calculer le score IKIGAI
  calculateIKIGAIScore(factors: IKIGAIFactors): number {
    const { passion, mission, profession, vocation } = factors
    
    // Formule IKIGAI : intersection des 4 cercles
    // Plus les valeurs sont élevées et équilibrées, plus le score est élevé
    const average = (passion + mission + profession + vocation) / 4
    const balance = 1 - Math.abs(passion - mission) / 10 - Math.abs(profession - vocation) / 10
    
    return Math.round((average * balance) * 10) / 10
  },

  // Analyser le profil utilisateur et générer des recommandations
  async analyzeProfile(userProfile: UserProfile): Promise<{
    ikigai_factors: IKIGAIFactors
    career_recommendations: CareerPath[]
    course_recommendations: CourseRecommendation[]
    mentor_recommendations: MentorRecommendation[]
    environment_analysis: EnvironmentFactors[]
  }> {
    // Simulation d'analyse IA - dans un vrai projet, ceci ferait appel à une API IA
    const ikigai_factors = this.estimateIKIGAIFactors(userProfile)
    const career_recommendations = this.generateCareerRecommendations(userProfile, ikigai_factors)
    const course_recommendations = this.generateCourseRecommendations(userProfile, ikigai_factors)
    const mentor_recommendations = this.generateMentorRecommendations(userProfile, ikigai_factors)
    const environment_analysis = this.analyzeEnvironmentFactors(userProfile)

    return {
      ikigai_factors,
      career_recommendations,
      course_recommendations,
      mentor_recommendations,
      environment_analysis
    }
  },

  // Estimer les facteurs IKIGAI basés sur le profil
  estimateIKIGAIFactors(profile: UserProfile): IKIGAIFactors {
    // Analyse basée sur les intérêts, compétences et objectifs
    const techInterests = ['programming', 'data science', 'ai', 'cybersecurity', 'web development']
    const businessInterests = ['marketing', 'management', 'finance', 'entrepreneurship']
    const creativeInterests = ['design', 'art', 'writing', 'music', 'photography']
    const socialInterests = ['education', 'healthcare', 'nonprofit', 'community']

    const hasTechInterest = profile.interests.some(interest => 
      techInterests.some(tech => interest.toLowerCase().includes(tech))
    )
    const hasBusinessInterest = profile.interests.some(interest => 
      businessInterests.some(business => interest.toLowerCase().includes(business))
    )
    const hasCreativeInterest = profile.interests.some(interest => 
      creativeInterests.some(creative => interest.toLowerCase().includes(creative))
    )
    const hasSocialInterest = profile.interests.some(interest => 
      socialInterests.some(social => interest.toLowerCase().includes(social))
    )

    // Calcul basé sur les patterns détectés
    const passion = Math.min(10, Math.max(1, 
      (hasTechInterest ? 8 : 5) + 
      (hasCreativeInterest ? 2 : 0) + 
      (profile.interests.length > 3 ? 1 : 0)
    ))

    const mission = Math.min(10, Math.max(1,
      (hasSocialInterest ? 9 : 6) +
      (profile.goals.some(goal => goal.toLowerCase().includes('help') || goal.toLowerCase().includes('change')) ? 3 : 0)
    ))

    const profession = Math.min(10, Math.max(1,
      (hasBusinessInterest ? 8 : 5) +
      (hasTechInterest ? 3 : 0) +
      (profile.skills.length > 2 ? 2 : 0)
    ))

    const vocation = Math.min(10, Math.max(1,
      (profile.experience.length > 1 ? 7 : 4) +
      (profile.skills.length > 3 ? 3 : 0)
    ))

    return { passion, mission, profession, vocation }
  },

  // Générer des recommandations de parcours professionnels
  generateCareerRecommendations(profile: UserProfile, ikigai: IKIGAIFactors): CareerPath[] {
    const careers: CareerPath[] = [
      {
        id: '1',
        title: 'Data Scientist',
        description: 'Analyser des données pour extraire des insights et créer des modèles prédictifs',
        requirements: ['Python', 'Machine Learning', 'Statistiques', 'SQL'],
        salary_range: { min: 45000, max: 80000, currency: 'EUR' },
        growth_potential: 9,
        difficulty: 8,
        ikigai_score: 0,
        environment_score: 0,
        total_score: 0
      },
      {
        id: '2',
        title: 'Product Manager',
        description: 'Diriger le développement de produits numériques et coordonner les équipes',
        requirements: ['Leadership', 'Stratégie', 'Analyse de marché', 'Communication'],
        salary_range: { min: 50000, max: 90000, currency: 'EUR' },
        growth_potential: 8,
        difficulty: 7,
        ikigai_score: 0,
        environment_score: 0,
        total_score: 0
      },
      {
        id: '3',
        title: 'UX/UI Designer',
        description: 'Créer des interfaces utilisateur intuitives et esthétiques',
        requirements: ['Design', 'Prototypage', 'Recherche utilisateur', 'Outils de design'],
        salary_range: { min: 35000, max: 65000, currency: 'EUR' },
        growth_potential: 7,
        difficulty: 6,
        ikigai_score: 0,
        environment_score: 0,
        total_score: 0
      },
      {
        id: '4',
        title: 'Cybersecurity Analyst',
        description: 'Protéger les systèmes informatiques contre les menaces',
        requirements: ['Sécurité réseau', 'Analyse de vulnérabilités', 'Incident response', 'Conformité'],
        salary_range: { min: 40000, max: 75000, currency: 'EUR' },
        growth_potential: 9,
        difficulty: 8,
        ikigai_score: 0,
        environment_score: 0,
        total_score: 0
      },
      {
        id: '5',
        title: 'Digital Marketing Manager',
        description: 'Développer et exécuter des stratégies marketing digitales',
        requirements: ['SEO/SEM', 'Analytics', 'Social Media', 'Content Marketing'],
        salary_range: { min: 30000, max: 60000, currency: 'EUR' },
        growth_potential: 6,
        difficulty: 5,
        ikigai_score: 0,
        environment_score: 0,
        total_score: 0
      }
    ]

    // Calculer les scores pour chaque carrière
    return careers.map(career => {
      const ikigai_score = this.calculateCareerIKIGAIScore(career, profile, ikigai)
      const environment_score = this.calculateEnvironmentScore(career, profile)
      const total_score = (ikigai_score * 0.6) + (environment_score * 0.4)

      return {
        ...career,
        ikigai_score,
        environment_score,
        total_score
      }
    }).sort((a, b) => b.total_score - a.total_score).slice(0, 3)
  },

  // Calculer le score IKIGAI pour une carrière
  calculateCareerIKIGAIScore(career: CareerPath, profile: UserProfile, ikigai: IKIGAIFactors): number {
    let score = 0

    // Correspondance avec les compétences
    const skillMatch = career.requirements.filter(req => 
      profile.skills.some(skill => skill.toLowerCase().includes(req.toLowerCase()))
    ).length / career.requirements.length

    // Correspondance avec les intérêts
    const interestMatch = profile.interests.some(interest => 
      career.title.toLowerCase().includes(interest.toLowerCase()) ||
      career.description.toLowerCase().includes(interest.toLowerCase())
    ) ? 1 : 0.3

    // Potentiel de croissance vs ambition
    const growthMatch = Math.abs(career.growth_potential - (ikigai.profession + ikigai.vocation) / 2) / 10
    const growthScore = 1 - growthMatch

    score = (skillMatch * 0.4) + (interestMatch * 0.4) + (growthScore * 0.2)
    return Math.round(score * 100) / 100
  },

  // Calculer le score environnemental
  calculateEnvironmentScore(career: CareerPath, profile: UserProfile): number {
    let score = 0.5 // Score de base

    // Ajustement basé sur la localisation préférée
    if (profile.preferred_location) {
      // Simulation - dans un vrai projet, ceci analyserait les opportunités par région
      score += 0.2
    }

    // Ajustement basé sur la langue préférée
    if (profile.preferred_language) {
      score += 0.1
    }

    // Ajustement basé sur le budget
    if (profile.budget_range) {
      const salaryFit = (career.salary_range.min + career.salary_range.max) / 2
      const budgetFit = (profile.budget_range.min + profile.budget_range.max) / 2
      const budgetMatch = 1 - Math.abs(salaryFit - budgetFit) / Math.max(salaryFit, budgetFit)
      score += budgetMatch * 0.2
    }

    return Math.min(1, Math.max(0, score))
  },

  // Générer des recommandations de cours
  generateCourseRecommendations(profile: UserProfile, ikigai: IKIGAIFactors): CourseRecommendation[] {
    const courses: CourseRecommendation[] = [
      {
        id: '1',
        title: 'Python pour la Data Science',
        provider: 'Coursera',
        duration: '6 mois',
        cost: 39,
        level: 'Intermédiaire',
        skills_gained: ['Python', 'Pandas', 'NumPy', 'Machine Learning'],
        relevance_score: 0,
        ikigai_alignment: 0
      },
      {
        id: '2',
        title: 'Certification Google Analytics',
        provider: 'Google',
        duration: '3 mois',
        cost: 0,
        level: 'Débutant',
        skills_gained: ['Analytics', 'Reporting', 'Data Visualization'],
        relevance_score: 0,
        ikigai_alignment: 0
      },
      {
        id: '3',
        title: 'UX Design Fundamentals',
        provider: 'Udemy',
        duration: '2 mois',
        cost: 89,
        level: 'Débutant',
        skills_gained: ['User Research', 'Wireframing', 'Prototyping', 'Figma'],
        relevance_score: 0,
        ikigai_alignment: 0
      }
    ]

    // Calculer les scores pour chaque cours
    return courses.map(course => {
      const relevance_score = this.calculateCourseRelevance(course, profile)
      const ikigai_alignment = this.calculateCourseIKIGAIAlignment(course, ikigai)

      return {
        ...course,
        relevance_score,
        ikigai_alignment
      }
    }).sort((a, b) => b.relevance_score - a.relevance_score).slice(0, 3)
  },

  // Calculer la pertinence d'un cours
  calculateCourseRelevance(course: CourseRecommendation, profile: UserProfile): number {
    let score = 0

    // Correspondance avec les compétences actuelles
    const skillOverlap = course.skills_gained.filter(skill => 
      profile.skills.some(userSkill => userSkill.toLowerCase().includes(skill.toLowerCase()))
    ).length / course.skills_gained.length

    // Correspondance avec les intérêts
    const interestMatch = profile.interests.some(interest => 
      course.title.toLowerCase().includes(interest.toLowerCase())
    ) ? 1 : 0.3

    // Niveau approprié
    const levelMatch = course.level === 'Débutant' ? 1 : 
                      course.level === 'Intermédiaire' ? 0.8 : 0.6

    score = (skillOverlap * 0.3) + (interestMatch * 0.5) + (levelMatch * 0.2)
    return Math.round(score * 100) / 100
  },

  // Calculer l'alignement IKIGAI d'un cours
  calculateCourseIKIGAIAlignment(course: CourseRecommendation, ikigai: IKIGAIFactors): number {
    // Basé sur l'équilibre des facteurs IKIGAI
    const balance = 1 - Math.abs(ikigai.passion - ikigai.mission) / 10
    const growth = (ikigai.profession + ikigai.vocation) / 20
    
    return Math.round((balance * 0.6 + growth * 0.4) * 100) / 100
  },

  // Générer des recommandations de mentors
  generateMentorRecommendations(profile: UserProfile, ikigai: IKIGAIFactors): MentorRecommendation[] {
    // Simulation de mentors - dans un vrai projet, ceci ferait appel à la base de données
    const mentors: MentorRecommendation[] = [
      {
        id: '1',
        name: 'Dr. Sarah Johnson',
        expertise: ['Data Science', 'Machine Learning', 'Python'],
        experience: 'Senior Data Scientist chez Google',
        rating: 4.8,
        match_score: 0,
        availability: true,
        location: 'Paris, France',
        languages: ['Français', 'Anglais']
      },
      {
        id: '2',
        name: 'Marc Dubois',
        expertise: ['UX Design', 'Product Management', 'User Research'],
        experience: 'Product Manager chez Spotify',
        rating: 4.6,
        match_score: 0,
        availability: true,
        location: 'Lyon, France',
        languages: ['Français', 'Anglais']
      },
      {
        id: '3',
        name: 'Emma Chen',
        expertise: ['Cybersecurity', 'Network Security', 'Incident Response'],
        experience: 'Cybersecurity Consultant',
        rating: 4.9,
        match_score: 0,
        availability: false,
        location: 'Toronto, Canada',
        languages: ['Anglais', 'Mandarin']
      }
    ]

    // Calculer les scores de correspondance
    return mentors.map(mentor => {
      const match_score = this.calculateMentorMatch(mentor, profile, ikigai)
      return { ...mentor, match_score }
    }).sort((a, b) => b.match_score - a.match_score).slice(0, 3)
  },

  // Calculer la correspondance avec un mentor
  calculateMentorMatch(mentor: MentorRecommendation, profile: UserProfile, ikigai: IKIGAIFactors): number {
    let score = 0

    // Correspondance des compétences
    const expertiseMatch = mentor.expertise.filter(expertise => 
      profile.interests.some(interest => interest.toLowerCase().includes(expertise.toLowerCase())) ||
      profile.skills.some(skill => skill.toLowerCase().includes(expertise.toLowerCase()))
    ).length / mentor.expertise.length

    // Correspondance géographique
    const locationMatch = profile.preferred_location && 
                         mentor.location.toLowerCase().includes(profile.preferred_location.toLowerCase()) ? 1 : 0.5

    // Correspondance linguistique
    const languageMatch = profile.preferred_language && 
                         mentor.languages.includes(profile.preferred_language) ? 1 : 0.7

    // Disponibilité
    const availabilityMatch = mentor.availability ? 1 : 0.3

    // Rating
    const ratingScore = mentor.rating / 5

    score = (expertiseMatch * 0.4) + (locationMatch * 0.2) + (languageMatch * 0.2) + 
            (availabilityMatch * 0.1) + (ratingScore * 0.1)

    return Math.round(score * 100) / 100
  },

  // Analyser les facteurs environnementaux
  analyzeEnvironmentFactors(profile: UserProfile): EnvironmentFactors[] {
    const environments: EnvironmentFactors[] = [
      {
        location: 'France',
        language: 'Français',
        market_demand: 7,
        cost_of_living: 6,
        cultural_fit: 8
      },
      {
        location: 'Canada',
        language: 'Français/Anglais',
        market_demand: 8,
        cost_of_living: 7,
        cultural_fit: 7
      },
      {
        location: 'États-Unis',
        language: 'Anglais',
        market_demand: 9,
        cost_of_living: 8,
        cultural_fit: 5
      }
    ]

    // Filtrer et scorer basé sur les préférences utilisateur
    return environments.filter(env => {
      if (profile.preferred_location && !env.location.toLowerCase().includes(profile.preferred_location.toLowerCase())) {
        return false
      }
      if (profile.preferred_language && !env.language.toLowerCase().includes(profile.preferred_language.toLowerCase())) {
        return false
      }
      return true
    }).sort((a, b) => {
      const scoreA = (a.market_demand + a.cultural_fit) / 2
      const scoreB = (b.market_demand + b.cultural_fit) / 2
      return scoreB - scoreA
    })
  },

  // Générer des objectifs automatiques basés sur l'analyse
  generateAutomaticGoals(profile: UserProfile, ikigai: IKIGAIFactors): string[] {
    const goals = []

    // Objectifs basés sur les facteurs IKIGAI
    if (ikigai.passion > 7) {
      goals.push('Explorer des projets passionnants dans mon domaine d\'intérêt')
    }

    if (ikigai.mission > 7) {
      goals.push('Contribuer à un projet à impact social ou environnemental')
    }

    if (ikigai.profession < 6) {
      goals.push('Développer mes compétences professionnelles techniques')
    }

    if (ikigai.vocation < 6) {
      goals.push('Acquérir de l\'expérience pratique dans mon domaine')
    }

    // Objectifs basés sur le profil
    if (profile.skills.length < 3) {
      goals.push('Apprendre 3 nouvelles compétences techniques cette année')
    }

    if (!profile.preferred_location) {
      goals.push('Identifier les meilleures destinations pour mon profil')
    }

    // Objectifs administratifs automatiques
    goals.push('Préparer mon CV et mes lettres de motivation')
    goals.push('Rechercher des opportunités de stage ou d\'emploi')
    goals.push('Mettre à jour mon profil LinkedIn')

    return goals
  }
}
