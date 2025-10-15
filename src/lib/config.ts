// Configuration de l'application
export const config = {
  // Mode de développement - utilise localStorage au lieu de Supabase
  DEV_MODE: process.env.NODE_ENV === 'development',
  
  // URLs de l'application
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  
  // Configuration Supabase (pour la production)
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  
  // Vérifier si Supabase est configuré
  isSupabaseConfigured: () => {
    return !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-key'
    )
  },
  
  // Utiliser Supabase ou localStorage
  useSupabase: () => {
    return config.isSupabaseConfigured() && !config.DEV_MODE
  }
}


