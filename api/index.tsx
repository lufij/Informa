import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import * as kv from './kv_store.tsx'

const app = new Hono()

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 86400,
  credentials: true,
}))
app.use('*', logger(console.log))

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

// Initialize storage bucket on startup
const bucketName = 'make-3467f1c6-media'
async function initializeBucket() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName)
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: 52428800, // 50MB
      })
      console.log('Storage bucket created successfully')
    }
  } catch (error) {
    console.error('Error initializing storage bucket:', error)
  }
}
initializeBucket()

// Helper function to verify user
async function verifyUser(authHeader: string | null) {
  if (!authHeader) return null
  const token = authHeader.split(' ')[1]
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null
  return user
}

// Helper function to get user profile
async function getUserProfile(userId: string) {
  const profile = await kv.get(`user:${userId}`)
  
  // Auto-assign firefighter role to Bomberos Voluntarios Gualán account
  if (profile && (profile.email === '79332213@informa.local' || profile.name?.includes('79332213'))) {
    if (profile.role !== 'firefighter' && profile.role !== 'admin') {
      profile.role = 'firefighter'
      await kv.set(`user:${userId}`, profile)
    }
  }
  
  return profile
}

// Auth routes
app.post('/make-server-3467f1c6/auth/signup', async (c) => {
  try {
    const { email, password, name, role = 'user', organization = '', phone = '' } = await c.req.json()
    
    // Auto-assign firefighter role to Bomberos Voluntarios Gualán account
    let assignedRole = role
    if (email === '79332213@informa.local' || name?.includes('79332213')) {
      assignedRole = 'firefighter'
    }
    
    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm email since email server hasn't been configured
      email_confirm: true
    })

    if (error) {
      console.log('Error creating user in Supabase Auth during signup:', error)
      return c.json({ error: error.message }, 400)
    }

    // Extract phone from email if not provided (format: phone@informa.local)
    const extractedPhone = phone || email.split('@')[0]

    // Store user profile in KV store
    const userProfile = {
      id: data.user.id,
      email,
      name,
      phone: extractedPhone,
      role: assignedRole, // 'admin', 'verified', 'firefighter', or 'user'
      organization,
      createdAt: new Date().toISOString()
    }
    
    await kv.set(`user:${data.user.id}`, userProfile)

    return c.json({ success: true, user: userProfile })
  } catch (error) {
    console.log('Error during signup process:', error)
    return c.json({ error: 'Error during signup' }, 500)
  }
})

app.get('/make-server-3467f1c6/auth/profile', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const profile = await getUserProfile(user.id)
    return c.json(profile || {})
  } catch (error) {
    console.log('Error fetching user profile:', error)
    return c.json({ error: 'Error fetching profile' }, 500)
  }
})

// Update user profile (bio, location, interests, role)
app.post('/make-server-3467f1c6/auth/update-profile', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const profile = await getUserProfile(user.id)
    const { bio, location, interests, role, profilePhoto } = await c.req.json()

    // Update profile
    const updatedProfile = {
      ...profile,
      bio: bio !== undefined ? bio : profile.bio,
      location: location !== undefined ? location : profile.location,
      interests: interests !== undefined ? interests : profile.interests,
      profilePhoto: profilePhoto !== undefined ? profilePhoto : profile.profilePhoto
    }

    // Handle role change (anyone can become a firefighter for demo purposes)
    if (role !== undefined) {
      const validRoles = ['user', 'verified', 'admin', 'firefighter']
      if (validRoles.includes(role)) {
        updatedProfile.role = role
      }
    }

    await kv.set(`user:${user.id}`, updatedProfile)
    return c.json(updatedProfile)
  } catch (error) {
    console.log('Error updating user profile:', error)
    return c.json({ error: 'Error updating profile' }, 500)
  }
})

// Migrate firefighter role for existing user (temporary endpoint)
app.post('/make-server-3467f1c6/auth/migrate-firefighter', async (c) => {
  try {
    // Get all users and find the firefighter account
    const allUsers = await kv.getByPrefix('user:')
    const firefighterUser = allUsers.find((u: any) => 
      u.email === '79332213@informa.local' || u.name?.includes('79332213')
    )
    
    if (!firefighterUser) {
      return c.json({ error: 'Usuario de bomberos no encontrado' }, 404)
    }
    
    // Update role to firefighter
    firefighterUser.role = 'firefighter'
    await kv.set(`user:${firefighterUser.id}`, firefighterUser)
    
    return c.json({ 
      success: true, 
      message: 'Usuario migrado a rol de bombero',
      user: firefighterUser 
    })
  } catch (error) {
    console.log('Error migrating firefighter user:', error)
    return c.json({ error: 'Error during migration' }, 500)
  }
})

// Update user role (admin only)
app.put('/make-server-3467f1c6/auth/profile/role', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const profile = await getUserProfile(user.id)
    const { role } = await c.req.json()

    // Validate role
    const validRoles = ['user', 'verified', 'admin', 'firefighter']
    if (!validRoles.includes(role)) {
      return c.json({ error: 'Rol inválido' }, 400)
    }

    // Only admin can change roles
    if (profile.role !== 'admin') {
      return c.json({ error: 'Solo administradores pueden cambiar roles' }, 403)
    }

    // Update profile with new role
    const updatedProfile = {
      ...profile,
      role
    }

    await kv.set(`user:${user.id}`, updatedProfile)
    return c.json(updatedProfile)
  } catch (error) {
    console.log('Error updating user role:', error)
    return c.json({ error: 'Error updating role' }, 500)
  }
})

// Upload route for media files
app.post('/make-server-3467f1c6/upload', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const formData = await c.req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400)
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: 'Tipo de archivo no permitido. Solo imágenes y videos.' }, 400)
    }

    // Validate file size (50MB max)
    if (file.size > 52428800) {
      return c.json({ error: 'El archivo es demasiado grande. Máximo 50MB.' }, 400)
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (error) {
      console.error('Error uploading file to storage:', error)
      return c.json({ error: 'Error al subir el archivo' }, 500)
    }

    // Create signed URL (valid for 1 year)
    const { data: urlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 31536000)

    if (!urlData) {
      return c.json({ error: 'Error al generar URL del archivo' }, 500)
    }

    return c.json({
      fileName: data.path,
      url: urlData.signedUrl,
      type: file.type
    })
  } catch (error) {
    console.error('Error during file upload:', error)
    return c.json({ error: 'Error al procesar el archivo' }, 500)
  }
})

// 🚀 TEMPORAL: Multiplicador de reacciones para motivar usuarios (cambiar a 1 para volver a normal)
const REACTION_MULTIPLIER = 5

// News routes
app.get('/make-server-3467f1c6/news', async (c) => {
  try {
    const newsItems = await kv.getByPrefix('news:')
    // Sort by createdAt descending
    const sorted = newsItems.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    return c.json(sorted)
  } catch (error) {
    console.log('Error fetching news:', error)
    return c.json({ error: 'Error fetching news' }, 500)
  }
})

app.post('/make-server-3467f1c6/news', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const profile = await getUserProfile(user.id)
    
    if (!profile) {
      return c.json({ error: 'Perfil no encontrado' }, 404)
    }

    const { title, content, category, mediaFiles = [] } = await c.req.json()
    const newsId = crypto.randomUUID()
    
    const newsItem = {
      id: newsId,
      title,
      content,
      category,
      mediaFiles, // Array of { url, type, fileName }
      authorId: user.id,
      authorName: profile.name,
      authorOrg: profile.organization,
      authorPhoto: profile.profilePhoto,
      reactions: { fire: 0, love: 0, wow: 0, sad: 0, angry: 0 },
      views: 0,
      createdAt: new Date().toISOString()
    }

    await kv.set(`news:${newsId}`, newsItem)
    
    // 📢 Enviar notificación push a todos los usuarios
    console.log(`🔔 Enviando notificación push por nueva noticia: ${title}`)
    await sendMassPushNotification(
      '📰 Nueva Noticia',
      `${profile.name}: ${title.substring(0, 80)}${title.length > 80 ? '...' : ''}`,
      { type: 'news', id: newsId },
      'normal'
    )
    console.log(`✅ Notificación push de noticia enviada`)
    
    return c.json(newsItem)
  } catch (error) {
    console.log('Error creating news:', error)
    return c.json({ error: 'Error creating news' }, 500)
  }
})

