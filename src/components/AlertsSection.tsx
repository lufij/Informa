import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { projectId, publicAnonKey } from '../utils/supabase/info'
import { AlertTriangle, Plus, Shield, Trash2, Image, Video, X, ZoomIn, Play, Clock, MessageCircle, Send, User, Edit, Camera } from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { Input } from './ui/input'
import { ProfilePhotoGuard } from './ProfilePhotoGuard'
import { PostActions } from './PostActions'
import { UserAvatar } from './UserAvatar'
import { ImageViewer } from './ImageViewer'

interface MediaFile {
  url: string
  type: string
  fileName: string
}

interface Reactions {
  fire: number
  love: number
  wow: number
  sad: number
  angry: number
}

interface Comment {
  id: string
  alertId: string
  content: string
  userId: string
  userName: string
  createdAt: string
}

interface Alert {
  id: string
  message: string
  title?: string
  description?: string
  category: string
  priority: string
  mediaFiles?: MediaFile[]
  mediaUrls?: string[]
  reactions?: Reactions
  views?: number
  authorName: string
  authorOrg: string
  authorId: string
  authorRole?: string
  isOfficial?: boolean
  isEmergency?: boolean
  createdAt: string
  expiresAt: string | null
  updatedAt?: string
}

interface AlertsSectionProps {
  token: string | null
  userProfile: any
  onRequestAuth: () => void
  onOpenSettings: () => void
  onNavigateToPost?: (section: string, postId: string) => void
  highlightedItemId?: string | null
  onItemHighlighted?: () => void
  refreshTrigger?: number
}

