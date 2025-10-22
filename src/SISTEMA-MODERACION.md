# 🛡️ Sistema de Moderación de Contenido Reportado - Informa

## 📋 Resumen Ejecutivo

Implementamos un **sistema completo de moderación** con auto-ocultamiento automático, panel de administración avanzado, y protección contra usuarios baneados. Este sistema permite a los administradores controlar todo el contenido reportado por la comunidad.

---

## 🎯 Características Principales

### **1. Auto-Ocultamiento Automático** 🚫

**¿Cómo funciona?**
- Cuando una publicación recibe **3 o más reportes**, se **oculta automáticamente**
- La publicación NO se elimina, solo se marca como `hidden: true`
- Se registra en el log de moderación como "Auto-ocultado"
- Los usuarios normales ya no la ven
- Los administradores pueden verla y decidir qué hacer

**Tipos de contenido protegido:**
- ✅ Noticias (Chismes) 🔥
- ✅ Alertas 📢
- ✅ Clasificados 💼
- ✅ Foros (Conversaciones) 💬
- ✅ Comentarios 💭

---

### **2. Panel de Administración** 🎛️

**Acceso:**
- Solo usuarios con `role: 'admin'` pueden verlo
- Se abre desde el botón "Admin" en el header (icono de escudo 🛡️)

**Componente:** `AdminReportsPanel.tsx`

#### **A. Vista General - Estadísticas**

```
┌─────────────────────────────────────────┐
│  📊 ESTADÍSTICAS DE MODERACIÓN          │
├─────────────────────────────────────────┤
│  Total de Reportes:        15           │
│  ⏳ Pendientes:             8           │
│  ✅ Resueltos:              7           │
└─────────────────────────────────────────┘
```

#### **B. Dos Pestañas Principales**

##### **📋 Pestaña 1: Reportes**

**Filtros:**
- 🔴 **Todos** - Muestra todos los reportes
- ⏳ **Pendientes** - Solo reportes sin revisar
- ✅ **Resueltos** - Reportes ya procesados

**Información de cada reporte:**
```
┌─────────────────────────────────────────────┐
│  🔥 Noticia                                 │
│  ⚠️ Reportado 3 veces                       │
├─────────────────────────────────────────────┤
│  👤 Juan Pérez                              │
│  📅 Hace 2 horas                            │
│  📝 Razón: Información falsa                │
│  💬 "Esta noticia es inventada..."          │
├─────────────────────────────────────────────┤
│  📄 Contenido:                              │
│  "Se cayó el puente en el centro..."        │
│  🖼️ [2 fotos]                               │
├─────────────────────────────────────────────┤
│  🚨 OCULTO AUTOMÁTICAMENTE                  │
├─────────────────────────────────────────────┤
│  ACCIONES:                                  │
│  [✅ Aprobar] [🗑️ Eliminar] [🚫 Banear]   │
└─────────────────────────────────────────────┘
```

##### **📜 Pestaña 2: Log de Moderación**

**Historial completo de acciones:**
```
┌─────────────────────────────────────────────┐
│  🗑️ Publicación Eliminada                   │
│  Noticia: "Se cayó el puente..."            │
│  Usuario: Juan Pérez                        │
│  Por: Admin Carlos                          │
│  📅 Hace 5 minutos                          │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  🚫 Usuario Baneado                         │
│  Usuario: María González                    │
│  Razón: Spam repetitivo                     │
│  Por: Admin Carlos                          │
│  📅 Hace 1 hora                             │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  🤖 Auto-ocultado                           │
│  Alerta: "Apagón en toda la zona..."        │
│  Motivo: 3+ reportes                        │
│  📅 Hace 3 horas                            │
└─────────────────────────────────────────────┘
```

---

### **3. Acciones Disponibles** ⚙️

#### **A. Aprobar Publicación** ✅

**¿Qué hace?**
- Marca el reporte como "Resuelto"
- Quita el estado de "oculto" de la publicación
- La publicación vuelve a ser visible para todos
- Se registra en el log

**Cuándo usarlo:**
- El reporte es falso
- El contenido es apropiado
- Fue reportado por error