app.post('/make-server-3467f1c6/news/:id/react', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const newsId = c.req.param('id')
    const { reaction } = await c.req.json()
    
    const news = await kv.get(`news:${newsId}`)
    if (!news) {
      return c.json({ error: 'Noticia no encontrada' }, 404)
    }

    if (!news.reactions) {
      news.reactions = { fire: 0, love: 0, wow: 0, sad: 0, angry: 0 }
    }

    if (reaction in news.reactions) {
      // 🚀 TEMPORAL: Aplicar multiplicador (cambiar REACTION_MULTIPLIER a 1 para volver a normal)
      news.reactions[reaction] = (news.reactions[reaction] || 0) + REACTION_MULTIPLIER
    }

    await kv.set(`news:${newsId}`, news)
    
    // Create notification for post author (only for first reaction from this user to avoid spam)
    if (news.authorId !== user.id) {
      const reactorProfile = await getUserProfile(user.id)
      await createNotification(news.authorId, 'reaction', {
        postType: 'news',
        postId: newsId,
        postTitle: news.title,
        reactorId: user.id,
        reactorName: reactorProfile.name,
        reactorPhoto: reactorProfile.profilePhoto,
        reaction
      })
    }
    
    return c.json(news)
  } catch (error) {
    console.log('Error reacting to news:', error)
    return c.json({ error: 'Error reacting to news' }, 500)
  }
})

app.delete('/make-server-3467f1c6/news/:id', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const profile = await getUserProfile(user.id)
    const newsId = c.req.param('id')
    const news = await kv.get(`news:${newsId}`)

    if (!news) {
      return c.json({ error: 'Noticia no encontrada' }, 404)
    }

    // Only admin or the author can delete
    if (profile.role !== 'admin' && news.authorId !== user.id) {
      return c.json({ error: 'No autorizado para eliminar esta noticia' }, 403)
    }

    await kv.del(`news:${newsId}`)
    return c.json({ success: true })
  } catch (error) {
    console.log('Error deleting news:', error)
    return c.json({ error: 'Error deleting news' }, 500)
  }
})

// Events routes
app.get('/make-server-3467f1c6/events', async (c) => {
  try {
    const events = await kv.getByPrefix('event:')
    // Sort by date ascending (upcoming events first)
    const sorted = events.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    return c.json(sorted)
  } catch (error) {
    console.log('Error fetching events:', error)
    return c.json({ error: 'Error fetching events' }, 500)
  }
})

app.post('/make-server-3467f1c6/events', async (c) => {
  try {
    console.log('Recibiendo solicitud para crear evento...')
    
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      console.log('Usuario no autorizado')
      return c.json({ error: 'Unauthorized' }, 401)
    }

    console.log('Usuario verificado:', user.id)

    const profile = await getUserProfile(user.id)
    
    // Allow all authenticated users to post events
    if (!profile) {
      console.log('Perfil de usuario no encontrado para:', user.id)
      return c.json({ error: 'Perfil de usuario no encontrado' }, 404)
    }

    console.log('Perfil encontrado:', profile.name)

    const requestBody = await c.req.json()
    const { title, description, date, location, category, mediaUrls } = requestBody
    
    console.log('Datos del evento:', { title, description, date, location, category })
    
    const eventId = crypto.randomUUID()
    
    const event = {
      id: eventId,
      title,
      description,
      date,
      location,
      category,
      mediaUrls: mediaUrls || [],
      authorId: user.id,
      authorName: profile.name,
      authorPhoto: profile.profilePhoto,
      createdAt: new Date().toISOString()
    }

    console.log('Guardando evento en KV store...')
    await kv.set(`event:${eventId}`, event)
    console.log('Evento creado exitosamente:', eventId)
    
    return c.json(event)
  } catch (error) {
    console.error('Error creating event - detalles completos:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available')
    return c.json({ error: `Error creating event: ${error instanceof Error ? error.message : 'Unknown error'}` }, 500)
  }
})

app.delete('/make-server-3467f1c6/events/:id', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const profile = await getUserProfile(user.id)
    const eventId = c.req.param('id')
    const event = await kv.get(`event:${eventId}`)

    if (!event) {
      return c.json({ error: 'Evento no encontrado' }, 404)
    }

    if (profile.role !== 'admin' && event.authorId !== user.id) {
      return c.json({ error: 'No autorizado para eliminar este evento' }, 403)
    }

    await kv.del(`event:${eventId}`)
    return c.json({ success: true })
  } catch (error) {
    console.log('Error deleting event:', error)
    return c.json({ error: 'Error deleting event' }, 500)
  }
})

// Event attendance routes
app.post('/make-server-3467f1c6/events/:id/attend', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const profile = await getUserProfile(user.id)
    if (!profile) {
      return c.json({ error: 'Perfil no encontrado' }, 404)
    }

    const eventId = c.req.param('id')
    const { status } = await c.req.json() // 'attending' or 'maybe'
    const event = await kv.get(`event:${eventId}`)

    if (!event) {
      return c.json({ error: 'Event not found' }, 404)
    }

    // Initialize attendance if not present
    if (!event.attendance) {
      event.attendance = { attending: 0, maybe: 0 }
    }

    // Check if user already has attendance record
    const existingAttendance = await kv.get(`event_attendee:${eventId}:${user.id}`)
    
    if (existingAttendance) {
      // User already marked attendance, update their status
      const oldStatus = existingAttendance.status
      if (oldStatus !== status) {
        // Update counters
        if (event.attendance[oldStatus] > 0) {
          event.attendance[oldStatus]--
        }
        event.attendance[status]++
      }
      // Update status
      existingAttendance.status = status
      existingAttendance.timestamp = new Date().toISOString()
      await kv.set(`event_attendee:${eventId}:${user.id}`, existingAttendance)
    } else {
      // New attendance record
      const attendeeRecord = {
        userId: user.id,
        userName: profile.name,
        userPhone: profile.phone || 'No especificado',
        status: status,
        timestamp: new Date().toISOString()
      }
      
      await kv.set(`event_attendee:${eventId}:${user.id}`, attendeeRecord)
      
      // Increment attendance count
      if (status === 'attending' || status === 'maybe') {
        event.attendance[status]++
      }
    }

    await kv.set(`event:${eventId}`, event)
    return c.json(event)
  } catch (error) {
    console.log('Error updating event attendance:', error)
    return c.json({ error: 'Error updating event attendance' }, 500)
  }
})

// Get event attendees list
app.get('/make-server-3467f1c6/events/:id/attendees', async (c) => {
  try {
    const eventId = c.req.param('id')
    const attendees = await kv.getByPrefix(`event_attendee:${eventId}:`)
    
    // Sort by timestamp (most recent first)
    const sorted = attendees.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    
    // Separate by status
    const attending = sorted.filter(a => a.status === 'attending')
    const maybe = sorted.filter(a => a.status === 'maybe')
    
    return c.json({
      attending,
      maybe,
      total: attendees.length
    })
  } catch (error) {
    console.log('Error fetching event attendees:', error)
    return c.json({ error: 'Error fetching event attendees' }, 500)
  }
})

// Event comments routes
app.get('/make-server-3467f1c6/events/:id/comments', async (c) => {
  try {
    const eventId = c.req.param('id')
    const comments = await kv.getByPrefix(`event_comment:${eventId}:`)
    const sorted = comments.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    return c.json(sorted)
  } catch (error) {
    console.log('Error fetching event comments:', error)
    return c.json({ error: 'Error fetching event comments' }, 500)
  }
})

app.post('/make-server-3467f1c6/events/:id/comments', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const profile = await getUserProfile(user.id)
    if (!profile) {
      return c.json({ error: 'Perfil no encontrado' }, 404)
    }

    const eventId = c.req.param('id')
    const { text } = await c.req.json()
    const commentId = crypto.randomUUID()

    const comment = {
      id: commentId,
      eventId,
      text,
      userId: user.id,
      userName: profile.name,
      userPhoto: profile.profilePhoto,
      createdAt: new Date().toISOString()
    }

    await kv.set(`event_comment:${eventId}:${commentId}`, comment)
    return c.json(comment)
  } catch (error) {
    console.log('Error creating event comment:', error)
    return c.json({ error: 'Error creating event comment' }, 500)
  }
})

app.delete('/make-server-3467f1c6/events/:eventId/comments/:commentId', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const profile = await getUserProfile(user.id)
    const eventId = c.req.param('eventId')
    const commentId = c.req.param('commentId')
    const comment = await kv.get(`event_comment:${eventId}:${commentId}`)

    if (!comment) {
      return c.json({ error: 'Comentario no encontrado' }, 404)
    }

    if (profile.role !== 'admin' && comment.userId !== user.id) {
      return c.json({ error: 'No autorizado para eliminar este comentario' }, 403)
    }

    await kv.del(`event_comment:${eventId}:${commentId}`)
    return c.json({ success: true })
  } catch (error) {
    console.log('Error deleting event comment:', error)
    return c.json({ error: 'Error deleting event comment' }, 500)
  }
})

