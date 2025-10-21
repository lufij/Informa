import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from './ui/tabs'
import { AlertTriangle, Check, X, Eye, Shield } from 'lucide-react'
import { projectId } from '../utils/supabase/info'
import { toast } from 'sonner@2.0.3'
import { motion, AnimatePresence } from 'motion/react'

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

interface AdminReportsPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  token: string
}

export function AdminReportsPanel({ open, onOpenChange, token }: AdminReportsPanelProps) {
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed'>('pending')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      fetchReports()
    }
  }, [open])

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
          r.id === reportId ? { ...r, status } : r
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
      news: 'Chisme',
      alert: 'Alerta',
      classified: 'Clasificado',
      forum: 'Conversación',
      comment: 'Comentario',
      user: 'Usuario'
    }
    return labels[type] || type
  }

  const filteredReports = reports.filter(r => {
    if (filter === 'all') return true
    if (filter === 'pending') return r.status === 'pending'
    if (filter === 'reviewed') return r.status !== 'pending'
    return true
  })

  const pendingCount = reports.filter(r => r.status === 'pending').length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col bg-gradient-to-br from-white to-red-50">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 p-2 rounded-full">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="flex items-center gap-2">
                Panel de Reportes
                {pendingCount > 0 && (
                  <Badge className="bg-red-500 text-white">
                    {pendingCount} pendientes
                  </Badge>
                )}
              </DialogTitle>
            </div>
          </div>
          <DialogDescription>
            Gestiona los reportes de la comunidad
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="pending">
              Pendientes ({reports.filter(r => r.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="reviewed">
              Revisados ({reports.filter(r => r.status !== 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="all">
              Todos ({reports.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <ScrollArea className="flex-1 pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-500">Cargando reportes...</div>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <Shield className="w-12 h-12 text-gray-300 mb-2" />
              <p className="text-gray-500">No hay reportes</p>
              <p className="text-sm text-gray-400">
                {filter === 'pending' ? 'No hay reportes pendientes' : 'Cambia el filtro para ver otros reportes'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 mt-4">
              <AnimatePresence>
                {filteredReports.map((report) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                  >
                    <Card className={`overflow-hidden border-l-4 ${
                      report.status === 'pending'
                        ? 'border-l-red-500'
                        : report.status === 'resolved'
                        ? 'border-l-green-500'
                        : report.status === 'dismissed'
                        ? 'border-l-gray-400'
                        : 'border-l-blue-500'
                    }`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <Badge variant="outline">
                                {getContentTypeLabel(report.contentType)}
                              </Badge>
                              <Badge variant="destructive">
                                {getReasonLabel(report.reason)}
                              </Badge>
                              <Badge className={
                                report.status === 'pending'
                                  ? 'bg-red-500 text-white'
                                  : report.status === 'resolved'
                                  ? 'bg-green-500 text-white'
                                  : report.status === 'dismissed'
                                  ? 'bg-gray-400 text-white'
                                  : 'bg-blue-500 text-white'
                              }>
                                {report.status === 'pending' ? '⏳ Pendiente' :
                                 report.status === 'resolved' ? '✅ Resuelto' :
                                 report.status === 'dismissed' ? '❌ Descartado' :
                                 '👁️ Revisado'}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600">
                              <p>Reportado: {new Date(report.createdAt).toLocaleString('es-GT')}</p>
                              {report.description && (
                                <p className="mt-1 text-gray-800">{report.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {report.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => updateReportStatus(report.id, 'resolved')}
                              disabled={updatingId === report.id}
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Resolver
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => updateReportStatus(report.id, 'dismissed')}
                              disabled={updatingId === report.id}
                              className="bg-gray-400 hover:bg-gray-500 text-white"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Descartar
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => updateReportStatus(report.id, 'reviewed')}
                              disabled={updatingId === report.id}
                              variant="outline"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Marcar revisado
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
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
