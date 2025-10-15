'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { GraduationCap, User, Shield, BookOpen, ArrowLeft } from 'lucide-react'

const registerSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  countryCode: z.string().optional(),
  referralCode: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

// Plus besoin de sélection de rôle - tout le monde commence comme visiteur

const countries = [
  { code: 'FRA', name: 'France' },
  { code: 'USA', name: 'États-Unis' },
  { code: 'CAN', name: 'Canada' },
  { code: 'GBR', name: 'Royaume-Uni' },
  { code: 'DEU', name: 'Allemagne' },
  { code: 'ESP', name: 'Espagne' },
  { code: 'ITA', name: 'Italie' },
  { code: 'NLD', name: 'Pays-Bas' },
  { code: 'BEL', name: 'Belgique' },
  { code: 'CHE', name: 'Suisse' }
]

export default function RegisterPage() {
  const router = useRouter()
  const { signUp, isLoading } = useAuthStore()
  const [error, setError] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  })

  const onSubmit = async (data: RegisterFormData) => {
    setError('')
    const result = await signUp(data.email, data.password, {
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'visitor', // Par défaut, tout le monde commence comme visiteur
      phone: data.phone,
      countryCode: data.countryCode,
      referralCode: data.referralCode
    })

    if (result.success) {
      // Redirection vers la page d'accueil
      router.push('/')
    } else {
      setError(result.error || 'Erreur lors de l\'inscription')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Bouton retour */}
        <div className="mb-4">
          <Button 
            variant="outline" 
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Button>
        </div>
        
        <Card>
          <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <GraduationCap className="h-8 w-8 text-primary mr-2" />
            <h1 className="text-2xl font-bold">Traillearn</h1>
          </div>
          <CardTitle>Créer votre compte</CardTitle>
          <CardDescription>
            Rejoignez la communauté Traillearn en tant que visiteur. Vous pourrez activer vos statuts étudiant et mentor plus tard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {error}
              </div>
            )}
            {/* Information sur les rôles */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <User className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900">Compte Visiteur</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Vous commencez en tant que visiteur. Vous pourrez activer vos statuts étudiant et mentor 
                    dans votre profil après l'inscription.
                  </p>
                </div>
              </div>
            </div>

            {/* Informations personnelles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  {...register('firstName')}
                  placeholder="Votre prénom"
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  {...register('lastName')}
                  placeholder="Votre nom"
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="votre@email.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone (optionnel)</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="+33123456789"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="countryCode">Pays (optionnel)</Label>
                <Select onValueChange={(value) => setValue('countryCode', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner votre pays" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="referralCode">Code de parrainage (optionnel)</Label>
              <Input
                id="referralCode"
                {...register('referralCode')}
                placeholder="USER-ABC123"
              />
              <p className="text-xs text-gray-500">
                Entrez le code de parrainage si vous avez été invité par un mentor
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe *</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                placeholder="Minimum 8 caractères"
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                placeholder="Répétez votre mot de passe"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Création du compte...' : 'Créer mon compte'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Déjà un compte ?{' '}
              <button
                type="button"
                onClick={() => router.push('/auth/login')}
                className="text-primary hover:underline"
              >
                Se connecter
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
        </div>
      </div>
  )
}
