# 📦 Instrucciones de Instalación - Sistema de Notificaciones Push

## 🎯 Cambios Implementados

Esta actualización incluye:

✅ **Notificaciones Push del Navegador** - Alertas con sonido aunque la app esté cerrada  
✅ **Badges de Contenido Nuevo** - Contadores rojos en tabs de Noticias, Alertas, Clasificados y Foros  
✅ **Banner Superior** - "🔥 5 noticias nuevas - Ver ahora"  
✅ **Service Worker** - Para notificaciones en background  
✅ **Backend Mejorado** - Envía push automático en noticias importantes y alertas críticas  

---

## 🚀 Pasos para Instalar en Visual Studio Code

### 1️⃣ Descargar el Código

Ya descargaste todos los archivos del proyecto. Asegúrate de tener estos archivos nuevos:

```
/App.tsx (MODIFICADO)
/components/PushNotificationManager.tsx (NUEVO)
/components/NewContentBadge.tsx (NUEVO)
/components/NewContentBanner.tsx (NUEVO)
/public/service-worker.js (NUEVO)
/supabase/functions/server/index.tsx (MODIFICADO)
```

---

### 2️⃣ Crear Iconos para Notificaciones (IMPORTANTE)

Las notificaciones push necesitan iconos. Debes crear dos archivos de imagen:

**A) `/public/icon-192.png`** - Ícono de 192x192 píxeles  
**B) `/public/icon-96.png`** - Ícono de 96x96 píxeles  

**Opción fácil:** Usa el logo circular de Informa que ya tienes y renómbralo/cópialo:
1. Busca tu logo actual (probablemente está en `/public` o `/src/assets`)
2. Redimensiónalo a 192x192 con herramientas como:
   - https://www.iloveimg.com/resize-image
   - Photoshop
   - GIMP
   - Paint.NET
3. Guárdalo como `icon-192.png` en `/public`
4. Haz otro de 96x96 y guárdalo como `icon-96.png`

**Colores sugeridos para el ícono:**
- Fondo: Gradiente de amarillo/rosa/morado (los colores de Informa)
- Logo: Blanco o el logo circular actual

**Si no tienes logo aún**, puedes usar temporalmente estos servicios:
- https://www.favicon-generator.org/
- https://realfavicongenerator.net/

---

### 3️⃣ Instalar Dependencias (si aún no lo hiciste)

Abre la terminal en VS Code y ejecuta:

```bash
npm install
```

O si usas yarn:

```bash
yarn install
```

---

### 4️⃣ Verificar Variables de Entorno

Asegúrate de tener tu archivo `.env.local` con:

```env
VITE_SUPABASE_URL=tu-url-de-supabase
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

---

### 5️⃣ Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

O si usas yarn:

```bash
yarn dev
```

---

### 6️⃣ Probar las Notificaciones Push

1. **Abre la app** en Chrome, Edge o Firefox (Safari iOS 16.4+)
2. **Espera 3 segundos** - Aparecerá un diálogo pidiendo permiso
3. **Click en "Activar notificaciones"**
4. **Verás una notificación de prueba** "🔥 ¡Informa! - Las notificaciones están activas"
5. **Cierra la pestaña** (pero deja el navegador abierto)
6. **Pídele a alguien que publique una noticia o alerta importante**
7. **¡Deberías recibir la notificación con sonido!** 🔔

---

## 🔧 Troubleshooting

### ❌ "No aparece el diálogo de permisos"

**Solución:**
```javascript
// Abre la consola del navegador (F12) y ejecuta:
Notification.requestPermission()
```

---

### ❌ "Las notificaciones no tienen sonido"

**Causa:** El navegador está en modo silencio o las notificaciones están desactivadas en el sistema operativo.

**Solución:**
1. **Windows:** Configuración > Sistema > Notificaciones > Asegúrate que Chrome/Edge esté permitido
2. **macOS:** Preferencias > Notificaciones > Chrome/Edge > Activar
3. **Android:** Configuración > Apps > Chrome > Notificaciones > Activar todo

---

### ❌ "Service Worker no se registra"

**Solución:**
1. Abre DevTools (F12)
2. Ve a Application > Service Workers
3. Click en "Unregister" si hay uno viejo
4. Refresca la página (F5)
5. Verifica que aparezca el service worker activo

---

### ❌ "Los badges no aparecen"

**Causa:** El endpoint `/notifications/new-content` no está respondiendo.

**Solución:**
1. Abre DevTools (F12) > Network
2. Filtra por "new-content"
3. Si ves error 500, revisa los logs del backend
4. Verifica que el backend esté corriendo en Supabase Edge Functions

---

## 📱 Compatibilidad

### ✅ Funciona en:
- Chrome (Android y Desktop) - 100%
- Edge (Desktop) - 100%
- Firefox (Android y Desktop) - 100%
- Safari iOS 16.4+ - 90% (sin vibración)
- Safari macOS - 95%

### ❌ NO funciona en:
- Safari iOS anterior a 16.4
- Navegadores en modo incógnito
- Si el navegador está COMPLETAMENTE cerrado (no en background)

---

## 🎨 Personalizar el Estilo

### Cambiar colores de los badges:

Edita `/components/NewContentBadge.tsx`:

```typescript
// Línea 22-23
<Badge className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 text-white">
  {displayCount}
