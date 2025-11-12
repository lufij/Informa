import { useState, useEffect } from 'react'
import { Download, X, Smartphone, Monitor, Apple, Share, MoreVertical, CheckCircle, Chrome } from 'lucide-react'
import { PWADiagnostics } from './PWADiagnostics'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'

const logoCircular = 'https://img.icons8.com/fluency/96/news.png'

interface FloatingInstallButtonProps {
  deferredPrompt: any
  onInstall: () => void
}

export function FloatingInstallButton({ deferredPrompt, onInstall }: FloatingInstallButtonProps) {
  const [showButton, setShowButton] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return

    // Detect iOS and Android
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const android = /Android/.test(navigator.userAgent)
    setIsIOS(iOS)
    setIsAndroid(android)

    // Check if app is already installed (running in standalone mode)
    const installed = window.matchMedia('(display-mode: standalone)').matches ||
                     (window.navigator as any).standalone === true

    setIsInstalled(installed)

    // Check if user dismissed the button
    const dismissed = localStorage.getItem('floatingInstallDismissed')
    const dismissedTime = dismissed ? parseInt(dismissed) : 0
    const oneDayMs = 24 * 60 * 60 * 1000
    
    // SIEMPRE mostrar el botón si:
    // - App NO está instalada AND
    // - (Usuario NO lo ha cerrado OR ya pasó más de 1 día)
    if (!installed && (!dismissed || Date.now() - dismissedTime > oneDayMs)) {
      // Mostrar después de 2 segundos (menos intrusivo)
      setTimeout(() => setShowButton(true), 2000)
    }
  }, [deferredPrompt])

  const handleDismiss = () => {
    setShowButton(false)
    localStorage.setItem('floatingInstallDismissed', Date.now().toString())
  }

  const handleClick = () => {
    // PRIORIDAD 1: Si hay deferredPrompt, instalar inmediatamente
    if (deferredPrompt) {
      onInstall()
      setShowButton(false)
      return
    }
    
    // PRIORIDAD 2: Si no hay deferredPrompt, mostrar instrucciones
    setShowInstructions(true)
  }

  if (isInstalled || !showButton) {
    return null
  }

  return (
    <>
      {/* Floating Install Button - SIEMPRE VISIBLE */}
      <div className="fixed bottom-20 right-4 z-40 animate-in slide-in-from-bottom duration-500">
        <div className="relative">
          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="absolute -top-2 -right-2 w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-700 z-10"
            aria-label="Cerrar"
          >
            <X className="w-3 h-3" />
          </button>

          {/* Install button */}
          <Button
            onClick={handleClick}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-2xl rounded-full h-14 px-6 gap-2"
          >
            <Download className="w-5 h-5" />
            <span className="font-medium">Instalar App</span>
          </Button>

          {/* Pulse animation ring */}
          <div className="absolute inset-0 rounded-full bg-purple-600 opacity-20 animate-ping pointer-events-none" />
        </div>
      </div>

      {/* Installation Instructions Dialog - iOS y Android */}
      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="max-w-md bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 border-2 border-purple-200">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-white rounded-2xl p-3 shadow-lg">
                <img src={logoCircular} alt="Informa" className="w-full h-full" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {isIOS ? 'Cómo instalar en iPhone/iPad' : isAndroid ? 'Cómo instalar en Android' : 'Cómo instalar Informa'}
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Sigue estos sencillos pasos para instalar Informa en tu dispositivo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {isIOS ? (
              // iOS Instructions
              <>
                {/* Step 1 */}
                <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700">
                      Toca el botón <Share className="w-4 h-4 inline mx-1 text-blue-500" /> <strong>"Compartir"</strong> en Safari
                    </p>
                    <p className="text-xs text-gray-500 mt-1">(Parte inferior de la pantalla)</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700">
                      Desplázate y toca <strong>"Añadir a pantalla de inicio"</strong>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Busca el ícono con un "+"</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700">
                      Toca <strong>"Agregar"</strong> en la esquina superior derecha
                    </p>
                  </div>
                </div>
              </>
            ) : (
              // Android/Chrome Instructions
              <>
                {/* Step 1 */}
                <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700">
                      Toca el menú <MoreVertical className="w-4 h-4 inline mx-1 text-gray-700" /> <strong>(3 puntos)</strong> en la esquina superior derecha
                    </p>
                    <p className="text-xs text-gray-500 mt-1">En Chrome o tu navegador</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700">
                      Selecciona <Download className="w-4 h-4 inline mx-1 text-purple-600" /> <strong>"Instalar aplicación"</strong> o <strong>"Agregar a pantalla de inicio"</strong>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Puede aparecer con cualquiera de estos nombres</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700">
                      Toca <strong>"Instalar"</strong> o <strong>"Agregar"</strong>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Confirma la instalación</p>
                  </div>
                </div>
              </>
            )}

            {/* Success message */}
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-700">
                ¡Listo! Informa aparecerá en tu pantalla de inicio como una app
              </p>
            </div>

            {/* Note for browsers without support */}
            {!isIOS && !isAndroid && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Chrome className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  <strong>Tip:</strong> Para mejor experiencia, usa Chrome, Edge o Safari
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setShowInstructions(false)}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}