// Alerts routes
app.get('/make-server-3467f1c6/alerts', async (c) => {
  try {
    const alerts = await kv.getByPrefix('alert:')
    // Filter out expired alerts
    const now = new Date()
    const active = alerts.filter(alert => {
      if (!alert.expiresAt) return true
      return new Date(alert.expiresAt) > now
    })
    // Sort by priority and createdAt
    const sorted = active.sort((a, b) => {
      const priorityOrder = { 'critica': 1, 'alta': 2, 'media': 3, 'baja': 4 }
      const aPriority = priorityOrder[a.priority] || 5
      const bPriority = priorityOrder[b.priority] || 5
      if (aPriority !== bPriority) return aPriority - bPriority
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
    return c.json(sorted)
  } catch (error) {
    console.log('Error fetching alerts:', error)
    return c.json({ error: 'Error fetching alerts' }, 500)
  }
})

app.post('/make-server-3467f1c6/alerts', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const profile = await getUserProfile(user.id)
    
    // Any authenticated user can post alerts
    if (!profile) {
      return c.json({ error: 'Perfil de usuario no encontrado' }, 403)
    }

    const { message, title, description, category, priority, mediaFiles, mediaUrls, expiresAt, isOfficial, isEmergency } = await c.req.json()
    const alertId = crypto.randomUUID()
    
    const alert = {
      id: alertId,
      message: message || description, // Support both formats
      title: title || undefined,
      description: description || message,
      category, // 'desastre-natural', 'incendio', 'persona-desaparecida', 'lluvia', 'crecida-rio', 'emergencia', 'seguridad', 'trafico', 'otro'
      priority, // 'critica', 'alta', 'media', 'baja'
      mediaFiles: mediaFiles || [],
      mediaUrls: mediaUrls || [],
      reactions: { fire: 0, love: 0, wow: 0, sad: 0, angry: 0 },
      views: 0,
      authorId: user.id,
      authorName: profile.name,
      authorOrg: profile.organization,
      authorPhoto: profile.profilePhoto,
      authorRole: profile.role,
      isOfficial: isOfficial || false, // Flag for official alerts from firefighters/authorities
      isEmergency: isEmergency || false, // Flag for emergency alerts
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt || null
    }

    await kv.set(`alert:${alertId}`, alert)
    
    // 📢 Enviar notificación push a todos los usuarios
    // Prioridad ALTA para bomberos o alertas de emergencia
    const isFirefighterAlert = profile.role === 'firefighter' || profile.organization?.toLowerCase().includes('bombero')
    const pushPriority = (isEmergency || isFirefighterAlert || priority === 'critica') ? 'high' : 'normal'
    
    const emoji = isFirefighterAlert ? '🚨' : (priority === 'critica' ? '⚠️' : '📢')
    const titlePrefix = isFirefighterAlert ? 'EMERGENCIA - BOMBEROS' : (priority === 'critica' ? 'ALERTA CRÍTICA' : 'Nueva Alerta')
    
    await sendMassPushNotification(
      `${emoji} ${titlePrefix}`,
      `${title || message}`.substring(0, 100),
      { type: 'alert', id: alertId },
      pushPriority
    )
    
    return c.json(alert)
  } catch (error) {
    console.log('Error creating alert:', error)
    return c.json({ error: 'Error creating alert' }, 500)
  }
})

app.put('/make-server-3467f1c6/alerts/:id', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const profile = await getUserProfile(user.id)
    const alertId = c.req.param('id')
    const alert = await kv.get(`alert:${alertId}`)

    if (!alert) {
      return c.json({ error: 'Alerta no encontrada' }, 404)
    }

    if (profile.role !== 'admin' && alert.authorId !== user.id) {
      return c.json({ error: 'No autorizado para editar esta alerta' }, 403)
    }

    const { description, mediaFiles, mediaUrls } = await c.req.json()
    
    console.log('Updating alert:', alertId, {
      description,
      mediaFiles,
      mediaUrls,
      existingMediaFiles: alert.mediaFiles,
      existingMediaUrls: alert.mediaUrls
    })
    
    const updatedAlert = {
      ...alert,
      description: description || alert.description,
      message: description || alert.message,
      mediaFiles: mediaFiles !== undefined ? mediaFiles : (alert.mediaFiles || []),
      mediaUrls: mediaUrls !== undefined ? mediaUrls : (alert.mediaUrls || []),
      updatedAt: new Date().toISOString()
    }

    await kv.set(`alert:${alertId}`, updatedAlert)
    
    console.log('Alert updated successfully:', updatedAlert)
    
    return c.json(updatedAlert)
  } catch (error) {
    console.log('Error updating alert:', error)
    return c.json({ error: 'Error updating alert' }, 500)
  }
})

app.delete('/make-server-3467f1c6/alerts/:id', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const profile = await getUserProfile(user.id)
    const alertId = c.req.param('id')
    const alert = await kv.get(`alert:${alertId}`)

    if (!alert) {
      return c.json({ error: 'Alerta no encontrada' }, 404)
    }

    if (profile.role !== 'admin' && alert.authorId !== user.id) {
      return c.json({ error: 'No autorizado para eliminar esta alerta' }, 403)
    }

    await kv.del(`alert:${alertId}`)
    return c.json({ success: true })
  } catch (error) {
    console.log('Error deleting alert:', error)
    return c.json({ error: 'Error deleting alert' }, 500)
  }
})

app.post('/make-server-3467f1c6/alerts/:id/react', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const alertId = c.req.param('id')
    const { reaction } = await c.req.json()
    const alert = await kv.get(`alert:${alertId}`)

    if (!alert) {
      return c.json({ error: 'Alert not found' }, 404)
    }

    // Initialize reactions if not present
    if (!alert.reactions) {
      alert.reactions = { fire: 0, love: 0, wow: 0, sad: 0, angry: 0 }
    }

    // Increment reaction count
    if (reaction in alert.reactions) {
      // 🚀 TEMPORAL: Aplicar multiplicador (cambiar REACTION_MULTIPLIER a 1 para volver a normal)
      alert.reactions[reaction] += REACTION_MULTIPLIER
    }

    await kv.set(`alert:${alertId}`, alert)
    return c.json(alert)
  } catch (error) {
    console.log('Error reacting to alert:', error)
    return c.json({ error: 'Error reacting to alert' }, 500)
  }
})

// Classifieds routes
app.get('/make-server-3467f1c6/classifieds', async (c) => {
  try {
    const classifieds = await kv.getByPrefix('classified:')
    const sorted = classifieds.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    return c.json(sorted)
  } catch (error) {
    console.log('Error fetching classifieds:', error)
    return c.json({ error: 'Error fetching classifieds' }, 500)
  }
})

app.post('/make-server-3467f1c6/classifieds', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const profile = await getUserProfile(user.id)
    if (!profile) {
      return c.json({ error: 'Perfil no encontrado' }, 404)
    }

    const { title, description, category, price, contact, mediaUrls } = await c.req.json()
    const classifiedId = crypto.randomUUID()
    
    const classified = {
      id: classifiedId,
      title,
      description,
      category, // 'empleo', 'venta', 'ayuda', 'alquiler', 'otro'
      price,
      contact,
      mediaUrls: mediaUrls || [],
      userId: user.id,
      userName: profile.name,
      userPhoto: profile.profilePhoto,
      createdAt: new Date().toISOString()
    }

    await kv.set(`classified:${classifiedId}`, classified)
    return c.json(classified)
  } catch (error) {
    console.log('Error creating classified:', error)
    return c.json({ error: 'Error creating classified' }, 500)
  }
})

app.delete('/make-server-3467f1c6/classifieds/:id', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const profile = await getUserProfile(user.id)
    const classifiedId = c.req.param('id')
    const classified = await kv.get(`classified:${classifiedId}`)

    if (!classified) {
      return c.json({ error: 'Clasificado no encontrado' }, 404)
    }

    if (profile.role !== 'admin' && classified.userId !== user.id) {
      return c.json({ error: 'No autorizado para eliminar este clasificado' }, 403)
    }

    await kv.del(`classified:${classifiedId}`)
    return c.json({ success: true })
  } catch (error) {
    console.log('Error deleting classified:', error)
    return c.json({ error: 'Error deleting classified' }, 500)
  }
})

app.put('/make-server-3467f1c6/classifieds/:id/edit', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const classifiedId = c.req.param('id')
    const classified = await kv.get(`classified:${classifiedId}`)

    if (!classified) {
      console.log(`Classified not found: ${classifiedId}`)
      return c.json({ error: 'Post not found' }, 404)
    }

    if (classified.userId !== user.id) {
      return c.json({ error: 'No autorizado para editar este clasificado' }, 403)
    }

    const { title, description, content } = await c.req.json()
    
    // Update the classified
    const updatedClassified = {
      ...classified,
      title: title || classified.title,
      description: description || content || classified.description,
      editedAt: new Date().toISOString()
    }

    await kv.set(`classified:${classifiedId}`, updatedClassified)
    return c.json(updatedClassified)
  } catch (error) {
    console.log('Error editing classified:', error)
    return c.json({ error: 'Error editing classified' }, 500)
  }
})

// Forums routes
app.get('/make-server-3467f1c6/forums', async (c) => {
  try {
    const forums = await kv.getByPrefix('forum:')
    const sorted = forums.sort((a, b) => 
      new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
    )
    return c.json(sorted)
  } catch (error) {
    console.log('Error fetching forums:', error)
    return c.json({ error: 'Error fetching forums' }, 500)
  }
})

