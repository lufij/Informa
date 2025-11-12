# 📋 CÓDIGO LISTO PARA COPIAR Y PEGAR

## ⚡ Instrucciones Simples

1. Abre cada archivo en Visual Studio Code
2. Encuentra la línea indicada
3. Copia y pega el código
4. Guarda el archivo

---

## 📄 ARCHIVO 1: Backend

**Ruta:** `/supabase/functions/server/index.tsx`  
**Línea:** 1237 (después de `app.delete('/make-server-3467f1c6/forums/:forumId/posts/:postId'`)  
**Acción:** PEGAR este código DESPUÉS de esa ruta

```typescript
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
```

---

## 📄 ARCHIVO 2: PostActions - Parte 1 (Imports)

**Ruta:** `/components/PostActions.tsx`  
**Línea:** 3  
**Acción:** REEMPLAZAR la línea de imports

**BUSCAR:**
```typescript
import { Bookmark, Share2, Flag, Edit, Copy, Check, MessageCircle, Phone } from 'lucide-react'
```

**REEMPLAZAR POR:**
```typescript
import { Bookmark, Share2, Flag, Edit, Copy, Check, MessageCircle, Phone, Trash2 } from 'lucide-react'
```

---

## 📄 ARCHIVO 2: PostActions - Parte 2 (Interface)

**Ruta:** `/components/PostActions.tsx`  
**Línea:** 11  
**Acción:** REEMPLAZAR la interfaz completa

**BUSCAR:**
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

**REEMPLAZAR POR:**
```typescript
interface PostActionsProps {
  postType: 'news' | 'alert' | 'classified' | 'forum'
  postId: string
  token: string | null
  isAuthor?: boolean
  isAdmin?: boolean       // Permite que admins también eliminen
  onEdit?: () => void
  onDelete?: () => void   // Función para eliminar el contenido
  className?: string
  contactPhone?: string
  recipientId?: string
  recipientName?: string
}
```

---

## 📄 ARCHIVO 2: PostActions - Parte 3 (Función)

**Ruta:** `/components/PostActions.tsx`  
**Línea:** 23  
**Acción:** REEMPLAZAR la declaración de función

**BUSCAR:**
```typescript
export function PostActions({ postType, postId, token, isAuthor, onEdit, className = '', contactPhone, recipientId, recipientName }: PostActionsProps) {
```

**REEMPLAZAR POR:**
```typescript
export function PostActions({ postType, postId, token, isAuthor, isAdmin, onEdit, onDelete, className = '', contactPhone, recipientId, recipientName }: PostActionsProps) {
```

---

## 📄 ARCHIVO 2: PostActions - Parte 4 (Botón Eliminar)

**Ruta:** `/components/PostActions.tsx`  
**Línea:** ~352 (DESPUÉS del botón Editar y ANTES del botón Reportar)  
**Acción:** AGREGAR este código

**BUSCAR ESTE BLOQUE:**
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

**REEMPLAZAR POR:**
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

        {/* Delete Button (admin or author can delete) */}
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

## 📄 ARCHIVO 3: ForumsSection

**Ruta:** `/components/ForumsSection.tsx`  
**Línea:** ~395 (donde está el PostActions del foro)  
**Acción:** REEMPLAZAR todo el bloque

**BUSCAR:**
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

**REEMPLAZAR POR:**
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
                  // Confirm before deleting
                  const confirmed = window.confirm(
                    '¿Estás seguro de eliminar este foro?\n\n' +
                    'Se eliminarán:\n' +
                    '• El foro completo\n' +
                    '• Todas las respuestas\n\n' +
                    'Esta acción no se puede deshacer.'
                  )
                  
                  if (!confirmed) return
                  
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
                      toast.success('🗑️ Foro eliminado exitosamente')
                      setSelectedForum(null)
                      setForums(forums.filter(f => f.id !== selectedForum.id))
                    } else {
                      const error = await response.json()
                      toast.error(error.error || 'Error al eliminar el foro')
                    }
                  } catch (error) {
                    console.error('Error deleting forum:', error)
                    toast.error('Error al eliminar el foro')
                  }
                }}
                className="justify-end"
              />
            </div>
```

---

## ✅ Resumen de Cambios

### Archivo 1: `/supabase/functions/server/index.tsx`
- ✅ Agregar ruta DELETE para foros (52 líneas)

### Archivo 2: `/components/PostActions.tsx`
- ✅ Agregar `Trash2` a imports
- ✅ Agregar `isAdmin` y `onDelete` a interface
- ✅ Agregar `isAdmin` y `onDelete` a parámetros de función
- ✅ Agregar botón de eliminar en el HTML

### Archivo 3: `/components/ForumsSection.tsx`
- ✅ Cambiar `postType="news"` → `postType="forum"`
- ✅ Agregar `isAdmin={userProfile?.role === 'admin'}`
- ✅ Agregar función `onDelete` completa con confirmación

---

## 🧪 Probar que Funciona

1. Guarda todos los archivos
2. Reinicia el servidor de desarrollo (Ctrl+C y luego `npm run dev`)
3. Inicia sesión como admin (teléfono: **50404987**)
4. Ve a **Foros**
5. Abre cualquier foro
6. Verifica que aparece el botón **"Eliminar"** con ícono de basura 🗑️
7. Haz clic en **"Eliminar"**
8. Confirma en el diálogo
9. Verifica que:
   - ✅ Aparece el mensaje "🗑️ Foro eliminado exitosamente"
   - ✅ Regresa a la lista de foros
   - ✅ El foro eliminado ya NO aparece

---

## 🎯 Si algo sale mal

**Problema:** "Error al eliminar el tema"  
**Solución:** Verifica que agregaste la ruta en el backend (Archivo 1)

**Problema:** No aparece el botón de eliminar  
**Solución:** Verifica que agregaste `isAdmin` y `onDelete` (Archivos 2 y 3)

**Problema:** "No autorizado"  
**Solución:** Verifica que estás logueado como admin (50404987)

**Problema:** "Sin permiso"  
**Solución:** Verifica que el usuario tiene role='admin' en su perfil

---

**Total de archivos:** 3  
**Total de líneas agregadas:** ~120  
**Tiempo estimado:** 10-15 minutos  
**Dificultad:** Fácil (solo copiar y pegar)
