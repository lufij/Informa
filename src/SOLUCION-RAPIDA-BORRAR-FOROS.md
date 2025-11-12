# ⚡ SOLUCIÓN RÁPIDA: Borrar Foros como Admin

## 🎯 El Problema
Cuando haces clic en el ícono de basura 🗑️ para eliminar un foro, aparece "Error al eliminar el tema".

## 🔍 Causa del Error
La IA de Visual Studio agregó el ícono de basura, pero:
- ❌ NO creó la ruta en el backend
- ❌ NO conectó el botón con la función de eliminar

## ✅ SOLUCIÓN EN 2 ARCHIVOS

---

## 📄 ARCHIVO 1: Backend

**Archivo:** `/supabase/functions/server/index.tsx`

**Busca esta línea:** Aproximadamente línea 1237, después de `app.delete('/make-server-3467f1c6/forums/:forumId/posts/:postId'`

**AGREGA este código DESPUÉS de esa ruta:**

```typescript
// DELETE Forum - Admin or Author
app.delete('/make-server-3467f1c6/forums/:forumId', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) return c.json({ error: 'No autorizado' }, 401)

    const profile = await getUserProfile(user.id)
    const forumId = c.req.param('forumId')
    const forum = await kv.get(`forum:${forumId}`)
    
    if (!forum) return c.json({ error: 'Foro no encontrado' }, 404)
    if (profile.role !== 'admin' && forum.authorId !== user.id) {
      return c.json({ error: 'Sin permiso' }, 403)
    }

    // Delete all posts
    const posts = await kv.getByPrefix(`forum_post:${forumId}:`)
    for (const post of posts) {
      await kv.del(`forum_post:${forumId}:${post.id}`)
    }

    // Delete forum
    await kv.del(`forum:${forumId}`)

    // Log moderation
    if (profile.role === 'admin') {
      const logId = crypto.randomUUID()
      await kv.set(`moderation_log:${logId}`, {
        id: logId,
        action: 'delete_post',
        contentType: 'forum',
        contentId: forumId,
        contentTitle: forum.topic,
        performedAt: new Date().toISOString(),
        performedBy: user.id,
        performedByName: profile.name
      })
    }

    return c.json({ success: true })
  } catch (error) {
    console.error('Error deleting forum:', error)
    return c.json({ error: 'Error al eliminar' }, 500)
  }
})
```

---

## 📄 ARCHIVO 2: PostActions (Agregar botón de eliminar)

**Archivo:** `/components/PostActions.tsx`

### Paso 2.1: Actualizar la interfaz (línea 11)

**BUSCA:**
```typescript
interface PostActionsProps {
  postType: 'news' | 'alert' | 'classified' | 'forum'
  postId: string
  token: string | null
  isAuthor?: boolean
  onEdit?: () => void
  className?: string
  contactPhone?: string
  recipientId?: string
  recipientName?: string
}
```

**REEMPLAZA POR:**
```typescript
interface PostActionsProps {
  postType: 'news' | 'alert' | 'classified' | 'forum'
  postId: string
  token: string | null
  isAuthor?: boolean
  isAdmin?: boolean       // ← NUEVA
  onEdit?: () => void
  onDelete?: () => void   // ← NUEVA
  className?: string
  contactPhone?: string
  recipientId?: string
  recipientName?: string
}
```

### Paso 2.2: Actualizar la función (línea 23)

**BUSCA:**
```typescript
export function PostActions({ postType, postId, token, isAuthor, onEdit, className = '', contactPhone, recipientId, recipientName }: PostActionsProps) {
```

**REEMPLAZA POR:**
```typescript
export function PostActions({ postType, postId, token, isAuthor, isAdmin, onEdit, onDelete, className = '', contactPhone, recipientId, recipientName }: PostActionsProps) {
```

### Paso 2.3: Agregar imports (línea 3)

**BUSCA:**
```typescript
import { Bookmark, Share2, Flag, Edit, Copy, Check, MessageCircle, Phone } from 'lucide-react'
```

**REEMPLAZA POR:**
```typescript
import { Bookmark, Share2, Flag, Edit, Copy, Check, MessageCircle, Phone, Trash2 } from 'lucide-react'
```

### Paso 2.4: Agregar el botón de eliminar (línea ~352, DESPUÉS del botón Editar)

**BUSCA:**
```typescript
        {/* Edit Button (only for authors) */}
        {isAuthor && onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="text-xs text-gray-600 hover:text-purple-700 h-8 px-2"
          >
            <Edit className="w-3.5 h-3.5 mr-0.5" />
            <span className="text-[11px]">Editar</span>
          </Button>
        )}

        {/* Report Button */}
```

**REEMPLAZA POR:**
```typescript
        {/* Edit Button (only for authors) */}
        {isAuthor && onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="text-xs text-gray-600 hover:text-purple-700 h-8 px-2"
          >
            <Edit className="w-3.5 h-3.5 mr-0.5" />
            <span className="text-[11px]">Editar</span>
          </Button>
        )}

        {/* Delete Button (admin or author) */}
        {(isAuthor || isAdmin) && onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
          >
            <Trash2 className="w-3.5 h-3.5 mr-0.5" />
            <span className="text-[11px]">Eliminar</span>
          </Button>
        )}

        {/* Report Button */}
```

---

## 📄 ARCHIVO 3: ForumsSection (Conectar el botón)