app.post('/make-server-3467f1c6/forums', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const profile = await getUserProfile(user.id)
    if (!profile) {
      return c.json({ error: 'Perfil no encontrado' }, 404)
    }

    const { topic, description, category, mediaFiles = [] } = await c.req.json()
    const forumId = crypto.randomUUID()
    
    const forum = {
      id: forumId,
      topic,
      description,
      category,
      mediaFiles,
      authorId: user.id,
      authorName: profile.name,
      authorPhoto: profile.profilePhoto,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      postCount: 0
    }

    await kv.set(`forum:${forumId}`, forum)
    return c.json(forum)
  } catch (error) {
    console.log('Error creating forum:', error)
    return c.json({ error: 'Error creating forum' }, 500)
  }
})

app.delete('/make-server-3467f1c6/forums/:id', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const profile = await getUserProfile(user.id)
    const forumId = c.req.param('id')
    const forum = await kv.get(`forum:${forumId}`)

    if (!forum) {
      return c.json({ error: 'Tema no encontrado' }, 404)
    }

    // Only admin or forum author can delete
    if (profile.role !== 'admin' && forum.authorId !== user.id) {
      return c.json({ error: 'No autorizado para eliminar este tema' }, 403)
    }

    // Delete all posts in the forum
    const posts = await kv.getByPrefix(`forum_post:${forumId}:`)
    for (const post of posts) {
      await kv.del(`forum_post:${forumId}:${post.id}`)
    }

    // Delete the forum
    await kv.del(`forum:${forumId}`)
    return c.json({ success: true })
  } catch (error) {
    console.log('Error deleting forum:', error)
    return c.json({ error: 'Error al eliminar el tema' }, 500)
  }
})

app.get('/make-server-3467f1c6/forums/:id/posts', async (c) => {
  try {
    const forumId = c.req.param('id')
    const posts = await kv.getByPrefix(`forum_post:${forumId}:`)
    const sorted = posts.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    return c.json(sorted)
  } catch (error) {
    console.log('Error fetching forum posts:', error)
    return c.json({ error: 'Error fetching posts' }, 500)
  }
})

app.post('/make-server-3467f1c6/forums/:id/posts', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const profile = await getUserProfile(user.id)
    if (!profile) {
      return c.json({ error: 'Perfil no encontrado' }, 404)
    }

    const forumId = c.req.param('id')
    const { content } = await c.req.json()
    const postId = crypto.randomUUID()
    
    const post = {
      id: postId,
      forumId,
      content,
      userId: user.id,
      userName: profile.name,
      userPhoto: profile.profilePhoto,
      createdAt: new Date().toISOString()
    }

    await kv.set(`forum_post:${forumId}:${postId}`, post)
    
    // Update forum's postCount and updatedAt
    const forum = await kv.get(`forum:${forumId}`)
    if (forum) {
      forum.postCount = (forum.postCount || 0) + 1
      forum.updatedAt = new Date().toISOString()
      await kv.set(`forum:${forumId}`, forum)
    }

    return c.json(post)
  } catch (error) {
    console.log('Error creating forum post:', error)
    return c.json({ error: 'Error creating post' }, 500)
  }
})

app.delete('/make-server-3467f1c6/forums/:forumId/posts/:postId', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const profile = await getUserProfile(user.id)
    const forumId = c.req.param('forumId')
    const postId = c.req.param('postId')
    const post = await kv.get(`forum_post:${forumId}:${postId}`)

    if (!post) {
      return c.json({ error: 'Post no encontrado' }, 404)
    }

    if (profile.role !== 'admin' && post.userId !== user.id) {
      return c.json({ error: 'No autorizado para eliminar este post' }, 403)
    }

    await kv.del(`forum_post:${forumId}:${postId}`)
    
    // Update forum's postCount
    const forum = await kv.get(`forum:${forumId}`)
    if (forum) {
      forum.postCount = Math.max((forum.postCount || 1) - 1, 0)
      await kv.set(`forum:${forumId}`, forum)
    }

    return c.json({ success: true })
  } catch (error) {
    console.log('Error deleting forum post:', error)
    return c.json({ error: 'Error deleting post' }, 500)
  }
})

// DELETE Forum - Admin or Author can delete entire forum
app.delete('/make-server-3467f1c6/forums/:forumId', async (c: any) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'No autorizado' }, 401)
    }

    const profile = await getUserProfile(user.id)
    const forumId = c.req.param('forumId')
    const forum = await kv.get(`forum:${forumId}`)
    
    if (!forum) {
      return c.json({ error: 'Foro no encontrado' }, 404)
    }

    // Check permissions: admin or forum author
    if (profile.role !== 'admin' && forum.authorId !== user.id) {
      return c.json({ error: 'No tienes permiso para eliminar este foro' }, 403)
    }

    // Delete all posts in the forum
    const forumPosts = await kv.getByPrefix(`forum_post:${forumId}:`)
    for (const post of forumPosts) {
      await kv.del(`forum_post:${forumId}:${post.id}`)
    }

    // Delete the forum itself
    await kv.del(`forum:${forumId}`)

    // Log moderation action if admin
    if (profile.role === 'admin') {
      const logId = crypto.randomUUID()
      await kv.set(`moderation_log:${logId}`, {
        id: logId,
        action: 'delete_post',
        contentType: 'forum',
        contentId: forumId,
        contentTitle: forum.topic,
        reason: 'Eliminado por administrador',
        performedAt: new Date().toISOString(),
        performedBy: user.id,
        performedByName: profile.name
      })
    }

    console.log(`Forum ${forumId} deleted successfully by ${profile.name}`)
    return c.json({ success: true, message: 'Foro eliminado correctamente' })
  } catch (error) {
    console.error('Error deleting forum:', error)
    return c.json({ error: 'Error al eliminar el foro' }, 500)
  }
})

// Comments routes for News
app.get('/make-server-3467f1c6/news/:id/comments', async (c) => {
  try {
    const newsId = c.req.param('id')
    const comments = await kv.getByPrefix(`comment:news:${newsId}:`)
    const sorted = comments.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    return c.json(sorted)
  } catch (error) {
    console.log('Error fetching news comments:', error)
    return c.json({ error: 'Error fetching comments' }, 500)
  }
})

app.post('/make-server-3467f1c6/news/:id/comments', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const profile = await getUserProfile(user.id)
    if (!profile) {
      return c.json({ error: 'Perfil no encontrado' }, 404)
    }

    const newsId = c.req.param('id')
    const { content } = await c.req.json()
    
    if (!content || !content.trim()) {
      return c.json({ error: 'El comentario no puede estar vacío' }, 400)
    }

    const commentId = crypto.randomUUID()
    
    const comment = {
      id: commentId,
      newsId,
      content,
      userId: user.id,
      userName: profile.name,
      userPhoto: profile.profilePhoto,
      createdAt: new Date().toISOString()
    }

    await kv.set(`comment:news:${newsId}:${commentId}`, comment)
    
    // Create notification for post author
    const news = await kv.get(`news:${newsId}`)
    if (news && news.authorId !== user.id) {
      await createNotification(news.authorId, 'comment', {
        postType: 'news',
        postId: newsId,
        postTitle: news.title,
        commenterId: user.id,
        commenterName: profile.name,
        commenterPhoto: profile.profilePhoto,
        commentContent: content.substring(0, 100)
      })
    }
    
    return c.json(comment)
  } catch (error) {
    console.log('Error creating news comment:', error)
    return c.json({ error: 'Error creating comment' }, 500)
  }
})

app.delete('/make-server-3467f1c6/news/:newsId/comments/:commentId', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const profile = await getUserProfile(user.id)
    const newsId = c.req.param('newsId')
    const commentId = c.req.param('commentId')
    const comment = await kv.get(`comment:news:${newsId}:${commentId}`)

    if (!comment) {
      return c.json({ error: 'Comentario no encontrado' }, 404)
    }

    if (profile.role !== 'admin' && comment.userId !== user.id) {
      return c.json({ error: 'No autorizado para eliminar este comentario' }, 403)
    }

    await kv.del(`comment:news:${newsId}:${commentId}`)
    return c.json({ success: true })
  } catch (error) {
    console.log('Error deleting news comment:', error)
    return c.json({ error: 'Error deleting comment' }, 500)
  }
})

// Comments routes for Alerts
app.get('/make-server-3467f1c6/alerts/:id/comments', async (c) => {
  try {
    const alertId = c.req.param('id')
    const comments = await kv.getByPrefix(`comment:alert:${alertId}:`)
    const sorted = comments.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    return c.json(sorted)
  } catch (error) {
    console.log('Error fetching alert comments:', error)
    return c.json({ error: 'Error fetching comments' }, 500)
  }
})

