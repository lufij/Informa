# 🗑️ GUÍA: Permitir a Admins Borrar Foros Completos

## 🎯 Problema Identificado
Actualmente, cuando un administrador intenta borrar un foro, aparece el error "Error al eliminar el tema" porque:
1. ✅ El botón de basura SÍ aparece (la IA lo agregó)
2. ❌ Pero NO existe la ruta en el backend para eliminar foros
3. ❌ Solo existe la ruta para eliminar respuestas DENTRO de un foro

---

## 📋 Solución en 2 Pasos

### **PASO 1: Crear la Ruta de Backend para Eliminar Foros**
### **PASO 2: Conectar el Frontend con el Backend**

---

## 🔧 PASO 1: Backend - Crear Ruta de Eliminación

### 📍 Archivo: `/supabase/functions/server/index.tsx`

**Ubicación:** Busca la línea aproximadamente 1237 (después de la ruta DELETE de posts de foros)

**Código a AGREGAR:**

```typescript
// DELETE Forum (Admin or Author only)
app.delete('/make-server-3467f1c6/forums/:forumId', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'No autorizado' }, 401)
    }

    const profile = await getUserProfile(user.id)
    const forumId = c.req.param('forumId')
    
    // Get the forum
    const forum = await kv.get(`forum:${forumId}`)
    
    if (!forum) {
      return c.json({ error: 'Foro no encontrado' }, 404)
    }

    // Check if user is admin or forum author
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

## ⚡ PASO 2: Frontend - Usar la Nueva Ruta

### 📍 Archivo: `/components/ForumsSection.tsx`

**Código actual (línea ~395):**
```tsx
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

**REEMPLAZAR por:**

```tsx
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
          // Remove from local state
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

## 📝 PASO 3: Actualizar PostActions (Si es necesario)

### 📍 Archivo: `/components/PostActions.tsx`

**Verificar que PostActions tenga estas props:**

```typescript
interface PostActionsProps {
  postType: 'news' | 'alert' | 'classified' | 'forum'
  postId: string
  token: string | null
  isAuthor?: boolean
  isAdmin?: boolean      // ← AGREGAR ESTO
  onEdit?: () => void
  onDelete?: () => void  // ← AGREGAR ESTO
  className?: string
  contactPhone?: string
  recipientId?: string
  recipientName?: string
}
```

**Y en el componente, verificar que el botón de eliminar muestre así:**

```tsx
{(isAuthor || isAdmin) && onDelete && (
  <Button
    variant="ghost"
    size="sm"
    onClick={onDelete}
    className="text-red-600 hover:text-red-700 hover:bg-red-50"
  >
    <Trash2 className="w-4 h-4" />
  </Button>
)}
```

---

## 🎯 Instrucciones para la IA de Visual Studio

Copia y pega esto en el chat:

```
Necesito implementar la funcionalidad de borrar foros completos como administrador.

