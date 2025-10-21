import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from './ui/card'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { 
  User, Users, MessageSquare, Flame, MapPin, Heart, 
  Trophy, Zap, Star, Award, Crown, Sparkles, Settings, 
  TrendingUp, Calendar
} from 'lucide-react'
import { projectId } from '../utils/supabase/info'

interface MyProfileViewProps {
  token: string
  userProfile: any
  onOpenSettings: () => void
}

export function MyProfileView({ token, userProfile, onOpenSettings }: MyProfileViewProps) {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (userProfile?.id) {
      loadProfileStats()
    }
  }, [userProfile])

  const loadProfileStats = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/users/${userProfile.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error loading profile stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getUserLevelInfo = (level: string) => {
    const levels: Record<string, { icon: any; label: string; color: string; bgColor: string; gradient: string }> = {
      'nuevo': { 
        icon: Sparkles, 
        label: 'Miembro Nuevo', 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-100',
        gradient: 'from-blue-400 to-cyan-500'
      },
      'activo': { 
        icon: Zap, 
        label: 'Miembro Activo', 
        color: 'text-green-600', 
        bgColor: 'bg-green-100',
        gradient: 'from-green-400 to-emerald-500'
      },
      'veterano': { 
        icon: Star, 
        label: 'Veterano', 
        color: 'text-purple-600', 
        bgColor: 'bg-purple-100',
        gradient: 'from-purple-400 to-pink-500'
      },
      'leyenda': { 
        icon: Crown, 
        label: 'Leyenda Local', 
        color: 'text-yellow-600', 
        bgColor: 'bg-yellow-100',
        gradient: 'from-yellow-400 to-orange-500'
      },
    }
    return levels[level] || levels['nuevo']
  }

  const getBadgeInfo = (badge: string) => {
    const badges: Record<string, { icon: any; label: string; color: string; bgGradient: string }> = {
      'verified': { 
        icon: Award, 
        label: 'Verificado', 
        color: 'text-blue-500',
        bgGradient: 'from-blue-100 to-blue-200'
      },
      'founder': { 
        icon: Crown, 
        label: 'Miembro Fundador', 
        color: 'text-purple-500',
        bgGradient: 'from-purple-100 to-purple-200'
      },
      'top_contributor': { 
        icon: Trophy, 
        label: 'Top Contribuidor', 
        color: 'text-yellow-500',
        bgGradient: 'from-yellow-100 to-yellow-200'
      },
      'helpful': { 
        icon: Heart, 
        label: 'Usuario Servicial', 
        color: 'text-pink-500',
        bgGradient: 'from-pink-100 to-pink-200'
      },
    }
    return badges[badge] || { icon: Star, label: badge, color: 'text-gray-500', bgGradient: 'from-gray-100 to-gray-200' }
  }

  if (isLoading) {
    return (
      <Card className="bg-white/60 backdrop-blur-sm border-2 border-purple-200 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const levelInfo = getUserLevelInfo(stats?.userLevel || 'nuevo')
  const LevelIcon = levelInfo.icon

  return (
    <div className="space-y-4">
      {/* Profile Header Card */}
      <Card className="bg-white/60 backdrop-blur-sm border-2 border-purple-200 shadow-lg overflow-hidden">
        <div className={`h-32 bg-gradient-to-r ${levelInfo.gradient}`} />
        <CardContent className="relative px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16">
            <Avatar className="w-32 h-32 border-4 border-white shadow-xl ring-4 ring-pink-200">
              <AvatarImage src={userProfile.profilePhoto} />
              <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white">
                <User className="w-16 h-16" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center sm:text-left mt-2">
              <h2 className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                {userProfile.name}
                {stats?.badges?.includes('verified') && (
                  <Award className="w-5 h-5 text-blue-500" />
                )}
              </h2>
              {userProfile.organization && (
                <p className="text-sm text-gray-600 mb-2">{userProfile.organization}</p>
              )}
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <Badge className={`${levelInfo.bgColor} ${levelInfo.color} border-0`}>
                  <LevelIcon className="w-3 h-3 mr-1" />
                  {levelInfo.label}
                </Badge>
                {userProfile.role === 'admin' && (
                  <Badge className="bg-gradient-to-r from-red-500 to-pink-600 text-white border-0">
                    👑 Administrador
                  </Badge>
                )}
              </div>
            </div>

            <Button
              onClick={onOpenSettings}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-md sm:mb-2"
            >
              <Settings className="w-4 h-4 mr-2" />
              Editar Perfil
            </Button>
          </div>

          {/* Bio */}
          {userProfile.bio && (
            <div className="mt-4 bg-gradient-to-br from-yellow-50 to-pink-50 rounded-lg p-4 border-2 border-pink-200">
              <p className="text-sm text-gray-700 text-center sm:text-left">{userProfile.bio}</p>
            </div>
          )}

          {/* Location and Interests */}
          {(userProfile.location || userProfile.interests) && (
            <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
              {userProfile.location && (
                <div className="flex items-center gap-1 bg-pink-100 px-3 py-1.5 rounded-full border border-pink-300">
                  <MapPin className="w-3 h-3 text-pink-600" />
                  <span className="text-xs text-pink-700">{userProfile.location}</span>
                </div>
              )}
              {userProfile.interests && userProfile.interests.split(',').slice(0, 3).map((interest: string, idx: number) => (
                <div key={idx} className="flex items-center gap-1 bg-purple-100 px-3 py-1.5 rounded-full border border-purple-300">
                  <Heart className="w-3 h-3 text-purple-600" />
                  <span className="text-xs text-purple-700">{interest.trim()}</span>
                </div>
              ))}
              {userProfile.interests && userProfile.interests.split(',').length > 3 && (
                <div className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-300">
                  <span className="text-xs text-gray-600">+{userProfile.interests.split(',').length - 3} más</span>
                </div>
              )}
            </div>
          )}

          {/* Member Since */}
          <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Miembro desde {new Date(userProfile.createdAt).toLocaleDateString('es-GT', { month: 'long', year: 'numeric' })}</span>
          </div>
        </CardContent>
      </Card>

      {/* Achievements Section */}
      {stats?.badges && stats.badges.length > 0 && (
        <Card className="bg-white/60 backdrop-blur-sm border-2 border-yellow-300 shadow-lg">
          <CardHeader>
            <h3 className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              Mis Insignias
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stats.badges.map((badge: string, idx: number) => {
                const badgeInfo = getBadgeInfo(badge)
                const BadgeIcon = badgeInfo.icon
                return (
                  <div key={idx} className={`bg-gradient-to-br ${badgeInfo.bgGradient} rounded-lg p-4 text-center border-2 border-yellow-300 shadow-md transform hover:scale-105 transition-transform`}>
                    <BadgeIcon className={`w-8 h-8 ${badgeInfo.color} mx-auto mb-2`} />
                    <p className="text-xs">{badgeInfo.label}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-pink-100 to-pink-200 border-2 border-pink-300 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="w-5 h-5 text-pink-600" />
              <span className="text-2xl text-pink-700">{stats?.followersCount || 0}</span>
            </div>
            <p className="text-xs text-pink-600">Seguidores</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-100 to-purple-200 border-2 border-purple-300 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="w-5 h-5 text-purple-600" />
              <span className="text-2xl text-purple-700">{stats?.followingCount || 0}</span>
            </div>
            <p className="text-xs text-purple-600">Siguiendo</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-blue-300 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <span className="text-2xl text-blue-700">{stats?.postsCount || 0}</span>
            </div>
            <p className="text-xs text-blue-600">Posts</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-100 to-orange-200 border-2 border-orange-300 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className="w-5 h-5 text-orange-600" />
              <span className="text-2xl text-orange-700">{stats?.totalReactions || 0}</span>
            </div>
            <p className="text-xs text-orange-600">Reacciones</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Streak */}
      {stats?.activeStreak && stats.activeStreak > 0 && (
        <Card className="bg-gradient-to-r from-yellow-100 via-orange-100 to-pink-100 border-2 border-yellow-300 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-3">
              <Zap className="w-6 h-6 text-orange-500" />
              <span className="text-2xl">🔥</span>
              <div className="text-center">
                <p className="text-2xl text-orange-700">{stats.activeStreak}</p>
                <p className="text-sm text-gray-600">días en la comunidad</p>
              </div>
              <TrendingUp className="w-6 h-6 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Motivational Message */}
      <Card className="bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 border-2 border-purple-300 shadow-lg">
        <CardContent className="p-4">
          <p className="text-sm text-center text-gray-700 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span>
              {stats?.userLevel === 'leyenda' && '¡Eres una leyenda de Informa! 👑'}
              {stats?.userLevel === 'veterano' && '¡Sigue así! Eres un miembro veterano de la comunidad 🌟'}
              {stats?.userLevel === 'activo' && '¡Excelente participación! La comunidad te agradece ⚡'}
              {stats?.userLevel === 'nuevo' && '¡Bienvenido a Informa! Comparte y conecta con tu comunidad 🎉'}
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
