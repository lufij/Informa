import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { UserAvatar } from './components/UserAvatar'
import { ContentSkeleton } from './components/ContentSkeleton'
import { FixPhoneButton } from './components/FixPhoneButton'
import ErrorBoundary from './components/ErrorBoundary'

// Lazy load componentes pesados
const LoginPage = lazy(() => import('./components/LoginPage').then(m => ({ default: m.LoginPage })))
const SignupPage = lazy(() => import('./components/SignupPage').then(m => ({ default: m.SignupPage })))
const NewsSection = lazy(() => import('./components/NewsSection').then(m => ({ default: m.NewsSection })))
const AlertsSection = lazy(() => import('./components/AlertsSection').then(m => ({ default: m.AlertsSection })))
const ClassifiedsSection = lazy(() => import('./components/ClassifiedsSection').then(m => ({ default: m.ClassifiedsSection })))
const ForumsSection = lazy(() => import('./components/ForumsSection').then(m => ({ default: m.ForumsSection })))
const UserSettings = lazy(() => import('./components/UserSettings').then(m => ({ default: m.UserSettings })))
const NotificationsPanel = lazy(() => import('./components/NotificationsPanel').then(m => ({ default: m.NotificationsPanel })))
const GlobalSearch = lazy(() => import('./components/GlobalSearch').then(m => ({ default: m.GlobalSearch })))
const UnifiedFeed = lazy(() => import('./components/UnifiedFeed').then(m => ({ default: m.UnifiedFeed })))
const MessagingPanel = lazy(() => import('./components/MessagingPanel').then(m => ({ default: m.MessagingPanel })))
const SavedPosts = lazy(() => import('./components/SavedPosts').then(m => ({ default: m.SavedPosts })))
const TrendingContent = lazy(() => import('./components/TrendingContent').then(m => ({ default: m.TrendingContent })))
const AdminReportsPanel = lazy(() => import('./components/AdminReportsPanel').then(m => ({ default: m.AdminReportsPanel })))
const FirefighterEmergencyButton = lazy(() => import('./components/FirefighterEmergencyButton').then(m => ({ default: m.FirefighterEmergencyButton })))
const PWAInstallPrompt = lazy(() => import('./components/PWAInstallPrompt').then(m => ({ default: m.PWAInstallPrompt })))
const PWANetworkStatus = lazy(() => import('./components/PWANetworkStatus').then(m => ({ default: m.PWANetworkStatus })))
const PublicContentView = lazy(() => import('./components/PublicContentView').then(m => ({ default: m.PublicContentView })))
const InstallAppBanner = lazy(() => import('./components/InstallAppBanner').then(m => ({ default: m.InstallAppBanner })))
const FloatingInstallButton = lazy(() => import('./components/FloatingInstallButton').then(m => ({ default: m.FloatingInstallButton })))
// const EmergencyAlertBanner = lazy(() => import('./components/EmergencyAlertBanner').then(m => ({ default: m.EmergencyAlertBanner })))
import { Button } from './components/ui/button'
import { Badge } from './components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { Toaster } from './components/ui/sonner'
import { toast } from 'sonner'
import { getSupabaseClient } from './utils/supabase/client'
import { projectId, publicAnonKey } from './utils/supabase/info'
import { LogOut, Sparkles, TrendingUp, LogIn, UserPlus, Bell, Search, Mail, Bookmark, Rss, Shield, User, Menu } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './components/ui/dropdown-menu'
// import logoCircular from 'figma:asset/159f250301c9fc78337e0c8aa784431ded1c39c8.png'

