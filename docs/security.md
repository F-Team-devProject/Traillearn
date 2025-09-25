# Guide de Sécurité - Traillearn

## 🛡️ Vue d'ensemble de la sécurité

La sécurité est une priorité absolue pour Traillearn. Ce document détaille les mesures de sécurité implémentées, les bonnes pratiques et les procédures de conformité.

## 🔒 Standards de conformité

### RGPD (Règlement Général sur la Protection des Données)
- **Consentement explicite** pour la collecte de données
- **Droit à l'oubli** avec suppression complète des données
- **Portabilité des données** en format JSON/XML
- **Notification de violation** dans les 72h
- **DPO (Data Protection Officer)** désigné

### OWASP Top 10 2023
1. **A01:2021 – Broken Access Control**
2. **A02:2021 – Cryptographic Failures**
3. **A03:2021 – Injection**
4. **A04:2021 – Insecure Design**
5. **A05:2021 – Security Misconfiguration**
6. **A06:2021 – Vulnerable and Outdated Components**
7. **A07:2021 – Identification and Authentication Failures**
8. **A08:2021 – Software and Data Integrity Failures**
9. **A09:2021 – Security Logging and Monitoring Failures**
10. **A10:2021 – Server-Side Request Forgery (SSRF)**

## 🔐 Authentification et Autorisation

### 1. Authentification Multi-Facteurs (2FA)

```typescript
// Implémentation 2FA avec TOTP
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

class TwoFactorAuth {
  async generateSecret(userId: string): Promise<string> {
    const secret = authenticator.generateSecret();
    await this.storeSecret(userId, secret);
    return secret;
  }

  async generateQRCode(userId: string, email: string): Promise<string> {
    const secret = await this.getSecret(userId);
    const otpauth = authenticator.keyuri(email, 'Coach&Pro Talent', secret);
    return QRCode.toDataURL(otpauth);
  }

  async verifyToken(userId: string, token: string): Promise<boolean> {
    const secret = await this.getSecret(userId);
    return authenticator.verify({ token, secret });
  }
}
```

### 2. Gestion des Sessions

```typescript
// Configuration des sessions sécurisées
const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24h
    sameSite: 'strict' as const
  },
  store: new RedisStore({
    client: redisClient,
    prefix: 'sess:'
  })
};
```

### 3. JWT avec Refresh Tokens

```typescript
// Gestion des tokens JWT
class TokenManager {
  generateAccessToken(userId: string, role: string): string {
    return jwt.sign(
      { userId, role, type: 'access' },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );
  }

  generateRefreshToken(userId: string): string {
    return jwt.sign(
      { userId, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );
  }

  async verifyToken(token: string): Promise<JWTPayload> {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    } catch (error) {
      throw new UnauthorizedError('Token invalide');
    }
  }
}
```

## 🔑 Chiffrement et Protection des Données

### 1. Chiffrement des Mots de Passe

```typescript
import bcrypt from 'bcrypt';

class PasswordManager {
  private readonly SALT_ROUNDS = 12;

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  validatePasswordStrength(password: string): boolean {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return password.length >= minLength && 
           hasUpperCase && 
           hasLowerCase && 
           hasNumbers && 
           hasSpecialChar;
  }
}
```

### 2. Chiffrement des Données Sensibles

```typescript
import crypto from 'crypto';

class DataEncryption {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key = crypto.scryptSync(process.env.ENCRYPTION_KEY!, 'salt', 32);

  encrypt(text: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.key);
    cipher.setAAD(Buffer.from('coachprotalent', 'utf8'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  decrypt(encryptedData: { encrypted: string; iv: string; tag: string }): string {
    const decipher = crypto.createDecipher(
      this.algorithm, 
      this.key
    );
    
    decipher.setAAD(Buffer.from('coachprotalent', 'utf8'));
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

## 🛡️ Protection contre les Attaques

### 1. Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

// Rate limiting global
const globalLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:global:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite par IP
  message: 'Trop de requêtes, veuillez réessayer plus tard',
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting pour l'authentification
const authLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:auth:'
  }),
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 tentatives de connexion par 15min
  skipSuccessfulRequests: true,
  message: 'Trop de tentatives de connexion, veuillez réessayer plus tard'
});
```

### 2. Protection CSRF