app.post('/make-server-3467f1c6/alerts/:id/comments', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const profile = await getUserProfile(user.id)
    if (!profile) {
      return c.json({ error: 'Perfil no encontrado' }, 404)
    }

    const alertId = c.req.param('id')
    const { content } = await c.req.json()
    
    if (!content || !content.trim()) {
      return c.json({ error: 'El comentario no puede estar vacío' }, 400)
    }

    const commentId = crypto.randomUUID()
    
    const comment = {
      id: commentId,
      alertId,
      content,
      userId: user.id,
      userName: profile.name,
      userPhoto: profile.profilePhoto,
      createdAt: new Date().toISOString()
    }

    await kv.set(`comment:alert:${alertId}:${commentId}`, comment)
    
    // Create notification for alert author
    const alert = await kv.get(`alert:${alertId}`)
    if (alert && alert.authorId !== user.id) {
      await createNotification(alert.authorId, 'comment', {
        postType: 'alert',
        postId: alertId,
        postTitle: alert.message?.substring(0, 50),
        commenterId: user.id,
        commenterName: profile.name,
        commenterPhoto: profile.profilePhoto,
        commentContent: content.substring(0, 100)
      })
    }
    
    return c.json(comment)
  } catch (error) {
    console.log('Error creating alert comment:', error)
    return c.json({ error: 'Error creating comment' }, 500)
  }
})

app.delete('/make-server-3467f1c6/alerts/:alertId/comments/:commentId', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const profile = await getUserProfile(user.id)
    const alertId = c.req.param('alertId')
    const commentId = c.req.param('commentId')
    const comment = await kv.get(`comment:alert:${alertId}:${commentId}`)

    if (!comment) {
      return c.json({ error: 'Comentario no encontrado' }, 404)
    }

    if (profile.role !== 'admin' && comment.userId !== user.id) {
      return c.json({ error: 'No autorizado para eliminar este comentario' }, 403)
    }

    await kv.del(`comment:alert:${alertId}:${commentId}`)
    return c.json({ success: true })
  } catch (error) {
    console.log('Error deleting alert comment:', error)
    return c.json({ error: 'Error deleting comment' }, 500)
  }
})

// Update user profile (including profile photo)
app.post('/make-server-3467f1c6/auth/update-profile', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const profile = await getUserProfile(user.id)
    if (!profile) {
      return c.json({ error: 'Perfil no encontrado' }, 404)
    }

    const { profilePhoto, bio, location, interests } = await c.req.json()

    // Update profile with new data
    const updatedProfile = {
      ...profile,
      profilePhoto: profilePhoto || profile.profilePhoto,
      bio: bio !== undefined ? bio : profile.bio,
      location: location !== undefined ? location : profile.location,
      interests: interests !== undefined ? interests : profile.interests
    }

    await kv.set(`user:${user.id}`, updatedProfile)
    return c.json(updatedProfile)
  } catch (error) {
    console.log('Error updating profile:', error)
    return c.json({ error: 'Error updating profile' }, 500)
  }
})

// Get public user profile
app.get('/make-server-3467f1c6/users/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const profile = await getUserProfile(userId)
    
    if (!profile) {
      return c.json({ error: 'Usuario no encontrado' }, 404)
    }

    // Get follower/following counts
    const followers = await kv.getByPrefix(`follow:follower:${userId}:`)
    const following = await kv.getByPrefix(`follow:following:${userId}:`)

    // Calculate total reactions received on user's posts
    const newsItems = await kv.getByPrefix(`news:`)
    const alerts = await kv.getByPrefix(`alert:`)
    const classifieds = await kv.getByPrefix(`classified:`)
    const forums = await kv.getByPrefix(`forum:`)
    
    let totalReactions = 0
    const allPosts = [...newsItems, ...alerts, ...classifieds, ...forums]
    
    for (const post of allPosts) {
      if (post.userId === userId && post.reactions) {
        totalReactions += Object.values(post.reactions).reduce((sum: number, count: any) => sum + count, 0)
      }
    }

    // Calculate active streak (simplified - days since creation)
    const daysSinceCreation = Math.floor(
      (new Date().getTime() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    )

    // Determine user level based on activity
    let userLevel = 'nuevo'
    const userPosts = allPosts.filter(p => p.userId === userId)
    
    if (userPosts.length > 100 || daysSinceCreation > 180) {
      userLevel = 'leyenda'
    } else if (userPosts.length > 50 || daysSinceCreation > 90) {
      userLevel = 'veterano'
    } else if (userPosts.length > 10 || daysSinceCreation > 30) {
      userLevel = 'activo'
    }

    // Assign badges based on achievements
    const badges = []
    if (profile.role === 'admin') badges.push('verified')
    if (daysSinceCreation > 365) badges.push('founder')
    if (userPosts.length > 50) badges.push('top_contributor')
    if (totalReactions > 500) badges.push('helpful')

    // Return public profile info with gamification
    return c.json({
      id: profile.id,
      name: profile.name,
      profilePhoto: profile.profilePhoto,
      organization: profile.organization,
      bio: profile.bio,
      location: profile.location,
      interests: profile.interests,
      createdAt: profile.createdAt,
      followersCount: followers.length,
      followingCount: following.length,
      postsCount: userPosts.length,
      totalReactions,
      activeStreak: Math.min(daysSinceCreation, 365), // Cap at 365
      userLevel,
      badges
    })
  } catch (error) {
    console.log('Error fetching public user profile:', error)
    return c.json({ error: 'Error fetching user profile' }, 500)
  }
})

// Follow a user
app.post('/make-server-3467f1c6/users/:userId/follow', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const targetUserId = c.req.param('userId')
    
    if (user.id === targetUserId) {
      return c.json({ error: 'No puedes seguirte a ti mismo' }, 400)
    }

    const targetProfile = await getUserProfile(targetUserId)
    if (!targetProfile) {
      return c.json({ error: 'Usuario no encontrado' }, 404)
    }

    // Store the follow relationship both ways for efficient queries
    // follower: user who is following
    // following: user being followed
    const followId = crypto.randomUUID()
    const followData = {
      id: followId,
      followerId: user.id,
      followingId: targetUserId,
      createdAt: new Date().toISOString()
    }

    await kv.set(`follow:follower:${targetUserId}:${user.id}`, followData)
    await kv.set(`follow:following:${user.id}:${targetUserId}`, followData)

    // Create notification for followed user
    const followerProfile = await getUserProfile(user.id)
    await createNotification(targetUserId, 'follow', {
      followerId: user.id,
      followerName: followerProfile.name,
      followerPhoto: followerProfile.profilePhoto
    })

    return c.json({ success: true })
  } catch (error) {
    console.log('Error following user:', error)
    return c.json({ error: 'Error al seguir usuario' }, 500)
  }
})

// Unfollow a user
app.delete('/make-server-3467f1c6/users/:userId/follow', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const targetUserId = c.req.param('userId')

    // Remove both follow relationships
    await kv.del(`follow:follower:${targetUserId}:${user.id}`)
    await kv.del(`follow:following:${user.id}:${targetUserId}`)

    return c.json({ success: true })
  } catch (error) {
    console.log('Error unfollowing user:', error)
    return c.json({ error: 'Error al dejar de seguir' }, 500)
  }
})

// Check if current user is following a specific user
app.get('/make-server-3467f1c6/users/:userId/following-status', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ isFollowing: false })
    }

    const targetUserId = c.req.param('userId')
    const followData = await kv.get(`follow:following:${user.id}:${targetUserId}`)

    return c.json({ isFollowing: !!followData })
  } catch (error) {
    console.log('Error checking follow status:', error)
    return c.json({ error: 'Error checking follow status' }, 500)
  }
})

// Get user's posts across all sections
app.get('/make-server-3467f1c6/users/:userId/posts', async (c) => {
  try {
    const userId = c.req.param('userId')
    
    // Get all posts by this user
    const news = await kv.getByPrefix('news:')
    const alerts = await kv.getByPrefix('alert:')
    const classifieds = await kv.getByPrefix('classified:')
    const forums = await kv.getByPrefix('forum:')

    const userNews = news.filter(item => item.authorId === userId)
    const userAlerts = alerts.filter(item => item.authorId === userId)
    const userClassifieds = classifieds.filter(item => item.userId === userId)
    const userForums = forums.filter(item => item.authorId === userId)

    // Combine and sort by date
    const allPosts = [
      ...userNews.map(p => ({ ...p, type: 'news' })),
      ...userAlerts.map(p => ({ ...p, type: 'alert' })),
      ...userClassifieds.map(p => ({ ...p, type: 'classified' })),
      ...userForums.map(p => ({ ...p, type: 'forum' }))
    ].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return c.json(allPosts)
  } catch (error) {
    console.log('Error fetching user posts:', error)
    return c.json({ error: 'Error fetching user posts' }, 500)
  }
})

// ============================================
// NOTIFICATIONS SYSTEM
// ============================================

// Get user notifications
app.get('/make-server-3467f1c6/notifications', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const notifications = await kv.getByPrefix(`notification:${user.id}:`)
    const sorted = notifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    return c.json(sorted)
  } catch (error) {
    console.log('Error fetching notifications:', error)
    return c.json({ error: 'Error fetching notifications' }, 500)
  }
})

// Mark notification as read
app.post('/make-server-3467f1c6/notifications/:id/read', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const notificationId = c.req.param('id')
    const notification = await kv.get(`notification:${user.id}:${notificationId}`)
    
    if (notification) {
      notification.read = true
      await kv.set(`notification:${user.id}:${notificationId}`, notification)
    }

    return c.json({ success: true })
  } catch (error) {
    console.log('Error marking notification as read:', error)
    return c.json({ error: 'Error updating notification' }, 500)
  }
})

