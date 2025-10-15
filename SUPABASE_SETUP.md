# Configuration Supabase pour Traillearn

## 🚀 Guide de Configuration Supabase

### 1. Créer un Projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un compte ou connectez-vous
3. Cliquez sur "New Project"
4. Choisissez votre organisation
5. Remplissez les informations :
   - **Name**: `traillearn`
   - **Database Password**: Choisissez un mot de passe sécurisé
   - **Region**: Choisissez la région la plus proche
6. Cliquez sur "Create new project"

### 2. Récupérer les Clés API

Une fois le projet créé :

1. Allez dans **Settings** → **API**
2. Copiez :
   - **Project URL** (ex: `https://your-project-id.supabase.co`)
   - **anon public** key
   - **service_role** key (gardez-la secrète !)

### 3. Configuration des Variables d'Environnement

Créez un fichier `.env.local` à la racine du projet :

```bash
# Configuration Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Configuration de l'application
NEXT_PUBLIC_APP_URL=http://localhost:3000
DEV_MODE=false

# Configuration PayPal (optionnel pour les tests)
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYPAL_MODE=sandbox

# Configuration email (optionnel)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@traillearn.com

# Configuration SMS (optionnel)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# Configuration OpenAI (pour l'IA d'orientation)
OPENAI_API_KEY=sk-your-openai-api-key
```

### 4. Exécuter le Schéma de Base de Données

1. Allez dans **SQL Editor** dans votre dashboard Supabase
2. Créez une nouvelle requête
3. Copiez et exécutez le contenu du fichier `supabase-schema.sql`

### 5. Configuration des Politiques RLS (Row Level Security)

Après avoir exécuté le schéma, configurez les politiques de sécurité :

#### Table `user_profiles`
```sql
-- Permettre aux utilisateurs de voir et modifier leur propre profil
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);
```

#### Table `scholarships`
```sql
-- Permettre à tous les utilisateurs authentifiés de voir les bourses
CREATE POLICY "Authenticated users can view scholarships" ON scholarships
    FOR SELECT USING (auth.role() = 'authenticated');
```

#### Table `mentoring_sessions`
```sql
-- Les utilisateurs peuvent voir leurs propres sessions
CREATE POLICY "Users can view own sessions" ON mentoring_sessions
    FOR SELECT USING (
        auth.uid() = mentor_id OR auth.uid() = student_id
    );
```

### 6. Configuration de l'Authentification

1. Allez dans **Authentication** → **Settings**
2. Configurez :
   - **Site URL**: `http://localhost:3000` (pour le développement)
   - **Redirect URLs**: `http://localhost:3000/auth/callback`
3. Activez les providers souhaités (Email, Google, etc.)

### 7. Configuration du Storage (optionnel)

Si vous voulez stocker des fichiers :

1. Allez dans **Storage**
2. Créez un bucket `avatars`
3. Configurez les politiques :
```sql
-- Permettre aux utilisateurs d'uploader leur avatar
CREATE POLICY "Users can upload own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );
```

### 8. Test de la Configuration

1. Redémarrez votre serveur de développement
2. Allez sur `http://localhost:3000/test`
3. Vérifiez que "Supabase Configuré" affiche "✅ Oui"

### 9. Comptes de Test

Une fois Supabase configuré, vous pouvez créer des comptes de test :

1. Allez sur `http://localhost:3000/auth/register`
2. Créez les comptes suivants :
   - **Admin**: `admin@traillearn.com`
   - **Visiteur**: `visitor@traillearn.com`
   - **Mentor**: `mentor@traillearn.com`
   - **Étudiant**: `student@traillearn.com`

### 10. Mise à Jour du Rôle Admin

Pour donner le rôle admin à un utilisateur :

1. Allez dans **Authentication** → **Users**
2. Trouvez l'utilisateur admin
3. Allez dans **SQL Editor** et exécutez :
```sql
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'admin@traillearn.com';
```

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

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Guide Next.js + Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Politiques RLS](https://supabase.com/docs/guides/auth/row-level-security)

## 🚨 Sécurité

- Ne commitez JAMAIS le fichier `.env.local`
- Gardez votre `service_role` key secrète
- Configurez toujours les politiques RLS
- Utilisez HTTPS en production
