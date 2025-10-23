import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { AlertTriangle, X, Eye, Shield, Trash2, Ban, UserX, RefreshCw, History, AlertCircle } from 'lucide-react'
import { projectId } from '../utils/supabase/info'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'motion/react'
import { UserManagement } from './UserManagement'
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

interface Report {
  id: string
  reporterId: string
  contentType: 'news' | 'alert' | 'classified' | 'forum' | 'comment' | 'user'
  contentId: string
  reason: string
  description?: string
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  createdAt: string
  reviewedBy?: string
  reviewedAt?: string
}

interface ContentData {
  id: string
  title?: string
  topic?: string
  message?: string
  content?: string
  description?: string
  authorId: string
  authorName?: string
  hidden?: boolean
  reportCount?: number
}

interface ModerationLog {
  id: string
  action: string
  contentType?: string
  contentId?: string
  contentTitle?: string
  targetUserId?: string
  targetUserName?: string
  reason?: string
  performedAt: string
  performedBy: string
  performedByName: string
}

interface AdminReportsPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  token: string
  userProfile: any
  onNavigate?: (section: string, itemId: string) => void
}

export function AdminReportsPanel({ open, onOpenChange, token, userProfile, onNavigate }: AdminReportsPanelProps) {
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed'>('pending')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [contentDataMap, setContentDataMap] = useState<Record<string, ContentData>>({})
  const [activeTab, setActiveTab] = useState<'reports' | 'log' | 'moderators'>('reports')
  const [moderationLog, setModerationLog] = useState<ModerationLog[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  
  // Report detail view
  const [selectedReportGroup, setSelectedReportGroup] = useState<{
    reports: Report[]
    contentKey: string
    content: ContentData | null
  } | null>(null)
  
  // Confirmation dialogs
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean, report: Report | null }>({ open: false, report: null })
  const [banDialog, setBanDialog] = useState<{ open: boolean, report: Report | null }>({ open: false, report: null })
  const [vetDialog, setVetDialog] = useState<{ open: boolean, report: Report | null }>({ open: false, report: null })
  const [blockDialog, setBlockDialog] = useState<{ open: boolean, report: Report | null }>({ open: false, report: null })
  const [banReason, setBanReason] = useState('')
  const [vetReason, setVetReason] = useState('')
  const [blockReason, setBlockReason] = useState('')
  const [vetDuration, setVetDuration] = useState('7')
  
  const isAdmin = userProfile?.role === 'admin'

  useEffect(() => {
    if (open) {
      fetchReports()
      fetchModerationLog()
      if (isAdmin) {
        fetchUsers()
      }
    }
  }, [open, isAdmin])
  
  // Fetch users when switching to moderators tab
  useEffect(() => {
    if (open && activeTab === 'moderators' && isAdmin && users.length === 0) {
      fetchUsers()
    }
  }, [activeTab, open, isAdmin])

  const fetchReports = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/reports`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setReports(data)
        
        // Fetch content data for each report
        await fetchContentData(data)
      } else if (response.status === 403) {
        toast.error('No tienes permisos para ver los reportes')
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
      toast.error('Error al cargar reportes')
    } finally {
      setIsLoading(false)
    }
  }
  
  const fetchContentData = async (reportsData: Report[]) => {
    const dataMap: Record<string, ContentData> = {}
    
    // Group reports by content
    const uniqueContent = Array.from(
      new Set(reportsData.map(r => `${r.contentType}:${r.contentId}`))
    )
    
    for (const contentKey of uniqueContent) {
      const [contentType, contentId] = contentKey.split(':')
      
      try {
        // Fetch content by type
        let endpoint = ''
        switch (contentType) {
          case 'news':
            endpoint = `news/${contentId}`
            break
          case 'alert':
            endpoint = `alerts/${contentId}`
            break
          case 'classified':
            endpoint = `classifieds/${contentId}`
            break
          case 'forum':
            endpoint = `forums/${contentId}`
            break
          default:
            continue
        }
        
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/${endpoint}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )
        
        if (response.ok) {
          const content = await response.json()
          dataMap[contentKey] = content
        }
      } catch (error) {
        console.error(`Error fetching content ${contentKey}:`, error)
      }
    }
    
    setContentDataMap(dataMap)
  }
  
  const fetchModerationLog = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/moderation-log`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setModerationLog(data)
      }
    } catch (error) {
      console.error('Error fetching moderation log:', error)
    }
  }
  
  const fetchUsers = async () => {
    if (!isAdmin) return
    
    setIsLoadingUsers(true)
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/admin/users`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Error al cargar usuarios')
    } finally {
      setIsLoadingUsers(false)
    }
  }
  


  const updateReportStatus = async (reportId: string, status: string) => {
    setUpdatingId(reportId)
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/reports/${reportId}/status`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status })
        }
      )

      if (response.ok) {
        setReports(reports.map(r => 
          r.id === reportId ? { ...r, status: status as Report['status'] } : r
        ))
        toast.success('Estado actualizado')
      } else {
        toast.error('Error al actualizar estado')
      }
    } catch (error) {
      console.error('Error updating report:', error)
      toast.error('Error al actualizar estado')
    } finally {
      setUpdatingId(null)
    }
  }
  
  const deletePost = async (report: Report) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/posts/${report.contentType}/${report.contentId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        toast.success('Publicación eliminada exitosamente')
        
        // Mark all related reports as resolved
        const relatedReports = reports.filter(r => 
          r.contentType === report.contentType && r.contentId === report.contentId
        )
        
        for (const r of relatedReports) {
          await updateReportStatus(r.id, 'resolved')
        }
        
        // Refresh data
        await fetchReports()
        await fetchModerationLog()
      } else {
        toast.error('Error al eliminar publicación')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error('Error al eliminar publicación')
    }
  }
  
  const restorePost = async (report: Report) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/posts/${report.contentType}/${report.contentId}/restore`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        toast.success('Publicación restaurada')
        await fetchReports()
        await fetchModerationLog()
      } else {
        toast.error('Error al restaurar publicación')
      }
    } catch (error) {
      console.error('Error restoring post:', error)
      toast.error('Error al restaurar publicación')
    }
  }
  
  const banUser = async (report: Report) => {
    if (!banReason.trim()) {
      toast.error('Debes proporcionar una razón para el baneo')
      return
    }
    
    try {
      const content = contentDataMap[`${report.contentType}:${report.contentId}`]
      if (!content) {
        toast.error('No se encontró el contenido')
        return
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/users/${content.authorId}/ban`,
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
        toast.success('Usuario baneado permanentemente')
        setBanDialog({ open: false, report: null })
        setBanReason('')
        await fetchModerationLog()
        await fetchReports()
      } else {
        toast.error('Error al banear usuario')
      }
    } catch (error) {
      console.error('Error banning user:', error)
      toast.error('Error al banear usuario')
    }
  }
  
  const vetUser = async (report: Report) => {
    if (!vetReason.trim()) {
      toast.error('Debes proporcionar una razón para el vetado')
      return
    }
    
    try {
      const content = contentDataMap[`${report.contentType}:${report.contentId}`]
      if (!content) {
        toast.error('No se encontró el contenido')
        return
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/users/${content.authorId}/vet`,
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
        toast.success(`Usuario vetado por ${vetDuration} días`)
        setVetDialog({ open: false, report: null })
        setVetReason('')
        setVetDuration('7')
        await fetchModerationLog()
        await fetchReports()
      } else {
        toast.error('Error al vetar usuario')
      }
    } catch (error) {
      console.error('Error vetting user:', error)
      toast.error('Error al vetar usuario')
    }
  }
  
  const blockUser = async (report: Report) => {
    if (!blockReason.trim()) {
      toast.error('Debes proporcionar una razón para el bloqueo')
      return
    }
    
    try {
      const content = contentDataMap[`${report.contentType}:${report.contentId}`]
      if (!content) {
        toast.error('No se encontró el contenido')
        return
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/users/${content.authorId}/block`,
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
        toast.success('Usuario bloqueado exitosamente')
        setBlockDialog({ open: false, report: null })
        setBlockReason('')
        await fetchModerationLog()
        await fetchReports()
      } else {
        toast.error('Error al bloquear usuario')
      }
    } catch (error) {
      console.error('Error blocking user:', error)
      toast.error('Error al bloquear usuario')
    }
  }

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      spam: 'Spam',
      harassment: 'Acoso',
      inappropriate: 'Contenido inapropiado',
      'fake-news': 'Información falsa',
      other: 'Otro'
    }
    return labels[reason] || reason
  }

  const getContentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      news: 'Noticia',
      alert: 'Alerta',
      classified: 'Clasificado',
      forum: 'Conversación',
      comment: 'Comentario',
      user: 'Usuario'
    }
    return labels[type] || type
  }
  
  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      auto_hide: '🤖 Auto-ocultado',
      delete_post: '🗑️ Publicación eliminada',
      restore_post: '♻️ Publicación restaurada',
      block_user: '⏸️ Usuario bloqueado',
      ban_user: '🚫 Usuario baneado',
      vet_user: '⚠️ Usuario vetado',
      unban_user: '✅ Usuario desbaneado',
      unvet_user: '✅ Usuario desvetado',
      unblock_user: '✅ Usuario desbloqueado'
    }
    return labels[action] || action
  }
  
  const getContentTitle = (report: Report) => {
    const content = contentDataMap[`${report.contentType}:${report.contentId}`]
    if (!content) return 'Contenido no disponible'
    
    return content.title || content.topic || content.message || content.content || 'Sin título'
  }

  const filteredReports = reports.filter(r => {
    if (filter === 'all') return true
    if (filter === 'pending') return r.status === 'pending'
    if (filter === 'reviewed') return r.status !== 'pending'
    return true
  })

  const pendingCount = reports.filter(r => r.status === 'pending').length
  
  // Group reports by content
  const groupedReports = filteredReports.reduce((acc, report) => {
    const key = `${report.contentType}:${report.contentId}`
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(report)
    return acc
  }, {} as Record<string, Report[]>)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="fixed inset-0 w-screen h-screen sm:w-[95vw] sm:max-w-4xl sm:h-[85vh] sm:max-h-[85vh] sm:relative sm:inset-auto flex flex-col bg-white p-3 sm:p-4 overflow-hidden border-0 sm:border rounded-none sm:rounded-lg m-0 sm:m-auto z-50">
          <DialogHeader className="pb-3 sm:pb-4 flex-shrink-0">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 flex-1">
                <div className="bg-red-500 p-1.5 sm:p-2 rounded-full">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-lg sm:text-xl font-semibold truncate">
                    Panel de Moderación
                    {pendingCount > 0 && (
                      <Badge className="ml-2 bg-red-500 text-white text-xs">
                        {pendingCount}
                      </Badge>
                    )}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-600 mt-1">
                    Gestiona reportes y usuarios
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>
          
          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid grid-cols-3 w-full h-12 p-1 flex-shrink-0">
              <TabsTrigger value="reports" className="text-sm sm:text-base px-2 py-2 h-full">
                Reportes ({reports.length})
              </TabsTrigger>
              <TabsTrigger value="log" className="text-sm sm:text-base px-2 py-2 h-full">
                Historial
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="moderators" className="text-sm sm:text-base px-2 py-2 h-full">
                  Usuarios
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="reports" className="flex-1 flex flex-col min-h-0 mt-4">
              {/* Filters */}
              <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full mb-4 flex-shrink-0">
                <TabsList className="w-full grid grid-cols-3 h-10 p-1">
                  <TabsTrigger value="pending" className="px-2 py-2 text-sm h-full">
                    Pendientes ({reports.filter(r => r.status === 'pending').length})
                  </TabsTrigger>
                  <TabsTrigger value="reviewed" className="px-2 py-2 text-sm h-full">
                    Revisados ({reports.filter(r => r.status !== 'pending').length})
                  </TabsTrigger>
                  <TabsTrigger value="all" className="px-2 py-2 text-sm h-full">
                    Todos ({reports.length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <ScrollArea className="flex-1 pr-1 sm:pr-4 -mx-1 sm:mx-0">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-gray-500">Cargando reportes...</div>
                  </div>
                ) : Object.keys(groupedReports).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-center">
                    <Shield className="w-12 h-12 text-gray-300 mb-2" />
                    <p className="text-gray-500">No hay reportes</p>
                    <p className="text-sm text-gray-400">
                      {filter === 'pending' ? 'No hay reportes pendientes' : 'Cambia el filtro para ver otros reportes'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-4 mt-2 sm:mt-4">
                    <AnimatePresence>
                      {Object.entries(groupedReports).map(([contentKey, contentReports]) => {
                        const firstReport = contentReports[0]
                        const content = contentDataMap[contentKey]
                        const reportCount = contentReports.length
                        const pendingReports = contentReports.filter(r => r.status === 'pending').length
                        
                        return (
                          <motion.div
                            key={contentKey}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                          >
                            <Card 
                              className={`overflow-hidden border-l-4 cursor-pointer hover:shadow-lg transition-shadow ${
                                content?.hidden
                                  ? 'border-l-orange-500 bg-orange-50'
                                  : pendingReports > 0
                                  ? 'border-l-red-500'
                                  : 'border-l-gray-400'
                              }`}
                              onClick={() => {
                                if (onNavigate) {
                                  const sectionMap: Record<string, string> = {
                                    news: 'news',
                                    alert: 'alerts',
                                    classified: 'classifieds',
                                    forum: 'forums'
                                  }
                                  const section = sectionMap[firstReport.contentType] || 'feed'
                                  onNavigate(section, firstReport.contentId)
                                  onOpenChange(false)
                                  toast.info('📍 Navegando a la publicación reportada...', {
                                    duration: 2000
                                  })
                                }
                              }}
                            >
                              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <Badge variant="outline">
                                        {getContentTypeLabel(firstReport.contentType)}
                                      </Badge>
                                      <Badge className="bg-red-500 text-white">
                                        {reportCount} {reportCount === 1 ? 'reporte' : 'reportes'}
                                      </Badge>
                                      {pendingReports > 0 && (
                                        <Badge className="bg-orange-500 text-white">
                                          {pendingReports} pendientes
                                        </Badge>
                                      )}
                                      {content?.hidden && (
                                        <Badge className="bg-orange-600 text-white">
                                          ⚠️ Auto-ocultado
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    {/* Content Preview */}
                                    {content && (
                                      <div className="bg-white/50 rounded p-3 border border-gray-200">
                                        <p className="text-sm text-gray-800 mb-1 line-clamp-2">
                                          {getContentTitle(firstReport)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          Por: {content.authorName || 'Desconocido'}
                                        </p>
                                      </div>
                                    )}
                                    
                                    {/* Report Details */}
                                    <div className="space-y-1">
                                      {contentReports.slice(0, 3).map((report) => (
                                        <div key={report.id} className="text-xs text-gray-600 flex items-start gap-2">
                                          <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                          <div className="flex-1">
                                            <span className="font-medium">{getReasonLabel(report.reason)}</span>
                                            {report.description && (
                                              <span className="text-gray-500"> - {report.description}</span>
                                            )}
                                            <div className="text-[10px] text-gray-400">
                                              {new Date(report.createdAt).toLocaleString('es-GT')}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                      {contentReports.length > 3 && (
                                        <p className="text-xs text-gray-500 italic">
                                          +{contentReports.length - 3} reportes más... (Haz clic para ver todos)
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {/* Actions for pending reports */}
                                  {pendingReports > 0 && content && !content.hidden && (
                                    <>
                                      {/* Post Actions */}
                                      <Button
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setDeleteDialog({ open: true, report: firstReport })
                                        }}
                                        className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1"
                                      >
                                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                                        <span className="hidden sm:inline">Eliminar Post</span>
                                      </Button>
                                      
                                      {/* User Moderation Actions */}
                                      <Button
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setVetDialog({ open: true, report: firstReport })
                                        }}
                                        className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-2 py-1"
                                      >
                                        <Ban className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                                        <span className="hidden sm:inline">Vetar Usuario</span>
                                      </Button>
                                      
                                      <Button
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setBlockDialog({ open: true, report: firstReport })
                                        }}
                                        className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-2 py-1"
                                      >
                                        <UserX className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                                        <span className="hidden sm:inline">Bloquear</span>
                                      </Button>
                                      
                                      {isAdmin && (
                                        <Button
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setBanDialog({ open: true, report: firstReport })
                                          }}
                                          className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-2 py-1"
                                        >
                                          <UserX className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                                          <span className="hidden sm:inline">Banear</span>
                                        </Button>
                                      )}
                                      
                                      {/* Other Actions */}
                                      <Button
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          contentReports.forEach(r => updateReportStatus(r.id, 'dismissed'))
                                        }}
                                        variant="outline"
                                        className="text-xs px-2 py-1"
                                      >
                                        <X className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                                        <span className="hidden sm:inline">Descartar</span>
                                      </Button>
                                    </>
                                  )}
                                  
                                  {/* Restore if hidden */}
                                  {content?.hidden && (
                                    <Button
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        restorePost(firstReport)
                                      }}
                                      className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1"
                                    >
                                      <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                                      <span className="hidden sm:inline">Restaurar</span>
                                    </Button>
                                  )}
                                  
                                  {/* Mark as reviewed */}
                                  {pendingReports > 0 && (
                                    <Button
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        contentReports.forEach(r => updateReportStatus(r.id, 'reviewed'))
                                      }}
                                      variant="outline"
                                      className="text-xs px-2 py-1"
                                    >
                                      <Eye className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                                      <span className="hidden sm:inline">Revisado</span>
                                    </Button>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="log" className="flex-1 flex flex-col mt-2 sm:mt-4">
              <ScrollArea className="flex-1 pr-1 sm:pr-4 -mx-1 sm:mx-0">
                {moderationLog.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-center">
                    <History className="w-12 h-12 text-gray-300 mb-2" />
                    <p className="text-gray-500">No hay historial de moderación</p>
                  </div>
                ) : (
                  <div className="space-y-1.5 sm:space-y-2">
                    {moderationLog.map((log) => (
                      <Card key={log.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-3 sm:pt-4 px-3 sm:px-6 pb-3 sm:pb-6">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm">{getActionLabel(log.action)}</span>
                                {log.contentType && (
                                  <Badge variant="outline" className="text-xs">
                                    {getContentTypeLabel(log.contentType)}
                                  </Badge>
                                )}
                              </div>
                              
                              {log.contentTitle && (
                                <p className="text-xs text-gray-700 mb-1">
                                  "{log.contentTitle}"
                                </p>
                              )}
                              
                              {log.targetUserName && (
                                <p className="text-xs text-gray-700 mb-1">
                                  Usuario: {log.targetUserName}
                                </p>
                              )}
                              
                              {log.reason && (
                                <p className="text-xs text-gray-600 mb-1">
                                  Razón: {log.reason}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                <span>Por: {log.performedByName}</span>
                                <span>•</span>
                                <span>{new Date(log.performedAt).toLocaleString('es-GT')}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            
            {/* Moderators Tab - Admin Only */}
            {isAdmin && (
              <TabsContent value="moderators" className="flex-1 flex flex-col mt-1 sm:mt-2 overflow-hidden">
                <div className="flex-1 overflow-hidden">
                  {isLoadingUsers ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="text-gray-500">Cargando usuarios...</div>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-center">
                      <Shield className="w-12 h-12 text-gray-300 mb-2" />
                      <p className="text-gray-500">No hay usuarios</p>
                    </div>
                  ) : (
                    <UserManagement
                      users={users}
                      currentUserProfile={userProfile}
                      token={token}
                      onUserUpdated={fetchUsers}
                    />
                  )}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, report: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              ¿Eliminar publicación?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Esta acción es <strong>permanente</strong> y eliminará:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>La publicación completa</li>
                <li>Todos los comentarios</li>
                <li>Todas las reacciones</li>
              </ul>
              <p className="text-red-600 mt-2">
                ⚠️ Esta acción no se puede deshacer
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteDialog.report) {
                  deletePost(deleteDialog.report)
                  setDeleteDialog({ open: false, report: null })
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Ban Confirmation Dialog */}
      <AlertDialog open={banDialog.open} onOpenChange={(open) => {
        setBanDialog({ open, report: null })
        if (!open) setBanReason('')
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <UserX className="w-5 h-5 text-purple-600" />
              ¿Banear usuario permanentemente?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>Esta acción baneará al usuario de forma <strong>permanente</strong>.</p>
              <p className="text-red-600">
                ⚠️ El usuario no podrá acceder a la aplicación hasta que sea desbaneado por un admin.
              </p>
              <div className="mt-3">
                <label className="text-sm text-gray-700 block mb-2">
                  Razón del baneo (obligatorio):
                </label>
                <Textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Ej: Contenido ofensivo repetido, acoso, spam, etc."
                  className="min-h-[80px]"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (banDialog.report) {
                  banUser(banDialog.report)
                }
              }}
              disabled={!banReason.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Sí, banear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Vet User Dialog */}
      <AlertDialog open={vetDialog.open} onOpenChange={(open: boolean) => {
        setVetDialog({ open, report: null })
        if (!open) {
          setVetReason('')
          setVetDuration('7')
        }
      }}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Ban className="w-5 h-5 text-yellow-600" />
              ¿Vetar usuario temporalmente?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>Esta acción vetará al usuario por un período específico.</p>
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
                if (vetDialog.report) {
                  vetUser(vetDialog.report)
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
        setBlockDialog({ open, report: null })
        if (!open) setBlockReason('')
      }}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <UserX className="w-5 h-5 text-orange-600" />
              ¿Bloquear usuario?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>Esta acción bloqueará al usuario <strong>indefinidamente</strong>.</p>
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
                if (blockDialog.report) {
                  blockUser(blockDialog.report)
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
      
      {/* Report Detail Dialog */}
      <Dialog open={!!selectedReportGroup} onOpenChange={() => setSelectedReportGroup(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col bg-gradient-to-br from-white to-red-50">
          {selectedReportGroup && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 p-2 rounded-full">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="flex items-center gap-2">
                      Detalles del Reporte
                      <Badge className="bg-red-500 text-white">
                        {selectedReportGroup.reports.length} {selectedReportGroup.reports.length === 1 ? 'reporte' : 'reportes'}
                      </Badge>
                    </DialogTitle>
                    <DialogDescription>
                      {getContentTypeLabel(selectedReportGroup.reports[0].contentType)} reportado
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {/* Content Section */}
                  {selectedReportGroup.content && (
                    <Card className="border-l-4 border-l-blue-500">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Eye className="w-4 h-4" />
                          Contenido Reportado
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <label className="text-sm text-gray-600">Título/Mensaje:</label>
                          <p className="text-sm mt-1">
                            {selectedReportGroup.content.title || 
                             selectedReportGroup.content.topic || 
                             selectedReportGroup.content.message || 
                             selectedReportGroup.content.content || 
                             'Sin título'}
                          </p>
                        </div>
                        
                        {selectedReportGroup.content.description && (
                          <div>
                            <label className="text-sm text-gray-600">Descripción:</label>
                            <p className="text-sm mt-1 text-gray-700">
                              {selectedReportGroup.content.description}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <label className="text-gray-600">Autor:</label>
                            <span className="ml-2">{selectedReportGroup.content.authorName || 'Desconocido'}</span>
                          </div>
                          
                          {selectedReportGroup.content.hidden && (
                            <Badge className="bg-orange-600 text-white">
                              ⚠️ Auto-ocultado
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* Reports List Section */}
                  <Card className="border-l-4 border-l-red-500">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <AlertTriangle className="w-4 h-4" />
                        Lista de Reportes ({selectedReportGroup.reports.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedReportGroup.reports.map((report) => (
                          <div 
                            key={report.id} 
                            className="bg-white/70 rounded-lg p-3 border border-gray-200"
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline">
                                  {getReasonLabel(report.reason)}
                                </Badge>
                                <Badge 
                                  className={
                                    report.status === 'pending' 
                                      ? 'bg-orange-500 text-white' 
                                      : report.status === 'resolved'
                                      ? 'bg-green-600 text-white'
                                      : 'bg-gray-400 text-white'
                                  }
                                >
                                  {report.status === 'pending' ? 'Pendiente' : 
                                   report.status === 'resolved' ? 'Resuelto' :
                                   report.status === 'reviewed' ? 'Revisado' :
                                   'Descartado'}
                                </Badge>
                              </div>
                            </div>
                            
                            {report.description && (
                              <p className="text-sm text-gray-700 mb-2">
                                "{report.description}"
                              </p>
                            )}
                            
                            <div className="text-xs text-gray-500">
                              {new Date(report.createdAt).toLocaleString('es-GT')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Actions Section */}
                  <Card className="border-l-4 border-l-purple-500">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Shield className="w-4 h-4" />
                        Acciones de Moderación
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Info about reviewed */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm text-blue-900">
                            <strong>💡 "Marcar Revisado":</strong> Cambia el estado de los reportes a "revisado" 
                            para que dejen de aparecer como pendientes, sin tomar acción sobre el contenido. 
                            Útil cuando revisas un reporte y decides que no requiere acción.
                          </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {/* Pending reports actions */}
                          {selectedReportGroup.reports.some(r => r.status === 'pending') && 
                           selectedReportGroup.content && 
                           !selectedReportGroup.content.hidden && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setDeleteDialog({ open: true, report: selectedReportGroup.reports[0] })
                                  setSelectedReportGroup(null)
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Eliminar Post
                              </Button>
                              
                              {isAdmin && (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setBanDialog({ open: true, report: selectedReportGroup.reports[0] })
                                    setSelectedReportGroup(null)
                                  }}
                                  className="bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                  <UserX className="w-4 h-4 mr-1" />
                                  Banear Usuario
                                </Button>
                              )}
                              
                              <Button
                                size="sm"
                                onClick={() => {
                                  selectedReportGroup.reports.forEach(r => updateReportStatus(r.id, 'dismissed'))
                                  setTimeout(() => {
                                    fetchReports()
                                    setSelectedReportGroup(null)
                                  }, 500)
                                }}
                                variant="outline"
                              >
                                <X className="w-4 h-4 mr-1" />
                                Descartar Todos
                              </Button>
                              
                              <Button
                                size="sm"
                                onClick={() => {
                                  selectedReportGroup.reports.forEach(r => updateReportStatus(r.id, 'reviewed'))
                                  setTimeout(() => {
                                    fetchReports()
                                    setSelectedReportGroup(null)
                                  }, 500)
                                }}
                                variant="outline"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Marcar Revisado
                              </Button>
                            </>
                          )}
                          
                          {/* Restore if hidden */}
                          {selectedReportGroup.content?.hidden && (
                            <Button
                              size="sm"
                              onClick={() => {
                                restorePost(selectedReportGroup.reports[0])
                                setTimeout(() => {
                                  setSelectedReportGroup(null)
                                }, 500)
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <RefreshCw className="w-4 h-4 mr-1" />
                              Restaurar Post
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
