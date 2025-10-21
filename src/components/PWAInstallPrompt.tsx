import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { X, Download, Share, ChevronUp } from 'lucide-react'
import { toast } from 'sonner@2.0.3'

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if iOS
    const iOS = /iPhone|iPad|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // Check if already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone === true
    setIsStandalone(standalone)

    // Don't show prompt if already installed
    if (standalone) {
      return
    }

    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    const dismissedTime = dismissed ? parseInt(dismissed) : 0
    const now = Date.now()
    const daysSinceDismissed = (now - dismissedTime) / (1000 * 60 * 60 * 24)

    // Show prompt again after 7 days
    if (dismissed && daysSinceDismissed < 7) {
      return
    }

    // Listen for custom install prompt event
    const handleInstallPrompt = (e: any) => {
      setDeferredPrompt(e.detail.prompt)
      setShowPrompt(true)
    }

    // Listen for iOS instructions event
    const handleIOSInstructions = () => {
      setShowIOSInstructions(true)
    }

    window.addEventListener('showInstallPrompt', handleInstallPrompt)
    window.addEventListener('showIOSInstallInstructions', handleIOSInstructions)

    return () => {
      window.removeEventListener('showInstallPrompt', handleInstallPrompt)
      window.removeEventListener('showIOSInstallInstructions', handleIOSInstructions)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      toast.error('No se puede instalar en este momento')
      return
    }

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      toast.success('¡Gracias por instalar Informa! 🎉')
    } else {
      toast.info('Puedes instalar la app cuando quieras desde el menú del navegador')
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
    setShowPrompt(false)
    setShowIOSInstructions(false)
  }

  // Don't show anything if already installed
  if (isStandalone) {
    return null
  }

  return (
    <>
      {/* Android/Desktop Install Prompt */}
      <AnimatePresence>
        {showPrompt && !isIOS && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-96"
          >
            <Card className="border-2 border-pink-500 shadow-2xl bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    📱
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base mb-1">
                      ¡Instala Informa!
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Accede más rápido desde tu pantalla de inicio sin ocupar espacio de almacenamiento
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleInstall}
                        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white flex-1"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Instalar App
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleDismiss}
                        className="flex-shrink-0"
                      >
                        Más tarde
                      </Button>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDismiss}
                    className="h-6 w-6 p-0 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Install Instructions */}
      <AnimatePresence>
        {showIOSInstructions && isIOS && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-96"
          >
            <Card className="border-2 border-blue-500 shadow-2xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base mb-2">
                      Instala Informa en tu iPhone
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600 mb-3">
                      <div className="flex items-start gap-2">
                        <span className="text-blue-600 font-semibold flex-shrink-0">1.</span>
                        <div className="flex items-center gap-1">
                          <span>Toca el botón</span>
                          <Share className="w-4 h-4 text-blue-600 inline mx-1" />
                          <span>de compartir abajo</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-600 font-semibold flex-shrink-0">2.</span>
                        <div className="flex items-center gap-1">
                          <span>Selecciona "Agregar a inicio"</span>
                          <div className="inline-flex items-center justify-center w-5 h-5 border border-gray-400 rounded text-xs ml-1">
                            +
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-600 font-semibold flex-shrink-0">3.</span>
                        <span>Toca "Agregar" en la esquina superior</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-gray-500 text-xs animate-bounce">
                      <ChevronUp className="w-4 h-4" />
                      <span>Mira el menú de Safari</span>
                      <ChevronUp className="w-4 h-4" />
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDismiss}
                    className="h-6 w-6 p-0 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