// Mark all notifications as read
app.post('/make-server-3467f1c6/notifications/read-all', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const notifications = await kv.getByPrefix(`notification:${user.id}:`)
    
    for (const notification of notifications) {
      notification.read = true
      await kv.set(`notification:${user.id}:${notification.id}`, notification)
    }

    return c.json({ success: true })
  } catch (error) {
    console.log('Error marking all notifications as read:', error)
    return c.json({ error: 'Error updating notifications' }, 500)
  }
})

// Helper function to create notification
async function createNotification(userId: string, type: string, data: any) {
  const notificationId = crypto.randomUUID()
  const notification = {
    id: notificationId,
    userId,
    type, // 'comment', 'reaction', 'follow', 'mention', 'share'
    data,
    read: false,
    createdAt: new Date().toISOString()
  }
  
  await kv.set(`notification:${userId}:${notificationId}`, notification)
  return notification
}

// ============================================
// PUSH NOTIFICATIONS
// ============================================

// Subscribe to push notifications
app.post('/make-server-3467f1c6/notifications/subscribe', async (c: any) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const subscription = await c.req.json()
    
    // Guardar suscripción del usuario
    const subscriptionData = {
      userId: user.id,
      subscription,
      createdAt: new Date().toISOString()
    }
    
    await kv.set(`push_subscription:${user.id}`, subscriptionData)
    console.log(`✅ Usuario ${user.id} suscrito a push notifications:`, JSON.stringify(subscription, null, 2))
    return c.json({ success: true })
  } catch (error) {
    console.log('Error subscribing to push:', error)
    return c.json({ error: 'Error subscribing' }, 500)
  }
})

// Unsubscribe from push notifications
app.post('/make-server-3467f1c6/notifications/unsubscribe', async (c: Context) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    await kv.delete(`push_subscription:${user.id}`)
    console.log(`❌ Usuario ${user.id} desuscrito de push notifications`)
    return c.json({ success: true })
  } catch (error) {
    console.log('Error unsubscribing from push:', error)
    return c.json({ error: 'Error unsubscribing' }, 500)
  }
})

// Send push notification (internal function)
async function sendPushNotification(userId: string, title: string, body: string, data: any = {}, priority: string = 'normal') {
  try {
    console.log(`🔍 Buscando suscripción para usuario: ${userId}`)
    const subscriptionData = await kv.get(`push_subscription:${userId}`)
    if (!subscriptionData || !subscriptionData.subscription) {
      console.log(`❌ No hay suscripción para usuario ${userId}`)
      return
    }
    console.log(`✅ Suscripción encontrada para usuario ${userId}`)

    const webpush = await import('web-push')
    
    // VAPID keys
    const vapidKeys = {
      publicKey: 'BKSuCU38UwbReXe4F_CNB2EiJJYgHxdcG6SWfmUxPRD3nE_DxjPbWuCetgT8J9qAyh00rzTYr3mHfcbuP0l6WBE',
      privateKey: 'cR7rcsGqnIGMxpknlzh_I90NKA5bzDjtTVGoJEDivlA'
    }

    webpush.setVapidDetails(
      'mailto:informa@app.com',
      vapidKeys.publicKey,
      vapidKeys.privateKey
    )

    const payload = JSON.stringify({
      title,
      body,
      data,
      priority,
      tag: `informa-${Date.now()}`
    })

    await webpush.sendNotification(subscriptionData.subscription, payload)
    console.log(`✅ Push enviado a usuario ${userId}`)
  } catch (error) {
    console.log(`Error enviando push a ${userId}:`, error)
    // Si falla (suscripción expirada), eliminar
    await kv.delete(`push_subscription:${userId}`)
  }
}

// Send mass push notification to all subscribed users
async function sendMassPushNotification(title: string, body: string, data: any = {}, priority: string = 'normal') {
  try {
    console.log(`🔄 Iniciando notificación masiva: "${title}" - "${body}"`)
    const subscriptions = await kv.getByPrefix('push_subscription:')
    console.log(`📢 Enviando notificación masiva a ${subscriptions.length} usuarios`)
    
    if (subscriptions.length === 0) {
      console.log('❌ No hay usuarios suscritos a notificaciones push')
      return
    }
    
    const promises = subscriptions.map(subscriptionData => {
      console.log(`📤 Enviando a usuario: ${subscriptionData.userId}`)
      return sendPushNotification(subscriptionData.userId, title, body, data, priority)
    })
    
    const results = await Promise.allSettled(promises)
    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length
    
    console.log(`✅ Notificación masiva completada: ${successful} exitosas, ${failed} fallidas`)
  } catch (error) {
    console.log('❌ Error en notificación masiva:', error)
  }
}

// ============================================
// MESSAGING / CHAT SYSTEM
// ============================================

// Get user's conversations
app.get('/make-server-3467f1c6/messages/conversations', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const conversations = await kv.getByPrefix(`conversation:${user.id}:`)
    
    // Get last message for each conversation
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conv) => {
        const messages = await kv.getByPrefix(`message:${conv.conversationId}:`)
        const lastMessage = messages.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0]
        
        const otherUserId = conv.participants.find((id: string) => id !== user.id)
        const otherUserProfile = await getUserProfile(otherUserId)
        
        // Count unread messages
        const unreadCount = messages.filter(m => 
          m.senderId !== user.id && !m.read
        ).length
        
        return {
          ...conv,
          lastMessage,
          otherUser: otherUserProfile,
          unreadCount
        }
      })
    )
    
    const sorted = conversationsWithDetails.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt || a.createdAt
      const bTime = b.lastMessage?.createdAt || b.createdAt
      return new Date(bTime).getTime() - new Date(aTime).getTime()
    })
    
    return c.json(sorted)
  } catch (error) {
    console.log('Error fetching conversations:', error)
    return c.json({ error: 'Error fetching conversations' }, 500)
  }
})

// Get messages for a conversation
app.get('/make-server-3467f1c6/messages/:conversationId', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const conversationId = c.req.param('conversationId')
    const messages = await kv.getByPrefix(`message:${conversationId}:`)
    
    const sorted = messages.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    
    // Mark messages as read
    for (const message of sorted) {
      if (message.senderId !== user.id && !message.read) {
        message.read = true
        await kv.set(`message:${conversationId}:${message.id}`, message)
      }
    }
    
    return c.json(sorted)
  } catch (error) {
    console.log('Error fetching messages:', error)
    return c.json({ error: 'Error fetching messages' }, 500)
  }
})

// Send a message
app.post('/make-server-3467f1c6/messages', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { recipientId, content, mediaUrl } = await c.req.json()
    
    if (!content && !mediaUrl) {
      return c.json({ error: 'Message cannot be empty' }, 400)
    }

    // Generate or find conversation ID
    const participants = [user.id, recipientId].sort()
    const conversationKey = participants.join(':')
    let conversation = await kv.get(`conversation_index:${conversationKey}`)
    
    if (!conversation) {
      const conversationId = crypto.randomUUID()
      conversation = {
        conversationId,
        participants,
        createdAt: new Date().toISOString()
      }
      
      await kv.set(`conversation_index:${conversationKey}`, conversation)
      await kv.set(`conversation:${user.id}:${conversationId}`, conversation)
      await kv.set(`conversation:${recipientId}:${conversationId}`, conversation)
    }

    const messageId = crypto.randomUUID()
    const message = {
      id: messageId,
      conversationId: conversation.conversationId,
      senderId: user.id,
      recipientId,
      content,
      mediaUrl,
      read: false,
      createdAt: new Date().toISOString()
    }

    await kv.set(`message:${conversation.conversationId}:${messageId}`, message)
    
    // Create notification for recipient
    const senderProfile = await getUserProfile(user.id)
    await createNotification(recipientId, 'message', {
      senderId: user.id,
      senderName: senderProfile.name,
      senderPhoto: senderProfile.profilePhoto,
      conversationId: conversation.conversationId,
      preview: content?.substring(0, 50) || '📸 Foto'
    })

    return c.json(message)
  } catch (error) {
    console.log('Error sending message:', error)
    return c.json({ error: 'Error sending message' }, 500)
  }
})

// ============================================
// SAVED POSTS / FAVORITES
// ============================================

// Save a post
app.post('/make-server-3467f1c6/saved/:postType/:postId', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const postType = c.req.param('postType') // 'news', 'alert', 'classified', 'forum'
    const postId = c.req.param('postId')
    
    const savedItem = {
      userId: user.id,
      postType,
      postId,
      savedAt: new Date().toISOString()
    }

    await kv.set(`saved:${user.id}:${postType}:${postId}`, savedItem)
    return c.json({ success: true })
  } catch (error) {
    console.log('Error saving post:', error)
    return c.json({ error: 'Error saving post' }, 500)
  }
})

