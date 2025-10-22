import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { projectId, publicAnonKey } from '../utils/supabase/info'
import { ShoppingBag, Plus, User, Users, Trash2, Phone, Calendar, MapPin, Briefcase, DollarSign, Wrench, Home, Star, PartyPopper, Upload, X, ImageIcon, Video, Info, CheckCircle2, HelpCircle, MessageCircle, Send, Heart, Droplet, Search } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'motion/react'
import { ProfilePhotoGuard } from './ProfilePhotoGuard'
import { PostActions } from './PostActions'
import { EditPostDialog } from './EditPostDialog'
import { ImageViewer } from './ImageViewer'

interface Classified {
  id: string
  title: string
  description: string
  category: string
  price: string
  contact: string
  userId: string
  userName: string
  mediaUrls?: string[]
  createdAt: string
}

interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  category: string
  authorName: string
  authorId: string
  mediaUrls?: string[]
  attendance?: {
    attending: number
    maybe: number
  }
  createdAt: string
}

interface EventComment {
  id: string
  eventId: string
  text: string
  userId: string
  userName: string
  createdAt: string
}

interface EventAttendee {
  userId: string
  userName: string
  userPhone: string
  status: 'attending' | 'maybe'
  timestamp: string
}

interface ClassifiedsSectionProps {
  token: string | null
  userProfile: any
  onRequestAuth: () => void
  onOpenSettings: () => void
  onNavigateToPost?: (section: string, postId: string) => void
  highlightedItemId?: string | null
  onItemHighlighted?: () => void
}

const categoryInfo = {
  empleo: {
    icon: Briefcase,
    color: 'from-green-400 to-emerald-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-500',
    title: '💼 Empleos',
    description: 'Publica ofertas de trabajo o busca empleo',
    examples: 'Ejemplo: "Se busca cajero/a", "Ofrezco servicios de..."',
    fields: ['Puesto', 'Descripción', 'Salario (opcional)', 'Contacto']
  },
  venta: {
    icon: DollarSign,
    color: 'from-blue-400 to-cyan-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-500',
    title: '💰 Venta',
    description: 'Vende artículos, productos o servicios',
    examples: 'Ejemplo: "Vendo bicicleta", "Celular Samsung..."',
    fields: ['Artículo', 'Descripción', 'Precio', 'Contacto']
  },
  ayuda: {
    icon: Heart,
    color: 'from-rose-400 to-red-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-500',
    title: '🫶 Servicio Comunitario - Como Gualán no Hay 2',
    description: 'Solidaridad para nuestra gente: recaudaciones médicas, personas/mascotas perdidas, donadores de sangre y emergencias comunitarias',
    examples: 'Ejemplo: "Recaudación para cirugía de emergencia", "Se busca persona desaparecida", "Urgente: se necesita sangre tipo O+"',
    fields: ['Descripción de la Necesidad', 'Detalles Importantes', 'Contacto']
  },
  alquiler: {
    icon: Home,
    color: 'from-orange-400 to-red-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-500',
    title: '🏠 Alquiler',
    description: 'Arrienda o busca propiedades y espacios',
    examples: 'Ejemplo: "Alquilo casa", "Busco apartamento..."',
    fields: ['Propiedad', 'Descripción', 'Precio mensual', 'Contacto']
  },
  eventos: {
    icon: PartyPopper,
    color: 'from-pink-400 to-purple-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-500',
    title: '🎉 Eventos',
    description: 'Anuncia eventos comunitarios y actividades',
    examples: 'Ejemplo: "Feria del pueblo", "Torneo de fútbol..."',
    fields: ['Evento', 'Descripción', 'Fecha y hora', 'Ubicación']
  }
}

