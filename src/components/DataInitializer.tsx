'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

export default function DataInitializer() {
  const { initDemoData } = useAuthStore()

  useEffect(() => {
    // Initialiser les données de démonstration au démarrage
    initDemoData()
  }, [initDemoData])

  return null // Ce composant ne rend rien
}
