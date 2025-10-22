import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Download, X, Share, CheckCircle, Smartphone } from 'lucide-react'

const logoCircular = 'https://img.icons8.com/fluency/96/news.png'

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
      // On Android, show if we have the prompt OR after 2 seconds
      if (iOS) {
        setTimeout(() => setShowButton(true), 2000)
      } else if (deferredPrompt) {
        setTimeout(() => setShowButton(true), 2000)
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

      {/* iOS Installation Instructions Dialog */}
      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="max-w-md bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 border-2 border-purple-200">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-white rounded-2xl p-3 shadow-lg">
                <img src={logoCircular} alt="Informa" className="w-full h-full" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Cómo instalar en iPhone/iPad
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Sigue estos sencillos pasos para instalar Informa en tu dispositivo iOS
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
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

            {/* Success message */}
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-700">
                ¡Listo! Informa aparecerá en tu pantalla de inicio como una app
              </p>
            </div>
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
