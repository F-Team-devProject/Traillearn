#!/usr/bin/env node

/**
 * Script d'initialisation des données de test pour Supabase
 * Usage: node scripts/init-supabase.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes')
  console.error('Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définies dans .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function initTestData() {
  console.log('🚀 Initialisation des données de test pour Traillearn...')

  try {
    // Vérifier la connexion
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1)
    if (error) {
      console.error('❌ Erreur de connexion à Supabase:', error.message)
      process.exit(1)
    }

    console.log('✅ Connexion à Supabase établie')

    // Créer les utilisateurs de test dans l'authentification
    const testUsers = [
      {
        email: 'admin@traillearn.com',
        password: 'password123',
        user_metadata: {
          first_name: 'Admin',
          last_name: 'Traillearn'
        }
      },
      {
        email: 'visitor1@traillearn.com',
        password: 'password123',
        user_metadata: {
          first_name: 'Jean',
          last_name: 'Dupont'
        }
      },
      {
        email: 'mentor@traillearn.com',
        password: 'password123',
        user_metadata: {
          first_name: 'Marie',
          last_name: 'Martin'
        }
      },
      {
        email: 'student@traillearn.com',
        password: 'password123',
        user_metadata: {
          first_name: 'Pierre',
          last_name: 'Durand'
        }
      },
      {
        email: 'visitor@traillearn.com',
        password: 'password123',
        user_metadata: {
          first_name: 'Sophie',
          last_name: 'Leroy'
        }
      }
    ]

    console.log('👥 Création des comptes utilisateurs...')
    
    for (const user of testUsers) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        user_metadata: user.user_metadata,
        email_confirm: true
      })

      if (authError) {
        console.log(`⚠️  Utilisateur ${user.email} existe déjà ou erreur:`, authError.message)
      } else {
        console.log(`✅ Utilisateur ${user.email} créé`)
      }
    }

    // Vérifier que les profils utilisateurs existent
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(5)

    if (profilesError) {
      console.error('❌ Erreur lors de la récupération des profils:', profilesError.message)
    } else {
      console.log(`✅ ${profiles.length} profils utilisateurs trouvés`)
    }

    // Vérifier les mentors
    const { data: mentors, error: mentorsError } = await supabase
      .from('mentors')
      .select('*')
      .limit(5)

    if (mentorsError) {
      console.error('❌ Erreur lors de la récupération des mentors:', mentorsError.message)
    } else {
      console.log(`✅ ${mentors.length} mentors trouvés`)
    }

    // Vérifier les bourses
    const { data: scholarships, error: scholarshipsError } = await supabase
      .from('scholarships')
      .select('*')
      .limit(5)

    if (scholarshipsError) {
      console.error('❌ Erreur lors de la récupération des bourses:', scholarshipsError.message)
    } else {
      console.log(`✅ ${scholarships.length} bourses trouvées`)
    }

    // Vérifier les événements
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .limit(5)

    if (eventsError) {
      console.error('❌ Erreur lors de la récupération des événements:', eventsError.message)
    } else {
      console.log(`✅ ${events.length} événements trouvés`)
    }

    console.log('\n🎉 Initialisation terminée avec succès!')
    console.log('\n📋 Comptes de test disponibles:')
    console.log('• admin@traillearn.com (Admin - Tous les rôles)')
    console.log('• visitor1@traillearn.com (Visiteur - Double profil)')
    console.log('• mentor@traillearn.com (Mentor validé)')
    console.log('• student@traillearn.com (Étudiant)')
    console.log('• visitor@traillearn.com (Visiteur basique)')
    console.log('\n🔑 Mot de passe pour tous les comptes: password123')
    console.log('\n🌐 Accédez à votre application: http://localhost:3000')

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error.message)
    process.exit(1)
  }
}

// Exécuter le script
initTestData()
