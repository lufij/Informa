import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from './ui/button'
import { X, Flame, Megaphone, Tag, CalendarDays, MessageSquare } from 'lucide-react'

interface NewContentItem {
  type: 'news' | 'alert' | 'classified' | 'forum' | 'event'
  count: number
  latestTitle?: string
  latestId?: string
}

interface NewContentBannerProps {
  newContent: NewContentItem[]
  onNavigate: (type: string, id?: string) => void
  onDismiss: () => void
}

export function NewContentBanner({ newContent, onNavigate, onDismiss }: NewContentBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible || newContent.length === 0) return null

  const totalCount = newContent.reduce((sum, item) => sum + item.count, 0)

  const getIcon = (type: string) => {
    switch (type) {
      case 'news':
        return <Flame className="w-4 h-4" />
      case 'alert':
        return <Megaphone className="w-4 h-4" />
      case 'classified':
        return <Tag className="w-4 h-4" />
      case 'forum':
        return <MessageSquare className="w-4 h-4" />
      case 'event':
        return <CalendarDays className="w-4 h-4" />
      default:
        return null
    }
  }

  const getLabel = (type: string) => {
    switch (type) {
      case 'news':
        return 'noticia'
      case 'alert':
        return 'alerta'
      case 'classified':
        return 'clasificado'
      case 'forum':
        return 'foro'
      case 'event':
        return 'evento'
      default:
        return 'contenido'
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss()
  }

  // Get the most important content type to show
  const primaryContent = newContent.find(c => c.type === 'alert') || newContent[0]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="fixed top-16 left-0 right-0 z-40 px-4 md:px-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white rounded-lg shadow-2xl p-3 md:p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 bg-white/20 p-2 rounded-full animate-pulse">
                  {getIcon(primaryContent.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-lg">
                      🔥 {totalCount} {totalCount === 1 ? 'novedad' : 'novedades'}
                    </span>
                    {newContent.length > 1 && (
                      <span className="text-sm opacity-90 hidden sm:inline">
                        ({newContent.map(c => `${c.count} ${getLabel(c.type)}${c.count !== 1 ? 's' : ''}`).join(', ')})
                      </span>
                    )}
                  </div>
                  {primaryContent.latestTitle && (
                    <p className="text-sm opacity-90 truncate">
                      {primaryContent.latestTitle}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  onClick={() => {
                    const sectionMap: Record<string, string> = {
                      news: 'noticias',
                      alert: 'alertas',
                      classified: 'clasificados',
                      forum: 'foros',
                      event: 'calendario'
                    }
                    onNavigate(sectionMap[primaryContent.type], primaryContent.latestId)
                    handleDismiss()
                  }}
                  className="bg-white text-purple-600 hover:bg-gray-100 font-semibold shadow-lg"
                >
                  Ver ahora
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Mobile-friendly content list */}
            {newContent.length > 1 && (
              <div className="mt-2 sm:hidden">
                <div className="flex flex-wrap gap-2 text-xs">
                  {newContent.map((item, index) => (
                    <div key={index} className="bg-white/20 px-2 py-1 rounded-full flex items-center gap-1">
                      {getIcon(item.type)}
                      <span>{item.count} {getLabel(item.type)}{item.count !== 1 ? 's' : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
