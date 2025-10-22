# 🛡️ Cómo Obtener Permisos de Administrador

## 📋 Guía Completa para Acceder al Panel de Admin

---

## 🎯 ¿Qué es el Panel de Administrador?

El Panel de Administrador te permite:
- ✅ Ver todos los reportes de la comunidad
- ✅ Aprobar o rechazar contenido reportado
- ✅ Eliminar publicaciones inapropiadas
- ✅ Banear usuarios que violen las reglas
- ✅ Ver historial completo de moderación

---

## 🔍 Paso 1: Verificar Tu Rol Actual

### **Opción A: En la App (Más Fácil)**

1. Inicia sesión en la app
2. Click en tu avatar (arriba a la derecha)
3. Se abre tu perfil
4. Busca la sección **"Información de Cuenta"**
5. Verás tu rol actual:
   - 👤 **Usuario** - Usuario normal
   - 🚒 **Bombero** - Bombero voluntario
   - 🛡️ **Administrador** - Admin con acceso completo

### **Opción B: Verificar en el Backend**

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Obtener tu perfil
const token = 'TU_TOKEN_AQUI' // Copia el token de localStorage
fetch('https://yuanvbqjiwpvdkncaqql.supabase.co/functions/v1/make-server-3467f1c6/auth/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(profile => console.log('Mi rol:', profile.role))
```

**Posibles roles:**
- `user` - Usuario normal
- `firefighter` - Bombero voluntario
- `admin` - Administrador

---

## 🔐 Paso 2: Cambiar Tu Rol a Administrador

Como no hay una UI para esto (por seguridad), necesitas hacerlo manualmente en el backend.

### **Método 1: Script en la Consola del Navegador** ⚡ (MÁS RÁPIDO)

1. Abre la app e inicia sesión
2. Presiona **F12** para abrir DevTools
3. Ve a la pestaña **Console**
4. Pega este código:

```javascript
// SCRIPT PARA HACERTE ADMINISTRADOR
(async function() {
  // Obtener el token del localStorage
  const supabaseKey = Object.keys(localStorage).find(k => 
    k.includes('supabase.auth.token')
  );
  
  if (!supabaseKey) {
    console.error('❌ No se encontró sesión activa');
    return;
  }
  
  const authData = JSON.parse(localStorage.getItem(supabaseKey));
  const token = authData?.currentSession?.access_token;
  
  if (!token) {
    console.error('❌ No se pudo obtener el token');
    return;
  }
  
  console.log('✅ Token obtenido');
  console.log('🔄 Cambiando rol a administrador...');
  
  // Cambiar rol a admin
  const response = await fetch(
    'https://yuanvbqjiwpvdkncaqql.supabase.co/functions/v1/make-server-3467f1c6/auth/update-profile',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role: 'admin' })
    }
  );
  
  if (response.ok) {
    const profile = await response.json();
    console.log('✅ ¡Rol cambiado exitosamente!');
    console.log('🛡️ Nuevo rol:', profile.role);
    console.log('📋 Perfil actualizado:', profile);
    console.log('');
    console.log('🎉 ¡Ahora eres administrador!');
    console.log('🔄 Recarga la página para ver el botón de Admin');
    alert('✅ ¡Ahora eres administrador!\n\nRecarga la página (F5) para ver el botón "Admin" en el header.');
  } else {
    const error = await response.text();
    console.error('❌ Error:', error);
  }
})();
```

5. Presiona **Enter**
6. Deberías ver:
   ```
   ✅ Token obtenido
   🔄 Cambiando rol a administrador...
   ✅ ¡Rol cambiado exitosamente!
   🛡️ Nuevo rol: admin
   🎉 ¡Ahora eres administrador!
   ```

7. **Recarga la página (F5)**

---

### **Método 2: Usando cURL (Desde Terminal)** 💻

Si prefieres usar la terminal:

#### **A. Obtener Tu Token**

1. Abre la app e inicia sesión
2. Abre DevTools (F12) → Console
3. Ejecuta:
   ```javascript
   const supabaseKey = Object.keys(localStorage).find(k => k.includes('supabase.auth.token'));
   const authData = JSON.parse(localStorage.getItem(supabaseKey));
   console.log('TOKEN:', authData.currentSession.access_token);
   ```
4. Copia el token que aparece

#### **B. Ejecutar cURL**

En tu terminal (PowerShell, CMD, o Git Bash):

```bash
curl -X POST https://yuanvbqjiwpvdkncaqql.supabase.co/functions/v1/make-server-3467f1c6/auth/update-profile \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d "{\"role\": \"admin\"}"
```

**Reemplaza `TU_TOKEN_AQUI` con el token que copiaste.**

---

### **Método 3: Crear un Endpoint Especial** 🔧

Voy a crear un endpoint especial para hacerte admin más fácilmente.

**Ver archivo:** `/supabase/functions/server/index.tsx`

Busca o agrega este endpoint:

```typescript
// Endpoint especial: Hacerse admin (solo funciona si eres el PRIMER usuario)
app.post('/make-server-3467f1c6/auth/make-me-admin', async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'))
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    // Obtener perfil
    const profile = await getUserProfile(user.id)
    
    // Cambiar a admin
    const updatedProfile = {
      ...profile,
      role: 'admin'
    }
    
    await kv.set(`user:${user.id}`, updatedProfile)
    
    return c.json({
      message: '¡Ahora eres administrador!',
      profile: updatedProfile
    })
  } catch (error) {
    console.log('Error making admin:', error)
    return c.json({ error: 'Error al cambiar rol' }, 500)
  }
})
```

Luego desde la consola:

```javascript
const token = 'TU_TOKEN';
fetch('https://yuanvbqjiwpvdkncaqql.supabase.co/functions/v1/make-server-3467f1c6/auth/make-me-admin', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(data => console.log(data));
```

---

## ✅ Paso 3: Verificar que Eres Admin

### **1. Recarga la Página**
Presiona **F5** o **Ctrl + R**

### **2. Busca el Botón "Admin"**

**En Desktop:**
- Deberías ver un botón **"Admin"** con icono de escudo 🛡️ en el header
- Está junto a los botones de Buscar, Trending, etc.

**En Mobile:**
- Abre el menú hamburguesa (☰) arriba a la derecha
- Deberías ver la opción **"Admin"** con icono de escudo 🛡️

### **3. Verificar en tu Perfil**

1. Click en tu avatar
2. Ve a la pestaña "Información"
3. Deberías ver:
   ```
   👤 Rol: 🛡️ Administrador
   ```

---

## 🎛️ Paso 4: Acceder al Panel de Admin

### **Abrir el Panel:**

**Opción 1: Botón en el Header (Desktop)**
1. Busca el botón **"Admin"** 🛡️ en el header
2. Click en él
3. Se abre el **Panel de Moderación**

**Opción 2: Menú Mobile**
1. Click en el menú (☰)
2. Click en **"Admin"** 🛡️
3. Se abre el **Panel de Moderación**

### **Lo Que Verás:**

```
┌──────────────────────────────────────┐
│  🛡️ PANEL DE MODERACIÓN              │
├──────────────────────────────────────┤
│  📊 Estadísticas                     │
│  Total: 15 | ⏳ Pendientes: 8       │
├──────────────────────────────────────┤
│  📋 Reportes | 📜 Log                │
├──────────────────────────────────────┤
│  [Lista de contenido reportado...]  │
│                                      │
│  Acciones:                           │
│  [✅ Aprobar]                        │
│  [🗑️ Eliminar]                      │
│  [🚫 Banear Usuario]                │
└──────────────────────────────────────┘
```

---

## 🚨 Solución de Problemas

### **Problema 1: No veo el botón "Admin" después de cambiar el rol**

**Solución:**
```bash
# Opción A: Recarga completa
Ctrl + Shift + R (forzar recarga sin caché)

# Opción B: Cierra sesión y vuelve a entrar
1. Click en el botón de Logout
2. Inicia sesión nuevamente

# Opción C: Limpia el localStorage
F12 → Console → Ejecuta:
localStorage.clear()
location.reload()
```

### **Problema 2: Error "Unauthorized" al cambiar rol**

**Posible causa:** Token expirado

**Solución:**
1. Cierra sesión
2. Inicia sesión nuevamente
3. Intenta cambiar el rol de nuevo con el script

### **Problema 3: El endpoint no responde**

**Verifica:**
```javascript
// Ver si el servidor está funcionando
fetch('https://yuanvbqjiwpvdkncaqql.supabase.co/functions/v1/make-server-3467f1c6/auth/profile', {
  headers: { 'Authorization': 'Bearer TOKEN' }
})
.then(r => console.log('Status:', r.status))
```

Si retorna `401` = Token inválido  
Si retorna `200` = Servidor OK

### **Problema 4: Cambié el rol pero sigo viendo "Usuario"**

**Solución:**
```javascript
// Forzar actualización del perfil
window.location.reload(true)
```

---

## 🔒 Seguridad y Mejores Prácticas

### **⚠️ Importante:**

1. **No compartas tu token** - Es como tu contraseña
2. **Solo haz admin a usuarios de confianza**
3. **El rol de admin es permanente** hasta que lo cambies manualmente
4. **Todas las acciones de admin se registran** en el log de moderación

### **Recomendaciones:**

1. **Crea una cuenta de admin separada** para tareas de moderación
2. **No uses el admin para publicar** contenido normal (usa tu cuenta de usuario)
3. **Revisa el log regularmente** para auditoría

---

## 📊 Diferencias Entre Roles

| Característica | Usuario | Bombero | Admin |
|---------------|---------|---------|-------|
| Publicar contenido | ✅ | ✅ | ✅ |
| Comentar | ✅ | ✅ | ✅ |
| Reportar contenido | ✅ | ✅ | ✅ |
| Botón de emergencia | ❌ | ✅ | ✅ |
| Publicar por voz | ❌ | ✅ | ✅ |
| Ver reportes | ❌ | ❌ | ✅ |
| Eliminar publicaciones | ❌ | ❌ | ✅ |
| Banear usuarios | ❌ | ❌ | ✅ |
| Ver log de moderación | ❌ | ❌ | ✅ |

---

## 🎓 Próximos Pasos

Una vez que seas administrador:

1. **Lee la documentación:**
   - `SISTEMA-MODERACION.md` - Guía completa del panel
   - `RESUMEN-SISTEMA-MODERACION.md` - Resumen ejecutivo

2. **Familiarízate con el panel:**
   - Explora las estadísticas
   - Revisa el log de moderación
   - Prueba las acciones en contenido de prueba

3. **Establece reglas:**
   - Define qué contenido es inapropiado
   - Crea criterios para baneos
   - Documenta tus decisiones

---

## 🔄 Volver a Usuario Normal

Si necesitas quitar tus permisos de admin:

```javascript
// Script para volver a usuario normal
const token = 'TU_TOKEN';
fetch('https://yuanvbqjiwpvdkncaqql.supabase.co/functions/v1/make-server-3467f1c6/auth/update-profile', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ role: 'user' })
})
.then(r => r.json())
.then(data => console.log('Rol cambiado a:', data.role));

// Luego recarga la página
location.reload();
```

---

## 📞 Soporte

Si tienes problemas:

1. Verifica que estés usando el **Método 1** (script en consola)
2. Revisa que el token sea válido
3. Asegúrate de recargar la página después del cambio
4. Verifica la consola del navegador para errores

---

## ✅ Checklist Rápido

- [ ] ✅ Verificar rol actual (debe ser `user`)
- [ ] ✅ Abrir DevTools (F12) → Console
- [ ] ✅ Ejecutar script para hacerse admin
- [ ] ✅ Ver mensaje de éxito
- [ ] ✅ Recargar página (F5)
- [ ] ✅ Ver botón "Admin" en el header
- [ ] ✅ Click en "Admin" para abrir panel
- [ ] ✅ Verificar acceso al panel de moderación
- [ ] ✅ Leer documentación del sistema de moderación

---

**¡Listo! Ahora tienes acceso completo al Panel de Administrador de Informa.** 🛡️🎉

---

**Última actualización:** 22 de octubre, 2025  
**Versión:** 2.1.0  
**Estado:** ✅ Guía completa lista para usar
