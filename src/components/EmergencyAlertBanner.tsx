import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { AlertTriangle, X, Bell } from 'lucide-react'
import { Button } from './ui/button'

interface Alert {
  id: string
  message: string
  severity: string
  location?: string
  createdAt: string
  authorName: string
}

interface EmergencyAlertBannerProps {
  onViewAlert: (alertId: string) => void
}

export function EmergencyAlertBanner({ onViewAlert }: EmergencyAlertBannerProps) {
  const [latestAlert, setLatestAlert] = useState<Alert | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Check for new alerts every 30 seconds
    const checkForNewAlerts = async () => {
      try {
        const response = await fetch(
          `https://yuanvbqjiwpvdkncaqql.supabase.co/functions/v1/make-server-3467f1c6/alerts`,
          {
            headers: {
              'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1YW52YnFqaXdwdmRrbmNhcXFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg0Mjc0NTAsImV4cCI6MjA0NDAwMzQ1MH0.SYlNRI-wW4mz2t9_O4nOEKUW1yTJCmXWZ4dNUFXwIiw`
            }
          }
        )

        if (response.ok) {
          const alerts = await response.json()
          if (alerts && alerts.length > 0) {
            // Get the most recent alert
            const newest = alerts[0]
            
            // Check if it's a new alert (within last 5 minutes) and not dismissed
            const alertTime = new Date(newest.createdAt).getTime()
            const now = Date.now()
            const fiveMinutes = 5 * 60 * 1000
            
            if (now - alertTime < fiveMinutes && !dismissedAlerts.has(newest.id)) {
              // Check if this is different from current alert
              if (!latestAlert || latestAlert.id !== newest.id) {
                setLatestAlert(newest)
                setShowBanner(true)
                
                // Play notification sound
                try {
                  const audio = new Audio()
                  audio.src = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADhAC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAA4T/'
                  audio.play().catch(() => {}) // Ignore if audio fails
                } catch (e) {
                  // Ignore audio errors
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error checking for alerts:', error)
      }
    }

    // Check immediately
    checkForNewAlerts()

    // Then check every 30 seconds
    const interval = setInterval(checkForNewAlerts, 30000)

    return () => clearInterval(interval)
  }, [latestAlert, dismissedAlerts])

  const handleDismiss = () => {
    if (latestAlert) {
      setDismissedAlerts(prev => new Set([...prev, latestAlert.id]))
    }
    setShowBanner(false)
  }

  const handleViewAlert = () => {
    if (latestAlert) {
      onViewAlert(latestAlert.id)
      handleDismiss()
    }
  }

  return (
    <AnimatePresence>
      {showBanner && latestAlert && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-20 left-0 right-0 z-50 px-4"
        >
          <div className="max-w-2xl mx-auto">
            <motion.div
              animate={{
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl shadow-2xl border-4 border-white overflow-hidden"
            >
              {/* Animated background */}
              <div className="absolute inset-0 opacity-20">
                <motion.div
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="w-full h-full"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)',
                    backgroundSize: '200% 200%'
                  }}
                />
              </div>

              <div className="relative p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{
                        rotate: [0, 10, -10, 10, 0],
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        repeatDelay: 1
                      }}
                    >
                      <AlertTriangle className="w-10 h-10" />
                    </motion.div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-2xl font-bold">🚨 ALERTA DE EMERGENCIA</h3>
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <Bell className="w-6 h-6" />
                        </motion.div>
                      </div>
                      <p className="text-sm opacity-90">{latestAlert.authorName}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismiss}
                    className="text-white hover:bg-white/20 rounded-full"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-lg font-semibold mb-2">
                      {latestAlert.severity === 'critical' && '🔴 CRÍTICA'}
                      {latestAlert.severity === 'high' && '🟠 ALTA'}
                      {latestAlert.severity === 'medium' && '🟡 MEDIA'}
                      {latestAlert.severity === 'low' && '🟢 BAJA'}
                    </p>
                    <p className="text-xl">{latestAlert.message}</p>
                    {latestAlert.location && (
                      <p className="text-sm mt-2 opacity-90">📍 {latestAlert.location}</p>
                    )}
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={handleViewAlert}
                    className="w-full bg-white text-red-600 hover:bg-gray-100 text-xl py-6 font-bold shadow-lg"
                    size="lg"
                  >
                    👁️ VER DETALLES DE LA EMERGENCIA
                  </Button>
                </div>

                {/* Time indicator */}
                <div className="mt-3 text-xs text-center opacity-75">
                  Publicada hace {Math.round((Date.now() - new Date(latestAlert.createdAt).getTime()) / 60000)} minuto(s)
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
