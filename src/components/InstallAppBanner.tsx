import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { X, Download, Smartphone, Share, CheckCircle } from 'lucide-react'

const logoCircular = 'https://img.icons8.com/fluency/96/news.png'

interface InstallAppBannerProps {
  onInstallClick: () => void
  visible?: boolean
}

export function InstallAppBanner({ onInstallClick, visible = true }: InstallAppBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)

  useEffect(() => {
    // Check if user dismissed the banner before
    const dismissed = localStorage.getItem('installBannerDismissed')
    if (dismissed) {
      setIsDismissed(true)
    }

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)
  }, [])

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem('installBannerDismissed', 'true')
  }

  const handleInstallClick = () => {
    if (isIOS) {
      setShowIOSInstructions(true)
    } else {
      onInstallClick()
    }
  }

  if (!visible || isDismissed) {
    return null
  }

  if (showIOSInstructions) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom">
        <Card className="max-w-2xl mx-auto bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-2xl border-0">
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-xl p-2 shadow-lg flex-shrink-0">
                  <img src={logoCircular} alt="Informa" className="w-full h-full" />
                </div>
                <div>
                  <h3 className="text-white mb-1">Cómo instalar en iPhone/iPad</h3>
                  <p className="text-sm text-white/80">Sigue estos pasos:</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-white hover:bg-white/20 -mt-2 -mr-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-3 bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">1</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    Toca el botón <Share className="w-4 h-4 inline mx-1" /> <strong>"Compartir"</strong> en Safari
                    (parte inferior de la pantalla)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">2</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    Desplázate hacia abajo y toca <strong>"Añadir a pantalla de inicio"</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">3</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    Toca <strong>"Agregar"</strong> en la esquina superior derecha
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-white/20">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <p className="text-sm text-green-200">¡Listo! Informa aparecerá en tu pantalla de inicio</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleDismiss}
                className="flex-1 bg-white text-purple-600 hover:bg-white/90"
              >
                Entendido
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom">
      <Card className="max-w-2xl mx-auto bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 text-white shadow-2xl border-0">
        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-xl p-2 shadow-lg flex-shrink-0">
              <img src={logoCircular} alt="Informa" className="w-full h-full" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-white mb-1">Instala la app Informa</h3>
              <p className="text-sm text-white/90">
                Accede más rápido y recibe notificaciones instantáneas
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                onClick={handleInstallClick}
                className="bg-white text-purple-600 hover:bg-white/90 shadow-lg"
              >
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Instalar</span>
                <Smartphone className="w-4 h-4 sm:hidden" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