**Archivo:** `/components/ForumsSection.tsx`

**BUSCA (línea ~395):**
```typescript
            {/* Post Actions for Forum */}
            <div className="border-t-2 border-gray-100 pt-3 mt-4">
              <PostActions
                postType="news"
                postId={selectedForum.id}
                token={token}
                isAuthor={selectedForum.authorId === userProfile?.id}
                onEdit={() => {
                  setEditingForum(selectedForum)
                  setShowEditDialog(true)
                }}
                className="justify-end"
              />
            </div>
```

**REEMPLAZA POR:**
```typescript
            {/* Post Actions for Forum */}
            <div className="border-t-2 border-gray-100 pt-3 mt-4">
              <PostActions
                postType="forum"
                postId={selectedForum.id}
                token={token}
                isAuthor={selectedForum.authorId === userProfile?.id}
                isAdmin={userProfile?.role === 'admin'}
                onEdit={() => {
                  setEditingForum(selectedForum)
                  setShowEditDialog(true)
                }}
                onDelete={async () => {
                  if (!confirm('¿Estás seguro de eliminar este foro? Se eliminarán todas las respuestas.')) {
                    return
                  }
                  
                  try {
                    const response = await fetch(
                      `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/forums/${selectedForum.id}`,
                      {
                        method: 'DELETE',
                        headers: {
                          'Authorization': `Bearer ${token}`
                        }
                      }
                    )

                    if (response.ok) {
                      toast.success('🗑️ Foro eliminado')
                      setSelectedForum(null)
                      setForums(forums.filter(f => f.id !== selectedForum.id))
                    } else {
                      const error = await response.json()
                      toast.error(error.error || 'Error al eliminar')
                    }
                  } catch (error) {
                    console.error('Error:', error)
                    toast.error('Error al eliminar')
                  }
                }}
                className="justify-end"
              />
            </div>
```

---

## 🎯 Para la IA de Visual Studio

Copia y pega esto:

```
Necesito arreglar la funcionalidad de borrar foros como admin. Hay 3 archivos que modificar:

PASO 1 - Backend (/supabase/functions/server/index.tsx):
Después de la línea 1237 (después de app.delete('/make-server-3467f1c6/forums/:forumId/posts/:postId')), agrega:

app.delete('/make-server-3467f1c6/forums/:forumId', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) return c.json({ error: 'No autorizado' }, 401)
    const profile = await getUserProfile(user.id)
    const forumId = c.req.param('forumId')
    const forum = await kv.get(`forum:${forumId}`)
    if (!forum) return c.json({ error: 'Foro no encontrado' }, 404)
    if (profile.role !== 'admin' && forum.authorId !== user.id) {
      return c.json({ error: 'Sin permiso' }, 403)
    }
    const posts = await kv.getByPrefix(`forum_post:${forumId}:`)
    for (const post of posts) {
      await kv.del(`forum_post:${forumId}:${post.id}`)
    }
    await kv.del(`forum:${forumId}`)
    if (profile.role === 'admin') {
      const logId = crypto.randomUUID()
      await kv.set(`moderation_log:${logId}`, {
        id: logId,
        action: 'delete_post',
        contentType: 'forum',
        contentId: forumId,
        contentTitle: forum.topic,
        performedAt: new Date().toISOString(),
        performedBy: user.id,
        performedByName: profile.name
      })
    }
    return c.json({ success: true })
  } catch (error) {
    console.error('Error deleting forum:', error)
    return c.json({ error: 'Error al eliminar' }, 500)
  }
})

PASO 2 - PostActions (/components/PostActions.tsx):
a) Agrega a los imports: Trash2
b) Agrega a PostActionsProps: isAdmin?: boolean y onDelete?: () => void
c) Agrega a los parámetros de la función: isAdmin, onDelete
d) Después del botón Editar (línea ~352), agrega:

{(isAuthor || isAdmin) && onDelete && (
  <Button
    variant="ghost"
    size="sm"
    onClick={onDelete}
    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
  >
    <Trash2 className="w-3.5 h-3.5 mr-0.5" />
    <span className="text-[11px]">Eliminar</span>
  </Button>
)}

PASO 3 - ForumsSection (/components/ForumsSection.tsx):
En línea ~395, donde está PostActions del foro, CAMBIA:
- postType="news" → postType="forum"
- AGREGA: isAdmin={userProfile?.role === 'admin'}
- AGREGA: onDelete con la función completa que maneja el DELETE fetch

Confirma cuando termines.
```

---

## ✅ Verificación

Después de implementar:

1. Inicia sesión como admin (50404987)
2. Ve a Foros
3. Abre cualquier foro
4. Busca el botón "Eliminar" (ícono de basura 🗑️)
5. Haz clic
6. Confirma la eliminación
7. Verifica que:
   - Aparece "🗑️ Foro eliminado"
   - Regresa a la lista de foros
   - El foro ya no está en la lista

---

## 🚨 Errores Comunes

**"Error al eliminar"** → Verifica que agregaste la ruta en el backend
**Botón no aparece** → Verifica que pasas isAdmin y onDelete
**"Sin permiso"** → Verifica que estás logueado como admin

---

**Archivos modificados:**
1. `/supabase/functions/server/index.tsx`
2. `/components/PostActions.tsx`
3. `/components/ForumsSection.tsx`

**Tiempo:** 10 minutos
