'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { aiService, IKIGAIFactors, UserProfile, CareerPath, CourseRecommendation, MentorRecommendation, EnvironmentFactors } from '@/lib/aiService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BackToDashboardButton } from '@/components/ui/back-button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  Brain, 
  Target, 
  BookOpen, 
  Users, 
  MapPin, 
  TrendingUp, 
  Star,
  Clock,
  DollarSign,
  GraduationCap,
  Award,
  Lightbulb,
  BarChart3,
  Globe,
  Zap
} from 'lucide-react'

export default function AIOrientationPage() {
  const { user } = useAuthStore()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [ikigaiFactors, setIkigaiFactors] = useState<IKIGAIFactors | null>(null)
  const [careerRecommendations, setCareerRecommendations] = useState<CareerPath[]>([])
  const [courseRecommendations, setCourseRecommendations] = useState<CourseRecommendation[]>([])
  const [mentorRecommendations, setMentorRecommendations] = useState<MentorRecommendation[]>([])
  const [environmentAnalysis, setEnvironmentAnalysis] = useState<EnvironmentFactors[]>([])
  const [automaticGoals, setAutomaticGoals] = useState<string[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile>({
    interests: [],
    skills: [],
    experience: [],
    goals: []
  })

  useEffect(() => {
    if (user) {
      // Charger le profil utilisateur (simulation)
      setUserProfile({
        interests: ['Data Science', 'Machine Learning', 'Python', 'Web Development'],
        skills: ['Python', 'JavaScript', 'SQL', 'React'],
        experience: ['Stage développeur web', 'Projet personnel de ML'],
        goals: ['Devenir Data Scientist', 'Travailler à l\'international', 'Contribuer à des projets open source'],
        preferred_location: 'France',
        preferred_language: 'Français',
        budget_range: { min: 30000, max: 60000 },
        timeline: '6-12 mois'
      })
    }
  }, [user])

  const runAIAnalysis = async () => {
    if (!user) return

    setIsAnalyzing(true)
    try {
      // Simulation d'un délai d'analyse
      await new Promise(resolve => setTimeout(resolve, 3000))

      const analysis = await aiService.analyzeProfile(userProfile)
      
      setIkigaiFactors(analysis.ikigai_factors)
      setCareerRecommendations(analysis.career_recommendations)
      setCourseRecommendations(analysis.course_recommendations)
      setMentorRecommendations(analysis.mentor_recommendations)
      setEnvironmentAnalysis(analysis.environment_analysis)
      
      // Générer des objectifs automatiques
      const goals = aiService.generateAutomaticGoals(userProfile, analysis.ikigai_factors)
      setAutomaticGoals(goals)
      
      setAnalysisComplete(true)
    } catch (error) {
      console.error('Erreur lors de l\'analyse IA:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getIKIGAIScore = (): number => {
    if (!ikigaiFactors) return 0
    return aiService.calculateIKIGAIScore(ikigaiFactors)
  }

  const getScoreColor = (score: number): string => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBackground = (score: number): string => {
    if (score >= 8) return 'bg-green-100'
    if (score >= 6) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const formatCurrency = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount)
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6 text-center">
        <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Connexion requise</h2>
        <p className="text-gray-600">Vous devez être connecté pour accéder à l'IA d'orientation.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Brain className="h-8 w-8 text-blue-600" />
              🧠 IA d'Orientation IKIGAI
            </h1>
            <p className="text-gray-600 mt-2">
              Découvrez votre vocation grâce à l'analyse IA basée sur la méthode IKIGAI
            </p>
          </div>
          <BackToDashboardButton />
        </div>
      </div>

      {!analysisComplete ? (
        <Card>
          <CardHeader>
            <CardTitle>Analyse de Votre Profil</CardTitle>
            <CardDescription>
              Notre IA va analyser votre profil pour vous proposer des recommandations personnalisées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Vos Intérêts</h3>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.interests.map((interest, index) => (
                      <Badge key={index} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Vos Compétences</h3>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.skills.map((skill, index) => (
                      <Badge key={index} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Vos Objectifs</h3>
                  <ul className="space-y-1">
                    {userProfile.goals.map((goal, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <Target className="h-4 w-4 text-blue-500 mt-0.5" />
                        {goal}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Préférences</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{userProfile.preferred_location || 'Non spécifié'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <span>{userProfile.preferred_language || 'Non spécifié'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span>
                        {userProfile.budget_range ? 
                          `${formatCurrency(userProfile.budget_range.min, 'EUR')} - ${formatCurrency(userProfile.budget_range.max, 'EUR')}` :
                          'Non spécifié'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Button 
                  onClick={runAIAnalysis}
                  disabled={isAnalyzing}
                  size="lg"
                  className="px-8"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyse en cours...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Lancer l'Analyse IA
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Score IKIGAI Global */}
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-blue-600" />
                Votre Score IKIGAI
              </CardTitle>
              <CardDescription>
                Basé sur l'intersection de vos passions, mission, profession et vocation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-3xl font-bold ${getScoreBackground(getIKIGAIScore())} ${getScoreColor(getIKIGAIScore())}`}>
                  {getIKIGAIScore()}
                </div>
                <p className="text-lg font-semibold">
                  {getIKIGAIScore() >= 8 ? 'Excellent alignement !' :
                   getIKIGAIScore() >= 6 ? 'Bon alignement' :
                   'Allez plus loin dans votre réflexion'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Détails des facteurs IKIGAI */}
          <Card>
            <CardHeader>
              <CardTitle>Analyse Détaillée IKIGAI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600 mb-2">{ikigaiFactors?.passion}/10</div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Passion</div>
                  <Progress value={ikigaiFactors?.passion ? ikigaiFactors.passion * 10 : 0} className="h-2" />
                  <div className="text-xs text-gray-500 mt-1">Ce que vous aimez</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-2">{ikigaiFactors?.mission}/10</div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Mission</div>
                  <Progress value={ikigaiFactors?.mission ? ikigaiFactors.mission * 10 : 0} className="h-2" />
                  <div className="text-xs text-gray-500 mt-1">Ce dont le monde a besoin</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">{ikigaiFactors?.profession}/10</div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Profession</div>
                  <Progress value={ikigaiFactors?.profession ? ikigaiFactors.profession * 10 : 0} className="h-2" />
                  <div className="text-xs text-gray-500 mt-1">Ce pour quoi vous êtes payé</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-2">{ikigaiFactors?.vocation}/10</div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Vocation</div>
                  <Progress value={ikigaiFactors?.vocation ? ikigaiFactors.vocation * 10 : 0} className="h-2" />
                  <div className="text-xs text-gray-500 mt-1">Ce pour quoi vous êtes doué</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommandations */}
          <Tabs defaultValue="careers" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="careers">Parcours</TabsTrigger>
              <TabsTrigger value="courses">Formations</TabsTrigger>
              <TabsTrigger value="mentors">Mentors</TabsTrigger>
              <TabsTrigger value="environment">Environnement</TabsTrigger>
            </TabsList>

            <TabsContent value="careers" className="space-y-6">
              <h2 className="text-2xl font-bold">Parcours Professionnels Recommandés</h2>
              <div className="grid gap-6">
                {careerRecommendations.map((career, index) => (
                  <Card key={career.id} className={index === 0 ? 'border-2 border-green-200 bg-green-50/50' : ''}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {index === 0 && <Star className="h-5 w-5 text-yellow-500" />}
                            {career.title}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            {career.description}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="ml-4">
                          Score: {Math.round(career.total_score * 100)}%
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <h4 className="font-medium mb-2">Compétences Requises</h4>
                          <div className="flex flex-wrap gap-2">
                            {career.requirements.map((req, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {req}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Salaire Moyen</h4>
                          <div className="text-lg font-semibold text-green-600">
                            {formatCurrency(career.salary_range.min, career.salary_range.currency)} - {formatCurrency(career.salary_range.max, career.salary_range.currency)}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <TrendingUp className="h-4 w-4 text-blue-500" />
                            <span className="text-sm text-gray-600">
                              Potentiel: {career.growth_potential}/10
                            </span>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Scores</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>IKIGAI:</span>
                              <span className={getScoreColor(career.ikigai_score * 10)}>
                                {Math.round(career.ikigai_score * 100)}%
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Environnement:</span>
                              <span className={getScoreColor(career.environment_score * 10)}>
                                {Math.round(career.environment_score * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="courses" className="space-y-6">
              <h2 className="text-2xl font-bold">Formations Recommandées</h2>
              <div className="grid gap-4">
                {courseRecommendations.map((course) => (
                  <Card key={course.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-4 w-4 text-blue-500" />
                              <span>{course.provider}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-green-500" />
                              <span>{course.duration}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-yellow-500" />
                              <span>{course.cost === 0 ? 'Gratuit' : `${course.cost}€`}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Award className="h-4 w-4 text-purple-500" />
                              <span>{course.level}</span>
                            </div>
                          </div>
                          <div className="mt-3">
                            <h4 className="font-medium mb-2">Compétences acquises:</h4>
                            <div className="flex flex-wrap gap-2">
                              {course.skills_gained.map((skill, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <Badge variant="outline">
                            {Math.round(course.relevance_score * 100)}% pertinent
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="mentors" className="space-y-6">
              <h2 className="text-2xl font-bold">Mentors Recommandés</h2>
              <div className="grid gap-4">
                {mentorRecommendations.map((mentor) => (
                  <Card key={mentor.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold">{mentor.name}</h3>
                              <p className="text-sm text-gray-600">{mentor.experience}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <h4 className="font-medium mb-2">Expertise</h4>
                              <div className="flex flex-wrap gap-1">
                                {mentor.expertise.map((exp, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {exp}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-2">Localisation</h4>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                <span>{mentor.location}</span>
                              </div>
                              <div className="mt-1">
                                <span className="text-xs text-gray-500">
                                  {mentor.languages.join(', ')}
                                </span>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-2">Disponibilité</h4>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${mentor.availability ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span>{mentor.availability ? 'Disponible' : 'Occupé'}</span>
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm">{mentor.rating}/5</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-4 text-right">
                          <Badge variant="outline">
                            {Math.round(mentor.match_score * 100)}% match
                          </Badge>
                          <Button size="sm" className="mt-2">
                            Contacter
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="environment" className="space-y-6">
              <h2 className="text-2xl font-bold">Analyse Environnementale</h2>
              <div className="grid gap-4">
                {environmentAnalysis.map((env, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                              <MapPin className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold">{env.location}</h3>
                              <p className="text-sm text-gray-600">Langue: {env.language}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">{env.market_demand}/10</div>
                              <div className="text-sm text-gray-600">Demande marché</div>
                              <Progress value={env.market_demand * 10} className="h-2 mt-1" />
                            </div>
                            
                            <div className="text-center">
                              <div className="text-2xl font-bold text-yellow-600">{env.cost_of_living}/10</div>
                              <div className="text-sm text-gray-600">Coût de vie</div>
                              <Progress value={env.cost_of_living * 10} className="h-2 mt-1" />
                            </div>
                            
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">{env.cultural_fit}/10</div>
                              <div className="text-sm text-gray-600">Ajustement culturel</div>
                              <Progress value={env.cultural_fit * 10} className="h-2 mt-1" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Objectifs Automatiques */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Objectifs Automatiques Suggérés
              </CardTitle>
              <CardDescription>
                Basés sur votre analyse IKIGAI et votre profil
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {automaticGoals.map((goal, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <Target className="h-5 w-5 text-blue-500 mt-0.5" />
                    <span className="text-sm">{goal}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button onClick={() => setAnalysisComplete(false)} variant="outline">
              Relancer l'Analyse
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