export default function App() {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('feed')
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showMessages, setShowMessages] = useState(false)
  const [showSaved, setShowSaved] = useState(false)
  const [showTrending, setShowTrending] = useState(false)
  const [showAdminReports, setShowAdminReports] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [messageRecipientId, setMessageRecipientId] = useState<string | undefined>(undefined)
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null)
  const [alertsRefreshTrigger, setAlertsRefreshTrigger] = useState(0)
  
  // Deep linking states
  const [deepLinkView, setDeepLinkView] = useState<'news' | 'alert' | 'classified' | 'forum' | null>(null)
  const [deepLinkId, setDeepLinkId] = useState<string | null>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // Update page title
    document.title = 'Informa - Lo que está pasando ahora'
    
    // Prevenir múltiples ejecuciones usando variable global mejorada
    if ((window as any).__INFORMA_INITIALIZED) {
      return
    }
    ;(window as any).__INFORMA_INITIALIZED = true
    
    // Check for deep links FIRST (before checking session)
    const params = new URLSearchParams(window.location.search)
    const view = params.get('view')
    const id = params.get('id')
    
    if (view && id && ['news', 'alert', 'classified', 'forum'].includes(view)) {
      setDeepLinkView(view as any)
      setDeepLinkId(id)
      setShowInstallBanner(true)
    }
    
    // Check existing session (critical)
    checkExistingSession()
    
    // Diferir llamadas no críticas más tiempo para evitar sobrecarga
    const migrationTimeout = setTimeout(() => {
      migrateFirefighterUser().catch(console.error)
    }, 5000) // Aumentado a 5 segundos
    
    // Listen for PWA install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      clearTimeout(migrationTimeout)
    }
  }, []) // Sin dependencias para evitar re-ejecuciones
  
  // Auto-suscribir a push notifications cuando el usuario está autenticado
  useEffect(() => {
    if (isAuthenticated && token) {
      // Esperar 3 segundos después del login para pedir permisos
      const timer = setTimeout(() => {
        subscribeToPushNotifications()
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, token])
  
  // Request notification permissions
  const requestNotificationPermission = async () => {
    // Only request if notifications are supported
    if (!('Notification' in window)) {
      console.log('Este navegador no soporta notificaciones')
      return
    }
    
    // Check current permission
    if (Notification.permission === 'granted') {
      console.log('Permisos de notificación ya concedidos')
      return
    }
    
    // Don't ask immediately on first load - wait for user to be authenticated
    // This will be called again when user logs in
    if (Notification.permission === 'default' && isAuthenticated) {
      try {
        const permission = await Notification.requestPermission()
        if (permission === 'granted') {
          console.log('Permisos de notificación concedidos')
          // Subscribe to push notifications
          await subscribeToPushNotifications()
        }
      } catch (error) {
        console.error('Error solicitando permisos de notificación:', error)
      }
    }
  }
  
  // Subscribe to push notifications
  const subscribeToPushNotifications = async () => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.log('Push notifications no soportadas')
        return
      }

      const { requestNotificationPermission, subscribeToPushNotifications: subscribe } = await import('./utils/notificationService')
      
      const hasPermission = await requestNotificationPermission()
      if (!hasPermission) {
        console.log('Permisos de notificación denegados')
        return
      }

      await subscribe(token || '')
      console.log('✅ Suscrito a push notifications')
    } catch (error) {
      console.error('Error suscribiendo a push notifications:', error)
    }
  }
  
  // Handle deep link navigation when user is already authenticated
  useEffect(() => {
    if (!isAuthenticated || !deepLinkView || !deepLinkId) {
      return
    }

    const sectionMap = {
      news: 'news',
      alert: 'alerts',
      classified: 'classifieds',
      forum: 'forums'
    }
    
    setActiveTab(sectionMap[deepLinkView] as any)
    setHighlightedItemId(deepLinkId)
    setDeepLinkView(null)
    setDeepLinkId(null)
    setShowInstallBanner(false)
    
    toast.success('Te llevamos al contenido 👋', {
      duration: 2000
    })
  }, [isAuthenticated, deepLinkView, deepLinkId])
  
  // const handleViewEmergencyAlert = (alertId: string) => {
  //   setActiveTab('alertas')
  //   setHighlightedItemId(alertId)
  //   setTimeout(() => setHighlightedItemId(null), 5000)
  // }
  
  const handleInstallPWA = async () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    
    if (deferredPrompt) {
      try {
        console.log('Intentando instalar PWA...')
        // Show the install prompt
        const promptResult = await deferredPrompt.prompt()
        console.log('Prompt mostrado:', promptResult)
        
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice
        console.log('Resultado de instalación:', outcome)
        
        if (outcome === 'accepted') {
          toast.success('¡App instalada! 🎉', {
            description: 'Ahora puedes acceder desde tu pantalla de inicio'
          })
        } else {
          toast.info('Instalación cancelada', {
            description: 'El botón seguirá disponible si cambias de opinión'
          })
        }
        
        // Clear the prompt as it can only be used once
        setDeferredPrompt(null)
        setShowInstallBanner(false)
      } catch (error) {
        console.error('Error al instalar PWA:', error)
        toast.error('Error al instalar', {
          description: 'Intenta desde el menú de Chrome: Más opciones > Instalar app',
          duration: 5000
        })
      }
    } else {
      console.log('No hay deferredPrompt disponible')
      // No prompt available
      if (isIOS) {
        toast.info('Instrucciones para iOS', {
          description: 'En Safari: toca Compartir > Añadir a pantalla de inicio',
          duration: 6000
        })
      } else {
        toast.info('Instalar desde el navegador', {
          description: 'En Chrome: Menú (⋮) > Instalar aplicación',
          duration: 6000
        })
      }
    }
  }
  
  const handleDeepLinkLogin = () => {
    setShowAuthDialog(true)
    // After login, they'll be redirected to the content
  }

  const migrateFirefighterUser = async () => {
    // Verificar si ya se ejecutó usando localStorage
    const migrationKey = 'firefighter_migration_completed'
    if (localStorage.getItem(migrationKey) === 'true') {
      return // Ya se ejecutó, no volver a ejecutar
    }
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/auth/migrate-firefighter`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      )
      
      if (response.ok) {
        // Marcar como completado
        localStorage.setItem(migrationKey, 'true')
      }
    } catch (error) {
      // Silent fail - this is just a helper migration
      // No marcar como completado si falla
    }
  }

  const fetchUnreadCount = useCallback(async () => {
    if (!token) return
    
    // Prevenir múltiples llamadas simultáneas
    if ((fetchUnreadCount as any).__fetching) {
      return
    }
    (fetchUnreadCount as any).__fetching = true
    
    try {
      // Timeout mejorado para evitar esperas infinitas en móviles
      const controller = new AbortController()
      setTimeout(() => controller.abort(), 5000)
      
      const fetchPromise = fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/notifications`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          signal: controller.signal
        }
      )
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Notification fetch timeout')), 5000)
      )
      
      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response
      
      if (response.ok) {
        const notifications = await response.json()
        const unread = notifications.filter((n: any) => !n.read).length
        setUnreadNotifications(unread)
      }
    } catch (error) {
      // Silent fail - no mostrar errores para evitar bucles
      console.log('Notification fetch skipped (timeout or error)')
    } finally {
      // Limpiar flag de fetching
      (fetchUnreadCount as any).__fetching = false
    }
  }, [token]) // Memoizar con dependencia de token

  // Poll for unread notifications (diferido y optimizado)
  useEffect(() => {
    if (!isAuthenticated || !token) {
      return
    }
    
    // Prevenir múltiples efectos ejecutándose
    let mounted = true
    
    // Diferir primera carga de notificaciones 1 segundo
    const initialTimeout = setTimeout(() => {
      if (mounted && navigator.onLine) {
        fetchUnreadCount()
      }
    }, 1000)
    
    // Polling cada 30 segundos con verificación de mounted
    const interval = setInterval(() => {
      if (mounted && navigator.onLine && isAuthenticated && token) {
        fetchUnreadCount()
      }
    }, 30000)
    
    return () => {
      mounted = false
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [isAuthenticated, token, fetchUnreadCount]) // Añadir fetchUnreadCount memoizado

  const checkExistingSession = async () => {
    try {
      const supabase = getSupabaseClient()

      // Timeout mejorado para evitar esperas infinitas
      const sessionPromise = supabase.auth.getSession()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Session check timeout')), 10000)
      )
      
      const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any

      if (session && session.access_token) {
        // Establecer token inmediatamente para mostrar UI
        setToken(session.access_token)
        setIsAuthenticated(true)
        setIsCheckingSession(false) // Liberar UI inmediatamente
        
        // Fetch user profile en background (no bloquea la UI)
        const profilePromise = fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/auth/profile`,
          {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          }
        )
        
        // Timeout para profile también
        const profileTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile fetch timeout')), 8000)
        )
        
        Promise.race([profilePromise, profileTimeoutPromise])
        .then((response: any) => {
          if (response.ok) {
            return response.json()
          }
          throw new Error('Profile fetch failed')
        })
        .then(profile => {
          console.log('✅ Perfil recibido:', profile)
          console.log('📱 Teléfono:', profile.phone)
          console.log('👤 Rol:', profile.role)
          
          setUserProfile(profile)
          
          // Show admin welcome for main administrator
          if (profile.phone === '50404987' && profile.role === 'admin' && !deepLinkView) {
            setTimeout(() => {
              toast.success('👑 Bienvenido Administrador', {
                description: 'Tienes acceso completo al panel de administración y moderación.',
                duration: 4000
              })
            }, 1000)
          }
          // Show welcome message for firefighters on session restore (if no deep link)
          else if (profile.role === 'firefighter' && !deepLinkView) {
            setTimeout(() => {
              toast.info('🚒 Sistema de Emergencias Activo', {
                description: 'Botón de alertas por voz disponible en la esquina inferior derecha.',
                duration: 4000
              })
            }, 1000)
          }
        })
        .catch(error => {
          // Si falla el perfil, NO cerrar sesión para evitar bucles
          console.error('Error fetching profile (non-critical):', error)
          // Fallback: crear un perfil mínimo para evitar errores en UI
          if (!userProfile) {
            setUserProfile({
              id: 'temp',
              name: 'Usuario',
              phone: '',
              role: 'user'
            })
          }
        })
      } else {
        setIsCheckingSession(false)
      }
    } catch (error) {
      console.error('Error al verificar sesión:', error)
      setIsCheckingSession(false)
    }
  }

  const handleLoginSuccess = (accessToken: string, profile: any) => {
    console.log('🔐 Login exitoso!')
    console.log('✅ Perfil recibido:', profile)
    console.log('📱 Teléfono:', profile.phone)
    console.log('👤 Rol:', profile.role)
    
    setToken(accessToken)
    setUserProfile(profile)
    setIsAuthenticated(true)
    
    // Request notification permissions after successful login
    setTimeout(() => {
      requestNotificationPermission()
    }, 2000)
    
    // Show welcome message based on context
    if (!deepLinkView) {
      if (profile.phone === '50404987' && profile.role === 'admin') {
        // Show special welcome for main administrator
        setTimeout(() => {
          toast.success('👑 Bienvenido Administrador Principal', {
            description: 'Tienes acceso completo al panel de administración. Mira el botón "Admin" en el header.',
            duration: 5000
          })
        }, 500)
      } else if (profile.role === 'moderator') {
        setTimeout(() => {
          toast.success('🛡️ Bienvenido Moderador', {
            description: 'Puedes gestionar reportes y moderación. Mira el botón "Mod" en el header.',
            duration: 4000
          })
        }, 500)
      } else if (profile.role === 'firefighter') {
        // Show special welcome message for firefighters
        setTimeout(() => {
          toast.success('🚒 Bienvenido, Bomberos Voluntarios de Gualán', {
            description: 'Tienes acceso al sistema de alertas de emergencia por voz. Mira el botón rojo en la esquina inferior derecha.',
            duration: 5000
          })
        }, 500)
      } else {
        toast.success('¡Bienvenido de vuelta! 👋', {
          duration: 2000
        })
      }
    }
    // Deep link navigation will be handled by the useEffect
  }

  const handleSignupSuccess = (accessToken: string, profile: any) => {
    setToken(accessToken)
    setUserProfile(profile)
    setIsAuthenticated(true)
    setShowAuthDialog(false)
    
    // Show welcome message
    setTimeout(() => {
      toast.success('🎉 ¡Bienvenido a Informa!', {
        description: `Hola ${profile.name}, tu cuenta ha sido creada exitosamente.`,
        duration: deepLinkView ? 3000 : 5000
      })
    }, 500)
    
    // Deep link navigation will be handled by the useEffect
  }

  const handleProfileUpdate = (updatedProfile: any) => {
    setUserProfile(updatedProfile)
  }

  const handleLogout = async () => {
    try {
      const supabase = getSupabaseClient()
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
    
    setToken(null)
    setUserProfile(null)
    setIsAuthenticated(false)
  }

  // Componente de carga mejorado
  const LoadingScreen = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center shadow-2xl mb-4 animate-bounce">
        <img 
          src="/icons/icon-192x192.png" 
          alt="Informa" 
          className="w-full h-full object-contain p-2"
        />
      </div>
      <div className="text-white flex items-center gap-2 text-lg">
        <Sparkles className="w-5 h-5 animate-spin" />
        <span>Cargando Informa...</span>
      </div>
      <p className="text-white/80 mt-2 text-sm">Tu comunidad en línea</p>
    </div>
  )

  // Componente de suspense para lazy loading (simple para dialogs)
  const SuspenseFallback = () => (
    <div className="flex items-center justify-center p-8">
      <Sparkles className="w-5 h-5 animate-spin text-pink-500" />
    </div>
  )
  
  // Skeleton para secciones de contenido
  const ContentLoader = () => <ContentSkeleton />

  if (isCheckingSession) {
    return <LoadingScreen />
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50">
      {/* Header - Mobile Optimized */}
      <header className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 sticky top-0 z-10 shadow-lg">
        <div className="w-full px-3 sm:px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            {/* Logo and Title */}
            <div className="flex items-center gap-2 min-w-0 flex-shrink">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center shadow-lg p-1 flex-shrink-0">
                <img 
                  src="/icons/icon-192x192.png" 
                  alt="Informa Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-white text-base sm:text-xl flex items-center gap-1 sm:gap-2">
                  <span className="truncate">Informa</span>
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                </h1>
                <p className="text-xs text-white/90 hidden sm:flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Lo que está pasando ahora
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {isAuthenticated ? (
                <>
                  {/* Mobile: Compact Menu Dropdown */}
                  <div className="md:hidden">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-white hover:bg-white/20 h-9 w-9 p-0"
                        >
                          <Menu className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => setShowSettings(true)}>
                          <User className="w-4 h-4 mr-2" />
                          Mi Perfil
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setShowSearch(true)}>
                          <Search className="w-4 h-4 mr-2" />
                          Buscar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setShowTrending(true)}>
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Trending
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setShowSaved(true)}>
                          <Bookmark className="w-4 h-4 mr-2" />
                          Guardados
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setShowMessages(true)}>
                          <Mail className="w-4 h-4 mr-2" />
                          Mensajes
                        </DropdownMenuItem>
                        {(userProfile?.role === 'admin' || userProfile?.role === 'moderator') && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setShowAdminReports(true)}>
                              <Shield className="w-4 h-4 mr-2" />
                              {userProfile?.role === 'admin' ? 'Admin' : 'Moderación'}
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={handleLogout}
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Cerrar Sesión
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Desktop: Full Buttons */}
                  <div className="hidden md:flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowSearch(true)}
                      className="text-white hover:bg-white/20 h-9 w-9 p-0"
                      title="Buscar"
                    >
                      <Search className="w-5 h-5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowTrending(true)}
                      className="text-white hover:bg-white/20 h-9 w-9 p-0"
                      title="Trending"
                    >
                      <TrendingUp className="w-5 h-5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowSaved(true)}
                      className="text-white hover:bg-white/20 h-9 w-9 p-0"
                      title="Guardados"
                    >
                      <Bookmark className="w-5 h-5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowMessages(true)}
                      className="text-white hover:bg-white/20 h-9 w-9 p-0"
                      title="Mensajes"
                    >
                      <Mail className="w-5 h-5" />
                    </Button>
                    {(userProfile?.role === 'admin' || userProfile?.role === 'moderator') && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowAdminReports(true)}
                        className="text-white hover:bg-white/20 h-9 px-3"
                        title={userProfile?.role === 'admin' ? 'Panel de Admin' : 'Panel de Moderación'}
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        {userProfile?.role === 'admin' ? 'Admin' : 'Mod'}
                      </Button>
                    )}
                  </div>

                  {/* Notifications - Always visible */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowNotifications(true)}
                    className="text-white hover:bg-white/20 h-9 w-9 p-0 relative flex-shrink-0"
                    title="Notificaciones"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadNotifications > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-4 min-w-[16px] flex items-center justify-center px-1 bg-red-500 text-white text-[10px]">
                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                      </Badge>
                    )}
                  </Button>

                  {/* Firefighter Badge */}
                  {userProfile?.role === 'firefighter' && (
                    <Badge className="bg-red-600 text-white h-8 px-2 border-0 animate-pulse hidden sm:flex">
                      <span className="text-sm">🚒</span>
                    </Badge>
                  )}

                  {/* User Avatar - Compact */}
                  {userProfile && (
                    <button
                      onClick={() => setShowSettings(true)}
                      className="flex items-center gap-1 rounded-lg hover:bg-white/20 transition-all p-1 flex-shrink-0"
                      title="Mi Perfil"
                    >
                      <UserAvatar
                        userId={userProfile.id}
                        userName={userProfile.name}
                        profilePhoto={userProfile.profile_photo}
                        size="sm"
                      />
                    </button>
                  )}

                  {/* Logout - Always visible */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLogout}
                    className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 p-0 flex items-center justify-center flex-shrink-0"
                    title="Cerrar Sesión"
                  >
                    <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                </>
              ) : (
                <>
                  {/* Guest buttons - compact on mobile */}
                  <Button 
                    size="sm" 
                    onClick={() => {
                      setAuthMode('login')
                      setShowAuthDialog(true)
                    }}
                    className="bg-white text-pink-600 hover:bg-white/90 h-9 px-3"
                  >
                    <LogIn className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Ingresar</span>
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => {
                      setAuthMode('signup')
                      setShowAuthDialog(true)
                    }}
                    className="bg-purple-600 text-white hover:bg-purple-700 h-9 px-3"
                  >
                    <UserPlus className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Registrarse</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-3 sm:px-4 py-4 sm:py-6 max-w-4xl mx-auto">
        {/* Show Public Content View if deep link exists and user is not authenticated */}
        {deepLinkView && deepLinkId && !isAuthenticated ? (
          <Suspense fallback={<SuspenseFallback />}>
            <PublicContentView
              contentType={deepLinkView}
              contentId={deepLinkId}
              onInstallClick={handleInstallPWA}
              onLoginClick={handleDeepLinkLogin}
            />
          </Suspense>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-5 mb-4 sm:mb-6 h-auto bg-white/80 backdrop-blur-sm shadow-md overflow-x-auto">
            <TabsTrigger value="feed" className="flex flex-col sm:flex-row items-center justify-center gap-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white text-xs sm:text-sm py-2 px-1 min-w-0">
              <Rss className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline truncate">Feed</span>
            </TabsTrigger>
            <TabsTrigger value="news" className="flex flex-col sm:flex-row items-center justify-center gap-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-orange-500 data-[state=active]:text-white text-xs sm:text-sm py-2 px-1 min-w-0">
              <span className="text-base flex-shrink-0">🔥</span>
              <span className="hidden sm:inline truncate">Noticias</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex flex-col sm:flex-row items-center justify-center gap-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white text-xs sm:text-sm py-2 px-1 min-w-0">
              <span className="text-base flex-shrink-0">📢</span>
              <span className="hidden sm:inline truncate">Alertas</span>
            </TabsTrigger>
            <TabsTrigger value="classifieds" className="flex flex-col sm:flex-row items-center justify-center gap-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white text-xs sm:text-sm py-2 px-1 min-w-0">
              <span className="text-base flex-shrink-0">💼</span>
              <span className="hidden sm:inline truncate">Clasif.</span>
            </TabsTrigger>
            <TabsTrigger value="forums" className="flex flex-col sm:flex-row items-center justify-center gap-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-xs sm:text-sm py-2 px-1 min-w-0">
              <span className="text-base flex-shrink-0">💬</span>
              <span className="hidden sm:inline truncate">Foros</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed">
            <Suspense fallback={<ContentLoader />}>
              <UnifiedFeed
                token={token}
                userProfile={userProfile}
                onNavigate={(section, itemId) => {
                  setHighlightedItemId(itemId)
                  setActiveTab(section)
                }}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="news">
            <Suspense fallback={<ContentLoader />}>
              <NewsSection 
                token={token} 
                userProfile={userProfile} 
                onRequestAuth={() => setShowAuthDialog(true)}
                onOpenSettings={() => setShowSettings(true)}
                onNavigateToPost={(section, _postId) => setActiveTab(section)}
                highlightedItemId={highlightedItemId}
                onItemHighlighted={() => setHighlightedItemId(null)}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="alerts">
            <Suspense fallback={<ContentLoader />}>
              <AlertsSection 
                token={token} 
                userProfile={userProfile} 
                onRequestAuth={() => setShowAuthDialog(true)}
                onOpenSettings={() => setShowSettings(true)}
                onNavigateToPost={(section, _postId) => setActiveTab(section)}
                highlightedItemId={highlightedItemId}
                onItemHighlighted={() => setHighlightedItemId(null)}
                refreshTrigger={alertsRefreshTrigger}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="classifieds">
            <Suspense fallback={<ContentLoader />}>
              <ClassifiedsSection 
                token={token} 
                userProfile={userProfile} 
                onRequestAuth={() => setShowAuthDialog(true)}
                onOpenSettings={() => setShowSettings(true)}
                onNavigateToPost={(section, _postId) => setActiveTab(section)}
                highlightedItemId={highlightedItemId}
                onItemHighlighted={() => setHighlightedItemId(null)}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="forums">
            <Suspense fallback={<ContentLoader />}>
              <ForumsSection 
                token={token} 
                userProfile={userProfile} 
                onRequestAuth={() => setShowAuthDialog(true)}
                onOpenSettings={() => setShowSettings(true)}
                onNavigateToPost={(section, _postId) => setActiveTab(section)}
                highlightedItemId={highlightedItemId}
                onItemHighlighted={() => setHighlightedItemId(null)}
              />
            </Suspense>
          </TabsContent>
        </Tabs>
        )}
      </main>

      {/* Auth Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="max-w-md bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-pink-500" />
              {authMode === 'login' ? '¡Bienvenido de vuelta!' : '¡Únete a la comunidad!'}
            </DialogTitle>
            <DialogDescription className="text-center">
              {authMode === 'login' 
                ? 'Ingresa tu número de celular para acceder' 
                : 'Regístrate con tu nombre y número'}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Suspense fallback={<SuspenseFallback />}>
              {authMode === 'login' ? (
                <div className="space-y-4">
                  <LoginPage
                    onLoginSuccess={(accessToken, profile) => {
                      handleLoginSuccess(accessToken, profile)
                      setShowAuthDialog(false)
                    }}
                    onSwitchToSignup={() => setAuthMode('signup')}
                    embedded={true}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <SignupPage
                    onSignupSuccess={(accessToken, profile) => {
                      handleSignupSuccess(accessToken, profile)
                    }}
                    onSwitchToLogin={() => setAuthMode('login')}
                    embedded={true}
                  />
                </div>
              )}
            </Suspense>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Settings Dialog */}
      {isAuthenticated && token && userProfile && showSettings && (
        <Suspense fallback={null}>
          <UserSettings
            open={showSettings}
            onOpenChange={setShowSettings}
            token={token}
            userProfile={userProfile}
            onProfileUpdate={handleProfileUpdate}
          />
        </Suspense>
      )}

      {/* Notifications Panel */}
      {isAuthenticated && token && showNotifications && (
        <Suspense fallback={null}>
          <NotificationsPanel
            open={showNotifications}
            onOpenChange={(open) => {
              setShowNotifications(open)
              if (!open) {
                fetchUnreadCount()
              }
            }}
            token={token}
            onNavigate={(section, itemId) => {
              setHighlightedItemId(itemId || null)
              setActiveTab(section)
              setShowNotifications(false)
            }}
            onOpenMessages={(recipientId) => {
              setMessageRecipientId(recipientId)
              setShowMessages(true)
            }}
          />
        </Suspense>
      )}

      {/* Global Search */}
      {showSearch && (
        <Suspense fallback={null}>
          <GlobalSearch
            open={showSearch}
            onOpenChange={setShowSearch}
            onNavigate={(type, id) => {
              const sectionMap: Record<string, string> = {
                news: 'news',
                alert: 'alerts',
                classified: 'classifieds',
                event: 'classifieds',
                forum: 'forums',
                user: 'feed'
              }
              setHighlightedItemId(id)
              setActiveTab(sectionMap[type] || 'feed')
              setShowSearch(false)
            }}
          />
        </Suspense>
      )}

      {/* Messaging Panel */}
      {isAuthenticated && token && userProfile && showMessages && (
        <Suspense fallback={null}>
          <MessagingPanel
            open={showMessages}
            onOpenChange={(open) => {
              setShowMessages(open)
              if (!open) {
                setMessageRecipientId(undefined)
              }
            }}
            token={token}
            userProfile={userProfile}
            recipientId={messageRecipientId}
          />
        </Suspense>
      )}

      {/* Saved Posts */}
      {isAuthenticated && token && showSaved && (
        <Suspense fallback={null}>
          <SavedPosts
            open={showSaved}
            onOpenChange={setShowSaved}
            token={token}
            onNavigate={(section, itemId) => {
              setHighlightedItemId(itemId)
              setActiveTab(section)
              setShowSaved(false)
            }}
          />
        </Suspense>
      )}

      {/* Trending Content */}
      {showTrending && (
        <Suspense fallback={null}>
          <TrendingContent
            open={showTrending}
            onOpenChange={setShowTrending}
            onNavigate={(section, itemId) => {
              setHighlightedItemId(itemId)
              setActiveTab(section)
              setShowTrending(false)
            }}
          />
        </Suspense>
      )}

      {/* Admin Reports Panel */}
      {isAuthenticated && token && (userProfile?.role === 'admin' || userProfile?.role === 'moderator') && showAdminReports && (
        <Suspense fallback={null}>
          <AdminReportsPanel
            open={showAdminReports}
            onOpenChange={setShowAdminReports}
            token={token}
            userProfile={userProfile}
            onNavigate={(section, itemId) => {
              setHighlightedItemId(itemId)
              setActiveTab(section)
              setShowAdminReports(false)
            }}
          />
        </Suspense>
      )}

      {/* Firefighter Emergency Button */}
      {isAuthenticated && token && userProfile && (
        <Suspense fallback={null}>
          <FirefighterEmergencyButton
            token={token}
            userProfile={userProfile}
            onEmergencyPublished={() => {
              setAlertsRefreshTrigger(prev => prev + 1)
              setActiveTab('alerts')
            }}
          />
        </Suspense>
      )}

      {/* Fix Phone Button - Temporary migration button */}
      {isAuthenticated && userProfile && userProfile.role === 'user' && !userProfile.phone && (
        <FixPhoneButton />
      )}

      <Toaster />
      
      {/* Emergency Alert Banner - TEMPORARILY DISABLED */}
      {/*
      <Suspense fallback={null}>
        <EmergencyAlertBanner onViewAlert={handleViewEmergencyAlert} />
      </Suspense>
      */}
      
      {/* PWA Components */}
      <Suspense fallback={null}>
        <PWAInstallPrompt />
        <PWANetworkStatus />
        
        {/* Floating Install Button - Always visible when not installed */}
        <FloatingInstallButton
          deferredPrompt={deferredPrompt}
          onInstall={handleInstallPWA}
        />
        
        {/* Install App Banner for Deep Links */}
        {deepLinkView && deepLinkId && !isAuthenticated && (
          <InstallAppBanner
            onInstallClick={handleInstallPWA}
            visible={showInstallBanner}
          />
        )}
      </Suspense>
      </div>
    </ErrorBoundary>
  )
}