```typescript
import csrf from 'csurf';

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// Middleware pour les routes sensibles
app.use('/api/auth', csrfProtection);
```

### 3. Validation et Sanitisation

```typescript
import Joi from 'joi';
import DOMPurify from 'isomorphic-dompurify';

// Schémas de validation
const userRegistrationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  countryCode: Joi.string().length(3).required()
});

// Middleware de validation
const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Données invalides',
        details: error.details.map(d => d.message)
      });
    }
    next();
  };
};

// Sanitisation des entrées
const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
};
```

### 4. Protection XSS

```typescript
// Headers de sécurité
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://api.coachprotalent.com;"
  );
  
  next();
});
```

## 🔍 Audit et Monitoring

### 1. Logs de Sécurité

```typescript
import winston from 'winston';

const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/security.log',
      level: 'warn'
    }),
    new winston.transports.Console()
  ]
});

// Middleware de logging des événements de sécurité
const securityAudit = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log des tentatives d'authentification
    if (req.path.includes('/auth/login')) {
      securityLogger.info({
        event: 'login_attempt',
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        success: res.statusCode === 200,
        timestamp: new Date().toISOString()
      });
    }
    
    // Log des accès aux ressources sensibles
    if (req.path.includes('/admin') || req.path.includes('/api/users')) {
      securityLogger.info({
        event: 'sensitive_access',
        userId: req.user?.id,
        path: req.path,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString()
      });
    }
    
    originalSend.call(this, data);
  };
  
  next();
};
```

### 2. Détection d'Intrusion

```typescript
class IntrusionDetection {
  private suspiciousIPs = new Map<string, number>();
  private readonly THRESHOLD = 10;

  async checkSuspiciousActivity(ip: string, event: string): Promise<boolean> {
    const key = `${ip}:${event}`;
    const count = this.suspiciousIPs.get(key) || 0;
    
    if (count > this.THRESHOLD) {
      await this.blockIP(ip);
      securityLogger.warn({
        event: 'ip_blocked',
        ip,
        reason: 'suspicious_activity',
        count,
        timestamp: new Date().toISOString()
      });
      return true;
    }
    
    this.suspiciousIPs.set(key, count + 1);
    return false;
  }

  private async blockIP(ip: string): Promise<void> {
    // Ajouter l'IP à la liste de blocage
    await redisClient.sadd('blocked_ips', ip);
    await redisClient.expire('blocked_ips', 3600); // 1 heure
  }
}
```

## 📋 Checklist de Sécurité

### Développement
- [ ] Validation stricte de toutes les entrées utilisateur
- [ ] Utilisation de paramètres préparés pour les requêtes SQL
- [ ] Chiffrement des données sensibles
- [ ] Gestion sécurisée des sessions
- [ ] Implémentation de l'authentification 2FA
- [ ] Headers de sécurité configurés
- [ ] Rate limiting implémenté
- [ ] Logs de sécurité activés

### Déploiement
- [ ] HTTPS obligatoire
- [ ] Certificats SSL valides
- [ ] Firewall configuré
- [ ] Mises à jour de sécurité appliquées
- [ ] Sauvegardes chiffrées
- [ ] Monitoring des performances
- [ ] Tests de pénétration effectués

### Maintenance
- [ ] Audit de sécurité trimestriel
- [ ] Mise à jour des dépendances
- [ ] Révision des logs de sécurité
- [ ] Formation de l'équipe sur les nouvelles menaces
- [ ] Plan de réponse aux incidents

## 🚨 Plan de Réponse aux Incidents

### 1. Classification des Incidents
- **Critique** : Compromission de données, accès non autorisé
- **Élevé** : Tentatives d'intrusion, déni de service
- **Moyen** : Vulnérabilités détectées, comportements suspects
- **Faible** : Alertes de sécurité mineures

### 2. Procédure de Réponse
1. **Détection** : Système d'alerte automatique
2. **Évaluation** : Classification de la gravité
3. **Containment** : Isolation de la menace
4. **Éradication** : Suppression de la menace
5. **Récupération** : Retour à la normale
6. **Leçons apprises** : Amélioration des processus

### 3. Contacts d'Urgence
- **Équipe de sécurité** : security@traillearn.com
- **DPO** : dpo@traillearn.com
- **Direction** : management@traillearn.com
- **Support technique 24/7** : +33 1 23 45 67 89
