import { useState, useEffect } from 'react'
import { LoginPage } from './components/LoginPage'
import { SignupPage } from './components/SignupPage'
import { NewsSection } from './components/NewsSection'
import { AlertsSection } from './components/AlertsSection'
import { ClassifiedsSection } from './components/ClassifiedsSection'
import { ForumsSection } from './components/ForumsSection'
import { UserSettings } from './components/UserSettings'
import { NotificationsPanel } from './components/NotificationsPanel'
import { GlobalSearch } from './components/GlobalSearch'
import { UnifiedFeed } from './components/UnifiedFeed'
import { MessagingPanel } from './components/MessagingPanel'
import { SavedPosts } from './components/SavedPosts'
import { TrendingContent } from './components/TrendingContent'
import { AdminReportsPanel } from './components/AdminReportsPanel'
import { UserAvatar } from './components/UserAvatar'
import { FirefighterEmergencyButton } from './components/FirefighterEmergencyButton'
import { PWAInstallPrompt } from './components/PWAInstallPrompt'
import { PWANetworkStatus } from './components/PWANetworkStatus'
import { PublicContentView } from './components/PublicContentView'
import { InstallAppBanner } from './components/InstallAppBanner'
import { FloatingInstallButton } from './components/FloatingInstallButton'
import { Button } from './components/ui/button'
import { Badge } from './components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { Toaster } from './components/ui/sonner'
import { toast } from 'sonner@2.0.3'
import { getSupabaseClient } from './utils/supabase/client'
import { projectId, publicAnonKey } from './utils/supabase/info'
import { Flame, Megaphone, ShoppingBag, MessageSquare, LogOut, Sparkles, TrendingUp, Eye, LogIn, UserPlus, Bell, Search, Mail, Bookmark, Rss, Shield, User, Menu } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './components/ui/dropdown-menu'
import logoCircular from 'figma:asset/159f250301c9fc78337e0c8aa784431ded1c39c8.png'

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
    
    // Check for deep links FIRST (before checking session)
    const params = new URLSearchParams(window.location.search)
    const view = params.get('view')
    const id = params.get('id')
    
    if (view && id && ['news', 'alert', 'classified', 'forum'].includes(view)) {
      setDeepLinkView(view as any)
      setDeepLinkId(id)
      setShowInstallBanner(true)
    }
    
    // Then check existing session
    checkExistingSession()
    
    // Migrate firefighter user if exists (runs once on load)
    migrateFirefighterUser()
    
    // Listen for PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    })
  }, [])
  
  // Handle deep link navigation when user is already authenticated
  useEffect(() => {
    if (isAuthenticated && deepLinkView && deepLinkId) {
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
    }
  }, [isAuthenticated, deepLinkView, deepLinkId])
  
  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        toast.success('¡App instalada! 🎉', {
          description: 'Ahora puedes acceder desde tu pantalla de inicio'
        })
      }
      
      setDeferredPrompt(null)
      setShowInstallBanner(false)
    } else {
      // iOS or already installed - show instructions
      toast.info('Instrucciones para instalar', {
        description: 'En Safari: toca Compartir > Añadir a pantalla de inicio',
        duration: 6000
      })
    }
  }
  
  const handleDeepLinkLogin = () => {
    setShowAuthDialog(true)
    // After login, they'll be redirected to the content
  }

  const migrateFirefighterUser = async () => {
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/auth/migrate-firefighter`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      )
    } catch (error) {
      // Silent fail - this is just a helper migration
      console.log('Firefighter migration check:', error)
    }
  }

  // Poll for unread notifications
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchUnreadCount()
      const interval = setInterval(() => {
        // Only fetch if browser is online
        if (navigator.onLine) {
          fetchUnreadCount()
        }
      }, 30000) // Every 30 seconds
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, token])

  const fetchUnreadCount = async () => {
    if (!token) return
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/notifications`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      
      if (response.ok) {
        const notifications = await response.json()
        const unread = notifications.filter((n: any) => !n.read).length
        setUnreadNotifications(unread)
      }
    } catch (error) {
      // Silent fail - don't log network errors for background polling
      // Only log if it's not a network connectivity issue
      if (error instanceof Error && !error.message.includes('fetch')) {
        console.error('Error fetching notification count:', error)
      }
    }
  }

  const checkExistingSession = async () => {
    try {
      const supabase = getSupabaseClient()

      const { data: { session }, error } = await supabase.auth.getSession()

      if (session && session.access_token) {
        // Fetch user profile
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/auth/profile`,
          {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          }
        )

        if (response.ok) {
          const profile = await response.json()
          setToken(session.access_token)
          setUserProfile(profile)
          setIsAuthenticated(true)
          
          // Show welcome message for firefighters on session restore (if no deep link)
          if (profile.role === 'firefighter' && !deepLinkView) {
            setTimeout(() => {
              toast.info('🚒 Sistema de Emergencias Activo', {
                description: 'Botón de alertas por voz disponible en la esquina inferior derecha.',
                duration: 4000
              })
            }, 1000)
          }
        }
      }
    } catch (error) {
      // Silent fail for network errors - only log non-fetch errors
      if (error instanceof Error && !error.message.includes('fetch')) {
        console.error('Error al verificar sesión:', error)
      }
    } finally {
      setIsCheckingSession(false)
    }
  }

  const handleLoginSuccess = (accessToken: string, profile: any) => {
    setToken(accessToken)
    setUserProfile(profile)
    setIsAuthenticated(true)
    
    // Show welcome message based on context
    if (!deepLinkView) {
      if (profile.role === 'firefighter') {
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

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600">
        <div className="text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 animate-spin" />
          <span>Cargando...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50">
      {/* Header - Mobile Optimized */}
      <header className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 sticky top-0 z-10 shadow-lg">
        <div className="w-full px-3 sm:px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            {/* Logo and Title */}
            <div className="flex items-center gap-2 min-w-0 flex-shrink">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center shadow-lg p-1 flex-shrink-0">
                <img 
                  src={logoCircular} 
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
                        {userProfile?.role === 'admin' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setShowAdminReports(true)}>
                              <Shield className="w-4 h-4 mr-2" />
                              Admin
                            </DropdownMenuItem>
                          </>
                        )}
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
                    {userProfile?.role === 'admin' && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowAdminReports(true)}
                        className="text-white hover:bg-white/20 h-9 px-3"
                        title="Reportes"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Admin
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

                  {/* Logout - Desktop only */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLogout}
                    className="text-white hover:bg-white/20 h-9 w-9 p-0 hidden sm:flex flex-shrink-0"
                    title="Salir"
                  >
                    <LogOut className="w-4 h-4" />
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
          <PublicContentView
            contentType={deepLinkView}
            contentId={deepLinkId}
            onInstallClick={handleInstallPWA}
            onLoginClick={handleDeepLinkLogin}
          />
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
            <UnifiedFeed
              token={token}
              userProfile={userProfile}
              onNavigate={(section, itemId) => {
                setHighlightedItemId(itemId)
                setActiveTab(section)
              }}
            />
          </TabsContent>

          <TabsContent value="news">
            <NewsSection 
              token={token} 
              userProfile={userProfile} 
              onRequestAuth={() => setShowAuthDialog(true)}
              onOpenSettings={() => setShowSettings(true)}
              onNavigateToPost={(section, postId) => setActiveTab(section)}
              highlightedItemId={highlightedItemId}
              onItemHighlighted={() => setHighlightedItemId(null)}
            />
          </TabsContent>

          <TabsContent value="alerts">
            <AlertsSection 
              token={token} 
              userProfile={userProfile} 
              onRequestAuth={() => setShowAuthDialog(true)}
              onOpenSettings={() => setShowSettings(true)}
              onNavigateToPost={(section, postId) => setActiveTab(section)}
              highlightedItemId={highlightedItemId}
              onItemHighlighted={() => setHighlightedItemId(null)}
              refreshTrigger={alertsRefreshTrigger}
            />
          </TabsContent>

          <TabsContent value="classifieds">
            <ClassifiedsSection 
              token={token} 
              userProfile={userProfile} 
              onRequestAuth={() => setShowAuthDialog(true)}
              onOpenSettings={() => setShowSettings(true)}
              onNavigateToPost={(section, postId) => setActiveTab(section)}
              highlightedItemId={highlightedItemId}
              onItemHighlighted={() => setHighlightedItemId(null)}
            />
          </TabsContent>

          <TabsContent value="forums">
            <ForumsSection 
              token={token} 
              userProfile={userProfile} 
              onRequestAuth={() => setShowAuthDialog(true)}
              onOpenSettings={() => setShowSettings(true)}
              onNavigateToPost={(section, postId) => setActiveTab(section)}
              highlightedItemId={highlightedItemId}
              onItemHighlighted={() => setHighlightedItemId(null)}
            />
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
          </div>
        </DialogContent>
      </Dialog>

      {/* User Settings Dialog */}
      {isAuthenticated && token && (
        <UserSettings
          open={showSettings}
          onOpenChange={setShowSettings}
          token={token}
          userProfile={userProfile}
          onProfileUpdate={handleProfileUpdate}
        />
      )}

      {/* Notifications Panel */}
      {isAuthenticated && token && (
        <NotificationsPanel
          open={showNotifications}
          onOpenChange={(open) => {
            setShowNotifications(open)
            if (!open) {
              fetchUnreadCount() // Refresh count when closing
            }
          }}
          token={token}
          onNavigate={(section, itemId) => {
            setHighlightedItemId(itemId)
            setActiveTab(section)
            setShowNotifications(false)
          }}
          onOpenMessages={(recipientId) => {
            setMessageRecipientId(recipientId)
            setShowMessages(true)
          }}
        />
      )}

      {/* Global Search */}
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

      {/* Messaging Panel */}
      {isAuthenticated && token && userProfile && (
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
      )}

      {/* Saved Posts */}
      {isAuthenticated && token && (
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
      )}

      {/* Trending Content */}
      <TrendingContent
        open={showTrending}
        onOpenChange={setShowTrending}
        onNavigate={(section, itemId) => {
          setHighlightedItemId(itemId)
          setActiveTab(section)
          setShowTrending(false)
        }}
      />

      {/* Admin Reports Panel */}
      {isAuthenticated && token && userProfile?.role === 'admin' && (
        <AdminReportsPanel
          open={showAdminReports}
          onOpenChange={setShowAdminReports}
          token={token}
        />
      )}

      {/* Firefighter Emergency Button */}
      {isAuthenticated && token && userProfile && (
        <FirefighterEmergencyButton
          token={token}
          userProfile={userProfile}
          onEmergencyPublished={() => {
            setAlertsRefreshTrigger(prev => prev + 1)
            setActiveTab('alerts')
          }}
        />
      )}

      <Toaster />
      
      {/* PWA Components */}
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
    </div>
  )
}
