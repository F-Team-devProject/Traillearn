# Architecture Technique - Traillearn

## 🏗️ Vue d'ensemble de l'architecture

L'architecture de Traillearn suit les principes de **Serverless**, **JAMstack** et **Clean Architecture** avec Supabase comme backend-as-a-service pour assurer la rapidité de développement, la scalabilité et la sécurité.

## 📐 Diagramme d'architecture globale

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  Next.js 14 App  │  PWA  │  Admin Dashboard  │  Mobile (Future) │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Vercel Edge Network                         │
├─────────────────────────────────────────────────────────────────┤
│  CDN Global  │  Edge Functions  │  Automatic Scaling  │  SSL    │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase Backend                            │
├─────────────────────────────────────────────────────────────────┤
│ Auth │ PostgreSQL │ Real-time │ Storage │ Edge Functions │ API  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                           │
├─────────────────────────────────────────────────────────────────┤
│ OpenAI API │ Google OAuth │ LinkedIn OAuth │ Resend Email      │
└─────────────────────────────────────────────────────────────────┘
```

## 🔧 Services principaux

### 1. Supabase Auth (Authentification)
**Responsabilité** : Gestion complète de l'authentification et de l'autorisation

**Fonctionnalités** :
- Authentification email/mot de passe
- OAuth2 (Google, LinkedIn, GitHub)
- Authentification multi-facteurs (2FA)
- Gestion des sessions et tokens JWT
- Row Level Security (RLS) intégrée

**API Supabase Auth** :
```typescript
// Inscription
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
  options: {
    data: {
      first_name: 'John',
      last_name: 'Doe'
    }
  }
})

// Connexion
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// OAuth
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google'
})
```

### 2. Supabase Database (PostgreSQL)
**Responsabilité** : Gestion des données avec Row Level Security

**Fonctionnalités** :
- PostgreSQL avec extensions (PostGIS, Full-text search)
- API REST automatique
- Real-time subscriptions
- Row Level Security (RLS) pour la sécurité
- Triggers et fonctions stockées

**API Supabase Database** :
```typescript
// Récupération des profils
const { data, error } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('role', 'mentor')

// Mise à jour avec RLS
const { data, error } = await supabase
  .from('user_profiles')
  .update({ bio: 'New bio' })
  .eq('user_id', user.id)

// Real-time subscriptions
const subscription = supabase
  .channel('mentoring_sessions')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'mentoring_sessions'
  }, (payload) => {
    console.log('New session:', payload.new)
  })
  .subscribe()
```

### 3. Supabase Edge Functions + OpenAI
**Responsabilité** : IA et recommandations via Edge Functions

**Fonctionnalités** :
- Edge Functions TypeScript (serverless)
- Intégration OpenAI API
- Streaming des réponses
- Cache intelligent
- Déploiement automatique

**Edge Function Example** :
```typescript
// supabase/functions/ai-recommendations/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { user_id, preferences } = await req.json()
  
  // Récupération des données utilisateur
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
  
  const { data: user } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user_id)
    .single()
  
  // Appel OpenAI
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Tu es un conseiller en orientation académique...'
        },
        {
          role: 'user',
          content: `Recommandations pour: ${JSON.stringify(user)}`
        }
      ],
      stream: true
    })
  })
  
  return new Response(response.body, {
    headers: { 'Content-Type': 'text/plain' }
  })
})
```

### 4. Supabase Storage
**Responsabilité** : Stockage des fichiers et médias

**Fonctionnalités** :
- Stockage de fichiers sécurisé
- Upload direct depuis le frontend
- Redimensionnement d'images automatique
- CDN intégré
- Politiques d'accès granulaires

**API Supabase Storage** :
```typescript
// Upload d'avatar
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${user.id}/avatar.jpg`, file)

// Récupération d'image avec transformation
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${user.id}/avatar.jpg`, {
    transform: {
      width: 200,
      height: 200,
      resize: 'cover'
    }
  })
```

### 5. Community Service
**Responsabilité** : Forums, groupes et interactions communautaires

**Technologies** :
- Node.js + Express + TypeScript
- Socket.io pour le temps réel
- Elasticsearch pour la recherche

**Endpoints principaux** :
```
GET    /communities
POST   /communities
GET    /communities/:id/posts
POST   /communities/:id/posts
GET    /communities/:id/members
```

### 6. Event Service
**Responsabilité** : Gestion des événements, webinaires et calendrier

**Technologies** :
- Node.js + Express + TypeScript
- Prisma ORM
- Integration calendrier (Google Calendar, Outlook)

**Endpoints principaux** :
```
GET    /events
POST   /events
GET    /events/:id
POST   /events/:id/register
GET    /events/calendar
```

## 🗄️ Architecture des données

### Base de données PostgreSQL

#### Tables principales

```sql
-- Utilisateurs
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    country_code VARCHAR(3),
    city VARCHAR(100),
    profile_completed BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Profils utilisateurs
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    avatar_url VARCHAR(500),
    current_education_level education_level,
    field_of_study VARCHAR(100),
    career_goals TEXT[],
    interests TEXT[],
    languages JSONB,
    skills JSONB,
    experience JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Mentorat
