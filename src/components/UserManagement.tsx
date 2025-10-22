import { useState } from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { ScrollArea } from './ui/scroll-area'
import { Search, Shield, User, Users, X } from 'lucide-react'
import { UserAvatar } from './UserAvatar'
import { toast } from 'sonner'
import { projectId } from '../utils/supabase/info'

interface UserManagementProps {
  users: any[]
  currentUserProfile: any
  token: string
  onUserUpdated: () => void
}

export function UserManagement({ users, currentUserProfile, token, onUserUpdated }: UserManagementProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'users' | 'moderators' | 'firefighters'>('all')

  const changeUserRole = async (userId: string, newRole: string) => {
    const user = users.find(u => u.id === userId)
    
    if (!user) return
    
    // Prevent changing own role
    if (userId === currentUserProfile.id) {
      toast.error('No puedes cambiar tu propio rol')
      return
    }
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/admin/users/${userId}/role`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ role: newRole })
        }
      )

      if (response.ok) {
        const roleLabels: Record<string, string> = {
          user: 'usuario normal',
          moderator: 'moderador',
          firefighter: 'bombero voluntario',
          verified: 'usuario verificado'
        }
        toast.success(`✅ ${user.name} es ahora ${roleLabels[newRole]}`)
        onUserUpdated()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al cambiar rol')
      }
    } catch (error) {
      console.error('Error changing role:', error)
      toast.error('Error al cambiar rol')
    }
  }

  // Filter logic
  let filteredUsers = users
  
  // Apply search filter
  if (searchQuery) {
    filteredUsers = filteredUsers.filter(u => 
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone?.includes(searchQuery) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }
  
  // Apply role filter
  if (filter === 'moderators') {
    filteredUsers = filteredUsers.filter(u => u.role === 'moderator')
  } else if (filter === 'firefighters') {
    filteredUsers = filteredUsers.filter(u => u.role === 'firefighter')
  } else if (filter === 'users') {
    filteredUsers = filteredUsers.filter(u => 
      u.role !== 'admin' && u.role !== 'moderator' && u.role !== 'firefighter'
    )
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-600 text-white">👑 Admin</Badge>
      case 'moderator':
        return <Badge className="bg-blue-600 text-white">🛡️ Moderador</Badge>
      case 'firefighter':
        return <Badge className="bg-red-600 text-white">🚒 Bombero</Badge>
      case 'verified':
        return <Badge className="bg-green-600 text-white">✓ Verificado</Badge>
      default:
        return <Badge variant="outline">Usuario</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por nombre o teléfono..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className="text-xs"
          >
            <Users className="w-3 h-3 mr-1" />
            Todos ({users.length})
          </Button>
          <Button
            size="sm"
            variant={filter === 'moderators' ? 'default' : 'outline'}
            onClick={() => setFilter('moderators')}
            className="text-xs"
          >
            <Shield className="w-3 h-3 mr-1" />
            Mods ({users.filter(u => u.role === 'moderator').length})
          </Button>
          <Button
            size="sm"
            variant={filter === 'firefighters' ? 'default' : 'outline'}
            onClick={() => setFilter('firefighters')}
            className="text-xs"
          >
            🚒 Bomberos ({users.filter(u => u.role === 'firefighter').length})
          </Button>
          <Button
            size="sm"
            variant={filter === 'users' ? 'default' : 'outline'}
            onClick={() => setFilter('users')}
            className="text-xs"
          >
            <User className="w-3 h-3 mr-1" />
            Usuarios
          </Button>
        </div>
      </div>

      {/* User List */}
      <ScrollArea className="h-[500px] pr-4">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <Search className="w-12 h-12 text-gray-300 mb-2" />
            <p className="text-gray-500">No se encontraron usuarios</p>
            <p className="text-xs text-gray-400">Intenta con otra búsqueda</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredUsers.map(user => {
              const isCurrentUser = user.id === currentUserProfile.id
              const borderColor = user.role === 'admin' ? 'border-l-purple-600' 
                : user.role === 'moderator' ? 'border-l-blue-600'
                : user.role === 'firefighter' ? 'border-l-red-600'
                : ''
              
              return (
                <Card 
                  key={user.id} 
                  className={`${borderColor} ${borderColor ? 'border-l-4' : ''} ${user.banned ? 'opacity-50 bg-red-50' : ''}`}
                >
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <UserAvatar
                          userId={user.id}
                          userName={user.name}
                          profilePhoto={user.profile_photo}
                          size="md"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm truncate">{user.name}</p>
                            {isCurrentUser && <Badge variant="secondary" className="text-[10px]">Tú</Badge>}
                          </div>
                          <p className="text-xs text-gray-600 truncate">{user.phone || user.email}</p>
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            {getRoleBadge(user.role)}
                            {user.banned && (
                              <Badge variant="destructive" className="text-[10px]">
                                🚫 Baneado
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Role Change Buttons */}
                      {!isCurrentUser && !user.banned && (
                        <div className="flex flex-col gap-1">
                          {user.role !== 'moderator' && (
                            <Button
                              size="sm"
                              onClick={() => changeUserRole(user.id, 'moderator')}
                              className="h-7 text-xs bg-blue-600 hover:bg-blue-700"
                            >
                              <Shield className="w-3 h-3 mr-1" />
                              Moderador
                            </Button>
                          )}
                          {user.role === 'moderator' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => changeUserRole(user.id, 'user')}
                              className="h-7 text-xs"
                            >
                              <X className="w-3 h-3 mr-1" />
                              Remover
                            </Button>
                          )}
                          {user.role !== 'firefighter' && user.role !== 'moderator' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => changeUserRole(user.id, 'firefighter')}
                              className="h-7 text-xs"
                            >
                              🚒 Bombero
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
