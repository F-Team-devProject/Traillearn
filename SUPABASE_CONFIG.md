# Configuration Supabase Complète pour Traillearn

## 🚀 Configuration Initiale

### 1. Créer un Projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un compte ou connectez-vous
3. Cliquez sur "New Project"
4. Choisissez votre organisation
5. Remplissez les informations :
   - **Name**: `traillearn`
   - **Database Password**: Choisissez un mot de passe sécurisé (minimum 8 caractères)
   - **Region**: Choisissez la région la plus proche (Europe West pour la France)
6. Cliquez sur "Create new project"

### 2. Exécuter le Schéma de Base de Données

1. Allez dans **SQL Editor** dans votre dashboard Supabase
2. Créez une nouvelle requête
3. Copiez et exécutez le contenu du fichier `supabase-schema.sql`
4. Vérifiez que toutes les tables ont été créées sans erreur

### 3. Configuration de l'Authentification

1. Allez dans **Authentication** → **Settings**
2. Configurez :
   - **Site URL**: `http://localhost:3000` (pour le développement)
   - **Redirect URLs**: 
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000`
   - **Additional Redirect URLs**: Ajoutez votre domaine de production quand vous déployez

### 4. Configuration des Politiques RLS

Les politiques RLS sont déjà incluses dans le schéma. Elles permettent :
- Les utilisateurs de voir/modifier leurs propres données
- Les admins d'avoir accès à tout
- Les visiteurs de voir les contenus publics (bourses, événements, mentors approuvés)

### 5. Configuration des Variables d'Environnement

Créez un fichier `.env.local` à la racine du projet :

```bash
# Configuration Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Configuration de l'application
NEXT_PUBLIC_APP_URL=http://localhost:3000
DEV_MODE=false

# Configuration PayPal (pour les paiements)
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYPAL_MODE=sandbox

# Configuration email (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@traillearn.com

# Configuration SMS (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# Configuration OpenAI (pour l'IA d'orientation)
OPENAI_API_KEY=sk-your-openai-api-key
```

### 6. Récupérer les Clés API

1. Allez dans **Settings** → **API**
2. Copiez :
   - **Project URL** (ex: `https://your-project-id.supabase.co`)
   - **anon public** key
   - **service_role** key (gardez-la secrète !)

## 👥 Comptes de Test Créés

Le schéma crée automatiquement des comptes de test :

### Admin
- **Email**: `admin@traillearn.com`
- **Rôle**: Admin
- **Statuts**: Étudiant + Mentor (tous activés)
- **Niveau**: Platinum

### Visiteur 1 (Double Profil)
- **Email**: `visitor1@traillearn.com`
- **Rôle**: Visiteur
- **Statuts**: Étudiant + Mentor (tous activés)
- **Niveau**: Gold

### Mentor Validé
- **Email**: `mentor@traillearn.com`
- **Rôle**: Visiteur
- **Statuts**: Mentor validé
- **Niveau**: Silver

### Étudiant
- **Email**: `student@traillearn.com`
- **Rôle**: Visiteur
- **Statuts**: Étudiant activé
- **Niveau**: Bronze

### Visiteur Basique
- **Email**: `visitor@traillearn.com`
- **Rôle**: Visiteur
- **Statuts**: Aucun rôle activé
- **Niveau**: Bronze

## 🔐 Configuration des Mots de Passe

**IMPORTANT**: Les comptes de test sont créés dans la base de données, mais vous devez les créer dans l'authentification Supabase :

1. Allez dans **Authentication** → **Users**
2. Cliquez sur "Add user"
3. Créez chaque compte avec les emails ci-dessus
4. Utilisez le mot de passe : `password123` pour tous les comptes de test

## 🎯 Fonctionnalités Testées

### Système Multi-Rôles
- ✅ Visiteur de base
- ✅ Activation du rôle étudiant
- ✅ Demande de validation mentor
- ✅ Double profil (étudiant + mentor)

### Fonctionnalités Principales
- ✅ Système de bourses avec favoris et alertes
- ✅ Système de mentors avec validation admin
- ✅ Sessions de mentorat
- ✅ Événements et inscriptions
- ✅ Forums avec modération
- ✅ Alertes d'emploi
- ✅ Système de paiements PayPal
- ✅ Notifications email/SMS
- ✅ Checklists administratives
- ✅ Aide à l'intégration
- ✅ Système de feedback et notation

### Données de Test
- ✅ 2 mentors avec profils complets
- ✅ 2 bourses d'études (France)
- ✅ 2 événements (webinaire + bootcamp)
- ✅ Système de points et niveaux

## 🧪 Test de la Configuration

1. Redémarrez votre serveur de développement
2. Allez sur `http://localhost:3000/test`
3. Vérifiez que "Supabase Configuré" affiche "✅ Oui"
4. Testez la connexion avec les comptes créés

## 🔧 Dépannage

### Erreur "Invalid API key"
- Vérifiez que les clés API sont correctement copiées
- Assurez-vous que le fichier `.env.local` est à la racine du projet

### Erreur "Database connection failed"
- Vérifiez que l'URL du projet est correcte
- Assurez-vous que le projet Supabase est actif

### Les données ne s'affichent pas
- Vérifiez les politiques RLS
- Assurez-vous que l'utilisateur est bien authentifié

### Erreur d'authentification
- Vérifiez que les comptes sont créés dans Authentication → Users
- Vérifiez les URLs de redirection

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Guide Next.js + Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Politiques RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Authentification Supabase](https://supabase.com/docs/guides/auth)

## 🚨 Sécurité

- Ne commitez JAMAIS le fichier `.env.local`
- Gardez votre `service_role` key secrète
- Configurez toujours les politiques RLS
- Utilisez HTTPS en production
- Changez les mots de passe par défaut en production
