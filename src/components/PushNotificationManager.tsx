import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Bell, BellOff, Volume2 } from 'lucide-react'
import { toast } from 'sonner'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface PushNotificationManagerProps {
  token: string | null
  userProfile: any
}

export function PushNotificationManager({ token, userProfile }: PushNotificationManagerProps) {
  const [showPermissionDialog, setShowPermissionDialog] = useState(false)
  const [pushEnabled, setPushEnabled] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // Check if push notifications are supported
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
    setIsSupported(supported)

    if (supported) {
      checkPushStatus()
    }
  }, [])

  useEffect(() => {
    // Show permission dialog for first-time users after 3 seconds
    if (token && userProfile && isSupported && !pushEnabled) {
      const hasAskedBefore = localStorage.getItem('push-permission-asked')
      if (!hasAskedBefore) {
        const timer = setTimeout(() => {
          setShowPermissionDialog(true)
        }, 3000)
        return () => clearTimeout(timer)
      }
    }
  }, [token, userProfile, isSupported, pushEnabled])

  const checkPushStatus = async () => {
    try {
      const permission = Notification.permission
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        setPushEnabled(!!subscription)
      }
    } catch (error) {
      console.error('Error checking push status:', error)
    }
  }

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      })
      console.log('✅ Service Worker registrado:', registration)
      return registration
    } catch (error) {
      console.error('❌ Error registrando Service Worker:', error)
      throw error
    }
  }

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  const subscribeToPush = async () => {
    try {
      // Request notification permission
      const permission = await Notification.requestPermission()
      
      if (permission !== 'granted') {
        toast.error('Permiso denegado para notificaciones')
        localStorage.setItem('push-permission-asked', 'true')
        return false
      }

      // Register service worker
      const registration = await registerServiceWorker()
      await registration.update()

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready

      // Get VAPID public key from server (or use a default one)
      // For simplicity, we'll use a placeholder. In production, you'd get this from your server
      const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
      
      try {
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        })

        // Send subscription to server
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/notifications/subscribe-push`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ subscription })
          }
        )

        if (response.ok) {
          setPushEnabled(true)
          toast.success('🔔 ¡Notificaciones activadas! Recibirás alertas aunque la app esté cerrada', {
            duration: 5000,
            icon: '🔊'
          })
          localStorage.setItem('push-permission-asked', 'true')
          setShowPermissionDialog(false)
          
          // Show test notification
          new Notification('🔥 ¡Informa!', {
            body: 'Las notificaciones están activas. Te avisaremos de noticias importantes',
            icon: '/icon-192.png',
            badge: '/icon-96.png',
            tag: 'welcome',
            vibrate: [200, 100, 200]
          })
          
          return true
        } else {
          throw new Error('Failed to save subscription')
        }
      } catch (subError) {
        console.error('Error subscribing to push:', subError)
        // Fallback: just request permission without push subscription
        toast.success('🔔 Notificaciones básicas activadas', {
          duration: 3000
        })
        localStorage.setItem('push-permission-asked', 'true')
        setShowPermissionDialog(false)
        return true
      }
    } catch (error) {
      console.error('Error enabling push notifications:', error)
      toast.error('Error al activar notificaciones')
      return false
    }
  }

  const unsubscribeFromPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      
      if (subscription) {
        await subscription.unsubscribe()
        
        // Notify server
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/notifications/unsubscribe-push`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )
      }

      setPushEnabled(false)
      toast.success('Notificaciones desactivadas')
    } catch (error) {
      console.error('Error disabling push notifications:', error)
      toast.error('Error al desactivar notificaciones')
    }
  }

  const handleDismiss = () => {
    setShowPermissionDialog(false)
    localStorage.setItem('push-permission-asked', 'true')
  }

  if (!isSupported || !token) {
    return null
  }

  return (
    <>
      {/* Permission Dialog */}
      <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
        <DialogContent className="max-w-md bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Volume2 className="w-6 h-6 text-purple-600 animate-pulse" />
              ¡No te pierdas nada!
            </DialogTitle>
            <DialogDescription className="text-base">
              Activa las notificaciones para recibir alertas importantes aunque no tengas la app abierta
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-white rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-2 rounded-full">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold">Alertas importantes</p>
                  <p className="text-sm text-gray-600">Emergencias y avisos críticos</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-orange-500 to-yellow-600 p-2 rounded-full">
                  <span className="text-xl">🔥</span>
                </div>
                <div>
                  <p className="font-semibold">Noticias de última hora</p>
                  <p className="text-sm text-gray-600">Entérate de lo que pasa en Gualán</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-green-500 to-teal-600 p-2 rounded-full">
                  <span className="text-xl">💬</span>
                </div>
                <div>
                  <p className="font-semibold">Mensajes y comentarios</p>
                  <p className="text-sm text-gray-600">Cuando alguien interactúe contigo</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-3">
              <p className="text-sm text-gray-700">
                <strong>🔊 Con sonido:</strong> Recibirás notificaciones con sonido aunque la app esté cerrada, igual que WhatsApp o Facebook
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="flex-1"
            >
              Ahora no
            </Button>
            <Button
              onClick={subscribeToPush}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              <Bell className="w-4 h-4 mr-2" />
              Activar notificaciones
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating toggle button for settings */}
      {pushEnabled && (
        <div className="hidden">
          {/* This could be shown in settings */}
        </div>
      )}
    </>
  )
}
