import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Skeleton } from './ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { ImageWithFallback } from './figma/ImageWithFallback'
import { projectId, publicAnonKey } from '../utils/supabase/info'
import { Eye, Heart, MessageSquare, Clock, MapPin, DollarSign, Tag, Download, ExternalLink, Sparkles, AlertTriangle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface PublicContentViewProps {
  contentType: 'news' | 'alert' | 'classified' | 'forum'
  contentId: string
  onInstallClick: () => void
  onLoginClick: () => void
}

export function PublicContentView({ contentType, contentId, onInstallClick, onLoginClick }: PublicContentViewProps) {
  const [content, setContent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPublicContent()
  }, [contentType, contentId])

  const fetchPublicContent = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const endpoint = `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/public/${contentType}/${contentId}`
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      })

      if (!response.ok) {
        throw new Error('No se pudo cargar el contenido')
      }

      const data = await response.json()
      setContent(data)

      // Update meta tags dynamically
      updateMetaTags(data)
    } catch (err) {
      console.error('Error fetching public content:', err)
      setError('No se pudo cargar el contenido. Puede que ya no exista.')
    } finally {
      setIsLoading(false)
    }
  }

  const updateMetaTags = (data: any) => {
    // Update page title
    document.title = `${data.title || data.content?.substring(0, 50)} - Informa Gualán`

    // Update or create Open Graph meta tags
    const updateMeta = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`)
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('property', property)
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', content)
    }

    updateMeta('og:title', data.title || data.content?.substring(0, 50) || 'Informa Gualán')
    updateMeta('og:description', data.description || data.content?.substring(0, 150) || 'Lo que está pasando en Gualán, Zacapa')
    updateMeta('og:type', 'article')
    updateMeta('og:url', window.location.href)
    
    if (data.media?.[0]) {
      updateMeta('og:image', data.media[0])
    }

    // Twitter Card
    const updateTwitterMeta = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`)
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('name', name)
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', content)
    }

    updateTwitterMeta('twitter:card', 'summary_large_image')
    updateTwitterMeta('twitter:title', data.title || data.content?.substring(0, 50) || 'Informa Gualán')
    updateTwitterMeta('twitter:description', data.description || data.content?.substring(0, 150) || '')
    if (data.media?.[0]) {
      updateTwitterMeta('twitter:image', data.media[0])
    }
  }

  const getTypeConfig = () => {
    switch (contentType) {
      case 'news':
        return {
          icon: '🔥',
          label: 'Noticia',
          gradient: 'from-yellow-400 to-orange-500'
        }
      case 'alert':
        return {
          icon: '📢',
          label: 'Alerta',
          gradient: 'from-red-500 to-pink-500'
        }
      case 'classified':
        return {
          icon: '💼',
          label: 'Clasificado',
          gradient: 'from-green-500 to-emerald-500'
        }
      case 'forum':
        return {
          icon: '💬',
          label: 'Foro',
          gradient: 'from-blue-500 to-cyan-500'
        }
      default:
        return {
          icon: '✨',
          label: 'Contenido',
          gradient: 'from-purple-500 to-pink-500'
        }
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="overflow-hidden shadow-lg">
          <CardHeader className="space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !content) {
    return (
      <Card className="shadow-lg">
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h3 className="text-red-900 mb-2">Contenido no disponible</h3>
              <p className="text-sm text-red-700">{error || 'Este contenido ya no existe o fue eliminado.'}</p>
            </div>
            <Button
              onClick={onInstallClick}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar Informa
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const typeConfig = getTypeConfig()
  const formattedDate = content.created_at 
    ? formatDistanceToNow(new Date(content.created_at), { addSuffix: true, locale: es })
    : null

  return (
    <div className="space-y-4">
      {/* Content Card */}
      <Card className="overflow-hidden shadow-xl border-2">
        <CardHeader className={`bg-gradient-to-r ${typeConfig.gradient} text-white`}>
          <div className="flex items-center justify-between mb-2">
            <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
              <span className="mr-1">{typeConfig.icon}</span>
              {typeConfig.label}
            </Badge>
            {formattedDate && (
              <div className="flex items-center gap-1 text-sm text-white/90">
                <Clock className="w-3 h-3" />
                {formattedDate}
              </div>
            )}
          </div>

          {/* Author Info */}
          {content.author && (
            <div className="flex items-center gap-3 py-2">
              <Avatar className="w-10 h-10 border-2 border-white/50">
                <AvatarImage src={content.author.profile_photo} />
                <AvatarFallback className="bg-white/20 text-white">
                  {content.author.name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-white/90">Publicado por</p>
                <p className="text-white">{content.author.name}</p>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {/* Title */}
          {content.title && (
            <h2 className="text-gray-900">{content.title}</h2>
          )}

          {/* Description/Content */}
          {content.description && (
            <p className="text-gray-700 leading-relaxed">{content.description}</p>
          )}
          {content.content && !content.description && (
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{content.content}</p>
          )}

          {/* Media Gallery */}
          {content.media && content.media.length > 0 && (
            <div className="grid grid-cols-1 gap-4">
              {content.media.map((url: string, index: number) => (
                <div key={index} className="relative rounded-xl overflow-hidden border-2 border-gray-200 shadow-md">
                  {url.includes('.mp4') || url.includes('.webm') || url.includes('.mov') ? (
                    <video
                      src={url}
                      controls
                      className="w-full max-h-96 object-contain bg-black"
                    />
                  ) : (
                    <ImageWithFallback
                      src={url}
                      alt={`Media ${index + 1}`}
                      className="w-full h-auto object-contain max-h-96"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Classified-specific fields */}
          {contentType === 'classified' && (
            <div className="space-y-3 pt-2 border-t-2 border-gray-100">
              {content.price && (
                <div className="flex items-center gap-2 text-green-700">
                  <DollarSign className="w-5 h-5" />
                  <span className="text-lg">Q{content.price.toLocaleString()}</span>
                </div>
              )}
              {content.category && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Tag className="w-4 h-4" />
                  <Badge variant="outline" className="border-gray-300">
                    {content.category}
                  </Badge>
                </div>
              )}
              {content.location && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{content.location}</span>
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-6 pt-4 border-t-2 border-gray-100 text-sm text-gray-500">
            {content.views !== undefined && (
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{content.views}</span>
              </div>
            )}
            {content.reactions_count !== undefined && (
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{content.reactions_count}</span>
              </div>
            )}
            {content.comments_count !== undefined && (
              <div className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                <span>{content.comments_count}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Call to Action Buttons */}
      <div className="grid grid-cols-1 gap-3">
        <Button
          onClick={onInstallClick}
          size="lg"
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg"
        >
          <Download className="w-5 h-5 mr-2" />
          Descargar Informa y ver más contenido
        </Button>
        
        <Button
          onClick={onLoginClick}
          variant="outline"
          size="lg"
          className="w-full border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
        >
          <ExternalLink className="w-5 h-5 mr-2" />
          Ya tengo la app - Abrir aquí
        </Button>
      </div>

      {/* Info Footer */}
      <div className="bg-gradient-to-r from-yellow-50 via-pink-50 to-purple-50 rounded-xl p-4 border-2 border-purple-200">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-purple-900 mb-1">¿Qué es Informa?</h4>
            <p className="text-sm text-purple-700">
              La aplicación comunitaria de Gualán, Zacapa. Mantente al día con noticias verificadas, 
              alertas importantes, clasificados locales y más. ¡Únete a tu comunidad!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
