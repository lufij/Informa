import { useState, useEffect } from 'react'

/**
 * Hook para detectar si la PWA está instalada
 * Funciona en Android, iOS y desktop
 */
export function useAppInstalled() {
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const checkInstalled = () => {
      // Método 1: display-mode standalone (funciona en la mayoría)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      
      // Método 2: navigator.standalone (específico de iOS)
      const isIOSStandalone = (window.navigator as any).standalone === true
      
      // Método 3: Verificar si la app fue lanzada desde home screen
      const isInStandaloneMode = isStandalone || isIOSStandalone
      
      return isInStandaloneMode
    }

    // Check inicial
    const installed = checkInstalled()
    setIsInstalled(installed)

    // Escuchar cuando la app se instala
    const handleAppInstalled = () => {
      setIsInstalled(true)
    }

    window.addEventListener('appinstalled', handleAppInstalled)

    // Revisar periódicamente (útil para iOS)
    const interval = setInterval(() => {
      const currentlyInstalled = checkInstalled()
      if (currentlyInstalled !== isInstalled) {
        setIsInstalled(currentlyInstalled)
      }
    }, 2000)

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled)
      clearInterval(interval)
    }
  }, [isInstalled])

  return isInstalled
}
