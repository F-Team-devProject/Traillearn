# Architecture Technique - Coach&Pro'Talent

## 🏗️ Vue d'ensemble de l'architecture

L'architecture de Coach&Pro'Talent suit les principes de **microservices**, **Domain-Driven Design (DDD)** et **Clean Architecture** pour assurer la scalabilité, la maintenabilité et la sécurité.

## 📐 Diagramme d'architecture globale

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  Next.js App  │  Mobile App  │  Admin Dashboard  │  PWA        │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                         │
├─────────────────────────────────────────────────────────────────┤
│  Nginx  │  Rate Limiting  │  Load Balancer  │  SSL Termination │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Microservices Layer                        │
├─────────────────────────────────────────────────────────────────┤
│ Auth Service │ User Service │ AI Service │ Mentor Service │ ... │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                │
├─────────────────────────────────────────────────────────────────┤
│ PostgreSQL │ Redis │ Elasticsearch │ S3 Storage │ Message Queue │
└─────────────────────────────────────────────────────────────────┘
```

## 🔧 Services principaux

### 1. Authentication Service
**Responsabilité** : Gestion de l'authentification et de l'autorisation

**Technologies** :
- Node.js + Express + TypeScript
- JWT + Refresh Tokens
- bcrypt pour le hachage des mots de passe
- OAuth2 (Google, LinkedIn)

**Endpoints principaux** :
```
POST /auth/register
POST /auth/login
POST /auth/refresh
POST /auth/logout
POST /auth/forgot-password
POST /auth/reset-password
GET  /auth/verify-email
POST /auth/2fa/enable
POST /auth/2fa/verify
```

### 2. User Management Service
**Responsabilité** : Gestion des profils utilisateurs et des préférences

**Technologies** :
- Node.js + Express + TypeScript
- Prisma ORM
- File upload avec AWS S3

**Endpoints principaux** :
```
GET    /users/profile
PUT    /users/profile
GET    /users/:id/public
POST   /users/upload-avatar
GET    /users/search
PUT    /users/preferences
```

### 3. AI Recommendation Service
**Responsabilité** : Moteur de recommandations et IA conversationnelle

**Technologies** :
- Python + FastAPI
- TensorFlow/PyTorch
- OpenAI API
- scikit-learn

**Endpoints principaux** :
```
POST /ai/recommendations/career
POST /ai/recommendations/scholarships
POST /ai/recommendations/mentors
POST /ai/chat
GET  /ai/insights/:userId
```

### 4. Mentor Service
**Responsabilité** : Gestion du mentorat et des relations mentor-mentoré

**Technologies** :
- Node.js + Express + TypeScript
- Socket.io pour le temps réel
- Prisma ORM

**Endpoints principaux** :
```
GET    /mentors/available
POST   /mentors/request
GET    /mentors/sessions
POST   /mentors/sessions/:id/feedback
GET    /mentors/calendar
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