// Unsave a post
app.delete('/make-server-3467f1c6/saved/:postType/:postId', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const postType = c.req.param('postType')
    const postId = c.req.param('postId')
    
    await kv.del(`saved:${user.id}:${postType}:${postId}`)
    return c.json({ success: true })
  } catch (error) {
    console.log('Error unsaving post:', error)
    return c.json({ error: 'Error unsaving post' }, 500)
  }
})

// Get user's saved posts
app.get('/make-server-3467f1c6/saved', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const savedItems = await kv.getByPrefix(`saved:${user.id}:`)
    
    // Fetch actual post data
    const postsWithData = await Promise.all(
      savedItems.map(async (item) => {
        let post = null
        
        switch (item.postType) {
          case 'news':
            post = await kv.get(`news:${item.postId}`)
            break
          case 'alert':
            post = await kv.get(`alert:${item.postId}`)
            break
          case 'classified':
            post = await kv.get(`classified:${item.postId}`)
            break
          case 'forum':
            post = await kv.get(`forum:${item.postId}`)
            break
        }
        
        return post ? { ...post, postType: item.postType, savedAt: item.savedAt } : null
      })
    )
    
    const validPosts = postsWithData.filter(p => p !== null)
    const sorted = validPosts.sort((a, b) => 
      new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    )
    
    return c.json(sorted)
  } catch (error) {
    console.log('Error fetching saved posts:', error)
    return c.json({ error: 'Error fetching saved posts' }, 500)
  }
})

// Check if post is saved
app.get('/make-server-3467f1c6/saved/:postType/:postId/status', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ isSaved: false })
    }

    const postType = c.req.param('postType')
    const postId = c.req.param('postId')
    
    const saved = await kv.get(`saved:${user.id}:${postType}:${postId}`)
    return c.json({ isSaved: !!saved })
  } catch (error) {
    console.log('Error checking saved status:', error)
    return c.json({ isSaved: false })
  }
})

// ============================================
// SHARE SYSTEM
// ============================================

// Track share
app.post('/make-server-3467f1c6/share/:postType/:postId', async (c) => {
  try {
    const postType = c.req.param('postType')
    const postId = c.req.param('postId')
    
    // Get the post and increment share count
    let post = null
    let key = ''
    
    switch (postType) {
      case 'news':
        key = `news:${postId}`
        post = await kv.get(key)
        break
      case 'alert':
        key = `alert:${postId}`
        post = await kv.get(key)
        break
      case 'classified':
        key = `classified:${postId}`
        post = await kv.get(key)
        break
      case 'forum':
        key = `forum:${postId}`
        post = await kv.get(key)
        break
    }
    
    if (post) {
      post.shareCount = (post.shareCount || 0) + 1
      await kv.set(key, post)
    }
    
    return c.json({ success: true, shareCount: post?.shareCount || 0 })
  } catch (error) {
    console.log('Error tracking share:', error)
    return c.json({ error: 'Error tracking share' }, 500)
  }
})

// ============================================
// REPORTS / MODERATION SYSTEM
// ============================================

// Report content
app.post('/make-server-3467f1c6/reports', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { contentType, contentId, reason, description } = await c.req.json()
    
    const reportId = crypto.randomUUID()
    const report = {
      id: reportId,
      reporterId: user.id,
      contentType, // 'news', 'alert', 'classified', 'forum', 'comment', 'user'
      contentId,
      reason, // 'spam', 'harassment', 'inappropriate', 'fake-news', 'other'
      description,
      status: 'pending', // 'pending', 'reviewed', 'resolved', 'dismissed'
      createdAt: new Date().toISOString()
    }

    await kv.set(`report:${reportId}`, report)
    return c.json({ success: true })
  } catch (error) {
    console.log('Error creating report:', error)
    return c.json({ error: 'Error creating report' }, 500)
  }
})

// Get all reports (admin only)
app.get('/make-server-3467f1c6/reports', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const profile = await getUserProfile(user.id)
    if (profile.role !== 'admin') {
      return c.json({ error: 'Forbidden: Admin access required' }, 403)
    }

    const reports = await kv.getByPrefix('report:')
    const sorted = reports.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    
    return c.json(sorted)
  } catch (error) {
    console.log('Error fetching reports:', error)
    return c.json({ error: 'Error fetching reports' }, 500)
  }
})

// Update report status (admin only)
app.post('/make-server-3467f1c6/reports/:reportId/status', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const profile = await getUserProfile(user.id)
    if (profile.role !== 'admin') {
      return c.json({ error: 'Forbidden: Admin access required' }, 403)
    }

    const reportId = c.req.param('reportId')
    const { status } = await c.req.json()
    
    const report = await kv.get(`report:${reportId}`)
    if (!report) {
      return c.json({ error: 'Report not found' }, 404)
    }

    report.status = status
    report.reviewedBy = user.id
    report.reviewedAt = new Date().toISOString()
    
    await kv.set(`report:${reportId}`, report)
    return c.json({ success: true })
  } catch (error) {
    console.log('Error updating report status:', error)
    return c.json({ error: 'Error updating report' }, 500)
  }
})

// Block user (admin only)
app.post('/make-server-3467f1c6/users/:userId/block', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const profile = await getUserProfile(user.id)
    if (profile.role !== 'admin') {
      return c.json({ error: 'Forbidden: Admin access required' }, 403)
    }

    const targetUserId = c.req.param('userId')
    const { duration } = await c.req.json() // duration in hours, null for permanent
    
    const blockData = {
      userId: targetUserId,
      blockedBy: user.id,
      blockedAt: new Date().toISOString(),
      expiresAt: duration ? new Date(Date.now() + duration * 60 * 60 * 1000).toISOString() : null
    }

    await kv.set(`block:${targetUserId}`, blockData)
    return c.json({ success: true })
  } catch (error) {
    console.log('Error blocking user:', error)
    return c.json({ error: 'Error blocking user' }, 500)
  }
})

// ============================================
// SEARCH SYSTEM
// ============================================

// Global search
app.get('/make-server-3467f1c6/search', async (c) => {
  try {
    const query = c.req.query('q')?.toLowerCase()
    const type = c.req.query('type') // 'all', 'news', 'alerts', 'classifieds', 'forums', 'users'
    
    if (!query) {
      return c.json({ results: [] })
    }

    const results: any[] = []

    // Search news
    if (!type || type === 'all' || type === 'news') {
      const news = await kv.getByPrefix('news:')
      const matchedNews = news.filter(item => 
        item.title?.toLowerCase().includes(query) ||
        item.content?.toLowerCase().includes(query) ||
        item.authorName?.toLowerCase().includes(query)
      ).map(item => ({ ...item, resultType: 'news' }))
      results.push(...matchedNews)
    }

    // Search alerts
    if (!type || type === 'all' || type === 'alerts') {
      const alerts = await kv.getByPrefix('alert:')
      const matchedAlerts = alerts.filter(item => 
        item.message?.toLowerCase().includes(query) ||
        item.authorName?.toLowerCase().includes(query)
      ).map(item => ({ ...item, resultType: 'alert' }))
      results.push(...matchedAlerts)
    }

    // Search classifieds
    if (!type || type === 'all' || type === 'classifieds') {
      const classifieds = await kv.getByPrefix('classified:')
      const matchedClassifieds = classifieds.filter(item => 
        item.title?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.userName?.toLowerCase().includes(query)
      ).map(item => ({ ...item, resultType: 'classified' }))
      results.push(...matchedClassifieds)
    }

    // Search forums
    if (!type || type === 'all' || type === 'forums') {
      const forums = await kv.getByPrefix('forum:')
      const matchedForums = forums.filter(item => 
        item.topic?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.authorName?.toLowerCase().includes(query)
      ).map(item => ({ ...item, resultType: 'forum' }))
      results.push(...matchedForums)
    }

    // Search users
    if (!type || type === 'all' || type === 'users') {
      const users = await kv.getByPrefix('user:')
      const matchedUsers = users.filter(item => 
        item.name?.toLowerCase().includes(query) ||
        item.organization?.toLowerCase().includes(query)
      ).map(item => ({ ...item, resultType: 'user' }))
      results.push(...matchedUsers)
    }

    // Sort by relevance (for now, just by date)
    const sorted = results.sort((a, b) => {
      const aDate = new Date(a.createdAt || 0).getTime()
      const bDate = new Date(b.createdAt || 0).getTime()
      return bDate - aDate
    })

    return c.json({ results: sorted.slice(0, 50) }) // Limit to 50 results
  } catch (error) {
    console.log('Error searching:', error)
    return c.json({ error: 'Error searching' }, 500)
  }
})

// ============================================
// UNIFIED FEED / TIMELINE
// ============================================

