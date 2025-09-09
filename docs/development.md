# Guide de Développement - Traillearn

## 🚀 Environnement de développement

### Prérequis
- **Node.js** 20+ (LTS recommandé)
- **Python** 3.11+
- **PostgreSQL** 15+
- **Redis** 7+
- **Docker** & Docker Compose
- **Git** 2.30+

### Installation initiale

```bash
# Cloner le repository
git clone https://github.com/F-Team-devProject/Traillearn.git
cd platform

# Installation des dépendances frontend
cd frontend
npm install

# Installation des dépendances backend
cd ../backend
npm install

# Installation des dépendances IA
cd ../ai-service
pip install -r requirements.txt

# Configuration de l'environnement
cp .env.example .env
# Éditer .env avec vos configurations

# Démarrage des services avec Docker
docker-compose up -d postgres redis

# Migration de la base de données
npm run db:migrate

# Démarrage du développement
npm run dev
```

## 🏗️ Structure du projet

```
Traillearn/
├── frontend/                 # Application Next.js
│   ├── src/
│   │   ├── app/             # App Router (Next.js 13+)
│   │   ├── components/      # Composants réutilisables
│   │   ├── lib/            # Utilitaires et configurations
│   │   ├── hooks/          # Hooks React personnalisés
│   │   └── types/          # Types TypeScript
│   ├── public/             # Assets statiques
│   └── package.json
├── backend/                 # API Node.js
│   ├── src/
│   │   ├── controllers/    # Contrôleurs des routes
│   │   ├── services/       # Logique métier
│   │   ├── models/         # Modèles de données
│   │   ├── middleware/     # Middlewares Express
│   │   ├── routes/         # Définition des routes
│   │   ├── utils/          # Utilitaires
│   │   └── types/          # Types TypeScript
│   └── package.json
├── ai-service/              # Service IA Python
│   ├── src/
│   │   ├── models/         # Modèles ML
│   │   ├── services/       # Services IA
│   │   ├── api/           # Endpoints FastAPI
│   │   └── utils/         # Utilitaires
│   └── requirements.txt
├── shared/                  # Code partagé
│   ├── types/              # Types partagés
│   └── schemas/            # Schémas de validation
├── docs/                   # Documentation
├── docker-compose.yml      # Configuration Docker
└── README.md
```

## 📋 Standards de développement

### 1. Principes SOLID

#### Single Responsibility Principle (SRP)
```typescript
// ❌ Mauvaise pratique
class UserManager {
  createUser(userData: UserData) { /* ... */ }
  sendEmail(user: User, message: string) { /* ... */ }
  logActivity(user: User, action: string) { /* ... */ }
}

// ✅ Bonne pratique
class UserService {
  createUser(userData: UserData): Promise<User> { /* ... */ }
}

class EmailService {
  sendEmail(user: User, message: string): Promise<void> { /* ... */ }
}

class AuditService {
  logActivity(user: User, action: string): Promise<void> { /* ... */ }
}
```

#### Open/Closed Principle (OCP)
```typescript
// Interface pour les stratégies de recommandation
interface RecommendationStrategy {
  generateRecommendations(user: User): Promise<Recommendation[]>;
}

// Implémentation pour les recommandations académiques
class AcademicRecommendationStrategy implements RecommendationStrategy {
  async generateRecommendations(user: User): Promise<Recommendation[]> {
    // Logique spécifique aux recommandations académiques
  }
}

// Implémentation pour les recommandations professionnelles
class ProfessionalRecommendationStrategy implements RecommendationStrategy {
  async generateRecommendations(user: User): Promise<Recommendation[]> {
    // Logique spécifique aux recommandations professionnelles
  }
}

// Service utilisant les stratégies
class RecommendationService {
  constructor(private strategies: RecommendationStrategy[]) {}

  async getRecommendations(user: User): Promise<Recommendation[]> {
    const allRecommendations = await Promise.all(
      this.strategies.map(strategy => strategy.generateRecommendations(user))
    );
    return allRecommendations.flat();
  }
}
```

#### Dependency Inversion Principle (DIP)
```typescript
// Interface pour le repository
interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}

// Implémentation concrète
class PostgreSQLUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    // Implémentation avec Prisma
  }

  async save(user: User): Promise<User> {
    // Implémentation avec Prisma
  }

  async delete(id: string): Promise<void> {
    // Implémentation avec Prisma
  }
}

// Service dépendant de l'abstraction
class UserService {
  constructor(private userRepository: UserRepository) {}

  async getUser(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }
}
```

### 2. Conventions de nommage

