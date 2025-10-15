'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  href?: string
  label?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function BackButton({ 
  href = '/', 
  label = 'Retour', 
  variant = 'outline',
  size = 'default',
  className = ''
}: BackButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <Button 
      variant={variant}
      size={size}
      onClick={handleClick}
      className={`flex items-center gap-2 ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  )
}

// Composant spécialisé pour retourner au dashboard
export function BackToDashboardButton({ className = '' }: { className?: string }) {
  return (
    <BackButton 
      href="/profile/dashboard" 
      label="Retour au tableau de bord"
      className={className}
    />
  )
}

// Composant spécialisé pour retourner à l'accueil
export function BackToHomeButton({ className = '' }: { className?: string }) {
  return (
    <BackButton 
      href="/" 
      label="Retour à l'accueil"
      className={className}
    />
  )
}