**Proceso:**
1. Click en botón "Aprobar"
2. Confirmación automática
3. Toast: "Publicación aprobada"
4. Se actualiza la vista

---

#### **B. Eliminar Publicación** 🗑️

**¿Qué hace?**
- **Elimina PERMANENTEMENTE** la publicación
- NO se puede recuperar (es definitivo)
- Marca todos los reportes relacionados como "Resueltos"
- Se registra en el log de moderación
- Notificación al usuario que la publicó

**Cuándo usarlo:**
- Contenido inapropiado confirmado
- Spam
- Información falsa peligrosa
- Acoso o discriminación
- Violación de términos de servicio

**Proceso:**
1. Click en botón "Eliminar" 🗑️
2. **Confirmación requerida:**
   ```
   ⚠️ ¿Eliminar publicación?
   
   Esta acción es PERMANENTE y no se puede deshacer.
   
   [Cancelar] [Sí, eliminar]
   ```
3. Si confirma → Publicación eliminada
4. Toast: "Publicación eliminada exitosamente"
5. Se actualiza todo

**Endpoints backend:**
- `DELETE /posts/news/:id` - Elimina noticia
- `DELETE /posts/alert/:id` - Elimina alerta
- `DELETE /posts/classified/:id` - Elimina clasificado
- `DELETE /posts/forum/:id` - Elimina conversación

---

#### **C. Banear Usuario** 🚫

**¿Qué hace?**
- Marca el usuario como `banned: true`
- El usuario NO puede crear nuevo contenido (noticias, alertas, etc.)
- El usuario NO puede comentar
- Puede ver contenido pero no interactuar
- Se registra en el log con la razón
- Se guarda la fecha del baneo

**Cuándo usarlo:**
- Usuario publica spam repetidamente
- Usuario acosa a otros
- Usuario publica contenido inapropiado constantemente
- Comportamiento tóxico

**Proceso:**
1. Click en botón "Banear Usuario" 🚫
2. **Dialog de confirmación:**
   ```
   ⚠️ ¿Banear usuario?
   
   Esta acción impedirá que el usuario publique contenido.
   
   Razón del baneo (requerido):
   ┌─────────────────────────────────────┐
   │ [Escribe aquí la razón...]          │
   │                                     │
   └─────────────────────────────────────┘
   
   Razones sugeridas:
   • Spam repetitivo
   • Acoso a otros usuarios
   • Contenido inapropiado
   • Información falsa maliciosa
   
   [Cancelar] [Confirmar Baneo]
   ```
3. Si confirma → Usuario baneado
4. Toast: "Usuario baneado exitosamente"

**Endpoint backend:**
- `POST /users/:userId/ban`
  ```json
  {
    "reason": "Spam repetitivo"
  }
  ```

---

### **4. Protección en Backend** 🔐

#### **A. Verificación en TODOS los Endpoints de Creación**

**Endpoints protegidos:**
```typescript
// ❌ Usuarios baneados NO pueden:
POST /news              // Crear noticias
POST /alerts            // Crear alertas
POST /classifieds       // Crear clasificados
POST /forums            // Crear conversaciones
POST /news/:id/comments // Comentar
POST /alerts/:id/comments
POST /classifieds/:id/comments
POST /forums/:id/comments
```

**Código de protección:**
```typescript
// En cada endpoint de creación
const profile = await getUserProfile(user.id)

// Verificar si está baneado
if (profile.banned) {
  return c.json({ 
    error: 'Tu cuenta ha sido suspendida. Contacta a un administrador.' 
  }, 403)
}
```

**Respuesta cuando usuario baneado intenta publicar:**
```json
{
  "error": "Tu cuenta ha sido suspendida. Contacta a un administrador."
}
```

**En el frontend:**
```typescript
// Toast de error
toast.error('Tu cuenta ha sido suspendida. Contacta a un administrador.')
```

#### **B. Información del Baneo en el Perfil**

