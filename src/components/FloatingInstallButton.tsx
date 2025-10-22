import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Download, X, Share, CheckCircle, Smartphone, ChevronUp } from 'lucide-react'
import logoCircular from 'figma:asset/159f250301c9fc78337e0c8aa784431ded1c39c8.png'

interface FloatingInstallButtonProps {
  deferredPrompt: any
  onInstall: () => void
}

export function FloatingInstallButton({ deferredPrompt, onInstall }: FloatingInstallButtonProps) {
  const [showButton, setShowButton] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // Check if app is already installed (running in standalone mode)
    const installed = window.matchMedia('(display-mode: standalone)').matches ||
                     (window.navigator as any).standalone === true

    setIsInstalled(installed)

    // Check if user dismissed the button
    const dismissed = localStorage.getItem('floatingInstallDismissed')
    const dismissedTime = dismissed ? parseInt(dismissed) : 0
    const oneDayMs = 24 * 60 * 60 * 1000
    
    // Show button if:
    // - App is not installed AND
    // - (User hasn't dismissed OR more than 1 day has passed since dismissal)
    if (!installed && (!dismissed || Date.now() - dismissedTime > oneDayMs)) {
      // On iOS, always show (they can't auto-install via prompt)
      // On Android, show if we have the prompt OR after 3 seconds
      if (iOS) {
        setTimeout(() => setShowButton(true), 3000)
      } else {
        // Always show on Android after delay, even without deferredPrompt
        setTimeout(() => setShowButton(true), 3000)
      }
    }
  }, [deferredPrompt])

  const handleDismiss = () => {
    setShowButton(false)
    localStorage.setItem('floatingInstallDismissed', Date.now().toString())
  }

  const handleClick = () => {
    if (isIOS) {
      setShowInstructions(true)
    } else {
      onInstall()
      setShowButton(false)
    }
  }

  if (isInstalled || !showButton) {
    return null
  }

  return (
    <>
      {/* Floating Install Button */}
      <div className="fixed bottom-20 right-4 z-40 animate-in slide-in-from-bottom duration-500">
        <div className="relative">
          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="absolute -top-2 -right-2 w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-700 z-10 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-3 h-3" />
          </button>

          {/* Install button */}
          <Button
            onClick={handleClick}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-2xl rounded-full h-14 px-6 gap-2 transition-all hover:scale-105"
          >
            <Download className="w-5 h-5" />
            <div className="flex flex-col items-start">
              <span className="font-medium text-sm leading-tight">Instalar App</span>
              <span className="text-xs opacity-90 leading-tight">{isIOS ? 'iOS' : 'Android'}</span>
            </div>
          </Button>

          {/* Pulse animation ring */}
          <div className="absolute inset-0 rounded-full bg-purple-600 opacity-20 animate-ping pointer-events-none" />
        </div>
      </div>

      {/* iOS Installation Instructions Dialog */}
      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="max-w-md bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 border-2 border-purple-200">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-20 h-20 bg-white rounded-2xl p-3 shadow-lg">
                <img src={logoCircular} alt="Informa" className="w-full h-full object-contain" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              📱 Cómo instalar en iPhone/iPad
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Sigue estos sencillos pasos para tener Informa en tu pantalla de inicio
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Step 1 */}
            <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm border-2 border-purple-100">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
                1
              </div>
              <div className="flex-1">
                <p className="text-gray-700 font-medium mb-2">
                  Toca el botón <Share className="w-5 h-5 inline mx-1 text-blue-500 align-middle" /> <strong>"Compartir"</strong> en Safari
                </p>
                <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded flex items-center gap-2">
                  <ChevronUp className="w-4 h-4" />
                  Está en la parte inferior de la pantalla
                  <ChevronUp className="w-4 h-4" />
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm border-2 border-purple-100">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
                2
              </div>
              <div className="flex-1">
                <p className="text-gray-700 font-medium mb-2">
                  Desplázate hacia abajo y toca <strong>"Añadir a pantalla de inicio"</strong>
                </p>
                <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  Busca el ícono con un símbolo "+" dentro de un cuadrado
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm border-2 border-purple-100">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
                3
              </div>
              <div className="flex-1">
                <p className="text-gray-700 font-medium">
                  Toca el botón <strong>"Agregar"</strong> en la esquina superior derecha
                </p>
              </div>
            </div>

            {/* Success message */}
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border-2 border-green-200">
              <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-700 mb-1">
                  ¡Listo! 🎉
                </p>
                <p className="text-xs text-green-600">
                  Informa aparecerá en tu pantalla de inicio como una app nativa
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setShowInstructions(false)}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-12"
            >
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
