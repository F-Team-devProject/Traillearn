# Documentation API - Traillearn

## 🌐 Vue d'ensemble

L'API de Traillearn est une API RESTful construite avec Node.js, Express et TypeScript. Elle suit les principes de l'architecture REST et utilise des standards modernes pour la sécurité et la performance.

## 🔗 Base URL

- **Développement** : `http://localhost:3001/api`
- **Staging** : `https://api-staging.Traillearn.com/api`
- **Production** : `https://api.Traillearn.com/api`

## 🔐 Authentification

L'API utilise JWT (JSON Web Tokens) pour l'authentification. Incluez le token dans l'en-tête `Authorization` :

```
Authorization: Bearer <your-jwt-token>
```

### Types de tokens
- **Access Token** : Valide 15 minutes, utilisé pour les requêtes API
- **Refresh Token** : Valide 7 jours, utilisé pour renouveler l'access token

## 📝 Codes de statut HTTP

| Code | Description |
|------|-------------|
| 200 | Succès |
| 201 | Créé avec succès |
| 400 | Requête invalide |
| 401 | Non authentifié |
| 403 | Non autorisé |
| 404 | Ressource non trouvée |
| 422 | Erreur de validation |
| 429 | Trop de requêtes |
| 500 | Erreur serveur |

## 📊 Format de réponse

### Succès
```json
{
  "success": true,
  "data": {
    // Données de la réponse
  },
  "message": "Opération réussie"
}
```

### Erreur
```json
{
  "success": false,
  "message": "Message d'erreur",
  "errors": [
    {
      "field": "email",
      "message": "Email invalide"
    }
  ]
}
```

## 🔑 Authentification

### POST /auth/register
Inscription d'un nouvel utilisateur.

**Body :**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe",
  "countryCode": "FRA"
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "student",
      "emailVerified": false
    },
    "tokens": {
      "accessToken": "jwt-token",
      "refreshToken": "refresh-token"
    }
  }
}
```

### POST /auth/login
Connexion d'un utilisateur.

**Body :**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "student"
    },
    "tokens": {
      "accessToken": "jwt-token",
      "refreshToken": "refresh-token"
    }
  }
}
```

### POST /auth/refresh
Renouvellement du token d'accès.

**Body :**
```json
{
  "refreshToken": "refresh-token"
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "accessToken": "new-jwt-token"
  }
}
```

### POST /auth/logout
Déconnexion de l'utilisateur.

**Headers :**
```
Authorization: Bearer <access-token>
```

**Réponse :**
```json
{
  "success": true,
  "message": "Déconnexion réussie"
}
```

### POST /auth/forgot-password
Demande de réinitialisation de mot de passe.

**Body :**
```json
{
  "email": "user@example.com"
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Email de réinitialisation envoyé"
}
```

### POST /auth/reset-password
Réinitialisation du mot de passe.

**Body :**
```json
{
  "token": "reset-token",
  "password": "NewPassword123!"
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Mot de passe réinitialisé avec succès"
}
```

## 👤 Gestion des utilisateurs

### GET /users/profile
Récupération du profil de l'utilisateur connecté.

**Headers :**
```
Authorization: Bearer <access-token>
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "student",
    "profile": {
      "bio": "Étudiant en informatique",
      "avatarUrl": "https://...",
      "currentEducationLevel": "bachelor",
      "fieldOfStudy": "Computer Science",
      "careerGoals": ["Software Engineer", "Data Scientist"],
      "interests": ["AI", "Web Development"],
      "languages": [
        {"code": "fr", "level": "native"},
        {"code": "en", "level": "fluent"}
      ],
      "skills": [
        {"name": "JavaScript", "level": "intermediate"},
        {"name": "Python", "level": "beginner"}
      ]
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### PUT /users/profile
Mise à jour du profil utilisateur.

**Headers :**
```
Authorization: Bearer <access-token>
```

**Body :**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "profile": {
    "bio": "Nouvelle bio",
    "currentEducationLevel": "master",
    "fieldOfStudy": "Data Science",
    "careerGoals": ["Data Scientist", "ML Engineer"],
    "interests": ["Machine Learning", "AI"],
    "skills": [
      {"name": "Python", "level": "advanced"},
      {"name": "TensorFlow", "level": "intermediate"}
    ]
  }
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "user": {
      // Profil mis à jour
    }
  },
  "message": "Profil mis à jour avec succès"
}
```

