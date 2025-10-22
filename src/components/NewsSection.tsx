import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { projectId, publicAnonKey } from '../utils/supabase/info'
import { Flame, Plus, Shield, Trash2, Image, Video, X, ZoomIn, Play, Clock, User, Heart, Angry, Frown, PartyPopper, Eye, MessageCircle, Send } from 'lucide-react'
import { toast } from 'sonner'
import { ProfilePhotoGuard } from './ProfilePhotoGuard'
import { UserProfile } from './UserProfile'
import { UserAvatar } from './UserAvatar'
import { PostActions } from './PostActions'
import { EditPostDialog } from './EditPostDialog'
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
  newsId: string
  content: string
  userId: string
  userName: string
  userPhoto?: string
  createdAt: string
}

interface NewsItem {
  id: string
  title: string
  content: string
  category: string
  mediaFiles?: MediaFile[]
  authorName: string
  authorOrg: string
  authorId: string
  authorPhoto?: string
  reactions?: Reactions
  views?: number
  createdAt: string
}

interface NewsSectionProps {
  token: string | null
  userProfile: any
  onRequestAuth: () => void
  onOpenSettings: () => void
  onNavigateToPost?: (section: string, postId: string) => void
  highlightedItemId?: string | null
  onItemHighlighted?: () => void
}

