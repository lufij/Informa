import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from './ui/tabs'
import { TrendingUp, Flame, Heart, Eye, Share2, Clock } from 'lucide-react'
import { projectId, publicAnonKey } from '../utils/supabase/info'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'motion/react'
import { UserAvatar } from './UserAvatar'

interface TrendingItem {
  id: string
  contentType: 'news' | 'alert'
  title?: string
  message?: string
  content?: string
  category?: string
  authorName?: string
  authorId?: string
  authorPhoto?: string
  reactions?: any
  views?: number
  shareCount?: number
  engagementScore: number
  createdAt: string
}

interface TrendingContentProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onNavigate?: (section: string, itemId: string) => void
}

export function TrendingContent({ open, onOpenChange, onNavigate }: TrendingContentProps) {
  const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('7d')

  useEffect(() => {
    if (open) {
      fetchTrending()
    }
  }, [open, timeframe])

  const fetchTrending = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/trending?timeframe=${timeframe}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setTrendingItems(data)
      }
    } catch (error) {
      console.error('Error fetching trending:', error)
      toast.error('Error al cargar tendencias')
    } finally {
      setIsLoading(false)
    }
  }

  const getTotalReactions = (item: TrendingItem) => {
    if (!item.reactions) return 0
    return Object.values(item.reactions).reduce((sum: number, count: any) => sum + (count || 0), 0)
  }

  const getItemTitle = (item: TrendingItem) => {
    return item.title || item.message?.substring(0, 60) || 'Sin título'
  }

  const getItemContent = (item: TrendingItem) => {
    const text = item.content || item.message || ''
    return text.length > 120 ? text.substring(0, 120) + '...' : text
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

  const getGradient = (type: string) => {
    return type === 'news'
      ? 'from-yellow-400 to-orange-500'
      : 'from-red-500 to-pink-500'
  }

  const getLabel = (type: string) => {
    return type === 'news' ? 'Chisme' : 'Alerta'
  }

  const getTimeframeLabel = (tf: string) => {
    const labels: Record<string, string> = {
      '24h': 'Últimas 24 horas',
      '7d': 'Última semana',
      '30d': 'Último mes'
    }
    return labels[tf] || tf
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col bg-gradient-to-br from-white to-gray-50">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-full animate-pulse">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="flex items-center gap-2">
                🔥 Tendencias
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white animate-pulse">
                  HOT
                </Badge>
              </DialogTitle>
              <DialogDescription>
                Lo más popular en {getTimeframeLabel(timeframe)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Timeframe Selector */}
        <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as '24h' | '7d' | '30d')} className="px-6">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="24h" className="text-xs">
              24 horas
            </TabsTrigger>
            <TabsTrigger value="7d" className="text-xs">
              7 días
            </TabsTrigger>
            <TabsTrigger value="30d" className="text-xs">
              30 días
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <ScrollArea className="flex-1 px-6 pb-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-500">Cargando tendencias...</p>
              </div>
            </div>
          ) : trendingItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <TrendingUp className="w-12 h-12 text-gray-300 mb-2" />
              <p className="text-gray-500">No hay contenido trending en este período</p>
            </div>
          ) : (
            <div className="space-y-3 mt-4">
              <AnimatePresence>
                {trendingItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card 
                      className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer relative"
                      onClick={() => {
                        if (onNavigate) {
                          const section = item.contentType === 'news' ? 'news' : 'alerts'
                          onNavigate(section, item.id)
                          onOpenChange(false)
                        }
                      }}
                    >
                      {/* Ranking Badge */}
                      <div className="absolute top-3 left-3 z-10">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                          index === 0
                            ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                            : index === 1
                            ? 'bg-gradient-to-br from-gray-300 to-gray-400'
                            : index === 2
                            ? 'bg-gradient-to-br from-orange-400 to-orange-600'
                            : 'bg-gradient-to-br from-purple-500 to-pink-500'
                        }`}>
                          <span className="text-white font-bold">{index + 1}</span>
                        </div>
                      </div>

                      <div className={`h-2 bg-gradient-to-r ${getGradient(item.contentType)} ${index < 3 ? 'animate-pulse' : ''}`} />
                      
                      <CardHeader className="pb-2 pt-4">
                        <div className="flex items-start gap-3 ml-12">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={`bg-gradient-to-r ${getGradient(item.contentType)} text-white text-xs`}>
                                {getLabel(item.contentType)}
                              </Badge>
                              {item.category && (
                                <Badge variant="outline" className="text-xs">
                                  {item.category}
                                </Badge>
                              )}
                              {index < 3 && (
                                <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                              )}
                            </div>
                            
                            <CardTitle className="text-base line-clamp-2 mb-2">
                              {getItemTitle(item)}
                            </CardTitle>
                            
                            {getItemContent(item) && (
                              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                {getItemContent(item)}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                              <UserAvatar
                                userId={item.authorId || ''}
                                userName={item.authorName || ''}
                                profilePhoto={item.authorPhoto}
                                size="sm"
                              />
                              <span>{item.authorName}</span>
                              <span>•</span>
                              <Clock className="w-3 h-3" />
                              <span>{formatTimeAgo(item.createdAt)}</span>
                            </div>

                            {/* Engagement Stats */}
                            <div className="flex items-center gap-4 text-sm">
                              {getTotalReactions(item) > 0 && (
                                <div className="flex items-center gap-1.5 text-pink-600">
                                  <Heart className="w-4 h-4 fill-current" />
                                  <span className="font-semibold">{getTotalReactions(item)}</span>
                                </div>
                              )}
                              {item.views && item.views > 0 && (
                                <div className="flex items-center gap-1.5 text-blue-600">
                                  <Eye className="w-4 h-4" />
                                  <span className="font-semibold">{item.views}</span>
                                </div>
                              )}
                              {item.shareCount && item.shareCount > 0 && (
                                <div className="flex items-center gap-1.5 text-green-600">
                                  <Share2 className="w-4 h-4" />
                                  <span className="font-semibold">{item.shareCount}</span>
                                </div>
                              )}
                              <div className="ml-auto flex items-center gap-1.5 text-orange-600">
                                <TrendingUp className="w-4 h-4" />
                                <span className="font-semibold">{Math.round(item.engagementScore)}</span>
                                <span className="text-xs text-gray-500">pts</span>
                              </div>
                            </div>
                          </div>
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