#### TypeScript/JavaScript
```typescript
// Variables et fonctions : camelCase
const userName = 'john_doe';
const getUserProfile = async (id: string) => { /* ... */ };

// Classes : PascalCase
class UserService { /* ... */ }
class RecommendationEngine { /* ... */ }

// Interfaces : PascalCase avec préfixe I (optionnel)
interface IUser { /* ... */ }
interface UserProfile { /* ... */ }

// Constantes : UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = 'https://api.coachprotalent.com';

// Types : PascalCase
type UserRole = 'student' | 'mentor' | 'admin';
type ApiResponse<T> = {
  data: T;
  success: boolean;
  message?: string;
};
```

#### Base de données
```sql
-- Tables : snake_case, pluriel
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Colonnes : snake_case
CREATE TABLE mentoring_sessions (
    id UUID PRIMARY KEY,
    mentor_id UUID NOT NULL,
    mentee_id UUID NOT NULL,
    scheduled_at TIMESTAMP NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE
);

-- Index : idx_nom_table_colonnes
CREATE INDEX idx_mentoring_sessions_mentor_id ON mentoring_sessions(mentor_id);
CREATE INDEX idx_mentoring_sessions_scheduled_at ON mentoring_sessions(scheduled_at);
```

### 3. Gestion des erreurs

```typescript
// Classes d'erreur personnalisées
class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 400);
  }
}

class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
  }
}

class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

// Middleware de gestion d'erreurs
const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  }

  // Log de l'erreur
  logger.error({
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};
```

### 4. Validation des données

```typescript
import Joi from 'joi';

// Schémas de validation
const userRegistrationSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email invalide',
    'any.required': 'Email requis'
  }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
      'string.pattern.base': 'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial'
    }),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  countryCode: Joi.string().length(3).required()
});

// Middleware de validation
const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors
      });
    }

    req.body = value;
    next();
  };
};

// Utilisation
app.post('/api/auth/register',
  validateRequest(userRegistrationSchema),
  authController.register
);
```

## 🧪 Tests

### 1. Tests unitaires

```typescript
// user.service.test.ts
import { UserService } from '../user.service';
import { UserRepository } from '../user.repository';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn()
    } as jest.Mocked<UserRepository>;

    userService = new UserService(mockUserRepository);
  });

  describe('getUser', () => {
    it('should return user when found', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await userService.getUser('1');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should return null when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const result = await userService.getUser('999');

      expect(result).toBeNull();
    });
  });
});
```

### 2. Tests d'intégration

```typescript
// auth.integration.test.ts
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../lib/prisma';

describe('Auth Integration Tests', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        countryCode: 'FRA'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should not register user with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        countryCode: 'FRA'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });
});
```

### 3. Tests E2E

```typescript
// auth.e2e.test.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should complete registration and login flow', async ({ page }) => {
    // Aller à la page d'inscription
    await page.goto('/auth/register');

    // Remplir le formulaire
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'Password123!');
    await page.fill('[data-testid="firstName"]', 'John');
    await page.fill('[data-testid="lastName"]', 'Doe');
    await page.selectOption('[data-testid="countryCode"]', 'FRA');

    // Soumettre le formulaire
    await page.click('[data-testid="submit"]');

    // Vérifier la redirection
    await expect(page).toHaveURL('/dashboard');

    // Vérifier que l'utilisateur est connecté
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });
});
```

## 🔧 Configuration et outils

### 1. ESLint et Prettier

```json
// .eslintrc.json
{
  "extends": [
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### 2. Husky pour les Git Hooks

```json
// package.json
{
  "scripts": {
    "prepare": "husky install",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier --write src/**/*.{ts,tsx,json}",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run test"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

### 3. Configuration TypeScript

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## 📊 Monitoring et Debugging

### 1. Logging structuré

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'coachprotalent-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Utilisation
logger.info('User registered', { userId: '123', email: 'user@example.com' });
logger.error('Database connection failed', { error: error.message, stack: error.stack });
```

### 2. Métriques de performance

```typescript
import { register, Counter, Histogram } from 'prom-client';

// Métriques personnalisées
const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const userRegistrations = new Counter({
  name: 'user_registrations_total',
  help: 'Total number of user registrations',
  labelNames: ['country_code']
});

// Middleware pour collecter les métriques
const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
      .observe(duration);
  });

  next();
};
```

## 🚀 Déploiement

### 1. Configuration Docker

```dockerfile
# Dockerfile pour le backend
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS runtime

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
```

### 2. Docker Compose pour le développement

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: coachprotalent
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build: ./backend
    ports:
      - "3001:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/coachprotalent
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend:/app
      - /app/node_modules

volumes:
  postgres_data:
  redis_data:
```

Cette documentation de développement fournit une base solide pour maintenir la qualité du code et assurer la cohérence dans l'équipe de développement.