// Get unified feed
app.get('/make-server-3467f1c6/feed', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    const filter = c.req.query('filter') // 'all', 'following'
    
    // Get all content
    const news = await kv.getByPrefix('news:')
    const alerts = await kv.getByPrefix('alert:')
    const classifieds = await kv.getByPrefix('classified:')
    const events = await kv.getByPrefix('event:')
    const forums = await kv.getByPrefix('forum:')

    let allContent = [
      ...news.map(item => ({ ...item, feedType: 'news' })),
      ...alerts.map(item => ({ ...item, feedType: 'alert' })),
      ...classifieds.map(item => ({ ...item, feedType: 'classified' })),
      ...events.map(item => ({ ...item, feedType: 'event' })),
      ...forums.map(item => ({ ...item, feedType: 'forum' }))
    ]

    // Filter by following if requested
    if (filter === 'following' && user) {
      const following = await kv.getByPrefix(`follow:following:${user.id}:`)
      const followingIds = following.map(f => f.followingId)
      
      allContent = allContent.filter(item => 
        followingIds.includes(item.authorId || item.userId)
      )
    }

    // Sort by date
    const sorted = allContent.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return c.json(sorted.slice(0, 100)) // Limit to 100 items
  } catch (error) {
    console.log('Error fetching feed:', error)
    return c.json({ error: 'Error fetching feed' }, 500)
  }
})

// ============================================
// TRENDING / POPULAR CONTENT
// ============================================

// Get trending content
app.get('/make-server-3467f1c6/trending', async (c) => {
  try {
    const timeframe = c.req.query('timeframe') || '7d' // '24h', '7d', '30d'
    
    let cutoffDate = new Date()
    switch (timeframe) {
      case '24h':
        cutoffDate.setHours(cutoffDate.getHours() - 24)
        break
      case '7d':
        cutoffDate.setDate(cutoffDate.getDate() - 7)
        break
      case '30d':
        cutoffDate.setDate(cutoffDate.getDate() - 30)
        break
    }

    const news = await kv.getByPrefix('news:')
    const alerts = await kv.getByPrefix('alert:')
    
    const recentContent = [
      ...news.map(item => ({ ...item, contentType: 'news' })),
      ...alerts.map(item => ({ ...item, contentType: 'alert' }))
    ].filter(item => new Date(item.createdAt) > cutoffDate)

    // Calculate engagement score
    const withScores = recentContent.map(item => {
      const reactions = item.reactions || {}
      const totalReactions = Object.values(reactions).reduce((a: any, b: any) => a + b, 0)
      const views = item.views || 0
      const shares = item.shareCount || 0
      
      // Weighted scoring
      const score = (totalReactions * 3) + (views * 0.1) + (shares * 5)
      
      return { ...item, engagementScore: score }
    })

    const sorted = withScores.sort((a, b) => b.engagementScore - a.engagementScore)
    
    return c.json(sorted.slice(0, 20))
  } catch (error) {
    console.log('Error fetching trending content:', error)
    return c.json({ error: 'Error fetching trending content' }, 500)
  }
})

// ============================================
// EDIT POST FUNCTIONALITY
// ============================================

// Edit news post
app.put('/make-server-3467f1c6/news/:id/edit', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const newsId = c.req.param('id')
    const news = await kv.get(`news:${newsId}`)
    
    if (!news) {
      return c.json({ error: 'Post not found' }, 404)
    }

    if (news.authorId !== user.id) {
      return c.json({ error: 'Unauthorized to edit this post' }, 403)
    }

    const { content, title } = await c.req.json()
    
    news.content = content || news.content
    news.title = title || news.title
    news.edited = true
    news.editedAt = new Date().toISOString()
    
    await kv.set(`news:${newsId}`, news)
    return c.json(news)
  } catch (error) {
    console.log('Error editing post:', error)
    return c.json({ error: 'Error editing post' }, 500)
  }
})

// Edit comment
app.put('/make-server-3467f1c6/comments/:commentType/:parentId/:commentId/edit', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const commentType = c.req.param('commentType') // 'news', 'alert'
    const parentId = c.req.param('parentId')
    const commentId = c.req.param('commentId')
    
    const comment = await kv.get(`comment:${commentType}:${parentId}:${commentId}`)
    
    if (!comment) {
      return c.json({ error: 'Comment not found' }, 404)
    }

    if (comment.userId !== user.id) {
      return c.json({ error: 'Unauthorized to edit this comment' }, 403)
    }

    const { content } = await c.req.json()
    
    comment.content = content
    comment.edited = true
    comment.editedAt = new Date().toISOString()
    
    await kv.set(`comment:${commentType}:${parentId}:${commentId}`, comment)
    return c.json(comment)
  } catch (error) {
    console.log('Error editing comment:', error)
    return c.json({ error: 'Error editing comment' }, 500)
  }
})

// ============================================
// NOTIFICATIONS
// ============================================

// Get user notifications
app.get('/make-server-3467f1c6/notifications', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const notifications = await kv.getByPrefix(`notification:${user.id}:`)
    
    // Sort by date (newest first)
    const sorted = notifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return c.json(sorted)
  } catch (error) {
    console.log('Error fetching notifications:', error)
    return c.json({ error: 'Error fetching notifications' }, 500)
  }
})

// Mark notification as read
app.post('/make-server-3467f1c6/notifications/:notificationId/read', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const notificationId = c.req.param('notificationId')
    const notification = await kv.get(`notification:${user.id}:${notificationId}`)
    
    if (!notification) {
      return c.json({ error: 'Notification not found' }, 404)
    }

    notification.read = true
    await kv.set(`notification:${user.id}:${notificationId}`, notification)
    
    return c.json({ success: true })
  } catch (error) {
    console.log('Error marking notification as read:', error)
    return c.json({ error: 'Error marking notification as read' }, 500)
  }
})

// Mark all notifications as read
app.post('/make-server-3467f1c6/notifications/read-all', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const notifications = await kv.getByPrefix(`notification:${user.id}:`)
    
    for (const notification of notifications) {
      notification.read = true
      await kv.set(`notification:${user.id}:${notification.id}`, notification)
    }
    
    return c.json({ success: true })
  } catch (error) {
    console.log('Error marking all notifications as read:', error)
    return c.json({ error: 'Error marking all notifications as read' }, 500)
  }
})

// ============================================
// PUBLIC ENDPOINTS (No auth required)
// ============================================

// Get public news post
app.get('/make-server-3467f1c6/public/news/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const post = await kv.get(`news:${id}`)
    
    if (!post) {
      return c.json({ error: 'Not found' }, 404)
    }

    // Get author info
    const author = await kv.get(`user:${post.authorId}`)
    
    // Increment views
    const updatedPost = {
      ...post,
      views: (post.views || 0) + 1
    }
    await kv.set(`news:${id}`, updatedPost)

    return c.json({
      ...updatedPost,
      author: author ? {
        id: author.id,
        name: author.name,
        profile_photo: author.profilePhoto
      } : null
    })
  } catch (error) {
    console.log('Error fetching public news:', error)
    return c.json({ error: 'Error fetching content' }, 500)
  }
})

// Get public alert
app.get('/make-server-3467f1c6/public/alert/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const post = await kv.get(`alert:${id}`)
    
    if (!post) {
      return c.json({ error: 'Not found' }, 404)
    }

    // Get author info
    const author = await kv.get(`user:${post.authorId}`)
    
    // Increment views
    const updatedPost = {
      ...post,
      views: (post.views || 0) + 1
    }
    await kv.set(`alert:${id}`, updatedPost)

    return c.json({
      ...updatedPost,
      author: author ? {
        id: author.id,
        name: author.name,
        profile_photo: author.profilePhoto
      } : null
    })
  } catch (error) {
    console.log('Error fetching public alert:', error)
    return c.json({ error: 'Error fetching content' }, 500)
  }
})

// Get public classified
app.get('/make-server-3467f1c6/public/classified/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const post = await kv.get(`classified:${id}`)
    
    if (!post) {
      return c.json({ error: 'Not found' }, 404)
    }

    // Get author info
    const author = await kv.get(`user:${post.authorId}`)
    
    // Increment views
    const updatedPost = {
      ...post,
      views: (post.views || 0) + 1
    }
    await kv.set(`classified:${id}`, updatedPost)

    return c.json({
      ...updatedPost,
      author: author ? {
        id: author.id,
        name: author.name,
        profile_photo: author.profilePhoto
      } : null
    })
  } catch (error) {
    console.log('Error fetching public classified:', error)
    return c.json({ error: 'Error fetching content' }, 500)
  }
})

// Get public forum post
app.get('/make-server-3467f1c6/public/forum/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const post = await kv.get(`forum:${id}`)
    
    if (!post) {
      return c.json({ error: 'Not found' }, 404)
    }

    // Get author info
    const author = await kv.get(`user:${post.authorId}`)
    
    // Increment views
    const updatedPost = {
      ...post,
      views: (post.views || 0) + 1
    }
    await kv.set(`forum:${id}`, updatedPost)

    return c.json({
      ...updatedPost,
      author: author ? {
        id: author.id,
        name: author.name,
        profile_photo: author.profilePhoto
      } : null
    })
  } catch (error) {
    console.log('Error fetching public forum post:', error)
    return c.json({ error: 'Error fetching content' }, 500)
  }
})

Deno.serve(app.fetch)
