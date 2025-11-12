import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { User, UserPlus, UserMinus, Users, Flame, Megaphone, ShoppingBag, MessageSquare, Calendar, MapPin, Heart, Trophy, Zap, Star, Award, Crown, Sparkles } from 'lucide-react'
import { projectId, publicAnonKey } from '../utils/supabase/info'
import { toast } from 'sonner'

interface UserProfileProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  currentUserToken: string | null
  onNavigateToPost?: (section: string, postId: string) => void
}

interface UserData {
  id: string
  name: string
  profilePhoto?: string
  organization?: string
  bio?: string
  location?: string
  interests?: string
  createdAt: string
  followersCount: number
  followingCount: number
  totalReactions?: number
  activeStreak?: number
  userLevel?: string
  badges?: string[]
}

interface UserPost {
  id: string
  type: 'news' | 'alert' | 'classified' | 'forum'
  title?: string
  topic?: string
  message?: string
  content?: string
  description?: string
  category?: string
  createdAt: string
}

export function UserProfile({ open, onOpenChange, userId, currentUserToken, onNavigateToPost }: UserProfileProps) {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [userPosts, setUserPosts] = useState<UserPost[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isFollowLoading, setIsFollowLoading] = useState(false)

  useEffect(() => {
    if (open && userId) {
      loadUserData()
      loadUserPosts()
      if (currentUserToken) {
        checkFollowingStatus()
      }
    }
  }, [open, userId, currentUserToken])

  const loadUserData = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/users/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setUserData(data)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      toast.error('Error al cargar el perfil del usuario')
    } finally {
      setIsLoading(false)
    }
  }

  const loadUserPosts = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/users/${userId}/posts`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setUserPosts(data)
      }
    } catch (error) {
      console.error('Error loading user posts:', error)
    }
  }

  const checkFollowingStatus = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/users/${userId}/following-status`,
        {
          headers: {
            'Authorization': `Bearer ${currentUserToken}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setIsFollowing(data.isFollowing)
      }
    } catch (error) {
      console.error('Error checking follow status:', error)
    }
  }

  const handleFollowToggle = async () => {
    if (!currentUserToken) {
      toast.error('Debes iniciar sesión para seguir usuarios')
      return
    }

    setIsFollowLoading(true)
    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/users/${userId}/follow`
      const method = isFollowing ? 'DELETE' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${currentUserToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        setIsFollowing(!isFollowing)
        // Update follower count
        if (userData) {
          setUserData({
            ...userData,
            followersCount: userData.followersCount + (isFollowing ? -1 : 1)
          })
        }
        toast.success(isFollowing ? 'Dejaste de seguir a este usuario' : '¡Ahora sigues a este usuario!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al actualizar seguimiento')
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
      toast.error('Error al actualizar seguimiento')
    } finally {
      setIsFollowLoading(false)
    }
  }

  const getPostIcon = (type: string) => {
    switch (type) {
      case 'news':
        return <Flame className="w-4 h-4" />
      case 'alert':
        return <Megaphone className="w-4 h-4" />
      case 'classified':
        return <ShoppingBag className="w-4 h-4" />
      case 'forum':
        return <MessageSquare className="w-4 h-4" />
      default:
        return null
    }
  }

  const getPostTitle = (post: UserPost) => {
    return post.title || post.topic || post.message || post.description || 'Sin título'
  }

  const getPostTypeName = (type: string) => {
    switch (type) {
      case 'news':
        return 'Chisme'
      case 'alert':
        return 'Alerta'
      case 'classified':
        return 'Clasificado'
      case 'forum':
        return 'Conversación'
      default:
        return type
    }
  }

  const handlePostClick = (post: UserPost) => {
    if (onNavigateToPost) {
      const sectionMap: Record<string, string> = {
        news: 'news',
        alert: 'alerts',
        classified: 'classifieds',
        forum: 'forums'
      }
      onNavigateToPost(sectionMap[post.type], post.id)
      onOpenChange(false) // Close the profile dialog
    }
  }

  const getUserLevelInfo = (level: string) => {
    const levels: Record<string, { icon: any; label: string; color: string; bgColor: string }> = {
      'nuevo': { icon: Sparkles, label: 'Miembro Nuevo', color: 'text-blue-600', bgColor: 'bg-blue-100' },
      'activo': { icon: Zap, label: 'Miembro Activo', color: 'text-green-600', bgColor: 'bg-green-100' },
      'veterano': { icon: Star, label: 'Veterano', color: 'text-purple-600', bgColor: 'bg-purple-100' },
      'leyenda': { icon: Crown, label: 'Leyenda Local', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    }
    return levels[level] || levels['nuevo']
  }

  const getBadgeInfo = (badge: string) => {
    const badges: Record<string, { icon: any; label: string; color: string }> = {
      'verified': { icon: Award, label: 'Verificado', color: 'text-blue-500' },
      'founder': { icon: Crown, label: 'Miembro Fundador', color: 'text-purple-500' },
      'top_contributor': { icon: Trophy, label: 'Top Contribuidor', color: 'text-yellow-500' },
      'helpful': { icon: Heart, label: 'Usuario Servicial', color: 'text-pink-500' },
    }
    return badges[badge] || { icon: Star, label: badge, color: 'text-gray-500' }
  }

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cargando perfil</DialogTitle>
            <DialogDescription>Por favor espera mientras cargamos la información del usuario</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!userData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>No se pudo encontrar la información del usuario</DialogDescription>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-gray-600">Usuario no encontrado</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50">
        <DialogHeader>
          <DialogTitle className="flex flex-col sm:flex-row items-center gap-4">
            <Avatar className="w-24 h-24 border-4 border-white shadow-xl ring-4 ring-pink-200">
              <AvatarImage src={userData.profilePhoto} />
              <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white">
                <User className="w-12 h-12" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                {userData.name}
                {userData.badges && userData.badges.includes('verified') && (
                  <Award className="w-5 h-5 text-blue-500" />
                )}
              </h2>
              {userData.organization && (
                <p className="text-sm text-gray-600 mb-2">{userData.organization}</p>
              )}
              {userData.userLevel && (
                <Badge className={`${getUserLevelInfo(userData.userLevel).bgColor} ${getUserLevelInfo(userData.userLevel).color} border-0`}>
                  {(() => {
                    const LevelIcon = getUserLevelInfo(userData.userLevel).icon
                    return <LevelIcon className="w-3 h-3 mr-1" />
                  })()}
                  {getUserLevelInfo(userData.userLevel).label}
                </Badge>
              )}
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Perfil de usuario de {userData.name}, con {userData.followersCount} seguidores y {userData.followingCount} siguiendo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Bio Section */}
          {userData.bio && (
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border-2 border-purple-200">
              <p className="text-sm text-gray-700 text-center sm:text-left">{userData.bio}</p>
            </div>
          )}

          {/* Location and Interests */}
          {(userData.location || userData.interests) && (
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
              {userData.location && (
                <div className="flex items-center gap-1 bg-pink-100 px-3 py-1 rounded-full">
                  <MapPin className="w-3 h-3 text-pink-600" />
                  <span className="text-xs text-pink-700">{userData.location}</span>
                </div>
              )}
              {userData.interests && userData.interests.split(',').map((interest, idx) => (
                <div key={idx} className="flex items-center gap-1 bg-purple-100 px-3 py-1 rounded-full">
                  <Heart className="w-3 h-3 text-purple-600" />
                  <span className="text-xs text-purple-700">{interest.trim()}</span>
                </div>
              ))}
            </div>
          )}

          {/* Badges */}
          {userData.badges && userData.badges.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              {userData.badges.map((badge, idx) => {
                const BadgeIcon = getBadgeInfo(badge).icon
                return (
                  <div key={idx} className="flex items-center gap-1 bg-gradient-to-r from-yellow-100 to-orange-100 px-3 py-1 rounded-full border-2 border-yellow-300">
                    <BadgeIcon className={`w-3 h-3 ${getBadgeInfo(badge).color}`} />
                    <span className="text-xs">{getBadgeInfo(badge).label}</span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-lg p-4 text-center border-2 border-pink-300 shadow-md">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users className="w-4 h-4 text-pink-600" />
                <span className="text-lg text-pink-700">{userData.followersCount}</span>
              </div>
              <p className="text-xs text-pink-600">Seguidores</p>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg p-4 text-center border-2 border-purple-300 shadow-md">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users className="w-4 h-4 text-purple-600" />
                <span className="text-lg text-purple-700">{userData.followingCount}</span>
              </div>
              <p className="text-xs text-purple-600">Siguiendo</p>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-4 text-center border-2 border-blue-300 shadow-md">
              <div className="flex items-center justify-center gap-1 mb-1">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span className="text-lg text-blue-700">{userPosts.length}</span>
              </div>
              <p className="text-xs text-blue-600">Posts</p>
            </div>
            <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg p-4 text-center border-2 border-orange-300 shadow-md">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Flame className="w-4 h-4 text-orange-600" />
                <span className="text-lg text-orange-700">{userData.totalReactions || 0}</span>
              </div>
              <p className="text-xs text-orange-600">Reacciones</p>
            </div>
          </div>

          {/* Active Streak */}
          {userData.activeStreak && userData.activeStreak > 0 && (
            <div className="bg-gradient-to-r from-yellow-100 via-orange-100 to-pink-100 rounded-lg p-4 border-2 border-yellow-300 shadow-md">
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-5 h-5 text-orange-500" />
                <span className="text-lg">🔥</span>
                <p className="text-sm">
                  <span className="text-orange-700">{userData.activeStreak} días</span>
                  <span className="text-gray-600"> de actividad consecutiva</span>
                </p>
              </div>
            </div>
          )}

          {/* Follow Button */}
          {currentUserToken && (
            <Button
              onClick={handleFollowToggle}
              disabled={isFollowLoading}
              className={
                isFollowing
                  ? 'w-full bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-lg'
              }
            >
              {isFollowing ? (
                <>
                  <UserMinus className="w-4 h-4 mr-2" />
                  Dejar de seguir
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Seguir
                </>
              )}
            </Button>
          )}

          {/* User Posts */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full grid grid-cols-5">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="news">Noticias</TabsTrigger>
              <TabsTrigger value="alert">Alertas</TabsTrigger>
              <TabsTrigger value="classified">Clasificados</TabsTrigger>
              <TabsTrigger value="forum">Foros</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3">
              {userPosts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Este usuario aún no ha publicado nada
                </div>
              ) : (
                userPosts.map((post) => (
                  <Card 
                    key={post.id} 
                    className="hover:shadow-xl hover:border-pink-300 transition-all duration-200 cursor-pointer"
                    onClick={() => handlePostClick(post)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        {getPostIcon(post.type)}
                        <Badge variant="secondary">{getPostTypeName(post.type)}</Badge>
                        {post.category && (
                          <Badge variant="outline">{post.category}</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h4 className="mb-2 hover:text-pink-600 transition-colors">{getPostTitle(post)}</h4>
                      <p className="text-xs text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString('es-GT', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-xs text-pink-600 mt-2 flex items-center gap-1">
                        👉 Click para ver completa
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {['news', 'alert', 'classified', 'forum'].map((type) => (
              <TabsContent key={type} value={type} className="space-y-3">
                {userPosts.filter(p => p.type === type).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Sin publicaciones de este tipo
                  </div>
                ) : (
                  userPosts
                    .filter(p => p.type === type)
                    .map((post) => (
                      <Card 
                        key={post.id} 
                        className="hover:shadow-xl hover:border-pink-300 transition-all duration-200 cursor-pointer"
                        onClick={() => handlePostClick(post)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2">
                            {post.category && (
                              <Badge variant="outline">{post.category}</Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <h4 className="mb-2 hover:text-pink-600 transition-colors">{getPostTitle(post)}</h4>
                          <p className="text-xs text-gray-500">
                            {new Date(post.createdAt).toLocaleDateString('es-GT', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <p className="text-xs text-pink-600 mt-2 flex items-center gap-1">
                            👉 Click para ver completa
                          </p>
                        </CardContent>
                      </Card>
                    ))
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
