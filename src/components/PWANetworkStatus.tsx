import { useState, useEffect } from 'react'
import { Wifi, WifiOff } from 'lucide-react'

export function PWANetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showOfflineMessage, setShowOfflineMessage] = useState(false)
  const [showOnlineMessage, setShowOnlineMessage] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowOnlineMessage(true)
      setTimeout(() => setShowOnlineMessage(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOfflineMessage(true)
    }

    const handleConnectionChange = (event: any) => {
      if (event.detail.online) {
        handleOnline()
      } else {
        handleOffline()
      }
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('connectionChange', handleConnectionChange)

    // Show offline message immediately if already offline
    if (!navigator.onLine) {
      setShowOfflineMessage(true)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('connectionChange', handleConnectionChange)
    }
  }, [])

  return (
    <>
      {/* Offline Banner */}
      {showOfflineMessage && !isOnline && (
        <div
          className="fixed top-0 left-0 right-0 z-[100] bg-red-500 text-white py-2 px-4 shadow-lg transition-transform duration-300"
          style={{ transform: 'translateY(0)' }}
        >
          <div className="container mx-auto flex items-center justify-center gap-2">
            <WifiOff className="w-5 h-5" />
            <span className="text-sm font-medium">
              Sin conexión a internet. Algunas funciones están limitadas.
            </span>
          </div>
        </div>
      )}

      {/* Online Toast */}
      {showOnlineMessage && isOnline && (
        <div
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-green-500 text-white py-3 px-6 rounded-full shadow-lg transition-all duration-300"
          style={{ opacity: 1 }}
        >
          <div className="flex items-center gap-2">
            <Wifi className="w-5 h-5" />
            <span className="text-sm font-medium">
              ¡Conexión restaurada!
            </span>
          </div>
        </div>
      )}
    </>
  )
}