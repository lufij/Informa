import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { User } from 'lucide-react'

interface UserAvatarProps {
  userId: string
  userName: string
  profilePhoto?: string
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
}

export function UserAvatar({ userId, userName, profilePhoto, onClick, size = 'md' }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  return (
    <Avatar
      className={`${sizeClasses[size]} border-2 border-white shadow-md ${onClick ? 'cursor-pointer hover:ring-2 hover:ring-pink-400 transition-all' : ''}`}
      onClick={onClick}
    >
      <AvatarImage src={profilePhoto} alt={userName} />
      <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white">
        <User className={iconSizes[size]} />
      </AvatarFallback>
    </Avatar>
  )
}
