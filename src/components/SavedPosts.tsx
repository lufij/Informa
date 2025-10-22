import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { Bookmark, Trash2, Clock, Flame, Megaphone, ShoppingBag, MessageSquare } from 'lucide-react'
import { projectId, publicAnonKey } from '../utils/supabase/info'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'motion/react'
import { UserAvatar } from './UserAvatar'

interface SavedPost {
  id: string
  postType: 'news' | 'alert' | 'classified' | 'forum'
  savedAt: string
  title?: string
  topic?: string
  message?: string
  content?: string
  description?: string
  authorName?: string
  userName?: string
  authorId?: string
  userId?: string
  authorPhoto?: string
  userPhoto?: string
  category?: string
  createdAt?: string
}

interface SavedPostsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  token: string
  onNavigate?: (section: string, itemId: string) => void
}

export function SavedPosts({ open, onOpenChange, token, onNavigate }: SavedPostsProps) {
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      fetchSavedPosts()
    }
  }, [open])

  const fetchSavedPosts = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/saved`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setSavedPosts(data)
      }
    } catch (error) {
      console.error('Error fetching saved posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const unsavePost = async (postType: string, postId: string) => {
    setRemovingId(postId)
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/saved/${postType}/${postId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        setSavedPosts(savedPosts.filter(p => p.id !== postId))
        toast.success('Eliminado de guardados')
      } else {
        toast.error('Error al eliminar de guardados')
      }
    } catch (error) {
      console.error('Error unsaving post:', error)
      toast.error('Error al eliminar de guardados')
    } finally {
      setRemovingId(null)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'news':
        return <Flame className="w-4 h-4 text-orange-500" />
      case 'alert':
        return <Megaphone className="w-4 h-4 text-red-500" />
      case 'classified':
        return <ShoppingBag className="w-4 h-4 text-green-500" />
      case 'forum':
        return <MessageSquare className="w-4 h-4 text-blue-500" />
      default:
        return null
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      news: 'Noticia',
      alert: 'Alerta',
      classified: 'Clasificado',
      forum: 'Conversación'
    }
    return labels[type] || type
  }

  const getTypeGradient = (type: string) => {
    const gradients: Record<string, string> = {
      news: 'from-yellow-400 to-orange-500',
      alert: 'from-red-500 to-pink-500',
      classified: 'from-green-500 to-emerald-500',
      forum: 'from-blue-500 to-cyan-500'
    }
    return gradients[type] || 'from-gray-400 to-gray-500'
  }

  const getPostTitle = (post: SavedPost) => {
    return post.title || post.topic || post.message?.substring(0, 60) || 'Sin título'
  }

  const getPostContent = (post: SavedPost) => {
    const text = post.content || post.description || post.message || ''
    return text.length > 120 ? text.substring(0, 120) + '...' : text
  }

  const getAuthorName = (post: SavedPost) => {
    return post.authorName || post.userName || 'Usuario'
  }

  const getAuthorId = (post: SavedPost) => {
    return post.authorId || post.userId || ''
  }

  const getAuthorPhoto = (post: SavedPost) => {
    return post.authorPhoto || post.userPhoto
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col bg-gradient-to-br from-white to-gray-50">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-2 rounded-full">
              <Bookmark className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle>Guardados</DialogTitle>
              <DialogDescription>
                {savedPosts.length} {savedPosts.length === 1 ? 'publicación guardada' : 'publicaciones guardadas'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-500">Cargando guardados...</div>
            </div>
          ) : savedPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <Bookmark className="w-12 h-12 text-gray-300 mb-2" />
              <p className="text-gray-500">No has guardado ninguna publicación</p>
              <p className="text-sm text-gray-400">Guarda publicaciones para verlas más tarde</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {savedPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card 
                      className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => {
                        if (onNavigate) {
                          const sectionMap: Record<string, string> = {
                            news: 'news',
                            alert: 'alerts',
                            classified: 'classifieds',
                            forum: 'forums'
                          }
                          onNavigate(sectionMap[post.postType], post.id)
                          onOpenChange(false)
                        }
                      }}
                    >
                      <div className={`h-2 bg-gradient-to-r ${getTypeGradient(post.postType)}`} />
                      
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              {getTypeIcon(post.postType)}
                              <Badge className={`bg-gradient-to-r ${getTypeGradient(post.postType)} text-white text-xs`}>
                                {getTypeLabel(post.postType)}
                              </Badge>
                              {post.category && (
                                <Badge variant="outline" className="text-xs">
                                  {post.category}
                                </Badge>
                              )}
                            </div>
                            
                            <CardTitle className="text-base line-clamp-2 mb-2">
                              {getPostTitle(post)}
                            </CardTitle>
                            
                            {getPostContent(post) && (
                              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                {getPostContent(post)}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <UserAvatar
                                userId={getAuthorId(post)}
                                userName={getAuthorName(post)}
                                profilePhoto={getAuthorPhoto(post)}
                                size="sm"
                              />
                              <span>{getAuthorName(post)}</span>
                              {post.savedAt && (
                                <>
                                  <span>•</span>
                                  <Clock className="w-3 h-3" />
                                  <span>Guardado {formatTimeAgo(post.savedAt)}</span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              unsavePost(post.postType, post.id)
                            }}
                            disabled={removingId === post.id}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>
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
