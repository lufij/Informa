import { useState } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Search, Ban, Trash2 } from 'lucide-react'
import { UserAvatar } from './UserAvatar'
import { toast } from 'sonner'
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
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean, user: any | null }>({ open: false, user: null })
  const [vetReason, setVetReason] = useState('')
  const [deleteReason, setDeleteReason] = useState('')

  const changeUserRole = async (userId: string, newRole: string) => {
    const user = users.find(u => u.id === userId)
    
    if (!user) return
    
    // Prevent changing own role
    if (userId === currentUserProfile.id) {
      toast.error('No puedes cambiar tu propio rol')
      return
    }
    
    try {
      const response = await fetch(`https://kvmgaqhlpqdywscdckcf.supabase.co/rest/v1/profiles?id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2bWdhcWhscHFkeXdzY2Rja2NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAzMDMxNTAsImV4cCI6MjA0NTg3OTE1MH0.qVwjUi-lqWj7TQIl9IhJB6vBBpOHnPsHRcBYDJI4P0k',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ role: newRole })
      })

      if (response.ok) {
        toast.success(`Usuario ${newRole === 'moderator' ? 'promovido' : 'despromovido'} exitosamente`)
        onUserUpdated()
      } else {
        throw new Error('Error al cambiar rol')
      }
    } catch (error) {
      toast.error('Error al cambiar el rol del usuario')
    }
  }

  const vetUser = async (user: any) => {
    if (!vetReason.trim()) {
      toast.error('La razón es obligatoria')
      return
    }

    try {
      const response = await fetch(`https://kvmgaqhlpqdywscdckcf.supabase.co/rest/v1/profiles?id=eq.${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2bWdhcWhscHFkeXdzY2Rja2NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAzMDMxNTAsImV4cCI6MjA0NTg3OTE1MH0.qVwjUi-lqWj7TQIl9IhJB6vBBpOHnPsHRcBYDJI4P0k',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ 
          vetted: true,
          vet_reason: vetReason,
          vet_date: new Date().toISOString()
        })
      })

      if (response.ok) {
        toast.success(`${user.name} ha sido vetado`)
        setVetDialog({ open: false, user: null })
        setVetReason('')
        onUserUpdated()
      } else {
        throw new Error('Error al vetar usuario')
      }
    } catch (error) {
      toast.error('Error al vetar el usuario')
    }
  }

  const deleteUser = async (user: any) => {
    if (!deleteReason.trim()) {
      toast.error('La razón es obligatoria')
      return
    }

    try {
      const response = await fetch(`https://kvmgaqhlpqdywscdckcf.supabase.co/rest/v1/profiles?id=eq.${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2bWdhcWhscHFkeXdzY2Rja2NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAzMDMxNTAsImV4cCI6MjA0NTg3OTE1MH0.qVwjUi-lqWj7TQIl9IhJB6vBBpOHnPsHRcBYDJI4P0k',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ 
          banned: true,
          ban_reason: deleteReason,
          ban_date: new Date().toISOString()
        })
      })

      if (response.ok) {
        toast.success(`${user.name} ha sido eliminado`)
        setDeleteDialog({ open: false, user: null })
        setDeleteReason('')
        onUserUpdated()
      } else {
        throw new Error('Error al eliminar usuario')
      }
    } catch (error) {
      toast.error('Error al eliminar el usuario')
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.includes(searchQuery)
    
    const matchesFilter = filter === 'all' || 
      (filter === 'moderators' && user.role === 'moderator') ||
      (filter === 'firefighters' && user.role === 'firefighter') ||
      (filter === 'users' && (!user.role || user.role === 'user'))

    return matchesSearch && matchesFilter
  })

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-100 text-purple-800 text-xs">Admin</Badge>
      case 'moderator':
        return <Badge className="bg-blue-100 text-blue-800 text-xs">Moderador</Badge>
      case 'firefighter':
        return <Badge className="bg-red-100 text-red-800 text-xs">Bombero</Badge>
      default:
        return <Badge variant="secondary" className="text-xs">Usuario</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar usuarios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            Todos ({users.length})
          </Button>
          <Button
            size="sm"
            variant={filter === 'moderators' ? 'default' : 'outline'}
            onClick={() => setFilter('moderators')}
          >
            Mods ({users.filter(u => u.role === 'moderator').length})
          </Button>
          <Button
            size="sm"
            variant={filter === 'users' ? 'default' : 'outline'}
            onClick={() => setFilter('users')}
          >
            Usuarios
          </Button>
        </div>
      </div>

      {/* User List */}
      <div 
        className="border rounded-lg bg-white"
        style={{
          height: '50vh',
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch',
          msOverflowStyle: 'auto',
          scrollbarWidth: 'auto'
        }}
      >
        <div className="p-2">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron usuarios</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map(user => {
                const isCurrentUser = user.id === currentUserProfile.id
              
              return (
                <Card key={user.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        userId={user.id}
                        userName={user.name}
                        profilePhoto={user.profile_photo}
                        size="sm"
                      />
                      <div>
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        <div className="flex gap-1 mt-1">
                          {getRoleBadge(user.role)}
                          {isCurrentUser && <Badge variant="secondary" className="text-xs">Tú</Badge>}
                        </div>
                      </div>
                    </div>
                    
                    {!isCurrentUser && (
                      <div className="flex flex-col gap-1">
                        <div className="flex gap-1">
                          {user.role !== 'moderator' && (
                            <Button
                              size="sm"
                              onClick={() => changeUserRole(user.id, 'moderator')}
                              className="text-xs px-2 py-1 h-6"
                            >
                              Hacer Mod
                            </Button>
                          )}
                          {user.role === 'moderator' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => changeUserRole(user.id, 'user')}
                              className="text-xs px-2 py-1 h-6"
                            >
                              Quitar Mod
                            </Button>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setVetDialog({ open: true, user })}
                            className="text-xs px-2 py-1 h-6 text-yellow-600 border-yellow-600"
                          >
                            <Ban className="w-3 h-3 mr-1" />
                            Vetar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDeleteDialog({ open: true, user })}
                            className="text-xs px-2 py-1 h-6 text-red-600 border-red-600"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Vet User Dialog */}
      <AlertDialog open={vetDialog.open} onOpenChange={(open: boolean) => {
        setVetDialog({ open, user: null })
        if (!open) setVetReason('')
      }}>
        <AlertDialogContent className="w-[95vw] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Ban className="w-5 h-5 text-yellow-600" />
              ¿Vetar usuario?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>Esta acción vetará a <strong>{vetDialog.user?.name}</strong> temporalmente.</p>
              <div className="mt-3">
                <label className="text-sm text-gray-700 block mb-2">
                  Razón del veto (obligatorio):
                </label>
                <Textarea
                  value={vetReason}
                  onChange={(e) => setVetReason(e.target.value)}
                  placeholder="Ej: Comportamiento inapropiado, spam, etc."
                  className="min-h-[80px]"
                />
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
              Sí, vetar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Delete User Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open: boolean) => {
        setDeleteDialog({ open, user: null })
        if (!open) setDeleteReason('')
      }}>
        <AlertDialogContent className="w-[95vw] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              ¿Eliminar usuario?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>Esta acción eliminará a <strong>{deleteDialog.user?.name}</strong> permanentemente.</p>
              <p className="text-red-600">
                ⚠️ Esta acción no se puede deshacer.
              </p>
              <div className="mt-3">
                <label className="text-sm text-gray-700 block mb-2">
                  Razón de la eliminación (obligatorio):
                </label>
                <Textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Ej: Violación grave de términos, contenido ilegal, etc."
                  className="min-h-[80px]"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteDialog.user) {
                  deleteUser(deleteDialog.user)
                }
              }}
              disabled={!deleteReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
