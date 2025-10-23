import { useState } from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Search, Shield, User, Users, X, Ban, UserX, Trash2 } from 'lucide-react'
import { UserAvatar } from './UserAvatar'
import { toast } from 'sonner'
import { projectId } from '../utils/supabase/info'
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from './ui/alert-dialog'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface UserManagementProps {
  users: any[]
  currentUserProfile: any
  token: string
  onUserUpdated: () => void
}

export function UserManagement({ users, currentUserProfile, token, onUserUpdated }: UserManagementProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'users' | 'moderators' | 'firefighters'>('all')
  
  // Moderation dialogs
  const [vetDialog, setVetDialog] = useState<{ open: boolean, user: any | null }>({ open: false, user: null })
  const [blockDialog, setBlockDialog] = useState<{ open: boolean, user: any | null }>({ open: false, user: null })
  const [banDialog, setBanDialog] = useState<{ open: boolean, user: any | null }>({ open: false, user: null })
  const [vetReason, setVetReason] = useState('')
  const [blockReason, setBlockReason] = useState('')
  const [banReason, setBanReason] = useState('')
  const [vetDuration, setVetDuration] = useState('7')

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
  
  const vetUser = async (user: any) => {
    if (!vetReason.trim()) {
      toast.error('Debes proporcionar una razón para el vetado')
      return
    }
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/users/${user.id}/vet`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            reason: vetReason, 
            duration: parseInt(vetDuration),
            type: 'temporary'
          })
        }
      )

      if (response.ok) {
        toast.success(`🚨 ${user.name} vetado por ${vetDuration} días`)
        setVetDialog({ open: false, user: null })
        setVetReason('')
        setVetDuration('7')
        onUserUpdated()
      } else {
        toast.error('Error al vetar usuario')
      }
    } catch (error) {
      console.error('Error vetting user:', error)
      toast.error('Error al vetar usuario')
    }
  }
  
  const blockUser = async (user: any) => {
    if (!blockReason.trim()) {
      toast.error('Debes proporcionar una razón para el bloqueo')
      return
    }
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/users/${user.id}/block`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ reason: blockReason, type: 'block' })
        }
      )

      if (response.ok) {
        toast.success(`🚫 ${user.name} bloqueado exitosamente`)
        setBlockDialog({ open: false, user: null })
        setBlockReason('')
        onUserUpdated()
      } else {
        toast.error('Error al bloquear usuario')
      }
    } catch (error) {
      console.error('Error blocking user:', error)
      toast.error('Error al bloquear usuario')
    }
  }
  
  const banUser = async (user: any) => {
    if (!banReason.trim()) {
      toast.error('Debes proporcionar una razón para el baneo')
      return
    }
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/users/${user.id}/ban`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ reason: banReason, type: 'permanent' })
        }
      )

      if (response.ok) {
        toast.success(`🗑️ ${user.name} baneado permanentemente`)
        setBanDialog({ open: false, user: null })
        setBanReason('')
        onUserUpdated()
      } else {
        toast.error('Error al banear usuario')
      }
    } catch (error) {
      console.error('Error banning user:', error)
      toast.error('Error al banear usuario')
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
        return <Badge className="bg-purple-600 text-white text-[8px] px-1 py-0">👑 Admin</Badge>
      case 'moderator':
        return <Badge className="bg-blue-600 text-white text-[8px] px-1 py-0">🛡️ Mod</Badge>
      case 'firefighter':
        return <Badge className="bg-red-600 text-white text-[8px] px-1 py-0">🚒 Bomb</Badge>
      case 'verified':
        return <Badge className="bg-green-600 text-white text-[8px] px-1 py-0">✓ Ver</Badge>
      default:
        return <Badge variant="outline" className="text-[8px] px-1 py-0">User</Badge>
    }
  }

  return (
    <>
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
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className="text-xs px-2 py-1 h-8"
          >
            <Users className="w-3 h-3 sm:mr-1" />
            <span className="hidden sm:inline">Todos</span>
            <span className="sm:hidden">All</span>
            <span className="ml-1">({users.length})</span>
          </Button>
          <Button
            size="sm"
            variant={filter === 'moderators' ? 'default' : 'outline'}
            onClick={() => setFilter('moderators')}
            className="text-xs px-2 py-1 h-8"
          >
            <Shield className="w-3 h-3 sm:mr-1" />
            <span className="hidden sm:inline">Mods</span>
            <span className="sm:hidden">Mod</span>
            <span className="ml-1">({users.filter(u => u.role === 'moderator').length})</span>
          </Button>
          <Button
            size="sm"
            variant={filter === 'firefighters' ? 'default' : 'outline'}
            onClick={() => setFilter('firefighters')}
            className="text-xs px-2 py-1 h-8"
          >
            <span className="text-xs">🚒</span>
            <span className="hidden sm:inline ml-1">Bomberos</span>
            <span className="sm:hidden ml-1">Bomb</span>
            <span className="ml-1">({users.filter(u => u.role === 'firefighter').length})</span>
          </Button>
          <Button
            size="sm"
            variant={filter === 'users' ? 'default' : 'outline'}
            onClick={() => setFilter('users')}
            className="text-xs px-2 py-1 h-8"
          >
            <User className="w-3 h-3 sm:mr-1" />
            <span className="hidden sm:inline">Usuarios</span>
            <span className="sm:hidden">User</span>
          </Button>
        </div>
      </div>

      {/* User List */}
      <div className="relative h-[50vh] sm:h-[60vh] border rounded-md bg-white">
        <div className="absolute inset-0 overflow-y-scroll overflow-x-hidden p-2">
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
                  className={`${borderColor} ${borderColor ? 'border-l-4' : ''} ${user.banned ? 'opacity-50 bg-red-50' : ''} mx-1`}
                >
                  <CardContent className="py-2 px-3">
                    <div className="flex items-start justify-between gap-2 sm:items-center">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <UserAvatar
                          userId={user.id}
                          userName={user.name}
                          profilePhoto={user.profile_photo}
                          size="md"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1 mb-1">
                            <p className="text-sm truncate font-medium">{user.name}</p>
                            {isCurrentUser && <Badge variant="secondary" className="text-[8px] px-1 py-0">Tú</Badge>}
                          </div>
                          <p className="text-xs text-gray-600 truncate mb-1">{user.phone || user.email}</p>
                          <div className="flex items-center gap-1 flex-wrap">
                            {getRoleBadge(user.role)}
                            {user.banned && (
                              <Badge variant="destructive" className="text-[8px] px-1 py-0">
                                🚫 Baneado
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      {!isCurrentUser && (
                        <div className="flex flex-col gap-1 min-w-0 flex-shrink-0">
                          {!user.banned && (
                            <>
                              {/* Role Management - First Row */}
                              <div className="flex gap-1">
                                {user.role !== 'moderator' && (
                                  <Button
                                    size="sm"
                                    onClick={() => changeUserRole(user.id, 'moderator')}
                                    className="h-5 text-[9px] px-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    <Shield className="w-2.5 h-2.5" />
                                  </Button>
                                )}
                                {user.role === 'moderator' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => changeUserRole(user.id, 'user')}
                                    className="h-5 text-[9px] px-1.5"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </Button>
                                )}
                                {user.role !== 'firefighter' && user.role !== 'moderator' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => changeUserRole(user.id, 'firefighter')}
                                    className="h-5 text-[8px] px-1.5"
                                  >
                                    🚒
                                  </Button>
                                )}
                              </div>
                              
                              {/* Moderation Actions - Second Row */}
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  onClick={() => setVetDialog({ open: true, user })}
                                  className="h-5 text-[9px] px-1.5 bg-yellow-600 hover:bg-yellow-700 text-white"
                                  title="Vetar usuario"
                                >
                                  <Ban className="w-2.5 h-2.5" />
                                </Button>
                                
                                <Button
                                  size="sm"
                                  onClick={() => setBlockDialog({ open: true, user })}
                                  className="h-5 text-[9px] px-1.5 bg-orange-600 hover:bg-orange-700 text-white"
                                  title="Bloquear usuario"
                                >
                                  <UserX className="w-2.5 h-2.5" />
                                </Button>
                                
                                {currentUserProfile.role === 'admin' && (
                                  <Button
                                    size="sm"
                                    onClick={() => setBanDialog({ open: true, user })}
                                    className="h-5 text-[9px] px-1.5 bg-red-600 hover:bg-red-700 text-white"
                                    title="Banear usuario"
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                  </Button>
                                )}
                              </div>
                            </>
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
        </div>
      </div>
      
      {/* Moderation Dialogs */}
      {/* Vet User Dialog */}
      <AlertDialog open={vetDialog.open} onOpenChange={(open: boolean) => {
        setVetDialog({ open, user: null })
        if (!open) {
          setVetReason('')
          setVetDuration('7')
        }
      }}>
        <AlertDialogContent className="w-[95vw] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Ban className="w-5 h-5 text-yellow-600" />
              ¿Vetar usuario temporalmente?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>Esta acción vetará a <strong>{vetDialog.user?.name}</strong> por un período específico.</p>
              <p className="text-yellow-600">
                ⚠️ El usuario no podrá publicar contenido durante el tiempo seleccionado.
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-700 block mb-2">
                    Duración del vetado:
                  </label>
                  <Select value={vetDuration} onValueChange={setVetDuration}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar duración" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 día</SelectItem>
                      <SelectItem value="3">3 días</SelectItem>
                      <SelectItem value="7">7 días (1 semana)</SelectItem>
                      <SelectItem value="14">14 días (2 semanas)</SelectItem>
                      <SelectItem value="30">30 días (1 mes)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm text-gray-700 block mb-2">
                    Razón del vetado (obligatorio):
                  </label>
                  <Textarea
                    value={vetReason}
                    onChange={(e) => setVetReason(e.target.value)}
                    placeholder="Ej: Contenido inapropiado, incumplimiento de normas, etc."
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (vetDialog.user) {
                  vetUser(vetDialog.user)
                }
              }}
              disabled={!vetReason.trim()}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Sí, vetar por {vetDuration} días
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Block User Dialog */}
      <AlertDialog open={blockDialog.open} onOpenChange={(open: boolean) => {
        setBlockDialog({ open, user: null })
        if (!open) setBlockReason('')
      }}>
        <AlertDialogContent className="w-[95vw] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <UserX className="w-5 h-5 text-orange-600" />
              ¿Bloquear usuario?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>Esta acción bloqueará a <strong>{blockDialog.user?.name}</strong> indefinidamente.</p>
              <p className="text-orange-600">
                ⚠️ El usuario no podrá acceder hasta ser desbloqueado por un administrador.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900">
                  <strong>📝 Diferencias:</strong><br/>
                  • <strong>Vetar:</strong> Suspensión temporal (1-30 días)<br/>
                  • <strong>Bloquear:</strong> Suspensión indefinida<br/>
                  • <strong>Banear:</strong> Eliminación permanente (solo admin)
                </p>
              </div>
              <div className="mt-3">
                <label className="text-sm text-gray-700 block mb-2">
                  Razón del bloqueo (obligatorio):
                </label>
                <Textarea
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Ej: Violación grave de normas, comportamiento tóxico repetido, etc."
                  className="min-h-[80px]"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (blockDialog.user) {
                  blockUser(blockDialog.user)
                }
              }}
              disabled={!blockReason.trim()}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Sí, bloquear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Ban User Dialog */}
      <AlertDialog open={banDialog.open} onOpenChange={(open: boolean) => {
        setBanDialog({ open, user: null })
        if (!open) setBanReason('')
      }}>
        <AlertDialogContent className="w-[95vw] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              ¿Banear usuario permanentemente?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>Esta acción baneará a <strong>{banDialog.user?.name}</strong> de forma <strong>permanente</strong>.</p>
              <p className="text-red-600">
                ⚠️ Esta es la acción más severa. El usuario será eliminado del sistema.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-900">
                  <strong>🚨 ATENCIÓN:</strong> Esta acción es irreversible y solo está disponible para administradores.
                </p>
              </div>
              <div className="mt-3">
                <label className="text-sm text-gray-700 block mb-2">
                  Razón del baneo (obligatorio):
                </label>
                <Textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Ej: Violación extrema de términos, contenido ilegal, etc."
                  className="min-h-[80px]"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (banDialog.user) {
                  banUser(banDialog.user)
                }
              }}
              disabled={!banReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              Sí, banear permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </>
  )
}
