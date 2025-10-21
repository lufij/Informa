import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { projectId, publicAnonKey } from '../utils/supabase/info'
import { Calendar, Plus, MapPin, Trash2 } from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  category: string
  authorName: string
  authorId: string
  createdAt: string
}

interface EventsSectionProps {
  token: string | null
  userProfile: any
  onRequestAuth: () => void
}

export function EventsSection({ token, userProfile, onRequestAuth }: EventsSectionProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventDescription, setNewEventDescription] = useState('')
  const [newEventDate, setNewEventDate] = useState('')
  const [newEventLocation, setNewEventLocation] = useState('')
  const [newEventCategory, setNewEventCategory] = useState('social')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/events`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      )
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      }
    } catch (error) {
      console.error('Error al cargar eventos:', error)
      toast.error('Error al cargar eventos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/events`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: newEventTitle,
            description: newEventDescription,
            date: newEventDate,
            location: newEventLocation,
            category: newEventCategory
          })
        }
      )

      if (response.ok) {
        const newEvent = await response.json()
        setEvents([...events, newEvent].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        ))
        setIsDialogOpen(false)
        setNewEventTitle('')
        setNewEventDescription('')
        setNewEventDate('')
        setNewEventLocation('')
        setNewEventCategory('social')
        toast.success('Evento publicado exitosamente')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al publicar evento')
      }
    } catch (error) {
      console.error('Error al crear evento:', error)
      toast.error('Error al publicar evento')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este evento?')) return

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/events/${eventId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        setEvents(events.filter(e => e.id !== eventId))
        toast.success('Evento eliminado')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al eliminar evento')
      }
    } catch (error) {
      console.error('Error al eliminar evento:', error)
      toast.error('Error al eliminar evento')
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      social: 'bg-pink-100 text-pink-800',
      deportivo: 'bg-orange-100 text-orange-800',
      cultural: 'bg-purple-100 text-purple-800',
      religioso: 'bg-blue-100 text-blue-800',
      educativo: 'bg-green-100 text-green-800',
    }
    return colors[category] || colors.social
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando eventos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-purple-600" />
          <h2>Calendario de Eventos</h2>
        </div>
        {token ? (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Crear Evento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Crear Evento</DialogTitle>
                <DialogDescription>
                  Añade un nuevo evento al calendario comunitario
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título del evento</Label>
                  <Input
                    id="title"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={newEventDescription}
                    onChange={(e) => setNewEventDescription(e.target.value)}
                    required
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha y hora</Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación</Label>
                  <Input
                    id="location"
                    value={newEventLocation}
                    onChange={(e) => setNewEventLocation(e.target.value)}
                    required
                    placeholder="Ej: Parque Central"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select value={newEventCategory} onValueChange={setNewEventCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="deportivo">Deportivo</SelectItem>
                      <SelectItem value="cultural">Cultural</SelectItem>
                      <SelectItem value="religioso">Religioso</SelectItem>
                      <SelectItem value="educativo">Educativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Creando...' : 'Crear Evento'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        ) : null}
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-gray-500">
            No hay eventos programados todavía
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getCategoryColor(event.category)}>
                        {event.category}
                      </Badge>
                    </div>
                    <CardTitle>{event.title}</CardTitle>
                    <CardDescription>
                      <div className="flex flex-col gap-1 mt-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(event.date).toLocaleDateString('es-GT', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </CardDescription>
                  </div>
                  {(userProfile?.role === 'admin' || event.authorId === userProfile?.id) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Floating Action Button - Siempre visible */}
      <button
        onClick={() => token ? setIsDialogOpen(true) : onRequestAuth()}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-600 hover:from-purple-600 hover:via-fuchsia-600 hover:to-pink-700 text-white z-50 flex items-center justify-center transition-all duration-300 hover:scale-110 animate-pulse hover:animate-none border-4 border-white"
        aria-label="Crear nuevo evento"
      >
        <Plus className="w-8 h-8 drop-shadow-lg" />
      </button>
    </div>
  )
}