### GET /users/search
Recherche d'utilisateurs.

**Query Parameters :**
- `q` : Terme de recherche
- `role` : Rôle (student, mentor)
- `country` : Code pays
- `skills` : Compétences (séparées par des virgules)
- `page` : Numéro de page (défaut: 1)
- `limit` : Nombre d'éléments par page (défaut: 20)

**Exemple :**
```
GET /users/search?q=john&role=mentor&skills=javascript,python&page=1&limit=10
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "firstName": "John",
        "lastName": "Doe",
        "role": "mentor",
        "profile": {
          "bio": "Senior Developer",
          "avatarUrl": "https://...",
          "skills": [
            {"name": "JavaScript", "level": "expert"},
            {"name": "Python", "level": "advanced"}
          ]
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

## 🤝 Mentorat

### GET /mentors/available
Liste des mentors disponibles.

**Query Parameters :**
- `expertise` : Domaines d'expertise
- `country` : Code pays
- `minRating` : Note minimale
- `page` : Numéro de page
- `limit` : Nombre d'éléments par page

**Réponse :**
```json
{
  "success": true,
  "data": {
    "mentors": [
      {
        "id": "uuid",
        "user": {
          "id": "uuid",
          "firstName": "Jane",
          "lastName": "Smith",
          "profile": {
            "avatarUrl": "https://...",
            "bio": "Senior Software Engineer"
          }
        },
        "expertiseAreas": ["Web Development", "JavaScript"],
        "experienceYears": 8,
        "hourlyRate": 50.00,
        "rating": 4.8,
        "totalSessions": 150,
        "isVerified": true,
        "availability": {
          "monday": ["09:00-17:00"],
          "tuesday": ["09:00-17:00"],
          "wednesday": ["09:00-17:00"]
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

### POST /mentors/request
Demande de mentorat.

**Headers :**
```
Authorization: Bearer <access-token>
```

**Body :**
```json
{
  "mentorId": "mentor-uuid",
  "title": "Session de conseil en carrière",
  "description": "Je souhaite discuter de mon orientation professionnelle",
  "preferredDate": "2024-02-15T14:00:00Z",
  "duration": 60
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "session-uuid",
      "mentorId": "mentor-uuid",
      "menteeId": "mentee-uuid",
      "title": "Session de conseil en carrière",
      "description": "Je souhaite discuter de mon orientation professionnelle",
      "scheduledAt": "2024-02-15T14:00:00Z",
      "duration": 60,
      "status": "pending"
    }
  },
  "message": "Demande de mentorat envoyée"
}
```

### GET /mentors/sessions
Liste des sessions de mentorat.

**Headers :**
```
Authorization: Bearer <access-token>
```

**Query Parameters :**
- `status` : Statut (scheduled, completed, cancelled)
- `role` : Rôle (mentor, mentee)
- `page` : Numéro de page
- `limit` : Nombre d'éléments par page

**Réponse :**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "session-uuid",
        "mentor": {
          "id": "uuid",
          "firstName": "Jane",
          "lastName": "Smith",
          "profile": {
            "avatarUrl": "https://..."
          }
        },
        "mentee": {
          "id": "uuid",
          "firstName": "John",
          "lastName": "Doe",
          "profile": {
            "avatarUrl": "https://..."
          }
        },
        "title": "Session de conseil en carrière",
        "scheduledAt": "2024-02-15T14:00:00Z",
        "duration": 60,
        "status": "scheduled",
        "meetingUrl": "https://meet.Traillearn.com/session-uuid"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 12,
      "totalPages": 1
    }
  }
}
```

### POST /mentors/sessions/:id/feedback
Ajout de feedback pour une session.

**Headers :**
```
Authorization: Bearer <access-token>
```

**Body :**
```json
{
  "rating": 5,
  "comment": "Session très utile, merci pour les conseils !",
  "type": "mentee" // ou "mentor"
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Feedback ajouté avec succès"
}
```

## 🧠 Intelligence Artificielle

### POST /ai/recommendations/career
Recommandations de carrière basées sur l'IA.

**Headers :**
```
Authorization: Bearer <access-token>
```

**Body :**
```json
{
  "interests": ["AI", "Web Development"],
  "skills": ["JavaScript", "Python"],
  "educationLevel": "bachelor",
  "experience": "beginner"
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "type": "career",
        "title": "Développeur Full Stack",
        "description": "Carrière idéale pour combiner vos compétences en JavaScript et Python",
        "matchScore": 0.92,
        "requirements": [
          "Maîtrise de React.js",
          "Connaissance de Node.js",
          "Expérience avec les bases de données"
        ],
        "salaryRange": {
          "min": 35000,
          "max": 55000,
          "currency": "EUR"
        },
        "growthProspects": "Excellent"
      }
    ]
  }
}
```

### POST /ai/recommendations/scholarships
Recommandations de bourses.

**Headers :**
```
Authorization: Bearer <access-token>
```

**Body :**
```json
{
  "countryCode": "FRA",
  "fieldOfStudy": "Computer Science",
  "educationLevel": "master",
  "financialNeed": true
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "id": "scholarship-uuid",
        "title": "Bourse d'excellence Eiffel",
        "provider": "Campus France",
        "amount": 1181,
        "currency": "EUR",
        "deadline": "2024-03-15",
        "matchScore": 0.95,
        "eligibilityCriteria": [
          "Étudiant international",
          "Niveau master ou doctorat",
          "Excellence académique"
        ],
        "applicationUrl": "https://campusfrance.org/eiffel"
      }
    ]
  }
}
```

### POST /ai/chat
Chat avec l'IA pour l'orientation.

**Headers :**
```
Authorization: Bearer <access-token>
```

**Body :**
```json
{
  "message": "Quelles sont les meilleures universités pour étudier l'IA en France ?",
  "context": {
    "interests": ["AI", "Machine Learning"],
    "educationLevel": "master"
  }
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "response": "Pour étudier l'IA en France au niveau master, je recommande plusieurs excellentes options :\n\n1. **Sorbonne Université** - Master Intelligence Artificielle\n2. **École Polytechnique** - Master Data Science\n3. **Télécom Paris** - Master Intelligence Artificielle\n\nCes programmes offrent une formation solide en IA avec des opportunités de recherche et d'industrie.",
    "suggestions": [
      "Quels sont les prérequis pour ces masters ?",
      "Comment postuler à ces programmes ?",
      "Quelles sont les perspectives d'emploi après ces formations ?"
    ]
  }
}
```

## 🏘️ Communautés

### GET /communities
Liste des communautés.

**Query Parameters :**
- `category` : Catégorie (academic, professional, country, interest)
- `country` : Code pays
- `search` : Terme de recherche
- `page` : Numéro de page
- `limit` : Nombre d'éléments par page

**Réponse :**
```json
{
  "success": true,
  "data": {
    "communities": [
      {
        "id": "community-uuid",
        "name": "Étudiants en Informatique France",
        "description": "Communauté pour les étudiants en informatique en France",
        "category": "academic",
        "countryCode": "FRA",
        "isPrivate": false,
        "memberCount": 1250,
        "createdBy": {
          "id": "uuid",
          "firstName": "Admin",
          "lastName": "User"
        },
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

### POST /communities
Création d'une nouvelle communauté.

**Headers :**
```
Authorization: Bearer <access-token>
```

**Body :**
```json
{
  "name": "Développeurs React France",
  "description": "Communauté pour les développeurs React en France",
  "category": "professional",
  "countryCode": "FRA",
  "isPrivate": false
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "community": {
      "id": "community-uuid",
      "name": "Développeurs React France",
      "description": "Communauté pour les développeurs React en France",
      "category": "professional",
      "countryCode": "FRA",
      "isPrivate": false,
      "memberCount": 1,
      "createdBy": {
        "id": "user-uuid",
        "firstName": "John",
        "lastName": "Doe"
      },
      "createdAt": "2024-01-01T00:00:00Z"
    }
  },
  "message": "Communauté créée avec succès"
}
```

### GET /communities/:id/posts
Posts d'une communauté.

**Query Parameters :**
- `page` : Numéro de page
- `limit` : Nombre d'éléments par page

**Réponse :**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "post-uuid",
        "title": "Conseils pour débuter en React",
        "content": "Voici quelques conseils pour bien commencer avec React...",
        "author": {
          "id": "uuid",
          "firstName": "Jane",
          "lastName": "Smith",
          "profile": {
            "avatarUrl": "https://..."
          }
        },
        "likes": 15,
        "comments": 8,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

## 📅 Événements

### GET /events
Liste des événements.

**Query Parameters :**
- `type` : Type d'événement (webinar, conference, workshop)
- `country` : Code pays
- `dateFrom` : Date de début (ISO 8601)
- `dateTo` : Date de fin (ISO 8601)
- `page` : Numéro de page
- `limit` : Nombre d'éléments par page

**Réponse :**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "event-uuid",
        "title": "Webinaire : Introduction à l'IA",
        "description": "Découvrez les bases de l'intelligence artificielle",
        "eventType": "webinar",
        "startDate": "2024-02-20T18:00:00Z",
        "endDate": "2024-02-20T19:30:00Z",
        "location": "En ligne",
        "isOnline": true,
        "meetingUrl": "https://meet.Traillearn.com/webinar-ia",
        "maxParticipants": 100,
        "currentParticipants": 45,
        "createdBy": {
          "id": "uuid",
          "firstName": "Expert",
          "lastName": "IA"
        },
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "totalPages": 2
    }
  }
}
```

### POST /events/:id/register
Inscription à un événement.

**Headers :**
```
Authorization: Bearer <access-token>
```

**Réponse :**
```json
{
  "success": true,
  "message": "Inscription à l'événement confirmée"
}
```

## 🔍 Recherche

### GET /search
Recherche globale dans la plateforme.

**Query Parameters :**
- `q` : Terme de recherche
- `type` : Type de contenu (users, communities, events, scholarships)
- `page` : Numéro de page
- `limit` : Nombre d'éléments par page

**Exemple :**
```
GET /search?q=javascript&type=users,communities&page=1&limit=10
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "results": {
      "users": [
        {
          "id": "uuid",
          "firstName": "John",
          "lastName": "Doe",
          "role": "mentor",
          "profile": {
            "skills": [
              {"name": "JavaScript", "level": "expert"}
            ]
          }
        }
      ],
      "communities": [
        {
          "id": "uuid",
          "name": "JavaScript France",
          "description": "Communauté JavaScript"
        }
      ]
    },
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

## 📊 Limites et Rate Limiting

### Limites par défaut
- **Requêtes générales** : 100 requêtes par 15 minutes par IP
- **Authentification** : 5 tentatives par 15 minutes par IP
- **Upload de fichiers** : 10 fichiers par heure par utilisateur
- **Recherche** : 50 requêtes par heure par utilisateur

### Headers de rate limiting
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 🐛 Gestion des erreurs

### Codes d'erreur personnalisés
- `VALIDATION_ERROR` : Erreur de validation des données
- `AUTHENTICATION_REQUIRED` : Authentification requise
- `INSUFFICIENT_PERMISSIONS` : Permissions insuffisantes
- `RESOURCE_NOT_FOUND` : Ressource non trouvée
- `DUPLICATE_RESOURCE` : Ressource déjà existante
- `RATE_LIMIT_EXCEEDED` : Limite de requêtes dépassée

### Exemple d'erreur détaillée
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Les données fournies sont invalides",
    "details": [
      {
        "field": "email",
        "message": "Format d'email invalide"
      },
      {
        "field": "password",
        "message": "Le mot de passe doit contenir au moins 8 caractères"
      }
    ]
  }
}
```

## 📚 SDK et exemples

### JavaScript/TypeScript
```typescript
import { CoachProTalentAPI } from '@coachprotalent/sdk';

const api = new CoachProTalentAPI({
  baseURL: 'https://api.Traillearn.com',
  apiKey: 'your-api-key'
});

// Authentification
const authResult = await api.auth.login({
  email: 'user@example.com',
  password: 'password'
});

// Utilisation avec token
api.setAuthToken(authResult.tokens.accessToken);

// Récupération du profil
const profile = await api.users.getProfile();
```

### Python
```python
from coachprotalent import CoachProTalentAPI

api = CoachProTalentAPI(
    base_url='https://api.Traillearn.com',
    api_key='your-api-key'
)

# Authentification
auth_result = api.auth.login(
    email='user@example.com',
    password='password'
)

# Utilisation avec token
api.set_auth_token(auth_result['tokens']['accessToken'])

# Récupération du profil
profile = api.users.get_profile()
```

Cette documentation API fournit une référence complète pour l'intégration avec la plateforme Coach&Pro'Talent.