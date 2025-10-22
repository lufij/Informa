import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { ScrollArea } from './ui/scroll-area'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { MessageCircle, Send, ArrowLeft, Image as ImageIcon, X } from 'lucide-react'
import { projectId, publicAnonKey } from '../utils/supabase/info'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'motion/react'
import { UserAvatar } from './UserAvatar'

interface Conversation {
  conversationId: string
  otherUser: {
    id: string
    name: string
    profilePhoto?: string
  }
  lastMessage?: {
    content: string
    createdAt: string
  }
  unreadCount: number
  createdAt: string
}

interface Message {
  id: string
  conversationId: string
  senderId: string
  recipientId: string
  content?: string
  mediaUrl?: string
  read: boolean
  createdAt: string
}

interface MessagingPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  token: string
  userProfile: any
  recipientId?: string
}

export function MessagingPanel({ open, onOpenChange, token, userProfile, recipientId }: MessagingPanelProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      fetchConversations()
    }
  }, [open])

  useEffect(() => {
    // Auto-select conversation when recipientId is provided
    if (recipientId && conversations.length > 0 && !selectedConversation) {
      const conversation = conversations.find(c => c.otherUser.id === recipientId)
      if (conversation) {
        setSelectedConversation(conversation)
      } else {
        // Create a new conversation placeholder if not found
        fetchUserProfile(recipientId)
      }
    }
  }, [recipientId, conversations, selectedConversation])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.conversationId)
      // Poll for new messages every 5 seconds
      const interval = setInterval(() => {
        fetchMessages(selectedConversation.conversationId)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversations = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/messages/conversations`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setConversations(data)
      } else if (response.status === 404) {
        // Endpoint not implemented yet, use empty array
        setConversations([])
      }
    } catch (error) {
      // Network error or endpoint not available - silently handle with empty conversations
      setConversations([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/messages/${conversationId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const fetchUserProfile = async (userId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/users/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        const profile = await response.json()
        // Create a temporary conversation object
        const tempConversation: Conversation = {
          conversationId: `new-${userId}`,
          otherUser: {
            id: userId,
            name: profile.name,
            profilePhoto: profile.profilePhoto
          },
          unreadCount: 0,
          createdAt: new Date().toISOString()
        }
        setSelectedConversation(tempConversation)
        setMessages([])
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    setIsSending(true)
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            recipientId: selectedConversation.otherUser.id,
            content: newMessage
          })
        }
      )

      if (response.ok) {
        const message = await response.json()
        setMessages([...messages, message])
        setNewMessage('')
        fetchConversations() // Update conversation list
      } else {
        toast.error('Error al enviar mensaje')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Error al enviar mensaje')
    } finally {
      setIsSending(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 168) { // Less than a week
      return date.toLocaleDateString('es-GT', { weekday: 'short', hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString('es-GT', { day: 'numeric', month: 'short' })
    }
  }

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[600px] p-0 flex flex-col bg-gradient-to-br from-white to-gray-50">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          {selectedConversation ? (
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedConversation(null)}
                className="p-0 h-8 w-8"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <UserAvatar
                userId={selectedConversation.otherUser.id}
                userName={selectedConversation.otherUser.name}
                profilePhoto={selectedConversation.otherUser.profilePhoto}
                size="md"
              />
              <div>
                <DialogTitle className="text-lg">{selectedConversation.otherUser.name}</DialogTitle>
                <DialogDescription className="text-xs">Conversación privada</DialogDescription>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-full">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <DialogTitle>Mensajes</DialogTitle>
                  <DialogDescription>
                    {totalUnread > 0 ? `${totalUnread} mensaje${totalUnread > 1 ? 's' : ''} sin leer` : 'Tus conversaciones'}
                  </DialogDescription>
                </div>
              </div>
            </div>
          )}
        </DialogHeader>

        {selectedConversation ? (
          // Chat View
          <div className="flex-1 flex flex-col min-h-0">
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="space-y-4">
                {messages.map((message) => {
                  const isOwn = message.senderId === userProfile.id
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isOwn
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-none'
                              : 'bg-gray-100 text-gray-800 rounded-bl-none'
                          }`}
                        >
                          <p className="text-sm break-words">{message.content}</p>
                        </div>
                        <span className="text-xs text-gray-400 mt-1 px-2">
                          {formatTime(message.createdAt)}
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="px-6 py-4 border-t bg-white">
              <div className="flex items-center gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 border-2 focus:border-purple-400"
                  disabled={isSending}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isSending}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Conversations List
          <ScrollArea className="flex-1 px-6 py-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-500">Cargando conversaciones...</div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <MessageCircle className="w-12 h-12 text-gray-300 mb-2" />
                <p className="text-gray-500">No tienes conversaciones</p>
                <p className="text-sm text-gray-400">Envía un mensaje desde el perfil de un usuario</p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <motion.div
                    key={conversation.conversationId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      conversation.unreadCount > 0
                        ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
                        : 'bg-white border-gray-200 hover:border-purple-200'
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        userId={conversation.otherUser.id}
                        userName={conversation.otherUser.name}
                        profilePhoto={conversation.otherUser.profilePhoto}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`${conversation.unreadCount > 0 ? 'font-semibold' : 'font-medium'}`}>
                            {conversation.otherUser.name}
                          </h4>
                          {conversation.lastMessage && (
                            <span className="text-xs text-gray-500">
                              {formatTime(conversation.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className={`text-sm truncate ${
                            conversation.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'
                          }`}>
                            {conversation.lastMessage?.content || 'Nueva conversación'}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white ml-2">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}
