import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Tabs, TabsList, TabsTrigger } from './ui/tabs'
import { ScrollArea } from './ui/scroll-area'
import { Flame, Megaphone, ShoppingBag, MessageSquare, Calendar, TrendingUp, Users, Clock, User, Eye, Heart } from 'lucide-react'
import { projectId, publicAnonKey } from '../utils/supabase/info'
import { toast } from 'sonner@2.0.3'
import { motion, AnimatePresence } from 'motion/react'
import { UserAvatar } from './UserAvatar'

interface FeedItem {
  id: string
  feedType: 'news' | 'alert' | 'classified' | 'event' | 'forum'
  title?: string
  topic?: string
  message?: string
  content?: string
  description?: string
  category?: string
  authorId?: string
  userId?: string
  authorName?: string
  userName?: string
  authorPhoto?: string
  userPhoto?: string
  profilePhoto?: string
  reactions?: any
  views?: number
  shareCount?: number
  createdAt: string
}

interface UnifiedFeedProps {
  token: string | null
  userProfile: any
  onNavigate?: (section: string, itemId: string) => void
}

export function UnifiedFeed({ token, userProfile, onNavigate }: UnifiedFeedProps) {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'following'>('all')

  useEffect(() => {
    fetchFeed()
  }, [filter, token])

  const fetchFeed = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/feed?filter=${filter}`,
        {
          headers: {
            'Authorization': `Bearer ${token || publicAnonKey}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setFeedItems(data)
      } else {
        // Only show error if it's not a network issue
        if (response.status !== 0) {
          console.error('Error fetching feed:', response.status)
        }
      }
    } catch (error) {
      // Silent fail for network errors - only log non-fetch errors
      if (error instanceof Error && !error.message.includes('fetch')) {
        console.error('Error fetching feed:', error)
        toast.error('Error al cargar el feed')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getFeedIcon = (type: string) => {
    switch (type) {
      case 'news':
        return <Flame className="w-5 h-5 text-orange-500" />
      case 'alert':
        return <Megaphone className="w-5 h-5 text-red-500" />
      case 'classified':
        return <ShoppingBag className="w-5 h-5 text-green-500" />
      case 'event':
        return <Calendar className="w-5 h-5 text-blue-500" />
      case 'forum':
        return <MessageSquare className="w-5 h-5 text-purple-500" />
      default:
        return null
    }
  }

  const getFeedLabel = (type: string) => {
    const labels: Record<string, string> = {
      news: 'Chisme',
      alert: 'Alerta',
      classified: 'Clasificado',
      event: 'Evento',
      forum: 'Conversación'
    }
    return labels[type] || type
  }

  const getFeedGradient = (type: string) => {
    const gradients: Record<string, string> = {
      news: 'from-yellow-400 to-orange-500',
      alert: 'from-red-500 to-pink-500',
      classified: 'from-green-500 to-emerald-500',
      event: 'from-blue-500 to-cyan-500',
      forum: 'from-purple-500 to-violet-500'
    }
    return gradients[type] || 'from-gray-400 to-gray-500'
  }

  const getItemTitle = (item: FeedItem) => {
    return item.title || item.topic || item.message?.substring(0, 60) || 'Sin título'
  }

  const getItemContent = (item: FeedItem) => {
    const text = item.content || item.description || item.message || ''
    return text.length > 150 ? text.substring(0, 150) + '...' : text
  }

  const getAuthorName = (item: FeedItem) => {
    return item.authorName || item.userName || 'Usuario'
  }

  const getAuthorId = (item: FeedItem) => {
    return item.authorId || item.userId || ''
  }

  const getAuthorPhoto = (item: FeedItem) => {
    return item.authorPhoto || item.userPhoto || item.profilePhoto
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Ahora mismo'
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`
    if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} días`
    
    return date.toLocaleDateString('es-GT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getTotalReactions = (item: FeedItem) => {
    if (!item.reactions) return 0
    return Object.values(item.reactions).reduce((sum: number, count: any) => sum + (count || 0), 0)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-full">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="flex items-center gap-2">
              Feed Completo
            </h2>
            <p className="text-sm text-gray-600">Todo lo que está pasando</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      {token && (
        <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'following')}>
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Todo
            </TabsTrigger>
            <TabsTrigger value="following" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Siguiendo
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Feed Items */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-500">Cargando feed...</p>
          </div>
        </div>
      ) : feedItems.length === 0 ? (
        <Card className="border-4 border-dashed border-purple-300">
          <CardContent className="pt-12 pb-12 text-center">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 text-purple-400 opacity-50" />
            <h3 className="text-xl mb-2">
              {filter === 'following' ? '¡Sigue a usuarios para ver su contenido aquí!' : 'No hay contenido aún'}
            </h3>
            <p className="text-gray-600">
              {filter === 'following' 
                ? 'El contenido de las personas que sigues aparecerá aquí'
                : 'Sé el primero en publicar algo'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {feedItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => {
                    if (onNavigate) {
                      const sectionMap: Record<string, string> = {
                        news: 'news',
                        alert: 'alerts',
                        classified: 'classifieds',
                        event: 'classifieds',
                        forum: 'forums'
                      }
                      onNavigate(sectionMap[item.feedType], item.id)
                    }
                  }}
                >
                  {/* Type indicator strip */}
                  <div className={`h-2 bg-gradient-to-r ${getFeedGradient(item.feedType)}`} />
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {/* Type badge */}
                        <div className="flex items-center gap-2 mb-2">
                          {getFeedIcon(item.feedType)}
                          <Badge className={`bg-gradient-to-r ${getFeedGradient(item.feedType)} text-white`}>
                            {getFeedLabel(item.feedType).toUpperCase()}
                          </Badge>
                          {item.category && (
                            <Badge variant="outline" className="text-xs text-[15px] font-[ADLaM_Display]">
                              {item.category}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Title */}
                        <CardTitle className="text-xl mb-2 line-clamp-2">
                          {getItemTitle(item)}
                        </CardTitle>
                        
                        {/* Author info */}
                        <div className="flex items-center gap-2 text-sm">
                          <UserAvatar
                            userId={getAuthorId(item)}
                            userName={getAuthorName(item)}
                            profilePhoto={getAuthorPhoto(item)}
                            size="sm"
                          />
                          <span className="text-gray-600">{getAuthorName(item)}</span>
                          <span className="text-gray-400">•</span>
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-500 text-xs">{formatTimeAgo(item.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {/* Content preview */}
                    {getItemContent(item) && (
                      <p className="text-gray-700 line-clamp-3 mb-3">
                        {getItemContent(item)}
                      </p>
                    )}
                    
                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {getTotalReactions(item) > 0 && (
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4 text-pink-500" />
                          <span>{getTotalReactions(item)}</span>
                        </div>
                      )}
                      {item.views && item.views > 0 && (
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4 text-blue-500" />
                          <span>{item.views}</span>
                        </div>
                      )}
                      {item.shareCount && item.shareCount > 0 && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span>{item.shareCount}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