PASO 1 - Backend (/supabase/functions/server/index.tsx):
Agrega esta ruta DESPUÉS de la línea 1237 (después de la ruta DELETE de posts de foros):

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

    if (profile.role !== 'admin' && forum.authorId !== user.id) {
      return c.json({ error: 'No tienes permiso para eliminar este foro' }, 403)
    }

    const forumPosts = await kv.getByPrefix(`forum_post:${forumId}:`)
    for (const post of forumPosts) {
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

PASO 2 - Frontend (/components/ForumsSection.tsx):
En la línea ~395, donde está el PostActions del foro, REEMPLAZA todo el bloque por:

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

PASO 3 - Verificar PostActions (/components/PostActions.tsx):
Asegúrate de que la interfaz PostActionsProps tenga:
- isAdmin?: boolean
- onDelete?: () => void

Y que el botón de eliminar use esta condición:
{(isAuthor || isAdmin) && onDelete && (
  <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-600">
    <Trash2 className="w-4 h-4" />
  </Button>
)}

Confirma cuando hayas hecho estos 3 pasos.
```

---

## ✅ Checklist de Verificación

Después de implementar, verifica:

- [ ] El backend tiene la ruta DELETE `/forums/:forumId`
- [ ] El frontend pasa `postType="forum"` (no "news")
- [ ] El frontend pasa `isAdmin={userProfile?.role === 'admin'}`
- [ ] El frontend tiene la función `onDelete` implementada
- [ ] PostActions recibe las props `isAdmin` y `onDelete`
- [ ] El botón de basura 🗑️ aparece para admins
- [ ] Al hacer clic, se ejecuta la función onDelete
- [ ] Después de eliminar, vuelve a la lista de foros
- [ ] El foro desaparece de la lista

---

## 🧪 Cómo Probar

1. **Inicia sesión como admin** (teléfono: 50404987)
2. **Ve a Foros** → Sección de conversaciones
3. **Haz clic en un foro** para abrirlo
4. **Busca el ícono de basura** 🗑️ en la parte inferior
5. **Haz clic en la basura**
6. **Confirma la eliminación** (si hay diálogo de confirmación)
7. **Verifica** que:
   - Aparece el mensaje "🗑️ Foro eliminado exitosamente"
   - Regresa a la lista de foros
   - El foro ya NO aparece en la lista

---

## ⚠️ Errores Comunes

### Error 1: "Error al eliminar el tema"
**Causa:** La ruta de backend no existe o tiene un error
**Solución:** Verifica que agregaste la ruta DELETE en el backend correctamente

### Error 2: "No autorizado"
**Causa:** El token no se está enviando correctamente
**Solución:** Verifica que `token` no sea null y se pase en Authorization header

### Error 3: "No tienes permiso"
**Causa:** El usuario no es admin ni autor del foro
**Solución:** Verifica que estás logueado como admin (50404987)

### Error 4: El botón de basura no aparece
**Causa:** PostActions no está recibiendo `isAdmin` o `onDelete`
**Solución:** Verifica que pasas las props correctamente desde ForumsSection

---

## 📊 Flujo Completo

```
┌─────────────────────────────────────────────┐
│ 1. Usuario Admin abre un foro              │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ 2. ForumsSection renderiza PostActions      │
│    con isAdmin=true y onDelete definido    │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ 3. PostActions muestra botón de basura 🗑️  │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ 4. Admin hace clic en basura                │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ 5. Se ejecuta onDelete (función en          │
│    ForumsSection)                           │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ 6. Frontend hace DELETE request a:          │
│    /forums/:forumId                         │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ 7. Backend verifica:                        │
│    - Usuario autenticado ✓                  │
│    - Es admin o autor ✓                     │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ 8. Backend elimina:                         │
│    - Todos los posts del foro               │
│    - El foro mismo                          │
│    - Crea log de moderación                 │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ 9. Frontend recibe respuesta exitosa        │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ 10. Muestra toast de éxito 🎉              │
│     Vuelve a lista de foros                 │
│     Remueve foro de la lista                │
└─────────────────────────────────────────────┘
```

---

## 🔒 Seguridad

✅ **Solo admins y autores pueden borrar foros**
✅ **Se verifica autenticación en el backend**
✅ **Se registra en el log de moderación**
✅ **Se eliminan todos los posts asociados**
✅ **No se puede recuperar después de eliminar**

---

## 📝 Notas Importantes

1. **Eliminación Permanente:** Una vez eliminado, no se puede recuperar
2. **Cascada:** Se eliminan automáticamente todas las respuestas
3. **Log de Moderación:** Queda registrado quién eliminó el foro
4. **Permisos:** Solo admin o el autor del foro pueden eliminarlo
5. **Navegación:** Después de eliminar, vuelve automáticamente a la lista

---

## 🎯 Resultado Final

Después de implementar esta guía:

✅ Los admins verán el botón de basura en TODOS los foros
✅ Los autores verán el botón solo en SUS foros
✅ Al hacer clic, el foro se elimina correctamente
✅ Aparece un mensaje de éxito
✅ El foro desaparece de la lista
✅ Se registra en el historial de moderación

---

**Fecha:** Octubre 2025  
**Archivos modificados:**
- `/supabase/functions/server/index.tsx` (Backend)
- `/components/ForumsSection.tsx` (Frontend)
- `/components/PostActions.tsx` (Verificación)

**Tiempo estimado:** 10-15 minutos