CREATE TABLE mentors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    expertise_areas TEXT[] NOT NULL,
    experience_years INTEGER NOT NULL,
    hourly_rate DECIMAL(10,2),
    availability JSONB,
    rating DECIMAL(3,2) DEFAULT 0.0,
    total_sessions INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Sessions de mentorat
CREATE TABLE mentoring_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID REFERENCES mentors(id) ON DELETE CASCADE,
    mentee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMP NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    status session_status DEFAULT 'scheduled',
    meeting_url VARCHAR(500),
    notes TEXT,
    feedback_mentor TEXT,
    feedback_mentee TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Communautés
CREATE TABLE communities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category community_category NOT NULL,
    country_code VARCHAR(3),
    city VARCHAR(100),
    is_private BOOLEAN DEFAULT FALSE,
    member_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Événements
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_type event_type NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    location VARCHAR(200),
    is_online BOOLEAN DEFAULT FALSE,
    meeting_url VARCHAR(500),
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Bourses
CREATE TABLE scholarships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    provider VARCHAR(200) NOT NULL,
    amount DECIMAL(12,2),
    currency VARCHAR(3) DEFAULT 'EUR',
    deadline DATE NOT NULL,
    eligibility_criteria JSONB,
    application_url VARCHAR(500),
    country_code VARCHAR(3),
    field_of_study TEXT[],
    education_level education_level[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Types énumérés
CREATE TYPE user_role AS ENUM ('student', 'mentor', 'admin', 'moderator');
CREATE TYPE education_level AS ENUM ('high_school', 'bachelor', 'master', 'phd', 'professional');
CREATE TYPE session_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE community_category AS ENUM ('academic', 'professional', 'country', 'interest', 'skill');
CREATE TYPE event_type AS ENUM ('webinar', 'conference', 'workshop', 'networking', 'seminar');
```

### Redis Cache

**Utilisation** :
- Sessions utilisateur
- Cache des recommandations IA
- Rate limiting
- Données fréquemment accédées

**Structure** :
```
sessions:{userId} -> session data
recommendations:{userId} -> cached recommendations
rate_limit:{ip} -> request count
user_profile:{userId} -> cached profile data
```

### Elasticsearch

**Indexes** :
- `users` : Recherche d'utilisateurs
- `communities` : Recherche de communautés
- `events` : Recherche d'événements
- `scholarships` : Recherche de bourses

## 🔄 Flux de données

### 1. Authentification
```
Client → API Gateway → Auth Service → PostgreSQL
                    ↓
                JWT Token → Redis (session)
```

### 2. Recommandations IA
```
Client → API Gateway → AI Service → PostgreSQL (user data)
                    ↓
                ML Model → Cache (Redis) → Response
```

### 3. Messagerie temps réel
```
Client → WebSocket → Community Service → Socket.io → Redis Pub/Sub
```

## 🛡️ Sécurité

### 1. Authentification
- JWT avec refresh tokens
- Authentification multi-facteurs (2FA)
- OAuth2 pour les intégrations sociales
- Rate limiting par IP et utilisateur

### 2. Autorisation
- RBAC (Role-Based Access Control)
- Permissions granulaires par ressource
- Middleware d'autorisation sur chaque endpoint

### 3. Protection des données
- Chiffrement AES-256 pour les données sensibles
- HTTPS obligatoire
- CSP (Content Security Policy)
- Validation stricte des entrées

### 4. Monitoring
- Logs d'audit complets
- Détection d'intrusion
- Alertes de sécurité automatiques
- Monitoring des performances

## 📊 Scalabilité

### 1. Horizontal Scaling
- Microservices indépendants
- Load balancing automatique
- Auto-scaling basé sur les métriques

### 2. Base de données
- Read replicas pour PostgreSQL
- Sharding par région géographique
- Cache Redis distribué

### 3. CDN
- Assets statiques via CDN
- Images et vidéos optimisées
- Cache intelligent

## 🔍 Monitoring et Observabilité

### 1. Métriques
- Prometheus + Grafana
- Métriques applicatives personnalisées
- Alertes automatiques

### 2. Logs
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Logs structurés en JSON
- Corrélation des logs entre services

### 3. Traces
- Jaeger pour le tracing distribué
- Performance monitoring
- Debugging des problèmes de performance

## 🚀 Déploiement

### 1. Containerisation
- Docker pour tous les services
- Multi-stage builds pour optimiser les images
- Health checks intégrés

### 2. Orchestration
- Kubernetes pour la production
- Helm charts pour le déploiement
- Rolling updates sans interruption

### 3. CI/CD
- GitHub Actions
- Tests automatisés
- Déploiement automatique sur validation
