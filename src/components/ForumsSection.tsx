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
import { MessageSquare, Plus, User, Send, Image, Video, X, ZoomIn, Trash2, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { ProfilePhotoGuard } from './ProfilePhotoGuard'
import { PostActions } from './PostActions'
import { EditPostDialog } from './EditPostDialog'
import { ImageViewer } from './ImageViewer'

interface MediaFile {
  url: string
  type: string
  fileName: string
}

interface Forum {
  id: string
  topic: string
  description: string
  category: string
  mediaFiles?: MediaFile[]
  authorName: string
  authorId: string
  createdAt: string
  updatedAt: string
  postCount: number
}

interface ForumPost {
  id: string
  forumId: string
  content: string
  userName: string
  userId: string
  createdAt: string
}

interface ForumsSectionProps {
  token: string | null
  userProfile: any
  onRequestAuth: () => void
  onOpenSettings: () => void
  onNavigateToPost?: (section: string, postId: string) => void
  highlightedItemId?: string | null
  onItemHighlighted?: () => void
}

export function ForumsSection({ token, userProfile, onRequestAuth, onOpenSettings, onNavigateToPost, highlightedItemId, onItemHighlighted }: ForumsSectionProps) {
  const [forums, setForums] = useState<Forum[]>([])
  const [selectedForum, setSelectedForum] = useState<Forum | null>(null)
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newForumTopic, setNewForumTopic] = useState('')
  const [newForumDescription, setNewForumDescription] = useState('')
  const [newForumCategory, setNewForumCategory] = useState('general')
  const [newPostContent, setNewPostContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadedMedia, setUploadedMedia] = useState<MediaFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  
  // Edit post state
  const [editingForum, setEditingForum] = useState<Forum | null>(null)
  const [editingPost, setEditingPost] = useState<ForumPost | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)

  useEffect(() => {
    fetchForums()
  }, [])

  // Scroll to highlighted item
  useEffect(() => {
    if (highlightedItemId && forums.length > 0) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`forum-${highlightedItemId}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          // Open the forum if it's not already open
          const forum = forums.find(f => f.id === highlightedItemId)
          if (forum && selectedForum?.id !== forum.id) {
            setSelectedForum(forum)
          }
          setTimeout(() => {
            if (onItemHighlighted) {
              onItemHighlighted()
            }
          }, 3000)
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [highlightedItemId, forums, selectedForum, onItemHighlighted])

  useEffect(() => {
    if (selectedForum) {
      fetchForumPosts(selectedForum.id)
    }
  }, [selectedForum])

  const fetchForums = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/forums`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      )
      if (response.ok) {
        const data = await response.json()
        setForums(data)
      }
    } catch (error) {
      console.error('Error al cargar foros:', error)
      toast.error('Error al cargar foros')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchForumPosts = async (forumId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/forums/${forumId}/posts`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      )
      if (response.ok) {
        const data = await response.json()
        setForumPosts(data)
      }
    } catch (error) {
      console.error('Error al cargar posts:', error)
      toast.error('Error al cargar posts')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
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

  const handleCreateForum = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Upload files first if any
      let mediaFiles = uploadedMedia
      if (selectedFiles.length > 0 && uploadedMedia.length === 0) {
        mediaFiles = await uploadFiles()
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/forums`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            topic: newForumTopic,
            description: newForumDescription,
            category: newForumCategory,
            mediaFiles
          })
        }
      )

      if (response.ok) {
        const newForum = await response.json()
        setForums([newForum, ...forums])
        setIsDialogOpen(false)
        setNewForumTopic('')
        setNewForumDescription('')
        setNewForumCategory('general')
        setSelectedFiles([])
        setUploadedMedia([])
        toast.success('Tema creado exitosamente 🎉')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al crear tema')
      }
    } catch (error) {
      console.error('Error al crear foro:', error)
      toast.error('Error al crear tema')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedForum) return

    setIsSubmitting(true)

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/forums/${selectedForum.id}/posts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            content: newPostContent
          })
        }
      )

      if (response.ok) {
        const newPost = await response.json()
        setForumPosts([...forumPosts, newPost])
        setNewPostContent('')
        
        // Update forum's postCount locally
        const updatedForums = forums.map(f => 
          f.id === selectedForum.id ? { ...f, postCount: f.postCount + 1 } : f
        )
        setForums(updatedForums)
        setSelectedForum({ ...selectedForum, postCount: selectedForum.postCount + 1 })
        
        toast.success('Respuesta publicada')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al publicar respuesta')
      }
    } catch (error) {
      console.error('Error al crear post:', error)
      toast.error('Error al publicar respuesta')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      general: 'bg-blue-100 text-blue-800',
      deportes: 'bg-orange-100 text-orange-800',
      cultura: 'bg-purple-100 text-purple-800',
      negocios: 'bg-green-100 text-green-800',
      educacion: 'bg-yellow-100 text-yellow-800',
    }
    return colors[category] || colors.general
  }

  const handleUpdateForum = (updatedForum: Forum) => {
    setForums(forums.map(f => f.id === updatedForum.id ? updatedForum : f))
    if (selectedForum?.id === updatedForum.id) {
      setSelectedForum(updatedForum)
    }
  }

  const handleUpdatePost = (updatedPost: ForumPost) => {
    setForumPosts(forumPosts.map(p => p.id === updatedPost.id ? updatedPost : p))
  }

  const handleDeleteForum = async (forumId: string) => {
    if (!token || !userProfile) {
      toast.error('Debes iniciar sesión')
      return
    }

    // Check if user is admin
    if (userProfile.role !== 'admin') {
      toast.error('Solo los administradores pueden eliminar temas')
      return
    }

    if (!confirm('¿Estás seguro de que deseas eliminar este tema? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/forums/${forumId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        setForums(forums.filter(f => f.id !== forumId))
        if (selectedForum?.id === forumId) {
          setSelectedForum(null)
        }
        toast.success('Tema eliminado correctamente')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al eliminar el tema')
      }
    } catch (error) {
      console.error('Error deleting forum:', error)
      toast.error('Error al eliminar el tema')
    }
  }

  if (selectedForum) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setSelectedForum(null)}>
            ← Volver
          </Button>
          
          {/* Admin Delete Button */}
          {userProfile?.role === 'admin' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteForum(selectedForum.id)}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar Tema
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getCategoryColor(selectedForum.category)}>
                {selectedForum.category}
              </Badge>
              <span className="text-sm text-gray-600">
                {selectedForum.postCount} {selectedForum.postCount === 1 ? 'respuesta' : 'respuestas'}
              </span>
            </div>
            <CardTitle>{selectedForum.topic}</CardTitle>
            <CardDescription>
              Por {selectedForum.authorName} • {new Date(selectedForum.createdAt).toLocaleDateString('es-GT')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">{selectedForum.description}</p>
            
            {selectedForum.mediaFiles && selectedForum.mediaFiles.length > 0 && (
              <div className="grid grid-cols-1 gap-3 mt-4">
                {selectedForum.mediaFiles.map((media, index) => (
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
                      <video
                        src={media.url}
                        controls
                        className="w-full h-auto"
                        style={{ maxHeight: '500px' }}
                      >
                        Tu navegador no soporta la reproducción de video.
                      </video>
                    ) : null}
                  </div>
                ))}
              </div>
            )}

            {/* Post Actions for Forum */}
            <div className="border-t-2 border-gray-100 pt-3 mt-4">
              <PostActions
                postType="news"
                postId={selectedForum.id}
                token={token}
                isAuthor={selectedForum.authorId === userProfile?.id}
                onEdit={() => {
                  setEditingForum(selectedForum)
                  setShowEditDialog(true)
                }}
                className="justify-end"
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Respuestas
          </h3>
          
          {forumPosts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <CardDescription>
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{post.userName}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(post.createdAt).toLocaleDateString('es-GT', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>

                {/* Post Actions */}
                <div className="border-t-2 border-gray-100 pt-3 mt-3">
                  <PostActions
                    postType="news"
                    postId={post.id}
                    token={token}
                    isAuthor={post.userId === userProfile?.id}
                    onEdit={() => {
                      setEditingPost(post)
                      setShowEditDialog(true)
                    }}
                    className="justify-end"
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          {token ? (
            <ProfilePhotoGuard userProfile={userProfile} onOpenSettings={onOpenSettings}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Agregar respuesta</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreatePost} className="space-y-4">
                    <Textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      required
                      rows={4}
                      placeholder="Escribe tu respuesta..."
                    />
                    <Button type="submit" disabled={isSubmitting}>
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmitting ? 'Enviando...' : 'Enviar respuesta'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </ProfilePhotoGuard>
          ) : (
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300">
              <CardContent className="pt-6 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-blue-400" />
                <p className="text-gray-700 mb-4">¿Quieres unirte a la conversación?</p>
                <Button onClick={onRequestAuth} className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700">
                  Inicia sesión para comentar
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando foros...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-indigo-600" />
          <h2>Foros Comunitarios</h2>
        </div>
        {token ? (
          <ProfilePhotoGuard userProfile={userProfile} onOpenSettings={onOpenSettings}>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  💬 Nuevo Tema
                </Button>
              </DialogTrigger>
          <DialogContent className="max-w-md bg-gradient-to-br from-blue-50 to-cyan-50">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                💬 Crear Nuevo Tema
              </DialogTitle>
              <DialogDescription className="text-base">
                Inicia una conversación con la comunidad
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateForum} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topic" className="text-base">Tema</Label>
                <Input
                  id="topic"
                  value={newForumTopic}
                  onChange={(e) => setNewForumTopic(e.target.value)}
                  required
                  placeholder="Ej: ¿Qué lugares recomiendan para comer?"
                  className="border-2 border-blue-200 focus:border-blue-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base">Descripción</Label>
                <Textarea
                  id="description"
                  value={newForumDescription}
                  onChange={(e) => setNewForumDescription(e.target.value)}
                  required
                  rows={4}
                  placeholder="Describe tu tema..."
                  className="border-2 border-blue-200 focus:border-blue-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select value={newForumCategory} onValueChange={setNewForumCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">💬 General</SelectItem>
                    <SelectItem value="deportes">⚽ Deportes</SelectItem>
                    <SelectItem value="cultura">🎭 Cultura</SelectItem>
                    <SelectItem value="negocios">💼 Negocios</SelectItem>
                    <SelectItem value="educacion">📚 Educación</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="media" className="text-base flex items-center gap-2">
                  📸 Fotos y Videos
                  <span className="text-xs text-gray-500">(opcional)</span>
                </Label>
                <Input
                  id="media"
                  type="file"
                  accept="image/*,video/*"
                  capture="environment"
                  multiple
                  onChange={handleFileSelect}
                  className="cursor-pointer border-2 border-blue-200"
                />
                <p className="text-xs text-gray-500">
                  📱 Toma fotos con tu cámara o sube desde tu galería. Máximo 50MB por archivo
                </p>
              </div>
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Archivos seleccionados:</Label>
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                        {file.type.startsWith('image/') ? (
                          <Image className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Video className="w-4 h-4 text-purple-600" />
                        )}
                        <span className="text-sm flex-1 truncate">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white text-lg py-6" 
                disabled={isSubmitting || isUploading}
              >
                {isSubmitting ? '📤 Creando...' : isUploading ? '⬆️ Subiendo archivos...' : '🚀 Crear Tema'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
          </ProfilePhotoGuard>
        ) : (
          <Button 
            size="lg"
            onClick={onRequestAuth}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            💬 Nuevo Tema
          </Button>
        )}
      </div>

      {forums.length === 0 ? (
        <Card className="border-4 border-dashed border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="pt-12 pb-12 text-center">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-blue-400 animate-pulse" />
            <h3 className="text-xl mb-2">¡Inicia la conversación!</h3>
            <p className="text-gray-600">Sé el primero en compartir un tema 💬</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {forums.map((forum) => (
            <Card 
              key={forum.id}
              id={`forum-${forum.id}`}
              className={`hover:shadow-lg transition-all hover:-translate-y-1 border-l-4 border-l-blue-500 ${
                highlightedItemId === forum.id ? 'ring-4 ring-yellow-400 ring-offset-4 animate-pulse' : ''
              }`}
            >
              <CardHeader 
                className="cursor-pointer"
                onClick={() => setSelectedForum(forum)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getCategoryColor(forum.category)}>
                      {forum.category}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      💬 {forum.postCount} {forum.postCount === 1 ? 'respuesta' : 'respuestas'}
                    </span>
                    {forum.mediaFiles && forum.mediaFiles.length > 0 && (
                      <Badge variant="outline" className="text-blue-600 border-blue-600">
                        📸 {forum.mediaFiles.length}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Admin Delete Button */}
                  {userProfile?.role === 'admin' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation()
                        handleDeleteForum(forum.id)
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <CardTitle>{forum.topic}</CardTitle>
                <CardDescription>
                  Por {forum.authorName} • {new Date(forum.createdAt).toLocaleDateString('es-GT')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 line-clamp-2">{forum.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Image Viewer */}
      <ImageViewer
        imageUrl={selectedImage}
        onClose={() => setSelectedImage(null)}
        altText="Imagen de foro"
      />
    </div>
  )
}
