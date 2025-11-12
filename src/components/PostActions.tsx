import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Bookmark, Share2, Flag, Edit, Copy, Check, MessageCircle, Phone, Trash2, Facebook } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { projectId } from '../utils/supabase/info'
import { toast } from 'sonner'
import { ReportDialog } from './ReportDialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu'

interface PostActionsProps {
  postType: 'news' | 'alert' | 'classified' | 'forum'
  postId: string
  token: string | null
  isAuthor?: boolean
  isAdmin?: boolean       // Permite que admins también eliminen
  onEdit?: () => void
  onDelete?: () => void   // Función para eliminar el contenido
  className?: string
  contactPhone?: string  // Número de contacto para clasificados
  recipientId?: string   // ID del usuario destinatario
  recipientName?: string // Nombre del destinatario
  title?: string         // Título del post para compartir
  imageUrl?: string      // Imagen del post para compartir
}

export function PostActions({ postType, postId, token, isAuthor, isAdmin, onEdit, onDelete, className = '', contactPhone, recipientId, recipientName, title, imageUrl }: PostActionsProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showContactDialog, setShowContactDialog] = useState(false)
  const [contactMessage, setContactMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)

  useEffect(() => {
    if (token) {
      checkSavedStatus()
    }
  }, [token, postId])

  const checkSavedStatus = async () => {
    if (!token) return

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/saved/${postType}/${postId}/status`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setIsSaved(data.isSaved)
      }
    } catch (error) {
      console.error('Error checking saved status:', error)
    }
  }

  const toggleSave = async () => {
    if (!token) {
      toast.error('Debes iniciar sesión para guardar publicaciones')
      return
    }

    setIsSaving(true)
    try {
      const method = isSaved ? 'DELETE' : 'POST'
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/saved/${postType}/${postId}`,
        {
          method,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        setIsSaved(!isSaved)
        toast.success(isSaved ? 'Eliminado de guardados' : 'Guardado correctamente')
      } else {
        toast.error('Error al guardar')
      }
    } catch (error) {
      console.error('Error toggling save:', error)
      toast.error('Error al guardar')
    } finally {
      setIsSaving(false)
    }
  }

  const copyToClipboardFallback = (text: string) => {
    // Create temporary text area
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    try {
      document.execCommand('copy')
      textArea.remove()
      return true
    } catch (err) {
      console.error('Fallback copy failed:', err)
      textArea.remove()
      return false
    }
  }

  const handleShare = async () => {
    try {
      // Track share
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/share/${postType}/${postId}`,
        {
          method: 'POST'
        }
      )

      // Generate share URL with type and id as query params
      const shareUrl = `${window.location.origin}?view=${postType}&id=${postId}`
      
      // Get content type label
      const typeLabels: Record<string, string> = {
        news: '🔥 Noticia',
        alert: '📢 Alerta',
        classified: '💼 Clasificado',
        forum: '💬 Foro'
      }
      const shareTitle = typeLabels[postType] || 'Informa'
      const shareText = `¡Mira este contenido en Informa Gualán!`
      
      // Try native share first
      if (navigator.share) {
        try {
          await navigator.share({
            title: shareTitle,
            text: shareText,
            url: shareUrl
          })
          toast.success('Compartido')
          return
        } catch (shareError: any) {
          // If user cancelled, don't try to copy
          if (shareError.name === 'AbortError') {
            return
          }
          // Otherwise, fall through to clipboard methods
        }
      }
      
      // Try modern clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(shareUrl)
          setCopied(true)
          toast.success('Link copiado al portapapeles')
          setTimeout(() => setCopied(false), 2000)
          return
        } catch (clipboardError) {
          console.log('Clipboard API failed, trying fallback')
        }
      }
      
      // Try fallback method
      const success = copyToClipboardFallback(shareUrl)
      if (success) {
        setCopied(true)
        toast.success('Link copiado al portapapeles')
        setTimeout(() => setCopied(false), 2000)
      } else {
        // Last resort: show the URL in a toast so user can copy manually
        toast.success(`Link: ${shareUrl}`, {
          duration: 10000,
        })
      }
    } catch (error) {
      console.error('Error sharing:', error)
      const shareUrl = `${window.location.origin}?view=${postType}&id=${postId}`
      toast.success(`Link: ${shareUrl}`, {
        duration: 10000,
      })
    }
  }

  const shareWhatsApp = () => {
    // Si es clasificado y tiene número de contacto, contactar directamente
    if (postType === 'classified' && contactPhone) {
      // Limpiar el número (quitar espacios, guiones, etc)
      const cleanPhone = contactPhone.replace(/\D/g, '')
      
      // Si el número tiene 8 dígitos (formato guatemalteco sin código de área)
      const phoneWithCode = cleanPhone.length === 8 ? `502${cleanPhone}` : cleanPhone
      
      const message = encodeURIComponent('Hola, vi tu publicación en Informa y me interesa.')
      window.open(`https://wa.me/${phoneWithCode}?text=${message}`, '_blank')
    } else {
      // Comportamiento original: compartir el post
      const shareUrl = `${window.location.origin}?view=${postType}&id=${postId}`
      const typeEmojis: Record<string, string> = {
        news: '🔥',
        alert: '📢',
        classified: '💼',
        forum: '💬'
      }
      const emoji = typeEmojis[postType] || '✨'
      const text = `${emoji} ¡Mira esto en Informa Gualán!\n\n${shareUrl}`
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    }
  }

  const handleSendMessage = async () => {
    if (!token) {
      toast.error('Debes iniciar sesión para enviar mensajes')
      return
    }

    if (!contactMessage.trim()) {
      toast.error('Escribe un mensaje')
      return
    }

    if (!recipientId) {
      toast.error('No se pudo identificar al destinatario')
      return
    }

    setSendingMessage(true)
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
            recipientId,
            content: contactMessage.trim()
          })
        }
      )

      if (response.ok) {
        toast.success('Mensaje enviado correctamente')
        setContactMessage('')
        setShowContactDialog(false)
      } else {
        let errorMessage = 'Error al enviar mensaje'
        try {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const error = await response.json()
            errorMessage = error.error || errorMessage
          } else {
            const text = await response.text()
            console.error('Error response (non-JSON):', text)
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError)
        }
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Error al enviar mensaje')
    } finally {
      setSendingMessage(false)
    }
  }

  return (
    <>
      <div className={`flex items-center gap-1 flex-wrap ${className}`}>
        {/* Contact/Save Button - Para clasificados muestra "Contactar", para otros "Guardar" */}
        {token && (
          postType === 'classified' && !isAuthor && recipientId ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowContactDialog(true)}
              className="text-xs text-gray-600 hover:text-blue-700 h-8 px-2"
            >
              <MessageCircle className="w-3.5 h-3.5 mr-0.5" />
              <span className="text-[11px]">Contactar</span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSave}
              disabled={isSaving}
              className={`text-xs ${isSaved ? 'text-yellow-600' : 'text-gray-600'} hover:text-yellow-700 h-8 px-2`}
            >
              <Bookmark className={`w-3.5 h-3.5 mr-0.5 ${isSaved ? 'fill-current' : ''}`} />
              <span className="text-[11px]">{isSaved ? 'Guardado' : 'Guardar'}</span>
            </Button>
          )
        )}

        {/* Share Button */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="text-xs text-gray-600 hover:text-blue-700 h-8 px-2"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-0.5 text-green-600" />
                <span className="text-[11px]">Copiado</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 mr-0.5" />
                <span className="text-[11px]">Compartir</span>
              </>
            )}
          </Button>
        </div>

        {/* WhatsApp - Para clasificados contacta directo, para otros comparte */}
        <Button
          variant="ghost"
          size="sm"
          onClick={shareWhatsApp}
          className="text-xs text-gray-600 hover:text-green-700 h-8 px-2"
        >
          <span className="mr-0.5 text-sm">📱</span>
          <span className="text-[11px]">WhatsApp</span>
        </Button>

        {/* Edit Button (only for authors) */}
        {isAuthor && onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="text-xs text-gray-600 hover:text-purple-700 h-8 px-2"
          >
            <Edit className="w-3.5 h-3.5 mr-0.5" />
            <span className="text-[11px]">Editar</span>
          </Button>
        )}

        {/* Delete Button (admin or author can delete) */}
        {(isAuthor || isAdmin) && onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
          >
            <Trash2 className="w-3.5 h-3.5 mr-0.5" />
            <span className="text-[11px]">Eliminar</span>
          </Button>
        )}

        {/* Report Button */}
        {token && !isAuthor && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReportDialog(true)}
            className="text-xs text-gray-600 hover:text-red-700 h-8 px-2"
          >
            <Flag className="w-3.5 h-3.5 mr-0.5" />
            <span className="text-[11px]">Reportar</span>
          </Button>
        )}
      </div>

      {/* Report Dialog */}
      {token && (
        <ReportDialog
          open={showReportDialog}
          onOpenChange={setShowReportDialog}
          contentType={postType}
          contentId={postId}
          token={token}
        />
      )}

      {/* Contact Dialog - Para enviar mensajes directos */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              Contactar {recipientName ? `a ${recipientName}` : 'al anunciante'}
            </DialogTitle>
            <DialogDescription>
              Envía un mensaje directo para obtener más información
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {contactPhone && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm text-green-800">
                  <Phone className="w-4 h-4" />
                  <span>También puedes llamar al: <strong>{contactPhone}</strong></span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="contact-message">Tu mensaje</Label>
              <Textarea
                id="contact-message"
                placeholder="Hola, me interesa tu publicación..."
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                rows={5}
                className="resize-none"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowContactDialog(false)}
                className="flex-1"
                disabled={sendingMessage}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={sendingMessage || !contactMessage.trim()}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
              >
                {sendingMessage ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Enviar Mensaje
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}