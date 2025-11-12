import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { projectId } from '../utils/supabase/info'
import { toast } from 'sonner'
import { Bell, Flame, Megaphone, ShoppingBag, MessageSquare, Heart, MessageCircle, Share2, User, Settings, CheckCircle, AlertTriangle } from 'lucide-react'

interface NotificationPreferencesProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  token: string
}

interface Preferences {
  // Notificaciones de contenido nuevo
  newNews: boolean
  newAlerts: boolean
  newClassifieds: boolean
  newForums: boolean
  
  // Notificaciones de interacciones
  comments: boolean
  reactions: boolean
  mentions: boolean
  follows: boolean
  messages: boolean
  shares: boolean
  
  // Canales de notificación
  pushEnabled: boolean
  emailEnabled: boolean
  
  // Configuración avanzada
  digestMode: boolean // Resumen diario en lugar de instantáneas
  quietHours: boolean // Silenciar 10pm - 8am
}

export function NotificationPreferences({ open, onOpenChange, token }: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<Preferences>({
    // Por defecto TODO activo
    newNews: true,
    newAlerts: true,
    newClassifieds: true,
    newForums: true,
    comments: true,
    reactions: true,
    mentions: true,
    follows: true,
    messages: true,
    shares: true,
    pushEnabled: false,
    emailEnabled: false,
    digestMode: false,
    quietHours: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [pushSupported, setPushSupported] = useState(false)

  useEffect(() => {
    if (open) {
      loadPreferences()
      checkPushSupport()
    }
  }, [open])

  const checkPushSupport = () => {
    const supported = 'Notification' in window && 'serviceWorker' in navigator
    setPushSupported(supported)
  }

  const loadPreferences = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/notifications/preferences`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setPreferences(data)
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const savePreferences = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/notifications/preferences`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(preferences)
        }
      )

      if (response.ok) {
        toast.success('Preferencias guardadas', {
          description: 'Tus notificaciones se actualizaron correctamente'
        })
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast.error('Error al guardar', {
        description: 'No se pudieron actualizar tus preferencias'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const requestPushPermission = async () => {
    if (!pushSupported) {
      toast.error('Notificaciones push no soportadas', {
        description: 'Tu navegador no soporta notificaciones push'
      })
      return
    }

    try {
      const permission = await Notification.requestPermission()
      
      if (permission === 'granted') {
        // Subscribir al servicio de push
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
          )
        })

        // Enviar subscription al servidor
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/notifications/subscribe-push`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ subscription })
          }
        )

        setPreferences(prev => ({ ...prev, pushEnabled: true }))
        toast.success('¡Notificaciones activadas! 🔔', {
          description: 'Recibirás alertas de nuevas noticias importantes'
        })
      } else {
        toast.info('Permiso denegado', {
          description: 'Puedes activarlo después desde configuración del navegador'
        })
      }
    } catch (error) {
      console.error('Error requesting push permission:', error)
      toast.error('Error al activar notificaciones')
    }
  }

  const togglePreference = (key: keyof Preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  // Helper para convertir VAPID key
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Bell className="w-6 h-6 text-purple-600" />
            Preferencias de Notificaciones
          </DialogTitle>
          <DialogDescription>
            Personaliza qué notificaciones quieres recibir
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {/* CONTENIDO NUEVO */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-lg">Contenido Nuevo</h3>
                <Badge variant="outline" className="ml-auto bg-purple-100 text-purple-700 border-purple-300">
                  Recomendado
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                Recibe notificaciones cuando se publique nuevo contenido en Gualán
              </p>

              <div className="space-y-3 bg-white/60 rounded-lg p-4 border border-purple-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                      <Flame className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <Label htmlFor="newNews" className="text-base cursor-pointer">
                        Noticias
                      </Label>
                      <p className="text-xs text-gray-500">
                        Eventos importantes en Gualán
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="newNews"
                    checked={preferences.newNews}
                    onCheckedChange={() => togglePreference('newNews')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Megaphone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <Label htmlFor="newAlerts" className="text-base cursor-pointer">
                        Alertas de Emergencia
                      </Label>
                      <p className="text-xs text-gray-500">
                        Prioritarias - Siempre recomendado activar
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="newAlerts"
                    checked={preferences.newAlerts}
                    onCheckedChange={() => togglePreference('newAlerts')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <Label htmlFor="newClassifieds" className="text-base cursor-pointer">
                        Clasificados
                      </Label>
                      <p className="text-xs text-gray-500">
                        Nuevos anuncios y ofertas
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="newClassifieds"
                    checked={preferences.newClassifieds}
                    onCheckedChange={() => togglePreference('newClassifieds')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <Label htmlFor="newForums" className="text-base cursor-pointer">
                        Foros
                      </Label>
                      <p className="text-xs text-gray-500">
                        Nuevas discusiones comunitarias
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="newForums"
                    checked={preferences.newForums}
                    onCheckedChange={() => togglePreference('newForums')}
                  />
                </div>
              </div>
            </div>

            {/* INTERACCIONES */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-600" />
                <h3 className="font-semibold text-lg">Interacciones</h3>
              </div>
              <p className="text-sm text-gray-600">
                Cuando otros usuarios interactúen con tu contenido
              </p>

              <div className="space-y-3 bg-white/60 rounded-lg p-4 border border-pink-100">
                <div className="flex items-center justify-between">
                  <Label htmlFor="comments" className="cursor-pointer">
                    Comentarios en mis publicaciones
                  </Label>
                  <Switch
                    id="comments"
                    checked={preferences.comments}
                    onCheckedChange={() => togglePreference('comments')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="reactions" className="cursor-pointer">
                    Reacciones (🔥❤️😱😢😡)
                  </Label>
                  <Switch
                    id="reactions"
                    checked={preferences.reactions}
                    onCheckedChange={() => togglePreference('reactions')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="mentions" className="cursor-pointer">
                    Menciones (@tuNombre)
                  </Label>
                  <Switch
                    id="mentions"
                    checked={preferences.mentions}
                    onCheckedChange={() => togglePreference('mentions')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="follows" className="cursor-pointer">
                    Nuevos seguidores
                  </Label>
                  <Switch
                    id="follows"
                    checked={preferences.follows}
                    onCheckedChange={() => togglePreference('follows')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="messages" className="cursor-pointer">
                    Mensajes directos
                  </Label>
                  <Switch
                    id="messages"
                    checked={preferences.messages}
                    onCheckedChange={() => togglePreference('messages')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="shares" className="cursor-pointer">
                    Compartidas de mi contenido
                  </Label>
                  <Switch
                    id="shares"
                    checked={preferences.shares}
                    onCheckedChange={() => togglePreference('shares')}
                  />
                </div>
              </div>
            </div>

            {/* CANALES */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-lg">Canales</h3>
              </div>

              <div className="space-y-3 bg-white/60 rounded-lg p-4 border border-purple-100">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Bell className="w-5 h-5 text-purple-600" />
                      <Label htmlFor="pushEnabled" className="cursor-pointer font-semibold">
                        Notificaciones Push
                      </Label>
                      {preferences.pushEnabled && (
                        <Badge className="bg-green-500 text-white border-0 text-xs">
                          Activo
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">
                      {pushSupported 
                        ? 'Recibe alertas instantáneas aunque la app esté cerrada'
                        : 'No soportado en este navegador'
                      }
                    </p>
                  </div>
                  {!preferences.pushEnabled && pushSupported ? (
                    <Button
                      onClick={requestPushPermission}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Activar
                    </Button>
                  ) : (
                    <Switch
                      id="pushEnabled"
                      checked={preferences.pushEnabled}
                      onCheckedChange={() => togglePreference('pushEnabled')}
                      disabled={!pushSupported}
                    />
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="emailEnabled" className="cursor-pointer">
                      Email (Próximamente)
                    </Label>
                    <p className="text-xs text-gray-500">
                      Resumen diario por correo
                    </p>
                  </div>
                  <Switch
                    id="emailEnabled"
                    checked={preferences.emailEnabled}
                    onCheckedChange={() => togglePreference('emailEnabled')}
                    disabled={true}
                  />
                </div>
              </div>
            </div>

            {/* CONFIGURACIÓN AVANZADA */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <h3 className="font-semibold text-lg">Configuración Avanzada</h3>
              </div>

              <div className="space-y-3 bg-white/60 rounded-lg p-4 border border-yellow-100">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="digestMode" className="cursor-pointer">
                      Modo Resumen
                    </Label>
                    <p className="text-xs text-gray-500">
                      Recibir resumen diario en lugar de notificaciones instantáneas
                    </p>
                  </div>
                  <Switch
                    id="digestMode"
                    checked={preferences.digestMode}
                    onCheckedChange={() => togglePreference('digestMode')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="quietHours" className="cursor-pointer">
                      Horario Silencioso
                    </Label>
                    <p className="text-xs text-gray-500">
                      No molestar de 10:00 PM a 8:00 AM
                    </p>
                  </div>
                  <Switch
                    id="quietHours"
                    checked={preferences.quietHours}
                    onCheckedChange={() => togglePreference('quietHours')}
                  />
                </div>
              </div>
            </div>

            {/* INFO */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 mb-1">
                    ¡No te pierdas nada importante!
                  </h4>
                  <p className="text-sm text-blue-700">
                    Recomendamos activar notificaciones de <strong>Noticias</strong> y <strong>Alertas de Emergencia</strong> para estar siempre informado sobre lo que pasa en Gualán.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={savePreferences}
            disabled={isSaving}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            {isSaving ? 'Guardando...' : 'Guardar Preferencias'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
