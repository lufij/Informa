import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { Search, Flame, Megaphone, ShoppingBag, MessageSquare, User, X, Clock } from 'lucide-react'
import { projectId, publicAnonKey } from '../utils/supabase/info'
import { motion, AnimatePresence } from 'motion/react'
import { UserAvatar } from './UserAvatar'

interface SearchResult {
  resultType: 'news' | 'alert' | 'classified' | 'forum' | 'user' | 'event'
  id: string
  title?: string
  topic?: string
  message?: string
  content?: string
  description?: string
  name?: string
  category?: string
  authorName?: string
  userName?: string
  createdAt?: string
  profilePhoto?: string
}

interface GlobalSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onNavigate?: (type: string, id: string) => void
}

export function GlobalSearch({ open, onOpenChange, onNavigate }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    if (query.length >= 2) {
      const timer = setTimeout(() => {
        performSearch()
      }, 300) // Debounce search

      return () => clearTimeout(timer)
    } else {
      setResults([])
    }
  }, [query, activeFilter])

  const performSearch = async () => {
    setIsSearching(true)
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/search?q=${encodeURIComponent(query)}&type=${activeFilter}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setResults(data.results || [])
      }
    } catch (error) {
      console.error('Error searching:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const saveRecentSearch = (searchQuery: string) => {
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
  }

  const handleResultClick = (result: SearchResult) => {
    saveRecentSearch(query)
    if (onNavigate) {
      onNavigate(result.resultType, result.id)
    }
    onOpenChange(false)
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'news':
        return <Flame className="w-4 h-4 text-orange-500" />
      case 'alert':
        return <Megaphone className="w-4 h-4 text-red-500" />
      case 'classified':
      case 'event':
        return <ShoppingBag className="w-4 h-4 text-green-500" />
      case 'forum':
        return <MessageSquare className="w-4 h-4 text-blue-500" />
      case 'user':
        return <User className="w-4 h-4 text-purple-500" />
      default:
        return <Search className="w-4 h-4 text-gray-500" />
    }
  }

  const getResultTitle = (result: SearchResult) => {
    return result.title || result.topic || result.message?.substring(0, 60) || result.name || 'Sin título'
  }

  const getResultDescription = (result: SearchResult) => {
    if (result.resultType === 'user') {
      return result.description || 'Usuario'
    }
    return result.content?.substring(0, 100) || result.description?.substring(0, 100) || ''
  }

  const getResultCategory = (result: SearchResult) => {
    if (result.category) {
      return result.category.charAt(0).toUpperCase() + result.category.slice(1)
    }
    return result.resultType.charAt(0).toUpperCase() + result.resultType.slice(1)
  }

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Ahora'
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)}m`
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)}h`
    if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)}d`
    
    return date.toLocaleDateString('es-GT', { day: 'numeric', month: 'short' })
  }

  const filteredResults = activeFilter === 'all' 
    ? results 
    : results.filter(r => r.resultType === activeFilter)

  const resultCounts = {
    all: results.length,
    news: results.filter(r => r.resultType === 'news').length,
    alerts: results.filter(r => r.resultType === 'alert').length,
    classifieds: results.filter(r => r.resultType === 'classified' || r.resultType === 'event').length,
    forums: results.filter(r => r.resultType === 'forum').length,
    users: results.filter(r => r.resultType === 'user').length,
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0 bg-gradient-to-br from-white to-gray-50">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-full">
              <Search className="w-5 h-5 text-white" />
            </div>
            Buscar en Informa
          </DialogTitle>
          <DialogDescription>
            Busca noticias, alertas, clasificados, conversaciones y usuarios
          </DialogDescription>
        </DialogHeader>

        {/* Search Input */}
        <div className="px-6 py-4 border-b bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar..."
              className="pl-10 pr-10 border-2 focus:border-purple-400"
              autoFocus
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuery('')}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <Tabs value={activeFilter} onValueChange={setActiveFilter} className="px-6">
          <TabsList className="w-full grid grid-cols-6 h-auto">
            <TabsTrigger value="all" className="text-xs">
              Todo {resultCounts.all > 0 && `(${resultCounts.all})`}
            </TabsTrigger>
            <TabsTrigger value="news" className="text-xs">
              🔥 {resultCounts.news > 0 && resultCounts.news}
            </TabsTrigger>
            <TabsTrigger value="alerts" className="text-xs">
              📢 {resultCounts.alerts > 0 && resultCounts.alerts}
            </TabsTrigger>
            <TabsTrigger value="classifieds" className="text-xs">
              💼 {resultCounts.classifieds > 0 && resultCounts.classifieds}
            </TabsTrigger>
            <TabsTrigger value="forums" className="text-xs">
              💬 {resultCounts.forums > 0 && resultCounts.forums}
            </TabsTrigger>
            <TabsTrigger value="users" className="text-xs">
              👤 {resultCounts.users > 0 && resultCounts.users}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Results */}
        <ScrollArea className="flex-1 px-6 pb-6" style={{ maxHeight: 'calc(80vh - 280px)' }}>
          {query.length < 2 ? (
            <div className="space-y-4 mt-4">
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm text-gray-700 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Búsquedas recientes
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearRecentSearches}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Limpiar
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer hover:bg-purple-50"
                        onClick={() => setQuery(search)}
                      >
                        {search}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="text-center py-12 text-gray-400">
                <Search className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Escribe al menos 2 caracteres para buscar</p>
              </div>
            </div>
          ) : isSearching ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto" />
              <p className="text-gray-500 mt-2">Buscando...</p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>No se encontraron resultados para "{query}"</p>
            </div>
          ) : (
            <div className="space-y-2 mt-4">
              <AnimatePresence>
                {filteredResults.map((result, index) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer bg-white"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {result.resultType === 'user' ? (
                          <UserAvatar
                            userId={result.id}
                            userName={result.name || ''}
                            profilePhoto={result.profilePhoto}
                            size="sm"
                          />
                        ) : (
                          getResultIcon(result.resultType)
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm line-clamp-1">
                              {getResultTitle(result)}
                            </h4>
                            {getResultDescription(result) && (
                              <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                                {getResultDescription(result)}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {getResultCategory(result)}
                              </Badge>
                              {(result.authorName || result.userName) && (
                                <span className="text-xs text-gray-500">
                                  {result.authorName || result.userName}
                                </span>
                              )}
                              {result.createdAt && (
                                <span className="text-xs text-gray-400">
                                  • {formatTimeAgo(result.createdAt)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
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
