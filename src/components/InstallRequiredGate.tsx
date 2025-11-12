import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Download, Smartphone, Share, CheckCircle, Lock, Eye, Sparkles } from 'lucide-react'
import logoCircular from 'figma:asset/159f250301c9fc78337e0c8aa784431ded1c39c8.png'

interface InstallRequiredGateProps {
  children: React.ReactNode
  message?: string
}

export function InstallRequiredGate({ children, message = 'Instala la app para ver el contenido completo' }: InstallRequiredGateProps) {
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // Detectar si la app ya está instalada
    const checkInstalled = () => {
      // Método 1: display-mode standalone
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      
      // Método 2: navigator.standalone (iOS)
      const isIOSStandalone = (window.navigator as any).standalone === true
      
      // Método 3: Verificar si se abrió desde home screen
      const isInStandaloneMode = isStandalone || isIOSStandalone
      
      return isInStandaloneMode
    }

    const installed = checkInstalled()
    setIsInstalled(installed)

    // Detectar iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // Escuchar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Escuchar cambios en el estado de instalación
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    })

    // Detectar cuando la app se instala (iOS)
    const handleStandaloneChange = () => {
      if (checkInstalled()) {
        setIsInstalled(true)
      }
    }

    // Revisar periódicamente (para iOS)
    const interval = setInterval(() => {
      if (checkInstalled() && !isInstalled) {
        setIsInstalled(true)
      }
    }, 1000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      clearInterval(interval)
    }
  }, [isInstalled])

  const handleInstallClick = async () => {
    if (isIOS) {
      // En iOS, mostrar instrucciones
      setShowIOSInstructions(true)
    } else if (deferredPrompt) {
      // En Android/Chrome, mostrar el prompt nativo
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('Usuario aceptó instalar')
      }
      
      setDeferredPrompt(null)
    } else {
      // No hay prompt disponible, mostrar instrucciones generales
      setShowIOSInstructions(true)
    }
  }

  // Si ya está instalada, mostrar el contenido completo
  if (isInstalled) {
    return <>{children}</>
  }

  // Si NO está instalada, mostrar el gate
  return (
    <div className="relative">
      {/* Mostrar preview del contenido (blur) */}
      <div className="blur-md pointer-events-none select-none opacity-40">
        {children}
      </div>

      {/* Modal de bloqueo */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <Card className="max-w-lg w-full bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50 border-2 border-purple-200 shadow-2xl animate-in zoom-in-95 duration-300">
          <CardHeader className="text-center space-y-4 pb-4">
            {/* Logo */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 rounded-2xl p-1 shadow-lg">
                <div className="w-full h-full bg-white rounded-xl p-2 flex items-center justify-center">
                  <img src={logoCircular} alt="Informa" className="w-full h-full object-contain" />
                </div>
              </div>
            </div>

            {/* Título */}
            <div>
              <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
                <Lock className="w-6 h-6 text-purple-600" />
                Instala Informa
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {message}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {!showIOSInstructions ? (
              <>
                {/* Beneficios */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-purple-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-purple-900">Acceso Completo</h4>
                      <p className="text-sm text-gray-600">
                        Ve todas las noticias, alertas, clasificados y foros de Gualán
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-pink-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-pink-900">Notificaciones Instantáneas</h4>
                      <p className="text-sm text-gray-600">
                        Recibe alertas de emergencia y noticias importantes al instante
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-yellow-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Smartphone className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-yellow-900">Acceso Rápido</h4>
                      <p className="text-sm text-gray-600">
                        Ícono en tu pantalla de inicio para abrir Informa en segundos
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botón de instalación */}
                <Button
                  onClick={handleInstallClick}
                  className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-600 hover:from-purple-700 hover:via-pink-700 hover:to-yellow-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Download className="w-5 h-5 mr-2" />
                  {isIOS ? 'Ver Instrucciones de Instalación' : 'Instalar Ahora'}
                </Button>

                {/* Nota adicional */}
                <p className="text-xs text-center text-gray-500">
                  ✨ Es gratis, no ocupa espacio y funciona sin conexión
                </p>
              </>
            ) : (
              /* Instrucciones para iOS */
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <Share className="w-5 h-5" />
                    Cómo instalar en iPhone/iPad
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        1
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">
                          Toca el botón <Share className="w-4 h-4 inline mx-1" /> <strong>"Compartir"</strong> en Safari
                          <span className="block text-xs text-gray-500 mt-1">(En la parte inferior de la pantalla)</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        2
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">
                          Desplázate y toca <strong>"Añadir a pantalla de inicio"</strong>
                          <span className="block text-xs text-gray-500 mt-1">(Busca el ícono con un "+")</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        3
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">
                          Toca <strong>"Agregar"</strong> en la esquina superior derecha
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-blue-200">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <p className="text-sm text-green-700 font-medium">
                        ¡Listo! Abre Informa desde tu pantalla de inicio
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => setShowIOSInstructions(false)}
                  variant="outline"
                  className="w-full"
                >
                  Volver
                </Button>
              </div>
            )}

            {/* Nota para Android */}
            {!isIOS && !showIOSInstructions && (
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  💡 <strong>Tip:</strong> Busca el mensaje "Instalar Informa" en tu navegador
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