```typescript
// Estructura del perfil de usuario
interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  role: 'user' | 'firefighter' | 'admin'
  banned: boolean           // ← Estado de baneo
  bannedReason?: string     // ← Razón del baneo
  bannedAt?: string         // ← Fecha del baneo
  bannedBy?: string         // ← ID del admin que baneó
}
```

---

### **5. Flujo Completo de Moderación** 🔄

#### **Caso 1: Usuario reporta contenido**

```
1. Usuario ve publicación inapropiada
   ↓
2. Click en "Reportar" (icono de alerta ⚠️)
   ↓
3. Selecciona razón:
   • Spam
   • Acoso
   • Contenido inapropiado
   • Información falsa
   • Otro
   ↓
4. Agrega descripción opcional
   ↓
5. Envía reporte
   ↓
6. Backend guarda reporte: `report:${reportId}`
   ↓
7. Backend actualiza contador en publicación
   ↓
8. Si reportCount >= 3:
   → Publicación se oculta automáticamente
   → Se crea log de auto-ocultamiento
   → Se notifica a admins
```

#### **Caso 2: Admin revisa reportes**

```
1. Admin abre panel de administración
   ↓
2. Ve lista de reportes pendientes
   ↓
3. Revisa contenido reportado
   ↓
4. Admin decide:
   
   OPCIÓN A: Aprobar
   → Marca reporte como resuelto
   → Quita estado de oculto
   → Publicación visible de nuevo
   
   OPCIÓN B: Eliminar
   → Confirmación requerida
   → Publicación eliminada permanentemente
   → Todos los reportes relacionados → resueltos
   → Se registra en log
   
   OPCIÓN C: Banear Usuario
   → Pide razón del baneo
   → Usuario marcado como banned
   → No puede publicar más
   → Se registra en log
```

---

### **6. Sistema de Reportes** 📢

#### **A. Razones de Reporte Disponibles**

```typescript
const reportReasons = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Acoso' },
  { value: 'inappropriate', label: 'Contenido inapropiado' },
  { value: 'fake-news', label: 'Información falsa' },
  { value: 'other', label: 'Otro' }
]
```

#### **B. Estructura de un Reporte**

```typescript
interface Report {
  id: string                    // UUID del reporte
  reporterId: string            // Usuario que reportó
  contentType: 'news' | 'alert' | 'classified' | 'forum' | 'comment'
  contentId: string             // ID del contenido reportado
  reason: string                // Razón del reporte
  description?: string          // Descripción adicional (opcional)
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  createdAt: string             // Fecha del reporte
  reviewedBy?: string           // Admin que lo revisó
  reviewedAt?: string           // Fecha de revisión
}
```

#### **C. Endpoints de Reportes**

**Crear reporte:**
```
POST /reports
Body:
{
  "contentType": "news",
  "contentId": "abc123",
  "reason": "fake-news",
  "description": "Esta noticia es completamente falsa"
}
```

**Ver todos los reportes (solo admin):**
```
GET /reports
→ Retorna todos los reportes con información de contenido
```

**Actualizar estado de reporte:**
```
PUT /reports/:id
Body:
{
  "status": "resolved"
}
```

---

### **7. Log de Moderación** 📜

#### **A. Acciones Registradas**

**Tipos de acciones:**
- 🤖 `auto_hide` - Publicación auto-ocultada (3+ reportes)
- 🗑️ `delete_post` - Publicación eliminada por admin
- ♻️ `restore_post` - Publicación restaurada por admin
- 🚫 `ban_user` - Usuario baneado
- ✅ `approve_report` - Reporte aprobado/resuelto

#### **B. Estructura del Log**

```typescript
interface ModerationLog {
  id: string                    // UUID del log
  action: string                // Tipo de acción
  contentType?: string          // Tipo de contenido
  contentId?: string            // ID del contenido
  contentTitle?: string         // Título/preview del contenido
  targetUserId?: string         // Usuario afectado
  targetUserName?: string       // Nombre del usuario afectado
  reason?: string               // Razón de la acción
  performedAt: string           // Fecha
  performedBy: string           // Admin que lo hizo
  performedByName: string       // Nombre del admin
}
```

#### **C. Vista en el Panel**

