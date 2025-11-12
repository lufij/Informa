# 🤖 INSTRUCCIONES COMPLETAS PARA LA IA

**Copia TODO este documento y pégalo en el chat de la IA de Visual Studio**

---

# Necesito implementar la funcionalidad de eliminar foros completos como administrador

## CONTEXTO:
Actualmente cuando un administrador intenta borrar un foro, aparece "Error al eliminar el tema" porque:
1. El ícono de basura SÍ aparece
2. Pero NO existe la ruta en el backend para eliminar foros
3. Solo existe la ruta para eliminar respuestas DENTRO de un foro

## SOLUCIÓN: Modificar 3 archivos

---

## ARCHIVO 1: Backend - Crear ruta DELETE para foros

**Archivo:** `/supabase/functions/server/index.tsx`

**Ubicación:** Línea 1237, DESPUÉS de la ruta `app.delete('/make-server-3467f1c6/forums/:forumId/posts/:postId'`

**Instrucción:** AGREGA este código completo DESPUÉS de esa línea:

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

## ARCHIVO 2: PostActions - Agregar funcionalidad de eliminar

**Archivo:** `/components/PostActions.tsx`

### Cambio 2.1: Agregar Trash2 a los imports (línea 3)

**BUSCAR esta línea:**
```typescript
import { Bookmark, Share2, Flag, Edit, Copy, Check, MessageCircle, Phone } from 'lucide-react'
```

**REEMPLAZAR POR:**
```typescript
import { Bookmark, Share2, Flag, Edit, Copy, Check, MessageCircle, Phone, Trash2 } from 'lucide-react'
```

### Cambio 2.2: Actualizar interface (línea 11)

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
  isAdmin?: boolean       // Nueva prop para identificar admins
  onEdit?: () => void
  onDelete?: () => void   // Nueva prop para manejar eliminación
  className?: string
  contactPhone?: string
  recipientId?: string
  recipientName?: string
}
```

### Cambio 2.3: Actualizar parámetros de función (línea 23)

**BUSCAR:**
```typescript
export function PostActions({ postType, postId, token, isAuthor, onEdit, className = '', contactPhone, recipientId, recipientName }: PostActionsProps) {
```

**REEMPLAZAR POR:**
```typescript
export function PostActions({ postType, postId, token, isAuthor, isAdmin, onEdit, onDelete, className = '', contactPhone, recipientId, recipientName }: PostActionsProps) {
```

### Cambio 2.4: Agregar botón de eliminar (línea ~352)

**BUSCAR este bloque completo:**
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

## ARCHIVO 3: ForumsSection - Conectar botón con backend

**Archivo:** `/components/ForumsSection.tsx`

**BUSCAR (línea ~395):**
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

## RESUMEN DE CAMBIOS:

### Archivo 1: `/supabase/functions/server/index.tsx`
- ✅ Agregar ruta DELETE completa después de línea 1237

### Archivo 2: `/components/PostActions.tsx`
- ✅ Agregar `Trash2` a imports (línea 3)
- ✅ Agregar `isAdmin` y `onDelete` a interface (línea 11)
- ✅ Agregar `isAdmin` y `onDelete` a parámetros (línea 23)
- ✅ Agregar botón eliminar completo (línea ~352)

### Archivo 3: `/components/ForumsSection.tsx`
- ✅ Cambiar `postType="news"` a `postType="forum"`
- ✅ Agregar `isAdmin={userProfile?.role === 'admin'}`
- ✅ Agregar función `onDelete` completa con confirmación (línea ~395)

---

## VERIFICACIÓN:

Después de hacer los cambios, confirma que:
1. Los 3 archivos fueron modificados correctamente
2. No hay errores de TypeScript
3. El servidor se puede iniciar sin errores

Responde con: "✅ Cambios implementados correctamente" cuando termines.

---

## PARA PROBAR:

1. Inicia sesión como admin (teléfono: 50404987)
2. Ve a la sección Foros
3. Abre cualquier foro
4. Verifica que aparece el botón "Eliminar" con ícono de basura
5. Haz clic en Eliminar
6. Confirma en el diálogo
7. El foro debe eliminarse y aparecer mensaje de éxito

---

**IMPORTANTE:** Aplica TODOS los cambios exactamente como se muestran. No omitas ningún cambio.
