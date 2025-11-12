import { useState, useEffect } from 'react'
import { InstallRequiredGate } from './InstallRequiredGate'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Sparkles, UserPlus, Eye, MessageSquare, Heart, Share2, Lock } from 'lucide-react'
import logoCircular from 'figma:asset/159f250301c9fc78337e0c8aa784431ded1c39c8.png'

interface ProgressiveOnboardingProps {
  children: React.ReactNode
  isAuthenticated: boolean
  isInstalled: boolean
  onRequestAuth: () => void
  onRequestInstall: () => void
}

// Configuración del sistema
const CONFIG = {
  // Sin instalar: puede ver X noticias antes de pedir instalación
  FREE_VIEWS_WITHOUT_INSTALL: 3,
  
  // Instalado pero sin registro: puede ver X noticias más
  FREE_VIEWS_WITH_INSTALL: 10,
  
  // Tiempo antes de mostrar el mensaje (milisegundos)
  DELAY_BEFORE_PROMPT: 30000, // 30 segundos navegando
}

type OnboardingStage = 'free' | 'need-install' | 'need-signup' | 'full-access'

export function ProgressiveOnboarding({ 
  children, 
  isAuthenticated, 
  isInstalled,
  onRequestAuth,
  onRequestInstall
}: ProgressiveOnboardingProps) {
  const [viewCount, setViewCount] = useState(0)
  const [showSignupPrompt, setShowSignupPrompt] = useState(false)
  const [hasSeenSignupPrompt, setHasSeenSignupPrompt] = useState(false)
  const [stage, setStage] = useState<OnboardingStage>('free')
  const [timeOnSite, setTimeOnSite] = useState(0)

  // Cargar datos del localStorage
  useEffect(() => {
    const savedViewCount = localStorage.getItem('informa_view_count')
    const savedHasSeenPrompt = localStorage.getItem('informa_has_seen_signup_prompt')
    
    if (savedViewCount) {
      setViewCount(parseInt(savedViewCount, 10))
    }
    
    if (savedHasSeenPrompt === 'true') {
      setHasSeenSignupPrompt(true)
    }

    // Contador de tiempo en el sitio
    const timer = setInterval(() => {
      setTimeOnSite(prev => prev + 1000)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Determinar en qué etapa está el usuario
  useEffect(() => {
    if (isAuthenticated) {
      setStage('full-access')
      return
    }

    if (!isInstalled) {
      if (viewCount >= CONFIG.FREE_VIEWS_WITHOUT_INSTALL) {
        setStage('need-install')
      } else {
        setStage('free')
      }
    } else {
      // App instalada pero no registrado
      if (viewCount >= CONFIG.FREE_VIEWS_WITH_INSTALL) {
        setStage('need-signup')
      } else {
        setStage('free')
      }
    }
  }, [isAuthenticated, isInstalled, viewCount])

  // Mostrar prompt de registro después de cierto tiempo
  useEffect(() => {
    if (
      isInstalled && 
      !isAuthenticated && 
      !hasSeenSignupPrompt && 
      timeOnSite >= CONFIG.DELAY_BEFORE_PROMPT &&
      viewCount >= 3 // Ya vio al menos 3 cosas
    ) {
      setShowSignupPrompt(true)
      setHasSeenSignupPrompt(true)
      localStorage.setItem('informa_has_seen_signup_prompt', 'true')
    }
  }, [isInstalled, isAuthenticated, hasSeenSignupPrompt, timeOnSite, viewCount])

  // Función para incrementar el contador de vistas
  const incrementViewCount = () => {
    const newCount = viewCount + 1
    setViewCount(newCount)
    localStorage.setItem('informa_view_count', newCount.toString())
  }

  // Exponer función para que los componentes hijos puedan incrementar
  useEffect(() => {
    // Crear evento global para que cualquier componente pueda incrementar
    const handleIncrementView = () => {
      incrementViewCount()
    }

    window.addEventListener('informa:view-content', handleIncrementView)
    
    return () => {
      window.removeEventListener('informa:view-content', handleIncrementView)
    }
  }, [viewCount])

  // Renderizado según la etapa
  if (stage === 'full-access') {
    // Usuario autenticado: acceso completo
    return <>{children}</>
  }

  if (stage === 'need-install') {
    // Necesita instalar la app
    return (
      <InstallRequiredGate
        message="Has visto 3 noticias. Instala Informa para seguir explorando todo el contenido de Gualán"
      >
        {children}
      </InstallRequiredGate>
    )
  }

  if (stage === 'need-signup') {
    // Ya instaló pero necesita registrarse
    return (
      <>
        <div className="relative">
          {/* Mostrar preview del contenido (blur) */}
          <div className="blur-sm pointer-events-none select-none opacity-50">
            {children}
          </div>

          {/* Modal de registro requerido */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <Card className="max-w-lg w-full bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 border-2 border-purple-200 shadow-2xl">
              <CardHeader className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-500 rounded-2xl p-1 shadow-lg">
                    <div className="w-full h-full bg-white rounded-xl p-2 flex items-center justify-center">
                      <img src={logoCircular} alt="Informa" className="w-full h-full object-contain" />
                    </div>
                  </div>
                </div>

                <div>
                  <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
                    <Lock className="w-6 h-6 text-purple-600" />
                    ¡Únete a Informa!
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    Has visto {viewCount} publicaciones. Crea tu cuenta gratis para desbloquear todo el contenido y participar en la comunidad.
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Beneficios de registrarse */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-purple-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-purple-900">Ver Todo</h4>
                      <p className="text-sm text-gray-600">
                        Acceso ilimitado a noticias, alertas, clasificados y foros
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-pink-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-pink-900">Participar</h4>
                      <p className="text-sm text-gray-600">
                        Publica, comenta, reacciona y chatea con vecinos
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-yellow-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-yellow-900">Personalizar</h4>
                      <p className="text-sm text-gray-600">
                        Guarda favoritos, recibe notificaciones y personaliza tu perfil
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="space-y-3">
                  <Button
                    onClick={onRequestAuth}
                    className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-600 hover:from-purple-700 hover:via-pink-700 hover:to-yellow-700 text-white shadow-lg"
                  >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Crear Cuenta Gratis
                  </Button>

                  <Button
                    variant="outline"
                    onClick={onRequestAuth}
                    className="w-full"
                  >
                    Ya tengo cuenta
                  </Button>
                </div>

                <p className="text-xs text-center text-gray-500">
                  ✨ Es gratis y toma menos de 30 segundos
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    )
  }

  // stage === 'free'
  // Usuario puede navegar libremente, pero mostramos prompts sutiles
  return (
    <>
      {children}
      
      {/* Prompt suave de registro (no bloquea) */}
      <Dialog open={showSignupPrompt} onOpenChange={setShowSignupPrompt}>
        <DialogContent className="max-w-md bg-gradient-to-br from-purple-50 to-pink-50">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">
              ¿Te está gustando Informa?
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              Crea tu cuenta gratis para comentar, publicar y guardar tus favoritos
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="bg-white/60 rounded-lg p-4 border border-purple-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                </div>
                <span className="font-medium text-gray-700">Comenta y chatea con vecinos</span>
              </div>
              
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                  <Share2 className="w-4 h-4 text-pink-600" />
                </div>
                <span className="font-medium text-gray-700">Publica noticias y clasificados</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-yellow-600" />
                </div>
                <span className="font-medium text-gray-700">Guarda contenido que te interesa</span>
              </div>
            </div>

            <Button
              onClick={() => {
                setShowSignupPrompt(false)
                onRequestAuth()
              }}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Crear Cuenta Gratis
            </Button>

            <Button
              variant="ghost"
              onClick={() => setShowSignupPrompt(false)}
              className="w-full"
            >
              Tal vez después
            </Button>

            <p className="text-xs text-center text-gray-500">
              Es gratis, toma 30 segundos y no pedimos tarjeta de crédito 😊
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Indicador de progreso (opcional) */}
      {!isAuthenticated && viewCount > 0 && viewCount < (isInstalled ? CONFIG.FREE_VIEWS_WITH_INSTALL : CONFIG.FREE_VIEWS_WITHOUT_INSTALL) && (
        <div className="fixed bottom-4 left-4 z-40 bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs hidden md:block">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">
              {isInstalled ? 'Navegación libre' : 'Vista previa'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(viewCount / (isInstalled ? CONFIG.FREE_VIEWS_WITH_INSTALL : CONFIG.FREE_VIEWS_WITHOUT_INSTALL)) * 100}%` 
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {isInstalled 
              ? `${CONFIG.FREE_VIEWS_WITH_INSTALL - viewCount} publicaciones más sin cuenta`
              : `${CONFIG.FREE_VIEWS_WITHOUT_INSTALL - viewCount} publicaciones más sin instalar`
            }
          </p>
        </div>
      )}
    </>
  )
}

// Función helper para que los componentes incrementen el contador
export function trackContentView() {
  window.dispatchEvent(new Event('informa:view-content'))
}