```
┌─────────────────────────────────────────────────┐
│  📜 HISTORIAL DE MODERACIÓN (Últimas 50)        │
├─────────────────────────────────────────────────┤
│                                                 │
│  🗑️ Publicación Eliminada                       │
│  Noticia: "Se cayó el puente en el centro..."   │
│  Usuario: Juan Pérez (@juanp)                   │
│  Por: Admin Carlos                              │
│  📅 22 oct 2025, 14:30                          │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  🚫 Usuario Baneado                             │
│  Usuario: María González (@mariag)              │
│  Razón: Spam repetitivo de clasificados falsos  │
│  Por: Admin Carlos                              │
│  📅 22 oct 2025, 13:45                          │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  🤖 Auto-ocultado (3+ reportes)                 │
│  Alerta: "¡Apagón en toda la zona 1!"           │
│  📅 22 oct 2025, 12:20                          │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  ♻️ Publicación Restaurada                      │
│  Clasificado: "Vendo casa en buen estado"       │
│  Razón: Reporte falso                           │
│  Por: Admin Laura                               │
│  📅 22 oct 2025, 11:00                          │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

### **8. Notificaciones** 🔔

#### **A. Notificaciones para Admins**

**Cuando una publicación se auto-oculta:**
```
🚨 Nueva publicación auto-ocultada
Noticia reportada 3 veces
[Ver en panel de admin]
```

**Cuando hay nuevo reporte:**
```
📢 Nuevo reporte recibido
Contenido: Alerta
Razón: Información falsa
[Revisar]
```

#### **B. Notificaciones para Usuarios Reportados**

**Cuando su publicación es eliminada:**
```
⚠️ Tu publicación fue eliminada
Razón: Violación de términos de servicio
Contacta a un administrador para más información
```

**Cuando son baneados:**
```
🚫 Tu cuenta ha sido suspendida
Razón: Spam repetitivo
No podrás publicar contenido nuevo
Contacta a un administrador para apelar
```

---

### **9. Seguridad y Prevención** 🔒

#### **A. Prevención de Abuso del Sistema de Reportes**

**Límite de reportes por usuario:**
```typescript
// Un usuario solo puede reportar el mismo contenido UNA vez
if (existingReport) {
  return c.json({ error: 'Ya reportaste este contenido' }, 400)
}
```

**Detección de reportes masivos:**
```typescript
// Si un usuario reporta 10+ publicaciones en 1 hora → flag para admin
const recentReports = await getRecentReportsByUser(userId, 1hour)
if (recentReports.length > 10) {
  await flagSuspiciousActivity(userId, 'mass_reporting')
}
```

#### **B. Auditoría Completa**

**Todas las acciones de moderación se registran:**
- ✅ Quién hizo la acción
- ✅ Cuándo la hizo
- ✅ Qué contenido afectó
- ✅ Razón de la acción
- ✅ IP del admin (opcional)

**Exportar log de moderación:**
```typescript
// Endpoint para admins
GET /admin/moderation-log/export
→ CSV con todo el historial
```

---

### **10. UX del Panel de Administración** 🎨

#### **A. Diseño Intuitivo**

**Colores de estado:**
- 🔴 Pendiente → Badge rojo
- 🟡 En revisión → Badge amarillo
- 🟢 Resuelto → Badge verde
- 🔵 Desestimado → Badge azul

**Animaciones:**
```typescript
// Entrada de cards
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
/>
```

**Loading states:**
```typescript
// Mientras actualiza estado
{updatingId === report.id ? (
  <RefreshCw className="w-4 h-4 animate-spin" />
) : (
  <Check className="w-4 h-4" />
)}
```

#### **B. Responsive Design**

**Desktop:**
- Panel completo con todas las acciones visibles
- Vista de 3 columnas
- Sidebar con estadísticas

**Mobile:**
- Cards apiladas verticalmente
- Botones agrupados en menú
- Swipe para acciones rápidas

---

### **11. Testing y Debugging** 🧪

#### **A. Comandos Útiles**

**Ver todos los reportes:**
```bash
curl -X GET https://yuanvbqjiwpvdkncaqql.supabase.co/functions/v1/make-server-3467f1c6/reports \
  -H "Authorization: Bearer TOKEN_ADMIN"