export function ClassifiedsSection({ token, userProfile, onRequestAuth, onOpenSettings, onNavigateToPost, highlightedItemId, onItemHighlighted }: ClassifiedsSectionProps) {
  const [classifieds, setClassifieds] = useState<Classified[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('todos')
  const [showCategoryInfo, setShowCategoryInfo] = useState(false)

  // Classified form state
  const [newClassifiedTitle, setNewClassifiedTitle] = useState('')
  const [newClassifiedDescription, setNewClassifiedDescription] = useState('')
  const [newClassifiedCategory, setNewClassifiedCategory] = useState('')
  const [newClassifiedPrice, setNewClassifiedPrice] = useState('')
  const [newClassifiedContact, setNewClassifiedContact] = useState('')
  const [classifiedMediaFiles, setClassifiedMediaFiles] = useState<File[]>([])
  const [classifiedMediaPreviews, setClassifiedMediaPreviews] = useState<string[]>([])

  // Event form state
  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventDescription, setNewEventDescription] = useState('')
  const [newEventDate, setNewEventDate] = useState('')
  const [newEventTime, setNewEventTime] = useState('')
  const [newEventLocation, setNewEventLocation] = useState('')
  const [newEventCategory, setNewEventCategory] = useState('social')
  const [eventMediaFiles, setEventMediaFiles] = useState<File[]>([])
  const [eventMediaPreviews, setEventMediaPreviews] = useState<string[]>([])

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Edit state
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingClassified, setEditingClassified] = useState<Classified | null>(null)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  // Event attendance and comments state
  const [eventComments, setEventComments] = useState<Record<string, EventComment[]>>({})
  const [expandedEventComments, setExpandedEventComments] = useState<Record<string, boolean>>({})
  const [newEventComment, setNewEventComment] = useState<Record<string, string>>({})
  const [submittingComment, setSubmittingComment] = useState<string | null>(null)
  const [attendingTo, setAttendingTo] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [eventAttendees, setEventAttendees] = useState<Record<string, { attending: EventAttendee[], maybe: EventAttendee[] }>>({})
  const [expandedAttendeesList, setExpandedAttendeesList] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchClassifieds()
    fetchEvents()
  }, [])

  // Scroll to highlighted item and change category
  useEffect(() => {
    if (highlightedItemId) {
      const timer = setTimeout(() => {
        // Find the item in classifieds
        const classified = classifieds.find(c => c.id === highlightedItemId)
        if (classified) {
          // Change to the classified's category (or venta-alquiler for venta/alquiler)
          const targetCategory = (classified.category === 'venta' || classified.category === 'alquiler') 
            ? 'venta-alquiler' 
            : classified.category
          setSelectedCategory(targetCategory)
          // Wait for the tab to change, then scroll
          setTimeout(() => {
            const element = document.getElementById(`classified-${highlightedItemId}`)
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' })
              setTimeout(() => {
                if (onItemHighlighted) {
                  onItemHighlighted()
                }
              }, 3000)
            }
          }, 200)
        } else {
          // Try events
          const event = events.find(e => e.id === highlightedItemId)
          if (event) {
            // Change to events category
            setSelectedCategory('eventos')
            // Wait for the tab to change, then scroll
            setTimeout(() => {
              const element = document.getElementById(`event-${highlightedItemId}`)
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                setTimeout(() => {
                  if (onItemHighlighted) {
                    onItemHighlighted()
                  }
                }, 3000)
              }
            }, 200)
          }
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [highlightedItemId, classifieds, events, onItemHighlighted])

  // Update classified category when tab changes
  useEffect(() => {
    const validCategories = ['empleo', 'venta', 'ayuda', 'alquiler']
    if (validCategories.includes(selectedCategory)) {
      setNewClassifiedCategory(selectedCategory)
      console.log('Categoría actualizada a:', selectedCategory)
    } else if (selectedCategory === 'venta-alquiler') {
      // Default to "venta" when the combined tab is selected
      setNewClassifiedCategory('venta')
      console.log('Categoría por defecto establecida a: venta (pestaña venta-alquiler)')
    } else {
      // If on "todos" or "eventos", default to venta
      setNewClassifiedCategory('venta')
      console.log('Categoría por defecto establecida a: venta')
    }
  }, [selectedCategory])

  const fetchClassifieds = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/classifieds`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      )
      if (response.ok) {
        const data = await response.json()
        setClassifieds(data)
      }
    } catch (error) {
      console.error('Error al cargar clasificados:', error)
      toast.error('Error al cargar clasificados')
    } finally {
      setIsLoading(false)
    }
  }

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
    }
  }

  const handleClassifiedMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const totalFiles = classifiedMediaFiles.length + files.length
    
    if (totalFiles > 5) {
      toast.error('Máximo 5 archivos permitidos')
      return
    }

    setClassifiedMediaFiles(prev => [...prev, ...files])
    
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setClassifiedMediaPreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleEventMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const totalFiles = eventMediaFiles.length + files.length
    
    if (totalFiles > 5) {
      toast.error('Máximo 5 archivos permitidos')
      return
    }

    setEventMediaFiles(prev => [...prev, ...files])
    
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setEventMediaPreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeClassifiedMedia = (index: number) => {
    setClassifiedMediaFiles(prev => prev.filter((_, i) => i !== index))
    setClassifiedMediaPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const removeEventMedia = (index: number) => {
    setEventMediaFiles(prev => prev.filter((_, i) => i !== index))
    setEventMediaPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleCreateClassified = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate category
    const validCategories = ['empleo', 'venta', 'ayuda', 'alquiler']
    const categoryToUse = validCategories.includes(newClassifiedCategory) 
      ? newClassifiedCategory 
      : validCategories.includes(selectedCategory)
      ? selectedCategory
      : 'venta'

    if (!categoryToUse) {
      toast.error('Por favor selecciona una categoría válida')
      return
    }

    setIsSubmitting(true)

    try {
      console.log('Creando clasificado con categoría:', categoryToUse)
      
      // Para categoría "ayuda", generar título automático si no hay uno
      let titleToUse = newClassifiedTitle
      if (categoryToUse === 'ayuda' && !titleToUse) {
        // Generar título descriptivo basado en palabras clave de la descripción
        const desc = newClassifiedDescription.toLowerCase()
        if (desc.includes('recaudación') || desc.includes('dinero') || desc.includes('médico') || desc.includes('cirugía') || desc.includes('hospital')) {
          titleToUse = '🆘 Solicitud de Servicio - Recaudación Médica'
        } else if (desc.includes('perdido') || desc.includes('desaparecido') || desc.includes('busca')) {
          titleToUse = '🔍 Solicitud de Servicio - Persona/Mascota Perdida'
        } else if (desc.includes('sangre') || desc.includes('donador') || desc.includes('transfusión')) {
          titleToUse = '🩸 Solicitud de Servicio - Donadores de Sangre'
        } else {
          titleToUse = '🫶 Solicitud de Servicio Comunitario'
        }
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/classifieds`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: titleToUse,
            description: newClassifiedDescription,
            category: categoryToUse,
            price: categoryToUse === 'ayuda' ? '' : newClassifiedPrice, // No enviar precio para ayuda
            contact: newClassifiedContact,
            mediaUrls: classifiedMediaPreviews
          })
        }
      )

      if (response.ok) {
        const newClassified = await response.json()
        setClassifieds([newClassified, ...classifieds])
        setIsDialogOpen(false)
        resetClassifiedForm()
        toast.success(categoryToUse === 'ayuda' ? '🫶 Solicitud compartida. ¡La comunidad está contigo!' : '¡Anuncio publicado exitosamente! 🎉')
      } else {
        const error = await response.json()
        console.error('Error del servidor al crear clasificado:', error)
        toast.error(error.error || 'Error al publicar anuncio')
      }
    } catch (error) {
      console.error('Error al crear clasificado:', error)
      toast.error('Error al publicar anuncio')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!token) {
      toast.error('Debes iniciar sesión para publicar eventos')
      onRequestAuth()
      return
    }

    setIsSubmitting(true)

    try {
      // Validate required fields
      if (!newEventDate || !newEventTime) {
        toast.error('Por favor completa la fecha y hora del evento')
        setIsSubmitting(false)
        return
      }

      // Combine date and time
      const dateTimeString = `${newEventDate}T${newEventTime}`
      
      console.log('Creando evento:', {
        title: newEventTitle,
        description: newEventDescription,
        date: dateTimeString,
        location: newEventLocation,
        category: newEventCategory,
        token: token ? 'presente' : 'ausente',
        projectId
      })
      
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/events`
      console.log('URL del servidor:', url)
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newEventTitle,
          description: newEventDescription,
          date: dateTimeString,
          location: newEventLocation,
          category: newEventCategory,
          mediaUrls: eventMediaPreviews
        })
      })

      console.log('Respuesta del servidor:', response.status, response.statusText)

      if (response.ok) {
        const newEvent = await response.json()
        setEvents([...events, newEvent].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        ))
        setIsDialogOpen(false)
        resetEventForm()
        toast.success('¡Evento publicado exitosamente! 🎊')
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
        console.error('Error del servidor:', errorData)
        toast.error(errorData.error || 'Error al publicar evento')
      }
    } catch (error) {
      console.error('Error al crear evento:', error)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error('Error de conexión. Verifica tu internet e intenta de nuevo.')
      } else {
        toast.error('Error al publicar evento')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClassified = async (classifiedId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este anuncio?')) return

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/classifieds/${classifiedId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        setClassifieds(classifieds.filter(c => c.id !== classifiedId))
        toast.success('Anuncio eliminado')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al eliminar anuncio')
      }
    } catch (error) {
      console.error('Error al eliminar clasificado:', error)
      toast.error('Error al eliminar anuncio')
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

  const handleUpdateClassified = (updatedClassified: Classified) => {
    setClassifieds(classifieds.map(c => c.id === updatedClassified.id ? updatedClassified : c))
    setEditingClassified(null)
  }

  const handleUpdateEvent = (updatedEvent: Event) => {
    setEvents(events.map(e => e.id === updatedEvent.id ? updatedEvent : e))
    setEditingEvent(null)
  }

  // Event attendance functions
  const handleEventAttendance = async (eventId: string, status: 'attending' | 'maybe') => {
    if (!token) {
      onRequestAuth()
      return
    }

    setAttendingTo(eventId)
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/events/${eventId}/attend`,
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
        const updatedEvent = await response.json()
        setEvents(events.map(e => e.id === eventId ? updatedEvent : e))
        toast.success(status === 'attending' ? '¡Confirmaste tu asistencia! 🎉' : 'Marcado como posible asistencia 🤔')
        
        // Fetch updated attendees list
        await fetchEventAttendees(eventId)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al registrar asistencia')
      }
    } catch (error) {
      console.error('Error al registrar asistencia:', error)
      toast.error('Error al registrar asistencia')
    } finally {
      setAttendingTo(null)
    }
  }

  const fetchEventAttendees = async (eventId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/events/${eventId}/attendees`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      )
      if (response.ok) {
        const data = await response.json()
        setEventAttendees(prev => ({ ...prev, [eventId]: { attending: data.attending, maybe: data.maybe } }))
      }
    } catch (error) {
      console.error('Error al cargar lista de asistentes:', error)
    }
  }

  const toggleAttendeesList = async (eventId: string) => {
    const isExpanded = expandedAttendeesList[eventId]
    setExpandedAttendeesList(prev => ({ ...prev, [eventId]: !isExpanded }))
    
    if (!isExpanded && !eventAttendees[eventId]) {
      await fetchEventAttendees(eventId)
    }
  }

  // Event comments functions
  const fetchEventComments = async (eventId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/events/${eventId}/comments`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      )
      if (response.ok) {
        const comments = await response.json()
        setEventComments(prev => ({ ...prev, [eventId]: comments }))
      }
    } catch (error) {
      console.error('Error al cargar comentarios:', error)
    }
  }

  const toggleEventComments = async (eventId: string) => {
    const isExpanded = expandedEventComments[eventId]
    setExpandedEventComments(prev => ({ ...prev, [eventId]: !isExpanded }))
    
    if (!isExpanded && !eventComments[eventId]) {
      await fetchEventComments(eventId)
    }
  }

  const handleAddEventComment = async (eventId: string) => {
    if (!token) {
      onRequestAuth()
      return
    }

    const commentText = newEventComment[eventId]?.trim()
    if (!commentText) return

    setSubmittingComment(eventId)
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/events/${eventId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ text: commentText })
        }
      )

      if (response.ok) {
        const newComment = await response.json()
        setEventComments(prev => ({
          ...prev,
          [eventId]: [newComment, ...(prev[eventId] || [])]
        }))
        setNewEventComment(prev => ({ ...prev, [eventId]: '' }))
        toast.success('Comentario agregado 💬')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al agregar comentario')
      }
    } catch (error) {
      console.error('Error al agregar comentario:', error)
      toast.error('Error al agregar comentario')
    } finally {
      setSubmittingComment(null)
    }
  }

  const handleDeleteEventComment = async (eventId: string, commentId: string) => {
    if (!confirm('¿Eliminar este comentario?')) return

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/events/${eventId}/comments/${commentId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        setEventComments(prev => ({
          ...prev,
          [eventId]: (prev[eventId] || []).filter(c => c.id !== commentId)
        }))
        toast.success('Comentario eliminado')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al eliminar comentario')
      }
    } catch (error) {
      console.error('Error al eliminar comentario:', error)
      toast.error('Error al eliminar comentario')
    }
  }

  const resetClassifiedForm = () => {
    setNewClassifiedTitle('')
    setNewClassifiedDescription('')
    setNewClassifiedPrice('')
    setNewClassifiedContact('')
    setClassifiedMediaFiles([])
    setClassifiedMediaPreviews([])
    
    // Pre-select category based on active tab
    const validCategories = ['empleo', 'venta', 'ayuda', 'alquiler']
    if (validCategories.includes(selectedCategory)) {
      setNewClassifiedCategory(selectedCategory)
    } else {
      setNewClassifiedCategory('venta') // Default fallback
    }
  }

  const resetEventForm = () => {
    setNewEventTitle('')
    setNewEventDescription('')
    setNewEventDate('')
    setNewEventTime('')
    setNewEventLocation('')
    setNewEventCategory('social')
    setEventMediaFiles([])
    setEventMediaPreviews([])
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      empleo: 'bg-green-100 text-green-800',
      venta: 'bg-blue-100 text-blue-800',
      ayuda: 'bg-rose-100 text-rose-800',
      alquiler: 'bg-orange-100 text-orange-800',
      otro: 'bg-gray-100 text-gray-800',
    }
    return colors[category] || colors.otro
  }

  const getEventCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      social: 'bg-pink-100 text-pink-800',
      deportivo: 'bg-orange-100 text-orange-800',
      cultural: 'bg-purple-100 text-purple-800',
      religioso: 'bg-blue-100 text-blue-800',
      educativo: 'bg-green-100 text-green-800',
    }
    return colors[category] || colors.social
  }

  const filteredClassifieds = selectedCategory === 'todos' || selectedCategory === 'eventos'
    ? classifieds 
    : selectedCategory === 'venta-alquiler'
    ? classifieds.filter(c => c.category === 'venta' || c.category === 'alquiler')
    : classifieds.filter(c => c.category === selectedCategory)

  const displayClassifieds = selectedCategory === 'eventos' ? [] : filteredClassifieds
  const displayEvents = selectedCategory === 'eventos' || selectedCategory === 'todos' ? events : []

  const currentCategoryInfo = selectedCategory !== 'todos' && selectedCategory !== 'eventos' && selectedCategory !== 'venta-alquiler'
    ? categoryInfo[selectedCategory as keyof typeof categoryInfo] 
    : selectedCategory === 'eventos' 
    ? categoryInfo.eventos 
    : null

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div 
          className="text-gray-500 flex items-center gap-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ShoppingBag className="w-5 h-5 animate-spin" />
          <span>Cargando...</span>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-green-600" />
          <h2>Clasificados & Eventos</h2>
        </div>
        {token ? (
          <ProfilePhotoGuard userProfile={userProfile} onOpenSettings={onOpenSettings}>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) {
                setShowCategoryInfo(false)
              }
            }}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  onClick={() => {
                    // Pre-set category when opening dialog
                    if (selectedCategory === 'empleo' || selectedCategory === 'venta' || selectedCategory === 'ayuda' || selectedCategory === 'alquiler') {
                      setNewClassifiedCategory(selectedCategory)
                    } else if (selectedCategory === 'venta-alquiler') {
                      setNewClassifiedCategory('venta') // Default to venta for combined tab
                    }
                  }}
                  className={`bg-gradient-to-r ${
                    selectedCategory === 'eventos' 
                      ? 'from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700' 
                      : selectedCategory === 'empleo'
                      ? 'from-green-400 to-emerald-600 hover:from-green-500 hover:to-emerald-700'
                      : selectedCategory === 'venta-alquiler'
                      ? 'from-blue-400 via-purple-500 to-orange-600 hover:from-blue-500 hover:via-purple-600 hover:to-orange-700'
                      : selectedCategory === 'ayuda'
                      ? 'from-rose-400 to-red-600 hover:from-rose-500 hover:to-red-700'
                      : 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                  } transition-all duration-300 hover:scale-105 shadow-lg`}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {selectedCategory === 'eventos' 
                    ? 'Crear Evento' 
                    : selectedCategory === 'empleo'
                    ? 'Crear Empleo'
                    : selectedCategory === 'venta-alquiler'
                    ? 'Publicar Anuncio'
                    : selectedCategory === 'ayuda'
                    ? '🫶 Solicitar Servicio'
                    : 'Publicar Anuncio'}
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-gray-50 to-white">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-2xl">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: 3 }}
                  >
                    {selectedCategory === 'eventos' 
                      ? '🎉' 
                      : selectedCategory === 'empleo'
                      ? '💼'
                      : selectedCategory === 'venta-alquiler'
                      ? '💰'
                      : selectedCategory === 'ayuda'
                      ? '🫶'
                      : '✨'}
                  </motion.div>
                  {selectedCategory === 'eventos' 
                    ? 'Crear Nuevo Evento' 
                    : selectedCategory === 'empleo'
                    ? 'Publicar Empleo'
                    : selectedCategory === 'venta-alquiler'
                    ? 'Publicar Anuncio'
                    : selectedCategory === 'ayuda'
                    ? 'Solicitar Servicio Comunitario'
                    : 'Publicar Anuncio'}
                </DialogTitle>
                <DialogDescription className="text-base">
                  {selectedCategory === 'eventos' 
                    ? '¡Comparte eventos importantes con la comunidad!'
                    : selectedCategory === 'empleo'
                    ? '¡Ayuda a otros a encontrar trabajo!'
                    : selectedCategory === 'venta-alquiler'
                    ? '¡Vende o arrienda a la comunidad!'
                    : selectedCategory === 'ayuda'
                    ? '🫶 Como Gualán no Hay 2 - Unidos apoyamos a nuestra gente en momentos difíciles'
                    : '¡Comparte con tu comunidad!'
                  }
                </DialogDescription>
              </DialogHeader>

              {/* Category Info Section */}
              {currentCategoryInfo && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${currentCategoryInfo.bgColor} border-2 ${currentCategoryInfo.borderColor} rounded-xl p-4 mb-4`}
                >
                  <div className="flex items-start gap-3">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`bg-gradient-to-r ${currentCategoryInfo.color} text-white p-3 rounded-lg shadow-lg`}
                    >
                      <currentCategoryInfo.icon className="w-6 h-6" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{currentCategoryInfo.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{currentCategoryInfo.description}</p>
                      <div className="flex items-start gap-2 text-xs text-gray-500">
                        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span className="italic">{currentCategoryInfo.examples}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {selectedCategory === 'eventos' ? (
                // Event form
                <form onSubmit={handleCreateEvent} className="space-y-5">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="event-title" className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-purple-500" />
                      Título del evento *
                    </Label>
                    <Input
                      id="event-title"
                      value={newEventTitle}
                      onChange={(e) => setNewEventTitle(e.target.value)}
                      required
                      placeholder="Ej: Feria del pueblo 2025"
                      className="border-2 focus:border-purple-500 transition-all"
                    />
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="event-description">Descripción *</Label>
                    <Textarea
                      id="event-description"
                      value={newEventDescription}
                      onChange={(e) => setNewEventDescription(e.target.value)}
                      required
                      rows={4}
                      placeholder="Describe el evento: actividades, horarios, invitados especiales..."
                      className="border-2 focus:border-purple-500 transition-all"
                    />
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <span className="font-semibold text-purple-900">📅 ¿Cuándo será?</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="event-date" className="text-sm text-purple-700">
                            Fecha *
                          </Label>
                          <Input
                            id="event-date"
                            type="date"
                            value={newEventDate}
                            onChange={(e) => setNewEventDate(e.target.value)}
                            required
                            className="border-2 border-purple-300 focus:border-purple-500 transition-all bg-white text-base h-12"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="event-time" className="text-sm text-purple-700">
                            Hora *
                          </Label>
                          <Input
                            id="event-time"
                            type="time"
                            value={newEventTime}
                            onChange={(e) => setNewEventTime(e.target.value)}
                            required
                            className="border-2 border-purple-300 focus:border-purple-500 transition-all bg-white text-base h-12"
                          />
                        </div>
                      </div>
                      
                      <p className="text-xs text-purple-600 mt-2 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        Selecciona la fecha y hora del evento
                      </p>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="event-location" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-500" />
                      Ubicación *
                    </Label>
                    <Input
                      id="event-location"
                      value={newEventLocation}
                      onChange={(e) => setNewEventLocation(e.target.value)}
                      required
                      placeholder="Ej: Parque Central"
                      className="border-2 focus:border-purple-500 transition-all"
                    />
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="event-category">Categoría del evento</Label>
                    <Select value={newEventCategory} onValueChange={setNewEventCategory}>
                      <SelectTrigger className="border-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="social">🎊 Social</SelectItem>
                        <SelectItem value="deportivo">⚽ Deportivo</SelectItem>
                        <SelectItem value="cultural">🎨 Cultural</SelectItem>
                        <SelectItem value="religioso">⛪ Religioso</SelectItem>
                        <SelectItem value="educativo">📚 Educativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>

                  {/* Media Upload for Events */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-3"
                  >
                    <Label className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-purple-500" />
                      Fotos o videos (opcional, máx. 5)
                    </Label>
                    <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 bg-purple-50/30 hover:bg-purple-50/50 transition-all">
                      <input
                        type="file"
                        accept="image/*,video/*"
                        capture="environment"
                        multiple
                        onChange={handleEventMediaChange}
                        className="hidden"
                        id="event-media-upload"
                      />
                      <label
                        htmlFor="event-media-upload"
                        className="flex flex-col items-center gap-2 cursor-pointer"
                      >
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-3 rounded-full"
                        >
                          <Upload className="w-6 h-6" />
                        </motion.div>
                        <div className="text-center">
                          <p className="text-sm">Toca para agregar fotos o videos</p>
                          <p className="text-xs text-gray-500 mt-1">Imágenes del evento, afiches, etc.</p>
                        </div>
                      </label>
                    </div>

                    {/* Event Media Previews */}
                    {eventMediaPreviews.length > 0 && (
                      <div className="grid grid-cols-3 gap-3">
                        <AnimatePresence>
                          {eventMediaPreviews.map((preview, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="relative group"
                            >
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border-2 border-purple-200"
                              />
                              <button
                                type="button"
                                onClick={() => removeEventMedia(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                              {eventMediaFiles[index]?.type.startsWith('video/') && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Video className="w-6 h-6 text-white drop-shadow-lg" />
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-lg py-6 shadow-lg hover:shadow-xl transition-all" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            🎉
                          </motion.div>
                          Publicando evento...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <PartyPopper className="w-5 h-5" />
                          Publicar Evento
                        </span>
                      )}
                    </Button>
                  </motion.div>
                </form>
              ) : (
                // Classified form
                <form onSubmit={handleCreateClassified} className="space-y-5">
                  {/* Selector de subcategoría para venta-alquiler */}
                  {selectedCategory === 'venta-alquiler' && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="subCategory" className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-blue-500" />
                        Tipo de anuncio *
                      </Label>
                      <Select
                        value={newClassifiedCategory}
                        onValueChange={setNewClassifiedCategory}
                      >
                        <SelectTrigger className="border-2 focus:border-blue-500">
                          <SelectValue placeholder="Selecciona el tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="venta">�� Venta</SelectItem>
                          <SelectItem value="alquiler">🏠 Alquiler</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}

                  {/* Solo mostrar título si NO es categoría "ayuda" */}
                  {newClassifiedCategory !== 'ayuda' && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="title" className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-green-500" />
                        Título del anuncio *
                      </Label>
                      <Input
                        id="title"
                        value={newClassifiedTitle}
                        onChange={(e) => setNewClassifiedTitle(e.target.value)}
                        required
                        placeholder="Ej: Vendo bicicleta montañera en excelente estado"
                        className="border-2 focus:border-green-500 transition-all"
                      />
                    </motion.div>
                  )}

                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: newClassifiedCategory !== 'ayuda' ? 0.2 : 0.1 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="description" className="flex items-center gap-2">
                      {newClassifiedCategory === 'ayuda' && <Heart className="w-4 h-4 text-rose-500" />}
                      {newClassifiedCategory === 'ayuda' ? '¿Qué necesita la comunidad? *' : 'Descripción detallada *'}
                    </Label>
                    <Textarea
                      id="description"
                      value={newClassifiedDescription}
                      onChange={(e) => setNewClassifiedDescription(e.target.value)}
                      required
                      rows={6}
                      placeholder={
                        newClassifiedCategory === 'ayuda' 
                          ? "Explica la situación con detalle: ¿Para quién es? ¿Qué se necesita? ¿Por qué es urgente? La comunidad de Gualán está para apoyar..."
                          : "Describe tu anuncio: características, condición, detalles importantes..."
                      }
                      className={`border-2 transition-all ${
                        newClassifiedCategory === 'ayuda' 
                          ? 'focus:border-rose-500 border-rose-200' 
                          : 'focus:border-green-500'
                      }`}
                    />
                  </motion.div>

                  <div className={newClassifiedCategory === 'ayuda' ? '' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
                    {/* Solo mostrar precio si NO es categoría "ayuda" */}
                    {newClassifiedCategory !== 'ayuda' && (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-2"
                      >
                        <Label htmlFor="price" className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          Precio
                        </Label>
                        <Input
                          id="price"
                          value={newClassifiedPrice}
                          onChange={(e) => setNewClassifiedPrice(e.target.value)}
                          placeholder="Ej: Q500 o A convenir"
                          className="border-2 focus:border-green-500 transition-all"
                        />
                      </motion.div>
                    )}

                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: newClassifiedCategory === 'ayuda' ? 0.2 : 0.4 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="contact" className="flex items-center gap-2">
                        <Phone className={`w-4 h-4 ${newClassifiedCategory === 'ayuda' ? 'text-rose-500' : 'text-green-500'}`} />
                        Contacto *
                      </Label>
                      <Input
                        id="contact"
                        value={newClassifiedContact}
                        onChange={(e) => setNewClassifiedContact(e.target.value)}
                        required
                        placeholder={
                          newClassifiedCategory === 'ayuda'
                            ? "WhatsApp, teléfono o como contactarte..."
                            : "Teléfono, WhatsApp, email..."
                        }
                        className={`border-2 transition-all ${
                          newClassifiedCategory === 'ayuda' 
                            ? 'focus:border-rose-500 border-rose-200' 
                            : 'focus:border-green-500'
                        }`}
                      />
                    </motion.div>
                  </div>

                  {/* Media Upload for Classifieds */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: newClassifiedCategory === 'ayuda' ? 0.3 : 0.5 }}
                    className="space-y-3"
                  >
                    <Label className="flex items-center gap-2">
                      <ImageIcon className={`w-4 h-4 ${newClassifiedCategory === 'ayuda' ? 'text-rose-500' : 'text-green-500'}`} />
                      {newClassifiedCategory === 'ayuda' 
                        ? 'Fotos o videos que ayuden a entender la situación (opcional, máx. 5)' 
                        : 'Fotos o videos (opcional, máx. 5)'}
                    </Label>
                    <div className={`border-2 border-dashed rounded-lg p-6 transition-all ${
                      newClassifiedCategory === 'ayuda'
                        ? 'border-rose-300 bg-rose-50/30 hover:bg-rose-50/50'
                        : 'border-green-300 bg-green-50/30 hover:bg-green-50/50'
                    }`}>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        capture="environment"
                        multiple
                        onChange={handleClassifiedMediaChange}
                        className="hidden"
                        id="classified-media-upload"
                      />
                      <label
                        htmlFor="classified-media-upload"
                        className="flex flex-col items-center gap-2 cursor-pointer"
                      >
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={`text-white p-3 rounded-full ${
                            newClassifiedCategory === 'ayuda'
                              ? 'bg-gradient-to-r from-rose-500 to-red-600'
                              : 'bg-gradient-to-r from-green-500 to-emerald-600'
                          }`}
                        >
                          <Upload className="w-6 h-6" />
                        </motion.div>
                        <div className="text-center">
                          <p className="text-sm">Toca para agregar fotos o videos</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {newClassifiedCategory === 'ayuda'
                              ? 'Ayuda a que la gente entienda la necesidad'
                              : 'Muestra tu producto o servicio'}
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Classified Media Previews */}
                    {classifiedMediaPreviews.length > 0 && (
                      <div className="grid grid-cols-3 gap-3">
                        <AnimatePresence>
                          {classifiedMediaPreviews.map((preview, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="relative group"
                            >
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className={`w-full h-24 object-cover rounded-lg border-2 ${
                                  newClassifiedCategory === 'ayuda' ? 'border-rose-200' : 'border-green-200'
                                }`}
                              />
                              <button
                                type="button"
                                onClick={() => removeClassifiedMedia(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                              {classifiedMediaFiles[index]?.type.startsWith('video/') && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Video className="w-6 h-6 text-white drop-shadow-lg" />
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: newClassifiedCategory === 'ayuda' ? 0.4 : 0.6 }}
                  >
                    <Button 
                      type="submit" 
                      className={`w-full text-lg py-6 shadow-lg hover:shadow-xl transition-all ${
                        newClassifiedCategory === 'ayuda'
                          ? 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700'
                          : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                      }`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            {newClassifiedCategory === 'ayuda' ? '🫶' : '✨'}
                          </motion.div>
                          {newClassifiedCategory === 'ayuda' ? 'Compartiendo solicitud...' : 'Publicando anuncio...'}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          {newClassifiedCategory === 'ayuda' ? (
                            <>
                              <Heart className="w-5 h-5" />
                              Compartir Solicitud de Servicio
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-5 h-5" />
                              Publicar Anuncio
                            </>
                          )}
                        </span>
                      )}
                    </Button>
                  </motion.div>
                </form>
              )}
            </DialogContent>
          </Dialog>
          </ProfilePhotoGuard>
        ) : (
          <Button 
            size="sm" 
            onClick={onRequestAuth} 
            className={`bg-gradient-to-r ${
              selectedCategory === 'eventos' 
                ? 'from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700' 
                : selectedCategory === 'empleo'
                ? 'from-green-400 to-emerald-600 hover:from-green-500 hover:to-emerald-700'
                : selectedCategory === 'venta-alquiler'
                ? 'from-blue-400 via-purple-500 to-orange-600 hover:from-blue-500 hover:via-purple-600 hover:to-orange-700'
                : selectedCategory === 'ayuda'
                ? 'from-rose-400 to-red-600 hover:from-rose-500 hover:to-red-700'
                : 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
            } transition-all duration-300 hover:scale-105 shadow-lg`}
          >
            <Plus className="w-4 h-4 mr-2" />
            {selectedCategory === 'eventos' 
              ? 'Crear Evento' 
              : selectedCategory === 'empleo'
              ? 'Crear Empleo'
              : selectedCategory === 'venta-alquiler'
              ? 'Publicar Anuncio'
              : selectedCategory === 'ayuda'
              ? 'Solicitar Servicio'
              : 'Publicar Anuncio'}
          </Button>
        )}
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto bg-gradient-to-r from-green-50 to-purple-50">
          <TabsTrigger value="todos" className="data-[state=active]:bg-white data-[state=active]:shadow-md">Todos</TabsTrigger>
          <TabsTrigger value="empleo" className="data-[state=active]:bg-white data-[state=active]:shadow-md">💼 Empleo</TabsTrigger>
          <TabsTrigger value="venta-alquiler" className="data-[state=active]:bg-white data-[state=active]:shadow-md">💰 Venta y Alquiler</TabsTrigger>
          <TabsTrigger value="ayuda" className="data-[state=active]:bg-white data-[state=active]:shadow-md">🫶 Servicios</TabsTrigger>
          <TabsTrigger value="eventos" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-100 data-[state=active]:to-pink-100 data-[state=active]:shadow-md">🎉 Eventos</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Display Events */}
      {displayEvents.length > 0 && (
        <div className="space-y-4">
          <AnimatePresence>
            {displayEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  id={`event-${event.id}`}
                  className={`border-l-4 border-l-purple-500 hover:shadow-xl transition-all duration-300 ${
                    highlightedItemId === event.id ? 'ring-4 ring-yellow-400 ring-offset-4 animate-pulse' : ''
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getEventCategoryColor(event.category)}>
                            {event.category}
                          </Badge>
                        </div>
                        <CardTitle>{event.title}</CardTitle>
                        <div className="flex flex-col gap-1 mt-2 text-muted-foreground text-sm">
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
                  <CardContent className="space-y-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
                    
                    {/* Event Media */}
                    {event.mediaUrls && event.mediaUrls.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {event.mediaUrls.map((url, idx) => (
                          <div key={idx} className="relative group cursor-pointer">
                            <img
                              src={url}
                              alt={`Event media ${idx + 1}`}
                              className="w-full h-32 object-cover rounded-lg border-2 border-purple-200 transition-transform duration-300 group-hover:scale-105"
                              onClick={() => setSelectedImage(url)}
                            />
                            <div 
                              className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center rounded-lg"
                              onClick={() => setSelectedImage(url)}
                            >
                              <div className="bg-white/90 rounded-full p-2 opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
                                <ImageIcon className="w-4 h-4 text-gray-800" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Event Attendance Section */}
                    <div className="border-t-2 border-purple-100 pt-4 bg-gradient-to-b from-purple-50/30 to-pink-50/30 -mx-6 px-6 pb-4">
                      <h4 className="text-sm mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-600" />
                        ¿Vas a asistir?
                      </h4>
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEventAttendance(event.id, 'attending')}
                          disabled={attendingTo === event.id}
                          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-sm">Asistiré</span>
                          {event.attendance?.attending ? (
                            <Badge className="bg-white/30 text-white border-0 ml-1">
                              {event.attendance.attending}
                            </Badge>
                          ) : null}
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEventAttendance(event.id, 'maybe')}
                          disabled={attendingTo === event.id}
                          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                        >
                          <HelpCircle className="w-4 h-4" />
                          <span className="text-sm">Tal vez</span>
                          {event.attendance?.maybe ? (
                            <Badge className="bg-white/30 text-white border-0 ml-1">
                              {event.attendance.maybe}
                            </Badge>
                          ) : null}
                        </motion.button>
                      </div>

                      {/* Total attendance counter */}
                      {(event.attendance?.attending || event.attendance?.maybe) && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-3 text-center text-sm text-purple-700 bg-purple-100 rounded-lg py-2 px-3"
                        >
                          <span className="flex items-center justify-center gap-2">
                            <PartyPopper className="w-4 h-4" />
                            <strong>{(event.attendance?.attending || 0) + (event.attendance?.maybe || 0)}</strong>
                            <span>personas interesadas en este evento</span>
                          </span>
                        </motion.div>
                      )}

                      {/* Attendees List */}
                      {event.attendance?.attending > 0 && (
                        <div className="mt-4">
                          <button
                            onClick={() => toggleAttendeesList(event.id)}
                            className="flex items-center gap-2 text-sm hover:text-green-600 transition-colors mb-2 group w-full justify-center"
                          >
                            <Users className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span className="font-medium">
                              Ver lista de asistentes confirmados ({event.attendance.attending})
                            </span>
                          </button>

                          <AnimatePresence>
                            {expandedAttendeesList[event.id] && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-2 mt-3"
                              >
                                {eventAttendees[event.id]?.attending && eventAttendees[event.id].attending.length > 0 ? (
                                  <div className="bg-white rounded-lg border-2 border-green-200 p-4 shadow-sm">
                                    <h5 className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
                                      <CheckCircle2 className="w-4 h-4" />
                                      Asistentes Confirmados
                                    </h5>
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                      {eventAttendees[event.id].attending.map((attendee, idx) => (
                                        <motion.div
                                          key={attendee.userId}
                                          initial={{ opacity: 0, x: -20 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: idx * 0.05 }}
                                          className="bg-green-50 rounded-lg p-3 border border-green-200 hover:shadow-md transition-shadow"
                                        >
                                          <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm">
                                                {idx + 1}
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                  <User className="w-3 h-3 text-green-600 flex-shrink-0" />
                                                  <span className="text-sm font-medium text-green-900 truncate">
                                                    {attendee.userName}
                                                  </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                  <Phone className="w-3 h-3 text-green-600 flex-shrink-0" />
                                                  <a 
                                                    href={`tel:${attendee.userPhone}`}
                                                    className="text-sm text-green-700 hover:text-green-900 hover:underline"
                                                  >
                                                    {attendee.userPhone}
                                                  </a>
                                                </div>
                                              </div>
                                            </div>
                                            <div className="flex-shrink-0">
                                              <Badge className="bg-green-500 text-white border-0 text-xs">
                                                ✓ Confirmado
                                              </Badge>
                                            </div>
                                          </div>
                                        </motion.div>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500 text-center py-4">
                                    Cargando lista de asistentes...
                                  </p>
                                )}

                                {/* Maybe attendees (if any) */}
                                {eventAttendees[event.id]?.maybe && eventAttendees[event.id].maybe.length > 0 && (
                                  <div className="bg-white rounded-lg border-2 border-yellow-200 p-4 shadow-sm mt-3">
                                    <h5 className="text-sm font-semibold text-yellow-700 mb-3 flex items-center gap-2">
                                      <HelpCircle className="w-4 h-4" />
                                      Asistencia Pendiente ({eventAttendees[event.id].maybe.length})
                                    </h5>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                      {eventAttendees[event.id].maybe.map((attendee, idx) => (
                                        <motion.div
                                          key={attendee.userId}
                                          initial={{ opacity: 0, x: -20 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: idx * 0.05 }}
                                          className="bg-yellow-50 rounded-lg p-2 border border-yellow-200"
                                        >
                                          <div className="flex items-center gap-2">
                                            <User className="w-3 h-3 text-yellow-600 flex-shrink-0" />
                                            <span className="text-sm text-yellow-900 truncate">
                                              {attendee.userName}
                                            </span>
                                            <Badge className="bg-yellow-500 text-white border-0 text-xs ml-auto">
                                              ? Tal vez
                                            </Badge>
                                          </div>
                                        </motion.div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>

                    {/* Comments Section */}
                    <div className="border-t-2 border-gray-100 pt-4 bg-gradient-to-b from-white to-gray-50 -mx-6 px-6 pb-4">
                      <button
                        onClick={() => toggleEventComments(event.id)}
                        className="flex items-center gap-2 text-sm hover:text-purple-600 transition-colors mb-3 group"
                      >
                        <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span>
                          Comentarios {eventComments[event.id]?.length > 0 ? `(${eventComments[event.id].length})` : ''}
                        </span>
                      </button>

                      <AnimatePresence>
                        {expandedEventComments[event.id] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3"
                          >
                            {/* Add comment form */}
                            <ProfilePhotoGuard userProfile={userProfile} onOpenSettings={onOpenSettings}>
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Escribe un comentario..."
                                  value={newEventComment[event.id] || ''}
                                  onChange={(e) => setNewEventComment(prev => ({ ...prev, [event.id]: e.target.value }))}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault()
                                      handleAddEventComment(event.id)
                                    }
                                  }}
                                  className="flex-1 border-2 border-purple-200 focus:border-purple-400"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleAddEventComment(event.id)}
                                  disabled={submittingComment === event.id || !newEventComment[event.id]?.trim()}
                                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                                >
                                  <Send className="w-4 h-4" />
                                </Button>
                              </div>
                            </ProfilePhotoGuard>

                            {/* Comments list */}
                            {eventComments[event.id]?.length > 0 ? (
                              <div className="space-y-2 max-h-64 overflow-y-auto">
                                {eventComments[event.id].map((comment) => (
                                  <motion.div
                                    key={comment.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-purple-50/50 rounded-lg p-3 border border-purple-100"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <User className="w-3 h-3 text-purple-600 flex-shrink-0" />
                                          <span className="text-sm text-purple-700 truncate">{comment.userName}</span>
                                        </div>
                                        <p className="text-sm text-gray-700 break-words">{comment.text}</p>
                                        <span className="text-xs text-gray-500 mt-1 block">
                                          {new Date(comment.createdAt).toLocaleDateString('es-GT', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </span>
                                      </div>
                                      {(userProfile?.role === 'admin' || comment.userId === userProfile?.id) && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDeleteEventComment(event.id, comment.id)}
                                          className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      )}
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 text-center py-4">
                                Sé el primero en comentar este evento 💬
                              </p>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Post Actions */}
                    <div className="border-t-2 border-gray-100 pt-3 mt-4 -mx-6 px-6">
                      <PostActions
                        postType="classified"
                        postId={event.id}
                        token={token}
                        isAuthor={event.authorId === userProfile?.id}
                        onEdit={() => {
                          setEditingEvent(event)
                          setShowEditDialog(true)
                        }}
                        className="justify-end"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Display Classifieds */}
      {displayClassifieds.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {displayClassifieds.map((classified, index) => (
              <motion.div
                key={classified.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  id={`classified-${classified.id}`}
                  className={`hover:shadow-xl transition-all duration-300 ${
                    classified.category === 'ayuda' 
                      ? 'border-l-4 border-l-rose-500 bg-gradient-to-br from-rose-50/50 via-white to-white' 
                      : ''
                  } ${
                    highlightedItemId === classified.id ? 'ring-4 ring-yellow-400 ring-offset-4 animate-pulse' : ''
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge className={getCategoryColor(classified.category)}>
                            {classified.category}
                          </Badge>
                          {classified.category === 'ayuda' && (
                            <motion.span
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="text-rose-600"
                            >
                              🫶
                            </motion.span>
                          )}
                        </div>
                        <CardTitle className={`mt-2 ${classified.category === 'ayuda' ? 'text-rose-700' : ''}`}>
                          {classified.title}
                        </CardTitle>
                        <div className="flex items-center gap-1 mt-1 text-muted-foreground text-sm">
                            <User className="w-3 h-3" />
                            <span>{classified.userName}</span>
                          </div>
                      </div>
                      {(userProfile?.role === 'admin' || classified.userId === userProfile?.id) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClassified(classified.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {classified.category === 'ayuda' && (
                      <div className="bg-rose-100 border-l-4 border-rose-500 rounded-lg p-3 mb-3">
                        <p className="text-sm text-rose-800 flex items-center gap-2">
                          <Heart className="w-4 h-4" />
                          <strong>Como Gualán no Hay 2</strong> - Nuestra comunidad siempre está lista para apoyar
                        </p>
                      </div>
                    )}
                    
                    <p className="text-gray-700 whitespace-pre-wrap">{classified.description}</p>
                    
                    {/* Classified Media */}
                    {classified.mediaUrls && classified.mediaUrls.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        {classified.mediaUrls.map((url, idx) => (
                          <div key={idx} className="relative group cursor-pointer">
                            <img
                              src={url}
                              alt={`Classified media ${idx + 1}`}
                              className={`w-full h-32 object-cover rounded-lg border-2 transition-transform duration-300 group-hover:scale-105 ${
                                classified.category === 'ayuda' ? 'border-rose-200' : 'border-green-200'
                              }`}
                              onClick={() => setSelectedImage(url)}
                            />
                            <div 
                              className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center rounded-lg"
                              onClick={() => setSelectedImage(url)}
                            >
                              <div className="bg-white/90 rounded-full p-2 opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
                                <ImageIcon className="w-4 h-4 text-gray-800" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {classified.price && classified.category !== 'ayuda' && (
                      <div className="pt-2 border-t">
                        <span className="text-green-700">{classified.price}</span>
                      </div>
                    )}
                    <div className={`flex items-center gap-2 text-sm ${
                      classified.category === 'ayuda' ? 'bg-rose-50 border-rose-200 border rounded-lg p-2' : ''
                    }`}>
                      <Phone className={`w-4 h-4 ${classified.category === 'ayuda' ? 'text-rose-600' : 'text-gray-600'}`} />
                      <span className={classified.category === 'ayuda' ? 'text-rose-700' : 'text-gray-600'}>
                        {classified.category === 'ayuda' ? 'Contacto: ' : ''}{classified.contact}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Publicado: {new Date(classified.createdAt).toLocaleDateString('es-GT')}
                    </div>

                    {/* Post Actions */}
                    <div className="border-t-2 border-gray-100 pt-3 mt-3">
                      <PostActions
                        postType="classified"
                        postId={classified.id}
                        token={token}
                        isAuthor={classified.userId === userProfile?.id}
                        onEdit={() => {
                          setEditingClassified(classified)
                          setShowEditDialog(true)
                        }}
                        contactPhone={classified.contact}
                        recipientId={classified.userId}
                        recipientName={classified.userName}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Empty state */}
      {displayClassifieds.length === 0 && displayEvents.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Card className="border-2 border-dashed">
            <CardContent className="pt-6 text-center text-gray-500">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-4xl mb-2"
              >
                {selectedCategory === 'eventos' 
                  ? '🎉' 
                  : selectedCategory === 'ayuda'
                  ? '🫶'
                  : '📢'
                }
              </motion.div>
              <p>
                {selectedCategory === 'eventos' 
                  ? 'No hay eventos programados todavía'
                  : selectedCategory === 'ayuda'
                  ? 'No hay solicitudes de ayuda en este momento'
                  : 'No hay anuncios en esta categoría todavía'
                }
              </p>
              <p className="text-sm mt-2">
                {selectedCategory === 'ayuda' 
                  ? 'Como Gualán no Hay 2 - Siempre listos para apoyar a nuestra gente'
                  : '¡Sé el primero en publicar!'
                }
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Floating Action Button */}
      <motion.button
        onClick={() => token ? setIsDialogOpen(true) : onRequestAuth()}
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl ${
          selectedCategory === 'eventos'
            ? 'bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-600 hover:from-purple-600 hover:via-fuchsia-600 hover:to-pink-700'
            : selectedCategory === 'ayuda'
            ? 'bg-gradient-to-r from-rose-500 via-red-500 to-pink-600 hover:from-rose-600 hover:via-red-600 hover:to-pink-700'
            : 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 hover:from-green-600 hover:via-emerald-600 hover:to-teal-700'
        } text-white z-50 flex items-center justify-center transition-all duration-300 border-4 border-white`}
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        animate={{ 
          y: [0, -5, 0],
          boxShadow: [
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            "0 25px 30px -5px rgba(0, 0, 0, 0.2), 0 15px 15px -5px rgba(0, 0, 0, 0.08)",
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          ]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        aria-label={
          selectedCategory === 'eventos' 
            ? 'Crear nuevo evento' 
            : selectedCategory === 'ayuda'
            ? 'Solicitar ayuda comunitaria'
            : 'Publicar anuncio clasificado'
        }
      >
        <Plus className="w-8 h-8 drop-shadow-lg" />
      </motion.button>

      {/* Edit Dialog for Classifieds and Events */}
      {editingClassified && (
        <EditPostDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          postType="classified"
          postId={editingClassified.id}
          initialTitle={editingClassified.title}
          initialContent={editingClassified.description}
          token={token!}
          onSuccess={handleUpdateClassified}
        />
      )}

      {editingEvent && (
        <EditPostDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          postType="event"
          postId={editingEvent.id}
          initialTitle={editingEvent.title}
          initialContent={editingEvent.description}
          token={token!}
          onSuccess={handleUpdateEvent}
        />
      )}

      {/* Image Viewer */}
      <ImageViewer
        imageUrl={selectedImage}
        onClose={() => setSelectedImage(null)}
        altText="Imagen de clasificado o evento"
      />
    </div>
  )
}
