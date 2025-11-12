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

// Helper function to get category name
function getCategoryName(category: string): string {
  const names: Record<string, string> = {
    'salseo': 'El Salseo',
    'trend': 'Trend & Tips',
    'deportes': 'Vibra Deportiva'
  }
  return names[category] || 'Noticia'
}

// Helper function to get user profile
async function getUserProfile(userId: string) {
  const profile = await kv.get(`user:${userId}`)
  
  if (!profile) {
    console.log(`⚠️ Profile not found for user: ${userId}`)
    return null
  }
  
  console.log(`📋 getUserProfile - Perfil antes de checks:`, {
    userId,
    phone: profile.phone,
    role: profile.role,
    name: profile.name
  })
  
  // Auto-assign ADMIN role to main administrator (50404987)
  if (profile.phone === '50404987') {
    if (profile.role !== 'admin') {
      console.log(`👑 AUTO-ASIGNANDO ADMIN a ${profile.phone}`)
      profile.role = 'admin'
      await kv.set(`user:${userId}`, profile)
      console.log(`✅ Admin role asignado exitosamente a ${profile.phone}`)
    } else {
      console.log(`✅ Usuario ${profile.phone} ya es ADMIN`)
    }
  }
  
  // Auto-assign firefighter role to Bomberos Voluntarios Gualán account
  if (profile.email === '79332213@informa.local' || profile.name?.includes('79332213')) {
    if (profile.role !== 'firefighter' && profile.role !== 'admin') {
      console.log(`🚒 Auto-asignando firefighter role a ${profile.phone || profile.email}`)
      profile.role = 'firefighter'
      await kv.set(`user:${userId}`, profile)
    }
  }
  
  console.log(`📋 getUserProfile - Perfil FINAL:`, {
    userId,
    phone: profile.phone,
    role: profile.role,
    name: profile.name
  })
  
  return profile
}

