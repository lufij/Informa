import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { projectId } from '../utils/supabase/info'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'motion/react'
import { Flame, Megaphone, ShoppingBag, MessageSquare, Bell, X, Eye, ChevronUp } from 'lucide-react'

interface NewContentNotifierProps {
  token: string | null
  userProfile: any
  onNavigate?: (section: string) => void
}

interface NewContent {
  type: 'news' | 'alert' | 'classified' | 'forum'
  count: number
  latestTitle?: string
  latestId?: string
}

export function NewContentNotifier({ token, userProfile, onNavigate }: NewContentNotifierProps) {
  const [newContent, setNewContent] = useState<NewContent[]>([])
  const [showBanner, setShowBanner] = useState(false)
  const [lastCheckTime, setLastCheckTime] = useState<string>(new Date().toISOString())
  const pollingInterval = useRef<NodeJS.Timeout>()
  const hasShownToastRef = useRef(false)

  const showNewContentToast = useCallback((content: NewContent[]) => {
    const totalNew = content.reduce((sum, c) => sum + c.count, 0)
    
    // Determinar el contenido más importante
    const hasAlerts = content.find(c => c.type === 'alert')
    const hasNews = content.find(c => c.type === 'news')
    
    if (hasAlerts) {
      toast.error(`🚨 ${hasAlerts.count} Nueva${hasAlerts.count > 1 ? 's' : ''} Alerta${hasAlerts.count > 1 ? 's' : ''}`, {
        description: hasAlerts.latestTitle || 'Toca para ver',
        duration: 10000,
        action: {
          label: 'Ver',
          onClick: () => onNavigate?.('alerts')
        }
      })
    } else if (hasNews) {
      toast.success(`🔥 ${hasNews.count} Nueva${hasNews.count > 1 ? 's' : ''} Noticia${hasNews.count > 1 ? 's' : ''}`, {
        description: hasNews.latestTitle || 'Toca para ver',
        duration: 8000,
        action: {
          label: 'Ver',
          onClick: () => onNavigate?.('news')
        }
      })
    } else {
      toast.info(`🔔 ${totalNew} Nuevo${totalNew > 1 ? 's' : ''} Contenido${totalNew > 1 ? 's' : ''}`, {
        description: 'Hay contenido nuevo en Informa',
        duration: 6000
      })
    }
  }, [onNavigate])

  const sendPushNotification = useCallback(async (content: NewContent[]) => {
    // Solo si el navegador soporta notificaciones y el usuario dio permiso
    if ('Notification' in window && Notification.permission === 'granted') {
      const hasAlerts = content.find(c => c.type === 'alert')
      const hasNews = content.find(c => c.type === 'news')
      
      let title = '🔔 Nuevo contenido en Informa'
      let body = 'Hay contenido nuevo de tu comunidad'
      let icon = '/icon-192.png'
      
      if (hasAlerts) {
        title = '🚨 Nueva Alerta de Emergencia'
        body = hasAlerts.latestTitle || `${hasAlerts.count} nueva${hasAlerts.count > 1 ? 's' : ''} alerta${hasAlerts.count > 1 ? 's' : ''} en Gualán`
      } else if (hasNews) {
        title = '🔥 Nueva Noticia en Gualán'
        body = hasNews.latestTitle || `${hasNews.count} nueva${hasNews.count > 1 ? 's' : ''} noticia${hasNews.count > 1 ? 's' : ''}`
      }
      
      try {
        const registration = await navigator.serviceWorker.ready
        await registration.showNotification(title, {
          body,
          icon,
          badge: '/icon-192.png',
          vibrate: hasAlerts ? [200, 100, 200, 100, 200] : [200, 100, 200],
          tag: 'new-content',
          requireInteraction: hasAlerts ? true : false,
          data: {
            url: window.location.origin,
            section: hasAlerts ? 'alerts' : hasNews ? 'news' : 'feed'
          }
        })
      } catch (error) {
        console.error('Error showing push notification:', error)
      }
    }
  }, [])

  const checkForNewContent = useCallback(async () => {
    if (!token) return

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/notifications/new-content?since=${lastCheckTime}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        const data: NewContent[] = await response.json()
        
        if (data.length > 0) {
          setNewContent(data)
          setShowBanner(true)
          
          // Mostrar toast solo la primera vez
          if (!hasShownToastRef.current) {
            showNewContentToast(data)
            hasShownToastRef.current = true
          }

          // Enviar notificación push si está habilitada
          sendPushNotification(data)
        }
      }
    } catch (error) {
      console.error('Error checking for new content:', error)
    }
  }, [token, lastCheckTime, showNewContentToast, sendPushNotification])

  useEffect(() => {
    if (token && userProfile) {
      // Cargar última vez que revisó
      const lastCheck = localStorage.getItem('informa_last_content_check')
      if (lastCheck) {
        setLastCheckTime(lastCheck)
      }

      // Hacer check inicial
      checkForNewContent()

      // Polling cada 30 segundos
      pollingInterval.current = setInterval(() => {
        checkForNewContent()
      }, 30000) // 30 segundos

      return () => {
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current)
        }
      }
    }
  }, [token, userProfile, checkForNewContent]) // Agregar lastCheckTime a dependencias

  const markAsViewed = () => {
    const now = new Date().toISOString()
    setLastCheckTime(now)
    localStorage.setItem('informa_last_content_check', now)
    setNewContent([])
    setShowBanner(false)
    hasShownToastRef.current = false
  }

  const handleBannerClick = (type: string) => {
    const sectionMap = {
      news: 'news',
      alert: 'alerts',
      classified: 'classifieds',
      forum: 'forums'
    }
    onNavigate?.(sectionMap[type as keyof typeof sectionMap] || 'feed')
    markAsViewed()
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'news':
        return <Flame className="w-5 h-5 text-orange-600" />
      case 'alert':
        return <Megaphone className="w-5 h-5 text-red-600" />
      case 'classified':
        return <ShoppingBag className="w-5 h-5 text-green-600" />
      case 'forum':
        return <MessageSquare className="w-5 h-5 text-blue-600" />
      default:
        return <Bell className="w-5 h-5 text-purple-600" />
    }
  }

  const getLabel = (type: string, count: number) => {
    const labels = {
      news: 'noticia',
      alert: 'alerta',
      classified: 'clasificado',
      forum: 'foro'
    }
    const label = labels[type as keyof typeof labels] || 'contenido'
    return `${count} ${label}${count > 1 ? 's' : ''} nueva${count > 1 ? 's' : ''}`
  }

  const getColor = (type: string) => {
    switch (type) {
      case 'news':
        return 'from-yellow-400 to-orange-500'
      case 'alert':
        return 'from-red-500 to-pink-500'
      case 'classified':
        return 'from-green-500 to-emerald-500'
      case 'forum':
        return 'from-blue-500 to-cyan-500'
      default:
        return 'from-purple-500 to-pink-500'
    }
  }

  if (!showBanner || newContent.length === 0) {
    return null
  }

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', bounce: 0.3 }}
          className="fixed top-16 left-0 right-0 z-40 px-4 pointer-events-none"
        >
          <div className="max-w-4xl mx-auto pointer-events-auto">
            <div className="bg-white border-2 border-purple-200 rounded-lg shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-600 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                  <Bell className="w-5 h-5 animate-pulse" />
                  <span className="font-semibold">
                    ¡Contenido Nuevo en Gualán!
                  </span>
                </div>
                <button
                  onClick={markAsViewed}
                  className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {newContent.map((content) => (
                    <button
                      key={content.type}
                      onClick={() => handleBannerClick(content.type)}
                      className="flex items-center gap-3 p-3 bg-gradient-to-r hover:scale-105 transition-transform rounded-lg border border-gray-200 hover:shadow-md"
                      style={{
                        background: `linear-gradient(135deg, rgba(var(--${content.type}-color), 0.1), rgba(var(--${content.type}-color), 0.05))`
                      }}
                    >
                      <div className={`w-10 h-10 bg-gradient-to-br ${getColor(content.type)} rounded-full flex items-center justify-center flex-shrink-0`}>
                        {getIcon(content.type)}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
                            {content.count}
                          </Badge>
                          <span className="text-sm font-medium text-gray-700">
                            {getLabel(content.type, content.count)}
                          </span>
                        </div>
                        {content.latestTitle && (
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {content.latestTitle}
                          </p>
                        )}
                      </div>
                      <Eye className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </button>
                  ))}
                </div>

                {/* Call to Action */}
                <div className="mt-3 flex items-center justify-between bg-purple-50 rounded-lg p-3 border border-purple-100">
                  <p className="text-sm text-purple-700">
                    🎉 ¡No te pierdas lo que está pasando!
                  </p>
                  <Button
                    size="sm"
                    onClick={() => {
                      onNavigate?.('feed')
                      markAsViewed()
                    }}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    Ver Todo
                    <ChevronUp className="w-4 h-4 ml-1 rotate-90" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}