</Badge>
```

Cambia los colores: `from-red-500 via-pink-500 to-purple-600`

---

### Cambiar el banner superior:

Edita `/components/NewContentBanner.tsx`:

```typescript
// Línea 77-78
<div className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white">
```

---

## 🔔 Cómo Funcionan las Notificaciones

### Automáticas (Backend envía):
1. **Noticias importantes** - Cuando alguien publica una noticia de categoría "salseo" o "trend"
2. **Alertas críticas** - Cuando alguien publica una alerta de prioridad "crítica" o "alta"

### Manuales (Polling cada 30 segundos):
1. **Nuevos clasificados** - Badge en el tab
2. **Nuevos foros** - Badge en el tab
3. **Eventos nuevos** - En el feed unificado

---

## 🧪 Testing en Desarrollo

### Simular una notificación push:

Abre la consola del navegador (F12) y ejecuta:

```javascript
new Notification('🔥 Prueba de Informa', {
  body: 'Esta es una notificación de prueba',
  icon: '/icon-192.png',
  badge: '/icon-96.png',
  tag: 'test',
  vibrate: [200, 100, 200]
})
```

---

## 📊 Monitoreo

### Ver suscripciones push en el backend:

Los datos se guardan en el KV store con la key:
```
push_subscription:{userId}
```

### Ver contadores de contenido nuevo:

Se actualizan cada 30 segundos desde:
```
GET /notifications/new-content?since=2024-11-12T10:00:00Z
```

---

## 🚀 Deploy a Producción

### Si usas Vercel/Netlify:

1. **Sube todo el código** (incluyendo `/public/service-worker.js`)
2. **Configura las variables de entorno** en el dashboard
3. **Asegúrate que el Service Worker se sirva** desde la raíz
4. **Verifica HTTPS** - Las notificaciones push SOLO funcionan con HTTPS

### Si usas hosting tradicional:

1. **Sube todos los archivos**
2. **Verifica que `/service-worker.js` sea accesible** desde `https://tudominio.com/service-worker.js`
3. **Configura headers CORS** si es necesario

---

## 💡 Tips Adicionales

### Mejorar el rendimiento:

1. **Lazy loading ya está implementado** en `PushNotificationManager`
2. **Polling se pausa** cuando no hay conexión (`navigator.onLine`)
3. **Service Worker cachea** el registro para evitar re-registros

### Personalizar frecuencia de chequeo:

En `/App.tsx` línea ~213, cambia:

```typescript
}, 30000) // 30 segundos
```

A lo que prefieras (en milisegundos):
- `10000` = 10 segundos (más rápido, más requests)
- `60000` = 1 minuto (más lento, menos requests)
- `120000` = 2 minutos (muy lento)

---

## 🆘 Soporte

Si algo no funciona:

1. **Revisa la consola del navegador** (F12 > Console)
2. **Revisa los logs del backend** en Supabase > Edge Functions > Logs
3. **Verifica que el Service Worker esté activo** (F12 > Application > Service Workers)
4. **Asegúrate de tener HTTPS** (las notificaciones no funcionan en HTTP)

---

## ✅ Checklist Final

Antes de dar por terminado, verifica:

- [ ] Los iconos `/public/icon-192.png` y `/public/icon-96.png` existen
- [ ] El Service Worker se registra correctamente (F12 > Application)
- [ ] Aparece el diálogo de permisos después de 3 segundos
- [ ] Las notificaciones llegan con sonido
- [ ] Los badges aparecen en los tabs cuando hay contenido nuevo
- [ ] El banner superior aparece con nuevo contenido
- [ ] Click en "Ver ahora" navega a la sección correcta
- [ ] El backend envía notificaciones push para alertas críticas

---

## 🎉 ¡Listo!

Tu app **Informa** ahora tiene notificaciones push profesionales como WhatsApp, Facebook o Instagram.

Los usuarios de Gualán recibirán alertas importantes aunque tengan la app cerrada. 🔔🔥

---

**Desarrollado para:** Comunidad de Gualán, Zacapa, Guatemala  
**Fecha:** Noviembre 2024  
**Versión:** 2.0 - Sistema Push Completo
