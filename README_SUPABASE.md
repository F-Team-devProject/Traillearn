# 🚀 Configuration Supabase pour Traillearn

## Étapes Rapides

### 1. Créer un Projet Supabase
1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet nommé `traillearn`
3. Choisissez une région proche (Europe West)
4. Notez votre mot de passe de base de données

### 2. Exécuter le Schéma
1. Dans votre dashboard Supabase, allez dans **SQL Editor**
2. Créez une nouvelle requête
3. Copiez-collez le contenu de `supabase-schema.sql`
4. Exécutez la requête

### 3. Configurer les Variables d'Environnement
Créez un fichier `.env.local` à la racine du projet :

```bash
# Configuration Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Configuration de l'application
NEXT_PUBLIC_APP_URL=http://localhost:3000
DEV_MODE=false
```

### 4. Initialiser les Données de Test
```bash
npm run init-supabase
```

### 5. Démarrer l'Application
```bash
npm run dev
```

## 🎯 Comptes de Test Disponibles

Après l'initialisation, vous aurez accès à ces comptes :

| Email | Rôle | Statuts | Mot de passe |
|-------|------|---------|--------------|
| admin@traillearn.com | Admin | Étudiant + Mentor | password123 |
| visitor1@traillearn.com | Visiteur | Étudiant + Mentor | password123 |
| mentor@traillearn.com | Visiteur | Mentor validé | password123 |
| student@traillearn.com | Visiteur | Étudiant | password123 |
| visitor@traillearn.com | Visiteur | Aucun rôle | password123 |

## ✅ Vérification

1. Allez sur `http://localhost:3000/test`
2. Vérifiez que "Supabase Configuré" affiche "✅ Oui"
3. Testez la connexion avec les comptes ci-dessus

## 🎨 Fonctionnalités Testées

- ✅ Système multi-rôles (visiteur → étudiant/mentor)
- ✅ Validation des mentors par admin
- ✅ Système de bourses avec favoris et alertes
- ✅ Sessions de mentorat
- ✅ Événements et inscriptions
- ✅ Forums avec modération
- ✅ Alertes d'emploi
- ✅ Système de paiements
- ✅ Notifications
- ✅ Checklists administratives
- ✅ Aide à l'intégration
- ✅ Système de feedback et notation

## 🔧 Dépannage

### Erreur "Supabase Configuré: ❌ Non"
- Vérifiez vos variables d'environnement dans `.env.local`
- Assurez-vous que l'URL et les clés sont correctes

### Erreur de connexion à la base de données
- Vérifiez que le schéma a été exécuté sans erreur
- Assurez-vous que votre projet Supabase est actif

### Erreur d'authentification
- Vérifiez que les comptes ont été créés dans Authentication → Users
- Assurez-vous que les mots de passe sont corrects

## 📚 Documentation Complète

Pour plus de détails, consultez :
- `SUPABASE_CONFIG.md` - Configuration détaillée
- `SUPABASE_SETUP.md` - Guide complet de setup

## 🎉 Vous êtes prêt !

Votre application Traillearn est maintenant configurée avec Supabase et prête à être testée avec tous les rôles et fonctionnalités !