```

**Crear reporte de prueba:**
```bash
curl -X POST https://yuanvbqjiwpvdkncaqql.supabase.co/functions/v1/make-server-3467f1c6/reports \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "news",
    "contentId": "abc123",
    "reason": "spam"
  }'
```

**Banear usuario de prueba:**
```bash
curl -X POST https://yuanvbqjiwpvdkncaqql.supabase.co/functions/v1/make-server-3467f1c6/users/USER_ID/ban \
  -H "Authorization: Bearer TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Test de baneo"
  }'
```

#### **B. Verificaciones**

**Checklist de testing:**
- [ ] Usuario puede reportar contenido
- [ ] Auto-ocultamiento funciona a los 3 reportes
- [ ] Admin ve todos los reportes
- [ ] Admin puede aprobar publicación
- [ ] Admin puede eliminar publicación
- [ ] Confirmación antes de eliminar
- [ ] Admin puede banear usuario
- [ ] Usuario baneado no puede publicar
- [ ] Log de moderación se actualiza
- [ ] Notificaciones funcionan

---

### **12. Mejoras Futuras** 🚀

#### **A. Próximas Funcionalidades**

1. **Apelaciones**
   - Usuario puede apelar un baneo
   - Admin revisa apelación
   - Puede levantar el baneo

2. **Suspensiones Temporales**
   - Baneos de 1 día, 7 días, 30 días
   - Auto-levantamiento después del tiempo

3. **Categorías de Baneo**
   - Baneo parcial (solo comentarios)
   - Baneo de publicaciones
   - Baneo total

4. **Sistema de Strikes**
   - 3 strikes = baneo automático
   - Strikes se pueden quitar después de buen comportamiento

5. **Reportes de Usuarios**
   - No solo contenido, sino perfiles de usuario
   - Verificación de identidad

6. **Whitelist**
   - Usuarios verificados no se auto-ocultan
   - Requiere más reportes

7. **Filtros Automáticos**
   - IA para detectar spam
   - Lista de palabras prohibidas
   - Detección de enlaces sospechosos

---

## 📊 Resumen Visual del Sistema

```
┌────────────────────────────────────────────────────────────┐
│                    SISTEMA DE MODERACIÓN                    │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  1. Usuario Reporta Contenido                             │
│     ↓                                                      │
│  2. Reporte Guardado en Sistema                           │
│     ↓                                                      │
│  3. Contador de Reportes++                                │
│     ↓                                                      │
│  4. ¿Reportes >= 3?                                       │
│     ├── SÍ → Auto-ocultar publicación                     │
│     │        ↓                                             │
│     │        Notificar a admins                            │
│     │                                                       │
│     └── NO → Esperar más reportes                         │
│                                                            │
│  5. Admin Abre Panel                                      │
│     ↓                                                      │
│  6. Admin Revisa Contenido                                │
│     ↓                                                      │
│  7. Admin Decide:                                         │
│     ├── Aprobar → Restaurar publicación                   │
│     ├── Eliminar → Borrar permanentemente                 │
│     └── Banear → Usuario no puede publicar               │
│                                                            │
│  8. Acción Registrada en Log                              │
│     ↓                                                      │
│  9. Notificación al Usuario Afectado                      │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## ✅ Conclusión

El sistema de moderación de Informa es **completo, robusto y fácil de usar**. Proporciona a los administradores todas las herramientas necesarias para mantener la comunidad segura y saludable, mientras protege contra el abuso del sistema de reportes.

**Características destacadas:**
- ✅ Auto-ocultamiento automático
- ✅ Panel de administración intuitivo
- ✅ Eliminación permanente de contenido
- ✅ Sistema de baneo de usuarios
- ✅ Log completo de moderación
- ✅ Protección en backend
- ✅ Notificaciones en tiempo real
- ✅ Responsive y mobile-friendly

---

**Última actualización:** 22 de octubre, 2025  
**Versión:** 2.1.0  
**Estado:** ✅ Implementado y funcionando