// Helper function to check if user is banned or blocked
async function checkUserRestrictions(userId: string) {
  const profile = await getUserProfile(userId)
  
  if (!profile) {
    return { allowed: false, error: 'Perfil no encontrado', status: 404 }
  }
  
  // Check if user is banned
  if (profile.banned) {
    return { 
      allowed: false, 
      error: 'Tu cuenta ha sido baneada permanentemente. Contacta a un administrador si crees que es un error.', 
      status: 403 
    }
  }
  
  // Check if user is blocked
  const blockData = await kv.get(`block:${userId}`)
  if (blockData) {
    // Check if block has expired
    if (!blockData.expiresAt || new Date(blockData.expiresAt) > new Date()) {
      const expiryMsg = blockData.expiresAt 
        ? ` hasta ${new Date(blockData.expiresAt).toLocaleString('es-GT')}` 
        : ' permanentemente'
      return { 
        allowed: false, 
        error: `Tu cuenta está bloqueada${expiryMsg}.`, 
        status: 403 
      }
    } else {
      // Block has expired, remove it
      await kv.del(`block:${userId}`)
    }
  }
  
  return { allowed: true, profile }
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

// Get user stats (public)
app.get('/make-server-3467f1c6/users/:userId/stats', async (c) => {
  try {
    const userId = c.req.param('userId')
    
    // Get user profile
    const profile = await getUserProfile(userId)
    if (!profile) {
      return c.json({ error: 'User not found' }, 404)
    }

    // Count total posts across all content types
    const allNews = await kv.getByPrefix('news:')
    const allAlerts = await kv.getByPrefix('alert:')
    const allClassifieds = await kv.getByPrefix('classified:')
    const allForums = await kv.getByPrefix('forum:')
    const allEvents = await kv.getByPrefix('event:')

    const userNews = allNews.filter((n: any) => n.authorId === userId)
    const userAlerts = allAlerts.filter((a: any) => a.authorId === userId)
    const userClassifieds = allClassifieds.filter((c: any) => c.userId === userId)
    const userForums = allForums.filter((f: any) => f.authorId === userId)
    const userEvents = allEvents.filter((e: any) => e.authorId === userId)

    const totalPosts = userNews.length + userAlerts.length + userClassifieds.length + userForums.length + userEvents.length

    // Count total reactions received
    let totalReactions = 0
    
    // News reactions
    userNews.forEach((n: any) => {
      if (n.reactions) {
        totalReactions += Object.values(n.reactions).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0)
      }
    })
    
    // Alert reactions
    userAlerts.forEach((a: any) => {
      if (a.reactions) {
        totalReactions += Object.values(a.reactions).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0)
      }
    })
    
    // Forum reactions
    userForums.forEach((f: any) => {
      if (f.reactions) {
        totalReactions += Object.values(f.reactions).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0)
      }
    })

    // Count total comments made (simplified - just count across all posts)
    // In a real app, you'd have a separate comments collection
    const totalComments = 0 // Placeholder for now

    return c.json({
      totalPosts,
      totalReactions,
      totalComments,
      bio: profile.bio || '',
      location: profile.location || '',
      memberSince: profile.createdAt || profile.created_at || new Date().toISOString()
    })
  } catch (error) {
    console.log('Error fetching user stats:', error)
    return c.json({ error: 'Error fetching stats' }, 500)
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

// Fix phone field for all existing users (migration endpoint)
app.post('/make-server-3467f1c6/auth/fix-phone-fields', async (c) => {
  try {
    console.log('🔧 Iniciando migración de campos phone...')
    
    // Get all users
    const allUsers = await kv.getByPrefix('user:')
    console.log(`📋 Encontrados ${allUsers.length} usuarios`)
    
    let fixedCount = 0
    
    for (const user of allUsers) {
      // If phone field is missing or undefined, extract from email
      if (!user.phone && user.email) {
        const phoneFromEmail = user.email.split('@')[0]
        user.phone = phoneFromEmail
        await kv.set(`user:${user.id}`, user)
        console.log(`✅ Actualizado usuario ${user.id} con phone: ${phoneFromEmail}`)
        fixedCount++
      }
    }
    
    console.log(`🎉 Migración completada: ${fixedCount} usuarios actualizados`)
    
    return c.json({ 
      success: true, 
      message: `Migración completada: ${fixedCount} usuarios actualizados de ${allUsers.length} totales`,
      fixed: fixedCount,
      total: allUsers.length
    })
  } catch (error) {
    console.log('❌ Error durante migración de phone fields:', error)
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

// News routes
app.get('/make-server-3467f1c6/news', async (c) => {
  try {
    const newsItems = await kv.getByPrefix('news:')
    // Filter out hidden content
    const visible = newsItems.filter(item => !item.hidden)
    // Sort by createdAt descending
    const sorted = visible.sort((a, b) => 
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

    // Check user restrictions
    const check = await checkUserRestrictions(user.id)
    if (!check.allowed) {
      return c.json({ error: check.error }, check.status)
    }
    
    const profile = check.profile

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
    
    // Send push notification to all users (except author) for important news
    if (category === 'salseo' || category === 'trend') {
      // Use setTimeout to not block response
      setTimeout(async () => {
        await broadcastPushNotification(
          user.id,
          `🔥 Nueva noticia: ${getCategoryName(category)}`,
          title.substring(0, 100),
          {
            url: '/?section=noticias&id=' + newsId,
            tag: 'news-' + newsId,
            requireInteraction: false
          }
        )
      }, 0)
    }
    
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
      news.reactions[reaction] = (news.reactions[reaction] || 0) + 1
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
    // Filter out expired and hidden alerts
    const now = new Date()
    const active = alerts.filter(alert => {
      if (alert.hidden) return false
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

    // Check user restrictions
    const check = await checkUserRestrictions(user.id)
    if (!check.allowed) {
      return c.json({ error: check.error }, check.status)
    }
    
    const profile = check.profile

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
    
    // Send push notification to ALL users for important alerts
    if (priority === 'critica' || priority === 'alta' || isEmergency) {
      setTimeout(async () => {
        await broadcastPushNotification(
          user.id,
          `🚨 ${priority === 'critica' ? 'ALERTA CRÍTICA' : 'Alerta Importante'}`,
          (title || message || description).substring(0, 100),
          {
            url: '/?section=alertas&id=' + alertId,
            tag: 'alert-' + alertId,
            requireInteraction: priority === 'critica' // Critical alerts stay visible
          }
        )
      }, 0)
    }
    
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

    const { description, mediaUrls } = await c.req.json()
    
    const updatedAlert = {
      ...alert,
      description: description || alert.description,
      message: description || alert.message,
      mediaUrls: mediaUrls || alert.mediaUrls,
      updatedAt: new Date().toISOString()
    }

    await kv.set(`alert:${alertId}`, updatedAlert)
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
      alert.reactions[reaction]++
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
    // Filter out hidden content
    const visible = classifieds.filter(item => !item.hidden)
    const sorted = visible.sort((a, b) => 
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
    // Filter out hidden content
    const visible = forums.filter(item => !item.hidden)
    const sorted = visible.sort((a, b) => 
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
app.delete('/make-server-3467f1c6/forums/:forumId', async (c) => {
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
    
    // AUTO-MODERATION: Check if content has 5+ reports
    if (contentType !== 'user' && contentType !== 'comment') {
      const allReports = await kv.getByPrefix('report:')
      const contentReports = allReports.filter(r => 
        r.contentType === contentType && 
        r.contentId === contentId &&
        r.status === 'pending'
      )
      
      // If 5 or more reports, auto-hide the content
      if (contentReports.length >= 5) {
        const contentKey = `${contentType}:${contentId}`
        const content = await kv.get(contentKey)
        
        if (content && !content.hidden) {
          content.hidden = true
          content.hiddenAt = new Date().toISOString()
          content.hiddenReason = 'auto_moderation'
          content.reportCount = contentReports.length
          await kv.set(contentKey, content)
          
          // Log the action
          const logId = crypto.randomUUID()
          await kv.set(`modlog:${logId}`, {
            id: logId,
            action: 'auto_hide',
            contentType,
            contentId,
            reason: `Auto-hidden after ${contentReports.length} reports`,
            performedAt: new Date().toISOString(),
            performedBy: 'system'
          })
          
          console.log(`Auto-hidden ${contentType}:${contentId} after ${contentReports.length} reports`)
        }
      }
    }
    
    return c.json({ success: true })
  } catch (error) {
    console.log('Error creating report:', error)
    return c.json({ error: 'Error creating report' }, 500)
  }
})

// Get all reports (admin or moderator)
app.get('/make-server-3467f1c6/reports', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const profile = await getUserProfile(user.id)
    if (profile.role !== 'admin' && profile.role !== 'moderator') {
      return c.json({ error: 'Forbidden: Admin or Moderator access required' }, 403)
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

// Update report status (admin or moderator)
app.post('/make-server-3467f1c6/reports/:reportId/status', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const profile = await getUserProfile(user.id)
    if (profile.role !== 'admin' && profile.role !== 'moderator') {
      return c.json({ error: 'Forbidden: Admin or Moderator access required' }, 403)
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

// Get report count for specific content (admin or moderator)
app.get('/make-server-3467f1c6/reports/content/:contentType/:contentId', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const profile = await getUserProfile(user.id)
    if (profile.role !== 'admin' && profile.role !== 'moderator') {
      return c.json({ error: 'Forbidden: Admin or Moderator access required' }, 403)
    }

    const contentType = c.req.param('contentType')
    const contentId = c.req.param('contentId')
    
    const allReports = await kv.getByPrefix('report:')
    const contentReports = allReports.filter(r => 
      r.contentType === contentType && r.contentId === contentId
    )
    
    return c.json({ 
      count: contentReports.length,
      reports: contentReports,
      pendingCount: contentReports.filter(r => r.status === 'pending').length
    })
  } catch (error) {
    console.log('Error fetching content reports:', error)
    return c.json({ error: 'Error fetching reports' }, 500)
  }
})

// Delete post (admin or moderator)
app.delete('/make-server-3467f1c6/posts/:postType/:postId', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const profile = await getUserProfile(user.id)
    if (profile.role !== 'admin' && profile.role !== 'moderator') {
      return c.json({ error: 'Forbidden: Admin or Moderator access required' }, 403)
    }

    const postType = c.req.param('postType')
    const postId = c.req.param('postId')
    const contentKey = `${postType}:${postId}`
    
    const content = await kv.get(contentKey)
    if (!content) {
      return c.json({ error: 'Content not found' }, 404)
    }
    
    // Delete the content
    await kv.del(contentKey)
    
    // Delete all associated reactions
    const reactions = await kv.getByPrefix(`reaction:${postType}:${postId}:`)
    for (const reaction of reactions) {
      await kv.del(`reaction:${postType}:${postId}:${reaction.emoji}:${reaction.userId}`)
    }
    
    // Delete all associated comments
    const comments = await kv.getByPrefix(`comment:${postType}:${postId}:`)
    for (const comment of comments) {
      await kv.del(`comment:${postType}:${postId}:${comment.id}`)
    }
    
    // Log the action
    const logId = crypto.randomUUID()
    await kv.set(`modlog:${logId}`, {
      id: logId,
      action: 'delete_post',
      contentType: postType,
      contentId: postId,
      contentTitle: content.title || content.topic || content.message || 'Sin título',
      contentAuthor: content.authorId,
      performedAt: new Date().toISOString(),
      performedBy: user.id
    })
    
    return c.json({ success: true })
  } catch (error) {
    console.log('Error deleting post:', error)
    return c.json({ error: 'Error deleting post' }, 500)
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
    
    // Log the action
    const logId = crypto.randomUUID()
    await kv.set(`modlog:${logId}`, {
      id: logId,
      action: 'block_user',
      targetUserId,
      duration: duration ? `${duration} hours` : 'permanent',
      performedAt: new Date().toISOString(),
      performedBy: user.id
    })
    
    return c.json({ success: true })
  } catch (error) {
    console.log('Error blocking user:', error)
    return c.json({ error: 'Error blocking user' }, 500)
  }
})

// Ban user permanently (admin only)
app.post('/make-server-3467f1c6/users/:userId/ban', async (c) => {
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
    const { reason } = await c.req.json()
    
    const targetProfile = await getUserProfile(targetUserId)
    if (!targetProfile) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    // Mark user as banned
    targetProfile.banned = true
    targetProfile.bannedAt = new Date().toISOString()
    targetProfile.bannedBy = user.id
    targetProfile.banReason = reason
    await kv.set(`user:${targetUserId}`, targetProfile)
    
    // Also create a permanent block
    await kv.set(`block:${targetUserId}`, {
      userId: targetUserId,
      blockedBy: user.id,
      blockedAt: new Date().toISOString(),
      expiresAt: null, // permanent
      reason: reason
    })
    
    // Log the action
    const logId = crypto.randomUUID()
    await kv.set(`modlog:${logId}`, {
      id: logId,
      action: 'ban_user',
      targetUserId,
      targetUserName: targetProfile.name,
      reason,
      performedAt: new Date().toISOString(),
      performedBy: user.id
    })
    
    return c.json({ success: true })
  } catch (error) {
    console.log('Error banning user:', error)
    return c.json({ error: 'Error banning user' }, 500)
  }
})

// Unban user (admin only)
app.post('/make-server-3467f1c6/users/:userId/unban', async (c) => {
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
    
    const targetProfile = await getUserProfile(targetUserId)
    if (!targetProfile) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    // Remove ban
    targetProfile.banned = false
    targetProfile.unbannedAt = new Date().toISOString()
    targetProfile.unbannedBy = user.id
    await kv.set(`user:${targetUserId}`, targetProfile)
    
    // Remove block
    await kv.del(`block:${targetUserId}`)
    
    // Log the action
    const logId = crypto.randomUUID()
    await kv.set(`modlog:${logId}`, {
      id: logId,
      action: 'unban_user',
      targetUserId,
      targetUserName: targetProfile.name,
      performedAt: new Date().toISOString(),
      performedBy: user.id
    })
    
    return c.json({ success: true })
  } catch (error) {
    console.log('Error unbanning user:', error)
    return c.json({ error: 'Error unbanning user' }, 500)
  }
})

// Restore hidden post (admin or moderator)
app.post('/make-server-3467f1c6/posts/:postType/:postId/restore', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const profile = await getUserProfile(user.id)
    if (profile.role !== 'admin' && profile.role !== 'moderator') {
      return c.json({ error: 'Forbidden: Admin or Moderator access required' }, 403)
    }

    const postType = c.req.param('postType')
    const postId = c.req.param('postId')
    const contentKey = `${postType}:${postId}`
    
    const content = await kv.get(contentKey)
    if (!content) {
      return c.json({ error: 'Content not found' }, 404)
    }
    
    // Restore the content
    content.hidden = false
    content.restoredAt = new Date().toISOString()
    content.restoredBy = user.id
    await kv.set(contentKey, content)
    
    // Log the action
    const logId = crypto.randomUUID()
    await kv.set(`modlog:${logId}`, {
      id: logId,
      action: 'restore_post',
      contentType: postType,
      contentId: postId,
      performedAt: new Date().toISOString(),
      performedBy: user.id
    })
    
    return c.json({ success: true })
  } catch (error) {
    console.log('Error restoring post:', error)
    return c.json({ error: 'Error restoring post' }, 500)
  }
})

// Get moderation log (admin or moderator)
app.get('/make-server-3467f1c6/moderation-log', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const profile = await getUserProfile(user.id)
    if (profile.role !== 'admin' && profile.role !== 'moderator') {
      return c.json({ error: 'Forbidden: Admin or Moderator access required' }, 403)
    }

    const logs = await kv.getByPrefix('modlog:')
    const sorted = logs.sort((a, b) => 
      new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime()
    )
    
    // Get admin names for the logs
    const adminIds = [...new Set(sorted.map(log => log.performedBy).filter(id => id !== 'system'))]
    const adminProfiles = await Promise.all(
      adminIds.map(id => getUserProfile(id))
    )
    const adminMap = Object.fromEntries(
      adminProfiles.map(p => [p?.id, p?.name || 'Desconocido'])
    )
    
    const logsWithNames = sorted.map(log => ({
      ...log,
      performedByName: log.performedBy === 'system' ? 'Sistema' : adminMap[log.performedBy] || 'Desconocido'
    }))
    
    return c.json(logsWithNames)
  } catch (error) {
    console.log('Error fetching moderation log:', error)
    return c.json({ error: 'Error fetching log' }, 500)
  }
})

// Get all users (admin only - for assigning moderators)
app.get('/make-server-3467f1c6/admin/users', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const profile = await getUserProfile(user.id)
    if (profile.role !== 'admin') {
      return c.json({ error: 'Forbidden: Admin access required' }, 403)
    }

    const users = await kv.getByPrefix('user:')
    
    // Sort by creation date, newest first
    const sorted = users.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    
    // Return only relevant info (no sensitive data)
    const userList = sorted.map(u => ({
      id: u.id,
      name: u.name,
      phone: u.phone,
      email: u.email,
      role: u.role || 'user',
      profilePhoto: u.profilePhoto,
      createdAt: u.createdAt,
      banned: u.banned || false
    }))
    
    return c.json(userList)
  } catch (error) {
    console.log('Error fetching users:', error)
    return c.json({ error: 'Error fetching users' }, 500)
  }
})

// Assign or remove moderator role (admin only)
app.post('/make-server-3467f1c6/admin/users/:userId/moderator', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const profile = await getUserProfile(user.id)
    if (profile.role !== 'admin') {
      return c.json({ error: 'Forbidden: Only admin can assign moderators' }, 403)
    }

    const targetUserId = c.req.param('userId')
    const { action } = await c.req.json() // 'assign' or 'remove'
    
    const targetProfile = await getUserProfile(targetUserId)
    if (!targetProfile) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    // Don't allow changing admin's own role
    if (targetUserId === user.id) {
      return c.json({ error: 'Cannot modify your own role' }, 400)
    }
    
    // Don't allow changing the main admin (50404987)
    if (targetProfile.phone === '50404987') {
      return c.json({ error: 'Cannot modify main admin role' }, 400)
    }
    
    if (action === 'assign') {
      targetProfile.role = 'moderator'
      targetProfile.moderatorAssignedAt = new Date().toISOString()
      targetProfile.moderatorAssignedBy = user.id
    } else if (action === 'remove') {
      targetProfile.role = 'user'
      targetProfile.moderatorRemovedAt = new Date().toISOString()
      targetProfile.moderatorRemovedBy = user.id
    } else {
      return c.json({ error: 'Invalid action. Use "assign" or "remove"' }, 400)
    }
    
    await kv.set(`user:${targetUserId}`, targetProfile)
    
    // Log the action
    const logId = crypto.randomUUID()
    await kv.set(`modlog:${logId}`, {
      id: logId,
      action: action === 'assign' ? 'assign_moderator' : 'remove_moderator',
      targetUserId,
      targetUserName: targetProfile.name,
      performedAt: new Date().toISOString(),
      performedBy: user.id
    })
    
    return c.json({ 
      success: true, 
      message: action === 'assign' 
        ? `${targetProfile.name} ahora es moderador` 
        : `${targetProfile.name} ya no es moderador`,
      user: {
        id: targetProfile.id,
        name: targetProfile.name,
        role: targetProfile.role
      }
    })
  } catch (error) {
    console.log('Error managing moderator:', error)
    return c.json({ error: 'Error managing moderator' }, 500)
  }
})

// Change user role (admin only) - More flexible endpoint
app.put('/make-server-3467f1c6/admin/users/:userId/role', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const profile = await getUserProfile(user.id)
    if (profile.role !== 'admin') {
      return c.json({ error: 'Forbidden: Only admin can change roles' }, 403)
    }

    const targetUserId = c.req.param('userId')
    const { role } = await c.req.json()
    
    // Validate role
    const validRoles = ['user', 'moderator', 'firefighter', 'verified']
    if (!validRoles.includes(role)) {
      return c.json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` }, 400)
    }
    
    const targetProfile = await getUserProfile(targetUserId)
    if (!targetProfile) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    // Don't allow changing admin's own role
    if (targetUserId === user.id) {
      return c.json({ error: 'Cannot modify your own role' }, 400)
    }
    
    // Don't allow changing the main admin (50404987)
    if (targetProfile.phone === '50404987') {
      return c.json({ error: 'Cannot modify main admin role' }, 400)
    }
    
    const oldRole = targetProfile.role
    targetProfile.role = role
    targetProfile.roleChangedAt = new Date().toISOString()
    targetProfile.roleChangedBy = user.id
    
    await kv.set(`user:${targetUserId}`, targetProfile)
    
    // Log the action
    const logId = crypto.randomUUID()
    const actionMap: Record<string, string> = {
      'moderator': 'assign_moderator',
      'firefighter': 'assign_firefighter',
      'verified': 'assign_verified',
      'user': 'remove_special_role'
    }
    
    await kv.set(`modlog:${logId}`, {
      id: logId,
      action: actionMap[role] || 'change_role',
      targetUserId,
      targetUserName: targetProfile.name,
      reason: `Cambio de rol: ${oldRole} → ${role}`,
      performedAt: new Date().toISOString(),
      performedBy: user.id
    })
    
    const roleLabels: Record<string, string> = {
      user: 'usuario',
      moderator: 'moderador',
      firefighter: 'bombero voluntario',
      verified: 'usuario verificado'
    }
    
    return c.json({ 
      success: true, 
      message: `${targetProfile.name} ahora es ${roleLabels[role]}`,
      user: {
        id: targetProfile.id,
        name: targetProfile.name,
        role: targetProfile.role,
        oldRole
      }
    })
  } catch (error) {
    console.log('Error changing user role:', error)
    return c.json({ error: 'Error changing user role' }, 500)
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

    // Search news (exclude hidden content)
    if (!type || type === 'all' || type === 'news') {
      const news = await kv.getByPrefix('news:')
      const matchedNews = news.filter(item => 
        !item.hidden &&
        (item.title?.toLowerCase().includes(query) ||
        item.content?.toLowerCase().includes(query) ||
        item.authorName?.toLowerCase().includes(query))
      ).map(item => ({ ...item, resultType: 'news' }))
      results.push(...matchedNews)
    }

    // Search alerts (exclude hidden content)
    if (!type || type === 'all' || type === 'alerts') {
      const alerts = await kv.getByPrefix('alert:')
      const matchedAlerts = alerts.filter(item => 
        !item.hidden &&
        (item.message?.toLowerCase().includes(query) ||
        item.authorName?.toLowerCase().includes(query))
      ).map(item => ({ ...item, resultType: 'alert' }))
      results.push(...matchedAlerts)
    }

    // Search classifieds (exclude hidden content)
    if (!type || type === 'all' || type === 'classifieds') {
      const classifieds = await kv.getByPrefix('classified:')
      const matchedClassifieds = classifieds.filter(item => 
        !item.hidden &&
        (item.title?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.userName?.toLowerCase().includes(query))
      ).map(item => ({ ...item, resultType: 'classified' }))
      results.push(...matchedClassifieds)
    }

    // Search forums (exclude hidden content)
    if (!type || type === 'all' || type === 'forums') {
      const forums = await kv.getByPrefix('forum:')
      const matchedForums = forums.filter(item => 
        !item.hidden &&
        (item.topic?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.authorName?.toLowerCase().includes(query))
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
    
    // Get all content (exclude hidden items)
    const news = await kv.getByPrefix('news:')
    const alerts = await kv.getByPrefix('alert:')
    const classifieds = await kv.getByPrefix('classified:')
    const events = await kv.getByPrefix('event:')
    const forums = await kv.getByPrefix('forum:')

    let allContent = [
      ...news.filter(item => !item.hidden).map(item => ({ ...item, feedType: 'news' })),
      ...alerts.filter(item => !item.hidden).map(item => ({ ...item, feedType: 'alert' })),
      ...classifieds.filter(item => !item.hidden).map(item => ({ ...item, feedType: 'classified' })),
      ...events.filter(item => !item.hidden).map(item => ({ ...item, feedType: 'event' })),
      ...forums.filter(item => !item.hidden).map(item => ({ ...item, feedType: 'forum' }))
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

// ============================================
// NOTIFICATION PREFERENCES & NEW CONTENT CHECK
// ============================================

// Get user notification preferences
app.get('/make-server-3467f1c6/notifications/preferences', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const preferences = await kv.get(`notification_prefs:${user.id}`)
    
    // Default preferences if not set
    const defaultPrefs = {
      newNews: true,
      newAlerts: true,
      newClassifieds: true,
      newForums: true,
      comments: true,
      reactions: true,
      mentions: true,
      follows: true,
      messages: true,
      shares: true,
      pushEnabled: false,
      emailEnabled: false,
      digestMode: false,
      quietHours: false,
    }

    return c.json(preferences || defaultPrefs)
  } catch (error) {
    console.log('Error fetching notification preferences:', error)
    return c.json({ error: 'Error fetching preferences' }, 500)
  }
})

// Update user notification preferences
app.put('/make-server-3467f1c6/notifications/preferences', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const preferences = await c.req.json()
    await kv.set(`notification_prefs:${user.id}`, preferences)
    
    console.log(`✅ Notification preferences updated for user ${user.id}`)
    
    return c.json({ success: true })
  } catch (error) {
    console.log('Error updating notification preferences:', error)
    return c.json({ error: 'Error updating preferences' }, 500)
  }
})

// Check for new content since timestamp
app.get('/make-server-3467f1c6/notifications/new-content', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const sinceParam = c.req.query('since')
    const since = sinceParam ? new Date(sinceParam) : new Date(Date.now() - 3600000) // 1 hour ago default
    
    // Get user preferences
    const prefs = await kv.get(`notification_prefs:${user.id}`)
    const preferences = prefs || {
      newNews: true,
      newAlerts: true,
      newClassifieds: true,
      newForums: true,
    }

    const newContent: any[] = []

    // Check for new news (if enabled)
    if (preferences.newNews) {
      const allNews = await kv.getByPrefix('news:')
      const newNews = allNews.filter((n: any) => 
        new Date(n.createdAt) > since && !n.deleted
      )
      if (newNews.length > 0) {
        newContent.push({
          type: 'news',
          count: newNews.length,
          latestTitle: newNews[0].title,
          latestId: newNews[0].id
        })
      }
    }

    // Check for new alerts (if enabled)
    if (preferences.newAlerts) {
      const allAlerts = await kv.getByPrefix('alert:')
      const newAlerts = allAlerts.filter((a: any) => 
        new Date(a.createdAt) > since && !a.deleted
      )
      if (newAlerts.length > 0) {
        newContent.push({
          type: 'alert',
          count: newAlerts.length,
          latestTitle: newAlerts[0].content?.substring(0, 50),
          latestId: newAlerts[0].id
        })
      }
    }

    // Check for new classifieds (if enabled)
    if (preferences.newClassifieds) {
      const allClassifieds = await kv.getByPrefix('classified:')
      const newClassifieds = allClassifieds.filter((c: any) => 
        new Date(c.createdAt) > since && !c.deleted
      )
      if (newClassifieds.length > 0) {
        newContent.push({
          type: 'classified',
          count: newClassifieds.length,
          latestTitle: newClassifieds[0].title,
          latestId: newClassifieds[0].id
        })
      }
    }

    // Check for new forums (if enabled)
    if (preferences.newForums) {
      const allForums = await kv.getByPrefix('forum:')
      const newForums = allForums.filter((f: any) => 
        new Date(f.createdAt) > since && !f.deleted
      )
      if (newForums.length > 0) {
        newContent.push({
          type: 'forum',
          count: newForums.length,
          latestTitle: newForums[0].title,
          latestId: newForums[0].id
        })
      }
    }

    return c.json(newContent)
  } catch (error) {
    console.log('Error checking for new content:', error)
    return c.json({ error: 'Error checking new content' }, 500)
  }
})

// Subscribe to push notifications
app.post('/make-server-3467f1c6/notifications/subscribe-push', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { subscription } = await c.req.json()
    
    // Store push subscription
    await kv.set(`push_subscription:${user.id}`, {
      userId: user.id,
      subscription,
      createdAt: new Date().toISOString()
    })
    
    console.log(`✅ Push subscription registered for user ${user.id}`)
    
    return c.json({ success: true })
  } catch (error) {
    console.log('Error subscribing to push notifications:', error)
    return c.json({ error: 'Error subscribing to push' }, 500)
  }
})

// Unsubscribe from push notifications
app.post('/make-server-3467f1c6/notifications/unsubscribe-push', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    await kv.del(`push_subscription:${user.id}`)
    
    console.log(`✅ Push subscription removed for user ${user.id}`)
    
    return c.json({ success: true })
  } catch (error) {
    console.log('Error unsubscribing from push notifications:', error)
    return c.json({ error: 'Error unsubscribing from push' }, 500)
  }
})

// Helper function to send push notification to user
async function sendPushNotification(userId: string, title: string, body: string, data?: any) {
  try {
    const pushSub = await kv.get(`push_subscription:${userId}`)
    if (!pushSub || !pushSub.subscription) {
      return false // User not subscribed to push
    }

    // Get user preferences
    const prefs = await kv.get(`notification_prefs:${userId}`)
    if (prefs && prefs.pushEnabled === false) {
      return false // User disabled push notifications
    }

    const payload = {
      title,
      body,
      icon: '/icon-192.png',
      badge: '/icon-96.png',
      tag: data?.tag || 'informa-notification',
      requireInteraction: data?.requireInteraction || false,
      vibrate: [200, 100, 200],
      data: data || {}
    }

    // In a real implementation, you would use web-push library here
    // For now, we'll just log it (browser will handle local notifications)
    console.log(`📤 Push notification queued for user ${userId}:`, title)
    
    return true
  } catch (error) {
    console.error(`Error sending push notification to user ${userId}:`, error)
    return false
  }
}

// Helper function to send push to all subscribed users (except author)
async function broadcastPushNotification(excludeUserId: string, title: string, body: string, data?: any) {
  try {
    const allSubscriptions = await kv.getByPrefix('push_subscription:')
    let sentCount = 0

    for (const sub of allSubscriptions) {
      if (sub.userId !== excludeUserId) {
        const sent = await sendPushNotification(sub.userId, title, body, data)
        if (sent) sentCount++
      }
    }

    console.log(`📡 Broadcast push sent to ${sentCount} users`)
    return sentCount
  } catch (error) {
    console.error('Error broadcasting push notification:', error)
    return 0
  }
}

Deno.serve(app.fetch)
