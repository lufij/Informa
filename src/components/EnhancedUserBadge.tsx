import { UserAvatar } from './UserAvatar'
import { Badge } from './ui/badge'
import { MapPin, Calendar, TrendingUp, MessageCircle, Shield, Flame } from 'lucide-react'
import { useState, useEffect } from 'react'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface EnhancedUserBadgeProps {
  userId: string
  userName: string
  userPhoto?: string
  userRole?: string
  createdAt: string
  onUserClick?: () => void
  showStats?: boolean
}

export function EnhancedUserBadge({ 
  userId, 
  userName, 
  userPhoto, 
  userRole,
  createdAt,
  onUserClick,
  showStats = true
}: EnhancedUserBadgeProps) {
  const [userStats, setUserStats] = useState<{
    totalPosts: number
    totalReactions: number
    totalComments: number
    bio?: string
    location?: string
    memberSince?: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (showStats) {
      fetchUserStats()
    } else {
      setIsLoading(false)
    }
  }, [userId, showStats])

  const fetchUserStats = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/users/${userId}/stats`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      )
      if (response.ok) {
        const data = await response.json()
        setUserStats(data)
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getUserLevel = (totalPosts: number) => {
    if (totalPosts >= 100) return { name: 'Leyenda', emoji: '💎', color: 'text-purple-600' }
    if (totalPosts >= 50) return { name: 'Veterano', emoji: '🥇', color: 'text-yellow-600' }
    if (totalPosts >= 10) return { name: 'Activo', emoji: '🥈', color: 'text-gray-600' }
    return { name: 'Novato', emoji: '🥉', color: 'text-orange-600' }
  }

  const getRoleBadge = () => {
    if (userRole === 'admin') {
      return (
        <Badge className="bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs px-2 py-0.5">
          <Shield className="w-3 h-3 mr-1" />
          ADMIN
        </Badge>
      )
    }
    if (userRole === 'moderator') {
      return (
        <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-xs px-2 py-0.5">
          <Shield className="w-3 h-3 mr-1" />
          MODERADOR
        </Badge>
      )
    }
    if (userRole === 'firefighter') {
      return (
        <Badge className="bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs px-2 py-0.5">
          <Flame className="w-3 h-3 mr-1" />
          BOMBERO
        </Badge>
      )
    }
    return null
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Hace un momento'
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)}m`
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)}h`
    if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)}d`
    
    return date.toLocaleDateString('es-GT', {
      day: 'numeric',
      month: 'short'
    })
  }

  const level = userStats ? getUserLevel(userStats.totalPosts) : null
  const roleBadge = getRoleBadge()

  return (
    <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 rounded-xl p-4 border-2 border-pink-200/50 shadow-sm">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <UserAvatar
            userId={userId}
            userName={userName}
            profilePhoto={userPhoto}
            size="md"
            onClick={onUserClick}
            className="ring-2 ring-pink-300 ring-offset-2"
          />
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          {/* Name and Badges Row */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span 
              className="font-semibold text-gray-900 cursor-pointer hover:text-pink-600 transition-colors"
              onClick={onUserClick}
            >
              {userName}
            </span>
            
            {/* Verificado badge for admins/mods */}
            {(userRole === 'admin' || userRole === 'moderator') && (
              <span className="text-blue-500" title="Verificado">✓</span>
            )}
          </div>

          {/* Role Badge */}
          {roleBadge && (
            <div className="mb-2">
              {roleBadge}
            </div>
          )}

          {/* Level Badge */}
          {!isLoading && level && userStats && userStats.totalPosts > 0 && (
            <div className="mb-2">
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-0.5">
                {level.emoji} {level.name}
              </Badge>
            </div>
          )}

          {/* Bio if available */}
          {userStats?.bio && (
            <p className="text-sm text-gray-600 italic mb-2 line-clamp-2">
              "{userStats.bio}"
            </p>
          )}

          {/* Stats Row */}
          {!isLoading && userStats && showStats && (
            <div className="flex items-center gap-3 text-xs text-gray-600 mb-2 flex-wrap">
              {/* Location */}
              {userStats.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-pink-500" />
                  <span>{userStats.location}</span>
                </div>
              )}

              {/* Total Posts */}
              {userStats.totalPosts > 0 && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-purple-500" />
                  <span>{userStats.totalPosts} posts</span>
                </div>
              )}

              {/* Total Reactions */}
              {userStats.totalReactions > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-sm">🔥</span>
                  <span>{userStats.totalReactions}</span>
                </div>
              )}
            </div>
          )}

          {/* Time and Member Since */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              ⏰ {formatTimeAgo(createdAt)}
            </span>
            {userStats?.memberSince && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Desde {new Date(userStats.memberSince).toLocaleDateString('es-GT', { month: 'short', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
