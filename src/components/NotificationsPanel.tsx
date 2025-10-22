import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { ScrollArea } from './ui/scroll-area'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Bell, Heart, MessageCircle, UserPlus, Check, CheckCheck, X, Flame, Megaphone, Share2, Send, Reply } from 'lucide-react'
import { projectId, publicAnonKey } from '../utils/supabase/info'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'motion/react'

interface Notification {
  id: string
  userId: string
  type: 'comment' | 'reaction' | 'follow' | 'mention' | 'share' | 'message'
  data: any
  read: boolean
  createdAt: string
}

interface NotificationsPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  token: string | null
  onNavigate?: (section: string, itemId?: string) => void
  onOpenMessages?: (recipientId: string) => void
}

export function NotificationsPanel({ open, onOpenChange, token, onNavigate, onOpenMessages }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [isSendingReply, setIsSendingReply] = useState(false)

  useEffect(() => {
    if (open && token) {
      fetchNotifications()
    }
  }, [open, token])

  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/notifications`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    setMarkingAsRead(notificationId)
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/notifications/${notificationId}/read`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        setNotifications(notifications.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        ))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    } finally {
      setMarkingAsRead(null)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/notifications/read-all`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        setNotifications(notifications.map(n => ({ ...n, read: true })))
        toast.success('Todas las notificaciones marcadas como leídas')
      }
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-blue-500" />
      case 'reaction':
        return <Heart className="w-4 h-4 text-pink-500" />
      case 'follow':
        return <UserPlus className="w-4 h-4 text-purple-500" />
      case 'message':
        return <MessageCircle className="w-4 h-4 text-green-500" />
      case 'share':
        return <Share2 className="w-4 h-4 text-orange-500" />
      default:
        return <Bell className="w-4 h-4 text-gray-500" />
    }
  }

  const getNotificationText = (notification: Notification) => {
    const { type, data } = notification

    switch (type) {
      case 'comment':
        return (
          <div>
            <span className="font-semibold">{data.commenterName}</span>
            {' comentó en tu publicación: '}
            <span className="text-sm text-gray-600">"{data.commentContent}"</span>
          </div>
        )
      case 'reaction':
        return (
          <div>
            <span className="font-semibold">{data.reactorName}</span>
            {' reaccionó a tu publicación'}
          </div>
        )
      case 'follow':
        return (
          <div>
            <span className="font-semibold">{data.followerName}</span>
            {' comenzó a seguirte'}
          </div>
        )
      case 'message':
        return (
          <div>
            <span className="font-semibold">{data.senderName}</span>
            {' te envió un mensaje: '}
            <span className="text-sm text-gray-600">"{data.preview}"</span>
          </div>
        )
      default:
        return 'Nueva notificación'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Ahora'
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)}m`
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)}h`
    if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)}d`
    
    return date.toLocaleDateString('es-GT', { day: 'numeric', month: 'short' })
  }

  const handleQuickReply = async (notification: Notification) => {
    if (!replyContent.trim()) return
    
    setIsSendingReply(true)
    try {
      let response
      
      // Handle different notification types
      if (notification.type === 'comment') {
        // Reply to the comment with another comment
        response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/${notification.data.contentType}/${notification.data.postId}/comments`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              content: replyContent,
              parentCommentId: notification.data.commentId
            })
          }
        )
      } else if (notification.type === 'message') {
        // Send a direct message back
        response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/messages`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              recipientId: notification.data.senderId,
              content: replyContent
            })
          }
        )
      }
      
      if (response && response.ok) {
        toast.success('Respuesta enviada')
        setReplyContent('')
        setReplyingTo(null)
        markAsRead(notification.id)
      } else {
        toast.error('Error al enviar respuesta')
      }
    } catch (error) {
      console.error('Error sending reply:', error)
      toast.error('Error al enviar respuesta')
    } finally {
      setIsSendingReply(false)
    }
  }

  const handleOpenConversation = (notification: Notification) => {
    if (notification.type === 'message' && notification.data.senderId) {
      onOpenMessages?.(notification.data.senderId)
      onOpenChange(false)
    } else if (notification.type === 'comment' && notification.data.commenterId) {
      onOpenMessages?.(notification.data.commenterId)
      onOpenChange(false)
    }
  }

  const canReply = (notification: Notification) => {
    return notification.type === 'comment' || notification.type === 'message'
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-gradient-to-br from-white to-gray-50">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-purple-600" />
              Notificaciones
              {unreadCount > 0 && (
                <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                  {unreadCount}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Panel de notificaciones de Informa
            </DialogDescription>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs text-purple-600 hover:text-purple-700"
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                Marcar todo
              </Button>
            )}
          </div>
          <DialogDescription>
            Mantente al día con lo que está pasando
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-500">Cargando notificaciones...</div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <Bell className="w-12 h-12 text-gray-300 mb-2" />
              <p className="text-gray-500">No tienes notificaciones</p>
              <p className="text-sm text-gray-400">Aquí aparecerán tus notificaciones</p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                      notification.read
                        ? 'bg-white border-gray-200'
                        : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 shadow-sm'
                    }`}
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead(notification.id)
                      }
                    }}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="text-sm">
                                {getNotificationText(notification)}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500">
                                  {formatTimeAgo(notification.createdAt)}
                                </span>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                                )}
                              </div>
                            </div>
                            
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  markAsRead(notification.id)
                                }}
                                disabled={markingAsRead === notification.id}
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Quick actions */}
                      {canReply(notification) && (
                        <div className="flex gap-2 ml-7">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              setReplyingTo(replyingTo === notification.id ? null : notification.id)
                            }}
                          >
                            <Reply className="w-3 h-3 mr-1" />
                            Responder rápido
                          </Button>
                          {notification.type === 'message' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOpenConversation(notification)
                              }}
                            >
                              <MessageCircle className="w-3 h-3 mr-1" />
                              Abrir chat
                            </Button>
                          )}
                        </div>
                      )}
                      
                      {/* Quick reply input */}
                      {replyingTo === notification.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-7 flex gap-2"
                        >
                          <Input
                            placeholder="Escribe tu respuesta..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleQuickReply(notification)
                              }
                            }}
                            className="flex-1 h-8 text-sm"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Button
                            size="sm"
                            className="h-8 px-3"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleQuickReply(notification)
                            }}
                            disabled={!replyContent.trim() || isSendingReply}
                          >
                            <Send className="w-3 h-3" />
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