export function NewsSection({ token, userProfile, onRequestAuth, onOpenSettings, onNavigateToPost, highlightedItemId, onItemHighlighted }: NewsSectionProps) {
  const [news, setNews] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newNewsTitle, setNewNewsTitle] = useState('')
  const [newNewsContent, setNewNewsContent] = useState('')
  const [newNewsCategory, setNewNewsCategory] = useState('salseo')
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
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [editingPost, setEditingPost] = useState<NewsItem | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)

  useEffect(() => {
    fetchNews()
  }, [])

  // Scroll to highlighted item
  useEffect(() => {
    if (highlightedItemId && news.length > 0) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`news-${highlightedItemId}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          // Clear highlight after a delay
          setTimeout(() => {
            if (onItemHighlighted) {
              onItemHighlighted()
            }
          }, 3000)
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [highlightedItemId, news, onItemHighlighted])

  const fetchNews = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/news`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      )
      if (response.ok) {
        const data = await response.json()
        setNews(data)
      }
    } catch (error) {
      console.error('Error al cargar noticias:', error)
      toast.error('Error al cargar noticias')
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

  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Upload files first if any
      let mediaFiles = uploadedMedia
      if (selectedFiles.length > 0 && uploadedMedia.length === 0) {
        mediaFiles = await uploadFiles()
      }

      // Generate automatic title from content if not provided
      const autoTitle = newNewsContent.slice(0, 60) + (newNewsContent.length > 60 ? '...' : '')

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/news`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: autoTitle,
            content: newNewsContent,
            category: newNewsCategory,
            mediaFiles
          })
        }
      )

      if (response.ok) {
        const newNews = await response.json()
        setNews([newNews, ...news])
        setIsDialogOpen(false)
        setNewNewsTitle('')
        setNewNewsContent('')
        setNewNewsCategory('salseo')
        setSelectedFiles([])
        setUploadedMedia([])
        toast.success('¡Noticia publicada! 🔥')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al publicar noticia')
      }
    } catch (error) {
      console.error('Error al crear noticia:', error)
      toast.error('Error al publicar noticia')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteNews = async (newsId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta noticia?')) return

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/news/${newsId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        setNews(news.filter(n => n.id !== newsId))
        toast.success('Noticia eliminada')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al eliminar noticia')
      }
    } catch (error) {
      console.error('Error al eliminar noticia:', error)
      toast.error('Error al eliminar noticia')
    }
  }

  const handleReaction = async (newsId: string, reaction: string) => {
    setReactingTo(newsId)
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/news/${newsId}/react`,
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
        const updatedNews = await response.json()
        setNews(news.map(n => n.id === newsId ? updatedNews : n))
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

  const fetchComments = async (newsId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/news/${newsId}/comments`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      )

      if (response.ok) {
        const commentsData = await response.json()
        setComments(prev => ({ ...prev, [newsId]: commentsData }))
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const toggleComments = async (newsId: string) => {
    const isCurrentlyShown = showComments[newsId]
    setShowComments(prev => ({ ...prev, [newsId]: !isCurrentlyShown }))
    
    if (!isCurrentlyShown && !comments[newsId]) {
      await fetchComments(newsId)
    }
  }

  const handleAddComment = async (newsId: string) => {
    if (!newComment[newsId]?.trim()) {
      toast.error('Escribe algo en tu comentario')
      return
    }

    setIsSubmittingComment(newsId)

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/news/${newsId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ content: newComment[newsId] })
        }
      )

      if (response.ok) {
        const comment = await response.json()
        setComments(prev => ({
          ...prev,
          [newsId]: [...(prev[newsId] || []), comment]
        }))
        setNewComment(prev => ({ ...prev, [newsId]: '' }))
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

  const handleDeleteComment = async (newsId: string, commentId: string) => {
    if (!confirm('¿Eliminar este comentario?')) return

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/news/${newsId}/comments/${commentId}`,
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
          [newsId]: prev[newsId].filter(c => c.id !== commentId)
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

  const getCategoryEmoji = (category: string) => {
    const emojis: Record<string, string> = {
      salseo: '🔥',
      trend: '💡',
      deportes: '⚽',
      // Legacy categories (for old posts)
      general: '💬',
      educacion: '📚',
      chisme: '👀',
      amor: '💘',
      escandalo: '💥',
    }
    return emojis[category] || '📰'
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      salseo: 'bg-pink-500 text-white',
      trend: 'bg-purple-500 text-white',
      deportes: 'bg-orange-500 text-white',
      // Legacy categories (for old posts)
      general: 'bg-cyan-500 text-white',
      educacion: 'bg-green-500 text-white',
      chisme: 'bg-pink-500 text-white',
      amor: 'bg-rose-500 text-white',
      escandalo: 'bg-yellow-500 text-black',
    }
    return colors[category] || 'bg-cyan-500 text-white'
  }

  const getCategoryGradient = (category: string) => {
    const gradients: Record<string, string> = {
      salseo: 'from-pink-400 via-fuchsia-500 to-purple-600',
      trend: 'from-purple-400 via-violet-500 to-indigo-600',
      deportes: 'from-orange-400 via-amber-500 to-yellow-600',
      // Legacy categories (for old posts)
      general: 'from-cyan-400 via-blue-500 to-purple-600',
      educacion: 'from-green-400 via-emerald-500 to-teal-600',
      chisme: 'from-pink-400 via-fuchsia-500 to-purple-600',
      amor: 'from-rose-400 via-pink-500 to-red-600',
      escandalo: 'from-yellow-400 via-orange-500 to-red-600',
    }
    return gradients[category] || 'from-cyan-400 via-blue-500 to-purple-600'
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Hace un momento'
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`
    if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} días`
    
    return date.toLocaleDateString('es-GT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando noticias...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-2 rounded-full">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="flex items-center gap-2">
              ¡Comparte tu Noticia! 🔥
            </h2>
            <p className="text-sm text-gray-600">Tu voz, tu noticia</p>
          </div>
        </div>
        {token ? (
          <ProfilePhotoGuard userProfile={userProfile} onOpenSettings={onOpenSettings}>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Cuenta tu Noticia
                </Button>
              </DialogTrigger>
          <DialogContent className="max-w-md bg-gradient-to-br from-pink-50 to-purple-50">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                🔥 ¡Cuenta tu Noticia!
              </DialogTitle>
              <DialogDescription className="text-base">
                ¿Qué está pasando en tu comunidad? ¡Cuéntanos todo!
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateNews} className="space-y-4">
              {/* Tipo de noticia con botones visuales */}
              <div className="space-y-2">
                <Label>¿De qué tipo es tu noticia?</Label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewNewsCategory('salseo')}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      newNewsCategory === 'salseo' 
                        ? 'border-pink-500 bg-pink-50 shadow-lg scale-105' 
                        : 'border-gray-200 hover:border-pink-300 hover:shadow-md'
                    }`}
                  >
                    <span className="text-3xl">🔥</span>
                    <div className="text-center">
                      <div className="text-sm">El Salseo</div>
                      <div className="text-xs text-gray-500">Drama Total</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewNewsCategory('trend')}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      newNewsCategory === 'trend' 
                        ? 'border-purple-500 bg-purple-50 shadow-lg scale-105' 
                        : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                    }`}
                  >
                    <span className="text-3xl">💡</span>
                    <div className="text-center">
                      <div className="text-sm">Trend & Tips</div>
                      <div className="text-xs text-gray-500">Lo Viral</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewNewsCategory('deportes')}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      newNewsCategory === 'deportes' 
                        ? 'border-orange-500 bg-orange-50 shadow-lg scale-105' 
                        : 'border-gray-200 hover:border-orange-300 hover:shadow-md'
                    }`}
                  >
                    <span className="text-3xl">⚽</span>
                    <div className="text-center">
                      <div className="text-sm">Vibra Deportiva</div>
                      <div className="text-xs text-gray-500">El Juego</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Campo de contenido más grande y atractivo */}
              <div className="space-y-2">
                <Label htmlFor="content" className="text-base flex items-center gap-2">
                  ✍️ ¡Cuenta todo lo que sabes!
                </Label>
                <Textarea
                  id="content"
                  value={newNewsContent}
                  onChange={(e) => setNewNewsContent(e.target.value)}
                  required
                  rows={6}
                  placeholder="¡Comparte la noticia! ¿Qué pasó? ¿Dónde? ¿Cuándo? Cuéntanos todos los detalles... 🗣️"
                  className="border-2 border-pink-200 focus:border-pink-400 text-base"
                />
              </div>

              {/* Subir fotos y videos */}
              <div className="space-y-2">
                <Label className="text-base flex items-center gap-2">
                  📸 Fotos y Videos
                  <span className="text-xs text-pink-600">(opcional pero recomendado)</span>
                </Label>
                <div className="border-2 border-dashed border-pink-300 rounded-lg p-4 bg-pink-50/50 hover:bg-pink-50 transition-colors">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFileSelect}
                    className="w-full text-sm cursor-pointer"
                    capture="environment"
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    📱 ¡Una imagen vale más que mil palabras!
                  </p>
                </div>
              </div>

              {/* Preview de archivos seleccionados */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm text-gray-700">
                    📎 {selectedFiles.length} archivo(s) listo(s):
                  </Label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        {file.type.startsWith('image/') ? (
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="aspect-square bg-purple-100 rounded-lg flex items-center justify-center">
                            <Play className="w-8 h-8 text-purple-600" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Botón de publicar grande y atractivo */}
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 hover:from-pink-600 hover:via-fuchsia-600 hover:to-purple-700 text-white text-lg py-6 shadow-lg hover:shadow-xl transition-all" 
                disabled={isSubmitting || isUploading}
              >
                {isSubmitting ? '📤 Compartiendo Noticia...' : isUploading ? '⬆️ Subiendo fotos...' : '🚀 Comparte tu Noticia'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
          </ProfilePhotoGuard>
        ) : (
          <Button 
            size="lg" 
            onClick={onRequestAuth}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Comparte tu noticia
          </Button>
        )}
      </div>

      {news.length === 0 ? (
        <Card className="border-4 border-dashed border-pink-300 bg-gradient-to-br from-pink-50 to-purple-50">
          <CardContent className="pt-12 pb-12 text-center">
            <Flame className="w-16 h-16 mx-auto mb-4 text-orange-400 animate-pulse" />
            <h3 className="text-xl mb-2">¡Sé el primero en compartir noticias!</h3>
            <p className="text-gray-600">Comparte lo que está pasando en tu comunidad 👀</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {news.map((item) => (
            <Card 
              key={item.id} 
              id={`news-${item.id}`}
              className={`overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${
                highlightedItemId === item.id ? 'ring-4 ring-yellow-400 ring-offset-4 animate-pulse' : ''
              }`}
            >
              {/* Category Header with Gradient */}
              <div className={`h-3 bg-gradient-to-r ${getCategoryGradient(item.category)} animate-gradient`} />
              
              <CardHeader className="pb-3 bg-gradient-to-br from-white to-gray-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <Badge className={`${getCategoryColor(item.category)} shadow-lg text-base px-3 py-1`}>
                        {getCategoryEmoji(item.category)} {item.category.toUpperCase()}
                      </Badge>
                      {item.reactions && Object.values(item.reactions).reduce((a, b) => a + b, 0) > 5 && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg animate-pulse">
                          🔥 TENDENCIA
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-2xl mb-3 leading-tight bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                      {item.title}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <div className="flex items-center gap-2 bg-gradient-to-r from-pink-100 to-purple-100 px-3 py-1.5 rounded-full">
                        <UserAvatar 
                          userId={item.authorId}
                          userName={item.authorName}
                          profilePhoto={item.authorPhoto}
                          size="sm"
                          onClick={() => {
                            setSelectedUserId(item.authorId)
                            setShowUserProfile(true)
                          }}
                        />
                        <span className="font-medium text-purple-700">{item.authorName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatTimeAgo(item.createdAt)}</span>
                      </div>
                      {item.views && item.views > 0 && (
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{item.views} vistas</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {(userProfile?.role === 'admin' || item.authorId === userProfile?.id) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNews(item.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4 bg-white">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-lg">{item.content}</p>
                
                {item.mediaFiles && item.mediaFiles.length > 0 && (
                  <div className="grid grid-cols-1 gap-4 mt-4">
                    {item.mediaFiles.map((media, index) => (
                      <div key={index} className="rounded-xl overflow-hidden bg-gray-100 relative group">
                        {media.type.startsWith('image/') ? (
                          <>
                            <img
                              src={media.url}
                              alt={`Imagen ${index + 1}`}
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
                  </div>
                )}

                {/* Reactions Bar */}
                <div className="pt-4 border-t-2 border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {item.reactions && (
                        <>
                          {item.reactions.fire > 0 && <span>🔥 {item.reactions.fire}</span>}
                          {item.reactions.love > 0 && <span>❤️ {item.reactions.love}</span>}
                          {item.reactions.wow > 0 && <span>😱 {item.reactions.wow}</span>}
                          {item.reactions.sad > 0 && <span>😢 {item.reactions.sad}</span>}
                          {item.reactions.angry > 0 && <span>😡 {item.reactions.angry}</span>}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => token ? handleReaction(item.id, 'fire') : onRequestAuth()}
                      disabled={reactingTo === item.id}
                      className="flex-1 hover:bg-orange-50 hover:border-orange-500 hover:scale-110 hover:rotate-12 transition-all duration-300 hover:shadow-lg hover:shadow-orange-200 active:scale-95 px-2 py-1 min-w-0"
                    >
                      <span className="text-lg animate-pulse">🔥</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => token ? handleReaction(item.id, 'love') : onRequestAuth()}
                      disabled={reactingTo === item.id}
                      className="flex-1 hover:bg-pink-50 hover:border-pink-500 hover:scale-125 transition-all duration-300 hover:shadow-lg hover:shadow-pink-200 active:scale-95 animate-pulse px-2 py-1 min-w-0"
                    >
                      <span className="text-lg">❤️</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => token ? handleReaction(item.id, 'wow') : onRequestAuth()}
                      disabled={reactingTo === item.id}
                      className="flex-1 hover:bg-yellow-50 hover:border-yellow-500 hover:scale-110 hover:-rotate-12 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-200 active:scale-95 px-2 py-1 min-w-0"
                    >
                      <span className="text-lg">😱</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => token ? handleReaction(item.id, 'sad') : onRequestAuth()}
                      disabled={reactingTo === item.id}
                      className="flex-1 hover:bg-blue-50 hover:border-blue-500 hover:scale-110 hover:translate-y-1 transition-all duration-300 hover:shadow-lg hover:shadow-blue-200 active:scale-95 px-2 py-1 min-w-0"
                    >
                      <span className="text-lg">😢</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => token ? handleReaction(item.id, 'angry') : onRequestAuth()}
                      disabled={reactingTo === item.id}
                      className="flex-1 hover:bg-red-50 hover:border-red-500 hover:scale-110 hover:rotate-6 hover:-translate-y-1 transition-all duration-300 hover:shadow-lg hover:shadow-red-200 active:scale-95 px-2 py-1 min-w-0"
                    >
                      <span className="text-lg">😡</span>
                    </Button>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="border-t-2 border-gray-100 pt-4 bg-gradient-to-b from-white to-gray-50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleComments(item.id)}
                    className="w-full justify-start text-gray-700 hover:text-pink-600 hover:bg-pink-50"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {comments[item.id]?.length > 0 
                      ? `${comments[item.id].length} comentario${comments[item.id].length !== 1 ? 's' : ''}`
                      : 'Comentarios'
                    }
                  </Button>

                  {showComments[item.id] && (
                    <div className="mt-4 space-y-3">
                      {/* Comment input */}
                      {token ? (
                        <ProfilePhotoGuard userProfile={userProfile} onOpenSettings={onOpenSettings}>
                          <div className="flex gap-2">
                            <Input
                              placeholder="¿Qué opinas de esto? 💭"
                              value={newComment[item.id] || ''}
                              onChange={(e) => setNewComment(prev => ({ ...prev, [item.id]: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault()
                                  handleAddComment(item.id)
                                }
                              }}
                              className="flex-1 border-2 border-pink-200 focus:border-pink-400"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleAddComment(item.id)}
                              disabled={isSubmittingComment === item.id}
                              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </ProfilePhotoGuard>
                      ) : (
                        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3 text-center">
                          <p className="text-sm text-gray-700 mb-2">Inicia sesión para comentar</p>
                          <Button size="sm" onClick={onRequestAuth} className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                            Iniciar sesión
                          </Button>
                        </div>
                      )}

                      {/* Comments list */}
                      {comments[item.id] && comments[item.id].length > 0 && (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {comments[item.id].map((comment) => (
                            <div
                              key={comment.id}
                              className="bg-white rounded-lg p-3 border-2 border-gray-100 hover:border-pink-200 transition-colors"
                            >
                              <div className="flex items-start gap-2">
                                <UserAvatar 
                                  userId={comment.userId}
                                  userName={comment.userName}
                                  profilePhoto={comment.userPhoto}
                                  size="sm"
                                  onClick={() => {
                                    setSelectedUserId(comment.userId)
                                    setShowUserProfile(true)
                                  }}
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span 
                                      className="text-sm text-pink-600 cursor-pointer hover:underline"
                                      onClick={() => {
                                        setSelectedUserId(comment.userId)
                                        setShowUserProfile(true)
                                      }}
                                    >
                                      {comment.userName}
                                    </span>
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
                                    onClick={() => handleDeleteComment(item.id, comment.id)}
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

                      {comments[item.id] && comments[item.id].length === 0 && (
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
                    postType="news"
                    postId={item.id}
                    token={token}
                    isAuthor={item.authorId === userProfile?.id}
                    onEdit={() => {
                      setEditingPost(item)
                      setShowEditDialog(true)
                    }}
                    className="justify-end"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Image Viewer Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-7xl w-full p-0 bg-black/95 border-0" aria-describedby="image-viewer-description">
          <DialogHeader className="sr-only">
            <DialogTitle>Visor de imagen</DialogTitle>
          </DialogHeader>
          <div id="image-viewer-description" className="sr-only">
            Imagen del chisme en tamaño completo
          </div>
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full w-10 h-10 p-0"
            >
              <X className="w-5 h-5" />
            </Button>
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Imagen ampliada"
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Action Button - Siempre visible */}
      <button
        onClick={() => token ? setIsDialogOpen(true) : onRequestAuth()}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-600 hover:from-yellow-500 hover:via-orange-600 hover:to-pink-700 text-white z-50 flex items-center justify-center transition-all duration-300 hover:scale-110 animate-pulse hover:animate-none border-4 border-white"
        aria-label="Crear nuevo chisme"
      >
        <Plus className="w-8 h-8 drop-shadow-lg" />
      </button>

      {/* Edit Post Dialog */}
      {editingPost && token && (
        <EditPostDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          postType="news"
          postId={editingPost.id}
          initialTitle={editingPost.title}
          initialContent={editingPost.content}
          token={token}
          onSuccess={(updatedPost) => {
            setNews(news.map(n => n.id === updatedPost.id ? { ...n, ...updatedPost } : n))
            setShowEditDialog(false)
          }}
        />
      )}

      {/* User Profile Dialog */}
      {selectedUserId && (
        <UserProfile
          open={showUserProfile}
          onOpenChange={setShowUserProfile}
          userId={selectedUserId}
          currentUserToken={token}
          onNavigateToPost={onNavigateToPost}
        />
      )}

      {/* Image Viewer */}
      <ImageViewer
        imageUrl={selectedImage}
        onClose={() => setSelectedImage(null)}
        altText="Imagen de noticia"
      />
    </div>
  )
}