export function AlertsSection({ token, userProfile, onRequestAuth, onOpenSettings, onNavigateToPost, highlightedItemId, onItemHighlighted, refreshTrigger }: AlertsSectionProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newAlertMessage, setNewAlertMessage] = useState('')
  const [newAlertCategory, setNewAlertCategory] = useState('emergencia')
  const [newAlertPriority, setNewAlertPriority] = useState('alta')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadedMedia, setUploadedMedia] = useState<MediaFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [reactingTo, setReactingTo] = useState<string | null>(null)
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [newComment, setNewComment] = useState<Record<string, string>>({})
  const [isSubmittingComment, setIsSubmittingComment] = useState<string | null>(null)
  const [showComments, setShowComments] = useState<Record<string, boolean>>({})
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null)
  const [editDescription, setEditDescription] = useState('')
  const [editMediaFiles, setEditMediaFiles] = useState<File[]>([])
  const [editMediaPreviews, setEditMediaPreviews] = useState<string[]>([])
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const canPostAlert = !!token // Cualquier usuario autenticado puede publicar alertas

  useEffect(() => {
    fetchAlerts()
  }, [refreshTrigger])

  // Scroll to highlighted item
  useEffect(() => {
    if (highlightedItemId && alerts.length > 0) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`alert-${highlightedItemId}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          setTimeout(() => {
            if (onItemHighlighted) {
              onItemHighlighted()
            }
          }, 3000)
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [highlightedItemId, alerts, onItemHighlighted])

  const fetchAlerts = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/alerts`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      )
      if (response.ok) {
        const data = await response.json()
        setAlerts(data)
      }
    } catch (error) {
      console.error('Error al cargar alertas:', error)
      toast.error('Error al cargar alertas')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Validate file types
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
      return validTypes.includes(file.type)
    })

    if (validFiles.length !== files.length) {
      toast.error('Algunos archivos no son válidos. Solo se permiten imágenes y videos.')
    }

    setSelectedFiles(prev => [...prev, ...validFiles])
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return []

    setIsUploading(true)
    const uploadedFiles: MediaFile[] = []

    try {
      for (const file of selectedFiles) {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/upload`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          }
        )

        if (response.ok) {
          const data = await response.json()
          uploadedFiles.push(data)
        } else {
          const error = await response.json()
          toast.error(`Error al subir ${file.name}: ${error.error}`)
        }
      }

      setUploadedMedia(uploadedFiles)
      return uploadedFiles
    } catch (error) {
      console.error('Error uploading files:', error)
      toast.error('Error al subir archivos')
      return []
    } finally {
      setIsUploading(false)
    }
  }

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newAlertMessage.trim()) {
      toast.error('Por favor escribe el mensaje de la alerta')
      return
    }

    setIsSubmitting(true)

    try {
      // Upload files first if any
      let mediaFiles = uploadedMedia
      if (selectedFiles.length > 0 && uploadedMedia.length === 0) {
        mediaFiles = await uploadFiles()
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/alerts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            message: newAlertMessage,
            category: newAlertCategory,
            priority: newAlertPriority,
            mediaFiles
          })
        }
      )

      if (response.ok) {
        const newAlert = await response.json()
        // Re-sort based on priority
        const updated = [newAlert, ...alerts].sort((a, b) => {
          const priorityOrder = { 'critica': 1, 'alta': 2, 'media': 3, 'baja': 4 }
          const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 5
          const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 5
          if (aPriority !== bPriority) return aPriority - bPriority
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
        setAlerts(updated)
        setIsDialogOpen(false)
        setNewAlertMessage('')
        setNewAlertCategory('emergencia')
        setNewAlertPriority('alta')
        setSelectedFiles([])
        setUploadedMedia([])
        toast.success('¡Alerta publicada! Gracias por mantener informada a la comunidad 🚨')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al publicar alerta')
      }
    } catch (error) {
      console.error('Error al crear alerta:', error)
      toast.error('Error al publicar alerta')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReaction = async (alertId: string, reaction: string) => {
    setReactingTo(alertId)
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/alerts/${alertId}/react`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ reaction })
        }
      )

      if (response.ok) {
        const updatedAlert = await response.json()
        setAlerts(alerts.map(a => a.id === alertId ? updatedAlert : a))
        toast.success('¡Reacción agregada!')
      } else {
        toast.error('Error al reaccionar')
      }
    } catch (error) {
      console.error('Error al reaccionar:', error)
      toast.error('Error al reaccionar')
    } finally {
      setReactingTo(null)
    }
  }

  const handleDeleteAlert = async (alertId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta alerta?')) return

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/alerts/${alertId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        setAlerts(alerts.filter(a => a.id !== alertId))
        toast.success('Alerta eliminada')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al eliminar alerta')
      }
    } catch (error) {
      console.error('Error al eliminar alerta:', error)
      toast.error('Error al eliminar alerta')
    }
  }

  const openEditDialog = (alert: Alert) => {
    setEditingAlert(alert)
    setEditDescription(alert.description || alert.message)
    setEditMediaPreviews(alert.mediaUrls || [])
    setEditMediaFiles([])
    setIsEditDialogOpen(true)
  }

  const handleEditMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setEditMediaFiles(prev => [...prev, ...files])
    
    const previews = files.map(file => URL.createObjectURL(file))
    setEditMediaPreviews(prev => [...prev, ...previews])
  }

  const removeEditMedia = (index: number) => {
    setEditMediaPreviews(prev => prev.filter((_, i) => i !== index))
    if (index < (editingAlert?.mediaUrls?.length || 0)) {
      // Removing existing media - will need to handle server-side
    } else {
      // Removing newly added file
      const fileIndex = index - (editingAlert?.mediaUrls?.length || 0)
      setEditMediaFiles(prev => prev.filter((_, i) => i !== fileIndex))
    }
  }

  const handleUpdateAlert = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAlert || !token) return

    setIsUpdating(true)

    try {
      // Upload new media files if any
      let newMediaUrls: string[] = []
      if (editMediaFiles && editMediaFiles.length > 0) {
        const formData = new FormData()
        editMediaFiles.forEach(file => {
          formData.append('files', file)
        })

        const uploadResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/upload`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          }
        )

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          newMediaUrls = uploadData.urls || []
        }
      }

      // Combine existing and new media URLs
      const existingUrls = editingAlert.mediaUrls || []
      const allMediaUrls = [...existingUrls, ...newMediaUrls]

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/alerts/${editingAlert.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            description: editDescription,
            mediaUrls: allMediaUrls
          })
        }
      )

      if (response.ok) {
        const updatedAlert = await response.json()
        setAlerts(alerts.map(a => a.id === editingAlert.id ? updatedAlert : a))
        setIsEditDialogOpen(false)
        setEditingAlert(null)
        setEditDescription('')
        setEditMediaFiles([])
        setEditMediaPreviews([])
        toast.success('¡Emergencia actualizada!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al actualizar emergencia')
      }
    } catch (error) {
      console.error('Error updating alert:', error)
      toast.error('Error al actualizar emergencia')
    } finally {
      setIsUpdating(false)
    }
  }

  const fetchComments = async (alertId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/alerts/${alertId}/comments`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      )

      if (response.ok) {
        const commentsData = await response.json()
        setComments(prev => ({ ...prev, [alertId]: commentsData }))
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const toggleComments = async (alertId: string) => {
    const isCurrentlyShown = showComments[alertId]
    setShowComments(prev => ({ ...prev, [alertId]: !isCurrentlyShown }))
    
    if (!isCurrentlyShown && !comments[alertId]) {
      await fetchComments(alertId)
    }
  }

  const handleAddComment = async (alertId: string) => {
    if (!newComment[alertId]?.trim()) {
      toast.error('Escribe algo en tu comentario')
      return
    }

    setIsSubmittingComment(alertId)

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/alerts/${alertId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ content: newComment[alertId] })
        }
      )

      if (response.ok) {
        const comment = await response.json()
        setComments(prev => ({
          ...prev,
          [alertId]: [...(prev[alertId] || []), comment]
        }))
        setNewComment(prev => ({ ...prev, [alertId]: '' }))
        toast.success('¡Comentario publicado! 💬')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al publicar comentario')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error('Error al publicar comentario')
    } finally {
      setIsSubmittingComment(null)
    }
  }

  const handleDeleteComment = async (alertId: string, commentId: string) => {
    if (!confirm('¿Eliminar este comentario?')) return

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/alerts/${alertId}/comments/${commentId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        setComments(prev => ({
          ...prev,
          [alertId]: prev[alertId].filter(c => c.id !== commentId)
        }))
        toast.success('Comentario eliminado')
      } else {
        toast.error('Error al eliminar comentario')
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast.error('Error al eliminar comentario')
    }
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      critica: 'bg-red-500 text-white',
      alta: 'bg-orange-500 text-white',
      media: 'bg-yellow-500 text-white',
      baja: 'bg-blue-500 text-white',
    }
    return colors[priority] || colors.media
  }

  const getCategoryEmoji = (category: string) => {
    const emojis: Record<string, string> = {
      'desastre-natural': '🌪️',
      'incendio': '🔥',
      'persona-desaparecida': '🚨',
      'lluvia': '🌧️',
      'crecida-rio': '🌊',
      'emergencia': '🚑',
      'seguridad': '🛡️',
      'trafico': '🚗',
      'otro': '📌'
    }
    return emojis[category] || '⚠️'
  }

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      'desastre-natural': 'Desastre Natural',
      'incendio': 'Incendio',
      'persona-desaparecida': 'Persona Desaparecida',
      'lluvia': 'Lluvia Intensa',
      'crecida-rio': 'Crecida de Río',
      'emergencia': 'Emergencia',
      'seguridad': 'Seguridad',
      'trafico': 'Tráfico',
      'otro': 'Otro'
    }
    return names[category] || category
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando alertas...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Firefighter Welcome Banner */}
      {userProfile?.role === 'firefighter' && (
        <Card className="bg-gradient-to-r from-red-600 to-orange-600 border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center animate-pulse">
                <span className="text-4xl">🚒</span>
              </div>
              <div className="flex-1 text-white">
                <h3 className="text-xl font-bold mb-1">Sistema de Emergencias Activado</h3>
                <p className="text-sm opacity-90 mb-2">
                  Bienvenido, Bomberos Voluntarios de Gualán. Tienes acceso al sistema de alertas por voz.
                </p>
                <div className="flex items-center gap-2 text-xs bg-white/20 rounded-lg px-3 py-2 inline-flex">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Mira el botón rojo flotante en la esquina inferior derecha para publicar emergencias por voz</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Descripción de la sección */}
      <Card className="bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 border-orange-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
            <div>
              <p className="text-gray-700">
                <span className="font-semibold text-orange-700">Esta sección es muy importante.</span> Aquí puedes anunciar cualquier alerta que afecte a nuestra comunidad: <span className="font-semibold">desastres naturales</span>, <span className="font-semibold">incendios</span>, <span className="font-semibold">personas desaparecidas</span>, <span className="font-semibold">lluvias intensas</span>, <span className="font-semibold">crecidas de ríos</span>, o cualquier situación de emergencia. Tu alerta puede salvar vidas. 🚨
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-orange-600" />
          <h2>Alertas Comunitarias</h2>
        </div>
        {!token && (
          <Button size="sm" onClick={onRequestAuth} className="bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600">
            <Plus className="w-4 h-4 mr-2" />
            Publicar Alerta
          </Button>
        )}
        {token && canPostAlert && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Alerta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Publicar Alerta
                </DialogTitle>
                <DialogDescription>
                  Comparte información importante con tu comunidad
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAlert} className="space-y-4">
                {/* Tipo de alerta con botones grandes y visuales */}
                <div className="space-y-2">
                  <Label>Tipo de alerta</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewAlertCategory('crecida-rio')}
                      className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                        newAlertCategory === 'crecida-rio' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <span className="text-2xl">🌊</span>
                      <span className="text-xs">Crecida</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewAlertCategory('incendio')}
                      className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                        newAlertCategory === 'incendio' 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-gray-200 hover:border-red-300'
                      }`}
                    >
                      <span className="text-2xl">🔥</span>
                      <span className="text-xs">Incendio</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewAlertCategory('lluvia')}
                      className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                        newAlertCategory === 'lluvia' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <span className="text-2xl">🌧️</span>
                      <span className="text-xs">Lluvia</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewAlertCategory('persona-desaparecida')}
                      className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                        newAlertCategory === 'persona-desaparecida' 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-gray-200 hover:border-red-300'
                      }`}
                    >
                      <span className="text-2xl">����</span>
                      <span className="text-xs">Desapar.</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewAlertCategory('desastre-natural')}
                      className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                        newAlertCategory === 'desastre-natural' 
                          ? 'border-orange-500 bg-orange-50' 
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <span className="text-2xl">🌪️</span>
                      <span className="text-xs">Desastre</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewAlertCategory('emergencia')}
                      className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                        newAlertCategory === 'emergencia' 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-gray-200 hover:border-red-300'
                      }`}
                    >
                      <span className="text-2xl">🚑</span>
                      <span className="text-xs">Emerg.</span>
                    </button>
                  </div>
                </div>

                {/* Mensaje principal */}
                <div className="space-y-2">
                  <Label htmlFor="message">¿Qué está pasando?</Label>
                  <Textarea
                    id="message"
                    value={newAlertMessage}
                    onChange={(e) => setNewAlertMessage(e.target.value)}
                    required
                    rows={5}
                    placeholder="Ej: El río está creciendo rápidamente en la zona norte cerca del puente. Eviten circular por esa área..."
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500">Sé específico sobre la ubicación y qué está ocurriendo</p>
                </div>

                {/* Fotos y videos */}
                <div className="space-y-2">
                  <Label>Agregar fotos o videos (opcional)</Label>
                  <div className="flex flex-wrap gap-2">
                    <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors">
                      <Image className="w-4 h-4 text-gray-600" />
                      <span className="text-sm">Fotos</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        capture="environment"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                    <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors">
                      <Video className="w-4 h-4 text-gray-600" />
                      <span className="text-sm">Videos</span>
                      <input
                        type="file"
                        accept="video/*"
                        capture="environment"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Preview de archivos seleccionados */}
                  {selectedFiles.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          {file.type.startsWith('image/') ? (
                            <img
                              src={URL.createObjectURL(file)}
                              alt="Preview"
                              className="w-full h-20 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Video className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Nivel de urgencia simplificado */}
                <div className="space-y-2">
                  <Label>Nivel de urgencia</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewAlertPriority('alta')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        newAlertPriority === 'alta' 
                          ? 'border-red-500 bg-red-50 text-red-700' 
                          : 'border-gray-200 hover:border-red-300'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xl">🚨</span>
                        <span>Urgente</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewAlertPriority('media')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        newAlertPriority === 'media' 
                          ? 'border-yellow-500 bg-yellow-50 text-yellow-700' 
                          : 'border-gray-200 hover:border-yellow-300'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xl">⚠️</span>
                        <span>Informativo</span>
                      </div>
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600" 
                  disabled={isSubmitting || isUploading}
                >
                  {isUploading ? 'Subiendo archivos...' : isSubmitting ? 'Publicando...' : '🚨 Publicar Alerta'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {alerts.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-gray-500">
            No hay alertas activas en este momento
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card 
              key={alert.id} 
              id={`alert-${alert.id}`}
              className={`${
                alert.isEmergency && alert.isOfficial
                  ? 'border-4 border-red-600 bg-gradient-to-br from-red-50 to-orange-50 shadow-xl shadow-red-200'
                  : 'border-l-4'
              } overflow-hidden ${
                highlightedItemId === alert.id ? 'ring-4 ring-yellow-400 ring-offset-4 animate-pulse' : ''
              }`} 
              style={{
                borderLeftColor: !alert.isEmergency ? (alert.priority === 'critica' ? '#ef4444' : 
                                alert.priority === 'alta' ? '#f97316' :
                                alert.priority === 'media' ? '#eab308' : '#3b82f6') : undefined
              }}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {alert.isEmergency && alert.isOfficial && (
                        <Badge className="bg-red-600 text-white text-sm px-3 py-1">
                          🚒 ALERTA OFICIAL - BOMBEROS
                        </Badge>
                      )}
                      {alert.title && (
                        <h3 className="w-full font-bold text-lg text-red-700 mt-1">{alert.title}</h3>
                      )}
                      {!alert.isEmergency && (
                        <>
                          <Badge className={getPriorityColor(alert.priority)}>
                            {alert.priority === 'alta' ? '🚨 URGENTE' : '⚠️ INFO'}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <span>{getCategoryEmoji(alert.category)}</span>
                            <span>{getCategoryName(alert.category)}</span>
                          </Badge>
                        </>
                      )}
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Shield className="w-3 h-3" />
                        <span>{alert.authorOrg || alert.authorName}</span>
                        {alert.authorRole === 'firefighter' && !alert.isEmergency && (
                          <Badge className="bg-red-600 text-white text-xs px-2 py-0.5 ml-1">
                            🚒
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      {new Date(alert.createdAt).toLocaleDateString('es-GT', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                      {alert.updatedAt && (
                        <Badge variant="outline" className="text-xs ml-2">
                          Actualizada
                        </Badge>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    {alert.isEmergency && (userProfile?.role === 'firefighter' || userProfile?.role === 'admin') && alert.authorId === userProfile?.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(alert)}
                        title="Editar emergencia"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    {(userProfile?.role === 'admin' || alert.authorId === userProfile?.id) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAlert(alert.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 whitespace-pre-wrap">{alert.description || alert.message}</p>
                
                {/* Media Gallery */}
                {((alert.mediaFiles && alert.mediaFiles.length > 0) || (alert.mediaUrls && alert.mediaUrls.length > 0)) && (
                  <div className="space-y-2">
                    {alert.mediaFiles && alert.mediaFiles.map((media, idx) => (
                      <div key={`file-${idx}`} className="rounded-xl overflow-hidden bg-gray-100 relative group">
                        {media.type.startsWith('image/') ? (
                          <>
                            <img
                              src={media.url}
                              alt={`Foto de alerta ${idx + 1}`}
                              className="w-full h-auto object-contain cursor-pointer transition-transform duration-300 group-hover:scale-105"
                              onClick={() => setSelectedImage(media.url)}
                            />
                            <div 
                              className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center cursor-pointer"
                              onClick={() => setSelectedImage(media.url)}
                            >
                              <div className="bg-white/90 rounded-full p-3 opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
                                <ZoomIn className="w-6 h-6 text-gray-800" />
                              </div>
                            </div>
                          </>
                        ) : media.type.startsWith('video/') ? (
                          <div className="relative">
                            <video
                              src={media.url}
                              controls
                              className="w-full h-auto"
                              style={{ maxHeight: '500px' }}
                            >
                              Tu navegador no soporta la reproducción de video.
                            </video>
                            <div className="absolute top-3 left-3 bg-black/70 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm">
                              <Play className="w-3.5 h-3.5" />
                              <span>Video</span>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ))}
                    {alert.mediaUrls && alert.mediaUrls.map((url, idx) => (
                      <div key={`url-${idx}`} className="rounded-xl overflow-hidden bg-gray-100 relative group">
                        <img
                          src={url}
                          alt={`Foto de emergencia ${idx + 1}`}
                          className="w-full h-auto object-contain cursor-pointer transition-transform duration-300 group-hover:scale-105"
                          onClick={() => setSelectedImage(url)}
                        />
                        <div 
                          className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center cursor-pointer"
                          onClick={() => setSelectedImage(url)}
                        >
                          <div className="bg-white/90 rounded-full p-3 opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
                            <ZoomIn className="w-6 h-6 text-gray-800" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reactions Bar */}
                <div className="pt-4 border-t-2 border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {alert.reactions && (
                        <>
                          {alert.reactions.fire > 0 && <span>🔥 {alert.reactions.fire}</span>}
                          {alert.reactions.love > 0 && <span>❤️ {alert.reactions.love}</span>}
                          {alert.reactions.wow > 0 && <span>😱 {alert.reactions.wow}</span>}
                          {alert.reactions.sad > 0 && <span>😢 {alert.reactions.sad}</span>}
                          {alert.reactions.angry > 0 && <span>😡 {alert.reactions.angry}</span>}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => token ? handleReaction(alert.id, 'fire') : onRequestAuth()}
                      disabled={reactingTo === alert.id}
                      className="flex-1 hover:bg-orange-50 hover:border-orange-500 hover:scale-110 hover:rotate-12 transition-all duration-300 hover:shadow-lg hover:shadow-orange-200 active:scale-95 px-2 py-1 min-w-0"
                    >
                      <span className="text-lg animate-pulse">🔥</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => token ? handleReaction(alert.id, 'love') : onRequestAuth()}
                      disabled={reactingTo === alert.id}
                      className="flex-1 hover:bg-pink-50 hover:border-pink-500 hover:scale-125 transition-all duration-300 hover:shadow-lg hover:shadow-pink-200 active:scale-95 animate-pulse px-2 py-1 min-w-0"
                    >
                      <span className="text-lg">❤️</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => token ? handleReaction(alert.id, 'wow') : onRequestAuth()}
                      disabled={reactingTo === alert.id}
                      className="flex-1 hover:bg-yellow-50 hover:border-yellow-500 hover:scale-110 hover:-rotate-12 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-200 active:scale-95 px-2 py-1 min-w-0"
                    >
                      <span className="text-lg">😱</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => token ? handleReaction(alert.id, 'sad') : onRequestAuth()}
                      disabled={reactingTo === alert.id}
                      className="flex-1 hover:bg-blue-50 hover:border-blue-500 hover:scale-110 hover:translate-y-1 transition-all duration-300 hover:shadow-lg hover:shadow-blue-200 active:scale-95 px-2 py-1 min-w-0"
                    >
                      <span className="text-lg">😢</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => token ? handleReaction(alert.id, 'angry') : onRequestAuth()}
                      disabled={reactingTo === alert.id}
                      className="flex-1 hover:bg-red-50 hover:border-red-500 hover:scale-110 hover:rotate-6 hover:-translate-y-1 transition-all duration-300 hover:shadow-lg hover:shadow-red-200 active:scale-95 px-2 py-1 min-w-0"
                    >
                      <span className="text-lg">😡</span>
                    </Button>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="border-t-2 border-gray-100 pt-4 bg-gradient-to-b from-white to-orange-50/30">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleComments(alert.id)}
                    className="w-full justify-start text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {comments[alert.id]?.length > 0 
                      ? `${comments[alert.id].length} comentario${comments[alert.id].length !== 1 ? 's' : ''}`
                      : 'Comentarios'
                    }
                  </Button>

                  {showComments[alert.id] && (
                    <div className="mt-4 space-y-3">
                      {/* Comment input */}
                      {token ? (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Tu opinión sobre esta alerta... 💭"
                            value={newComment[alert.id] || ''}
                            onChange={(e) => setNewComment(prev => ({ ...prev, [alert.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleAddComment(alert.id)
                              }
                            }}
                            className="flex-1 border-2 border-orange-200 focus:border-orange-400"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleAddComment(alert.id)}
                            disabled={isSubmittingComment === alert.id}
                            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3 text-center">
                          <p className="text-sm text-gray-700 mb-2">Inicia sesión para comentar</p>
                          <Button size="sm" onClick={onRequestAuth} className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
                            Iniciar sesión
                          </Button>
                        </div>
                      )}

                      {/* Comments list */}
                      {comments[alert.id] && comments[alert.id].length > 0 && (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {comments[alert.id].map((comment) => (
                            <div
                              key={comment.id}
                              className="bg-white rounded-lg p-3 border-2 border-gray-100 hover:border-orange-200 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <User className="w-4 h-4 text-orange-500" />
                                    <span className="text-sm text-orange-600">{comment.userName}</span>
                                    <span className="text-xs text-gray-400">
                                      {new Date(comment.createdAt).toLocaleDateString('es-GT', {
                                        day: 'numeric',
                                        month: 'short',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                  <p className="text-gray-800 text-sm whitespace-pre-wrap">{comment.content}</p>
                                </div>
                                {token && (userProfile?.id === comment.userId || userProfile?.role === 'admin') && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteComment(alert.id, comment.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {comments[alert.id] && comments[alert.id].length === 0 && (
                        <p className="text-center text-gray-500 text-sm py-4">
                          ✨ Sé el primero en comentar
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Post Actions */}
                <div className="border-t-2 border-gray-100 pt-3 mt-4">
                  <PostActions
                    postType="alert"
                    postId={alert.id}
                    token={token}
                    isAuthor={alert.authorId === userProfile?.id}
                    className="justify-end"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Emergency Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg bg-gradient-to-br from-red-50 to-orange-50 border-4 border-red-500">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Edit className="w-5 h-5 text-red-600" />
              Actualizar Emergencia
              <Badge className="bg-red-600 text-white">🚒 Bomberos</Badge>
            </DialogTitle>
            <DialogDescription>
              Agrega información adicional, fotos o actualiza la descripción de la emergencia
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateAlert} className="space-y-4">
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descripción de la emergencia</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={6}
                disabled={isUpdating}
                className="border-2 border-red-300 focus:border-red-500 bg-white"
                required
              />
            </div>

            {/* Media Upload */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Agregar más fotos/videos
              </Label>
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleEditMediaSelect}
                disabled={isUpdating}
                className="w-full text-sm"
              />
              
              {/* Media Previews */}
              {editMediaPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {editMediaPreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg border-2 border-red-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeEditMedia(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isUpdating}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isUpdating || !editDescription.trim()}
                className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
              >
                {isUpdating ? (
                  <>
                    <AlertTriangle className="w-4 h-4 mr-2 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Actualizar
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Image Viewer */}
      <ImageViewer
        imageUrl={selectedImage}
        onClose={() => setSelectedImage(null)}
        altText="Imagen de alerta"
      />
    </div>
  )
}
