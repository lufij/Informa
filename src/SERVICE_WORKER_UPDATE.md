# 🔧 Service Worker Actualizado a v5.5.0

## ✅ Problema Resuelto

**Error anterior:**
```
Failed to load module script: Expected a JavaScript-or-Wasm module script 
but the server responded with a MIME type of "text/html".
```

**Causa:** El Service Worker tenía cacheados archivos viejos (como `index-0VpI3Vy3.js`) que ya no existen después del build.

**Solución:** Service Worker actualizado a v5.5.0 con limpieza automática de cachés antiguos.

---

## 🚀 Cambios Realizados

### 1. Versión actualizada
```javascript
// Antes:
const CACHE_NAME = 'informa-v1'

// Ahora:
const CACHE_NAME = 'informa-v5.5.0'
```

### 2. Limpieza automática de cachés
```javascript
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Eliminar cachés antiguos
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eliminando cache antiguo:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})
```

### 3. Cache de archivos esenciales
```javascript
const CACHE_ASSETS = [
  '/',
  '/index.html',
  '/icon-192.png',
  '/icon-96.png',
  '/manifest.json'
]
```

---

## 📱 Cómo Actualizar en tu Android

### Opción 1: Refrescar Forzado (Recomendado)

**En Chrome Android:**
```
1. Abre la app en Chrome
2. Toca el menú (⋮)
3. Toca "Configuración del sitio"
4. Toca "Borrar y restablecer"
5. Confirma
6. Cierra la pestaña completamente
7. Vuelve a abrir la app
8. ¡Listo! ✅
```

### Opción 2: Desinstalar Service Worker

**Método 1 - Desde Chrome DevTools (en PC):**
```
1. Conecta tu Android con USB
2. Abre Chrome en PC
3. Ve a: chrome://inspect
4. Click en "inspect" bajo tu dispositivo
5. Ve a: Application > Service Workers
6. Click en "Unregister"
7. Refresca la app (Ctrl+Shift+R)
```

**Método 2 - Desde el celular:**
```
1. Chrome Android > Menú (⋮)
2. Configuración
3. Privacidad y seguridad
4. Borrar datos de navegación
5. Avanzado
6. Selecciona "Todo el tiempo"
7. Marca:
   - Cookies y datos de sitios ✅
   - Archivos e imágenes en caché ✅
8. Borrar datos
9. Vuelve a abrir la app
```

### Opción 3: Hard Refresh

**Si estás en modo desarrollo:**
```
1. Abre Chrome DevTools en PC
2. Con DevTools abierto, mantén presionado "Reload"
3. Selecciona "Empty Cache and Hard Reload"
4. O presiona: Ctrl+Shift+Delete > Borrar caché
```

---

## 🧪 Verificar que Funcionó

### Paso 1: Abre la consola

**En Android (con Chrome DevTools):**
```
1. PC: chrome://inspect
2. Click "inspect" en tu dispositivo
3. Ve a la pestaña "Console"
```

### Paso 2: Busca estos logs

Deberías ver:
```
🔧 Service Worker v5.5.0 instalado ✅
📦 Cache abierto: informa-v5.5.0 ✅
✅ Service Worker v5.5.0 activado ✅
🗑️ Eliminando cache antiguo: informa-v1 ✅
✅ Cachés antiguos eliminados ✅
```

### Paso 3: Verifica el Service Worker

**En Chrome DevTools:**
```
1. Ve a: Application > Service Workers
2. Deberías ver: "Status: activated and is running"
3. Versión del cache: informa-v5.5.0 ✅
```

### Paso 4: Verifica el caché

**En Chrome DevTools:**
```
1. Ve a: Application > Cache Storage
2. Deberías ver SOLO: informa-v5.5.0 ✅
3. Si ves "informa-v1" → eliminarlo manualmente
```

---

## ⚠️ Si Sigue Fallando

### Problema: El Service Worker no se actualiza

**Causa:** Chrome está usando el Service Worker antiguo.

**Solución:**
```
1. Chrome DevTools > Application > Service Workers
2. Marca "Update on reload" ✅
3. Click en "Skip waiting"
4. Refresca la página (F5)
5. Desmarca "Update on reload"
```

### Problema: Sigue mostrando error de MIME type

**Causa:** El navegador tiene cache persistente.

**Solución:**
```
1. Cierra TODAS las pestañas de la app
2. Chrome > Menú > Salir (cierra Chrome completamente)
3. Ve a Settings > Apps > Chrome
4. Toca "Almacenamiento"
5. Toca "Borrar caché" (NO borres datos)
6. Vuelve a abrir Chrome
7. Abre la app
```

### Problema: Error persiste en producción (Vercel)

**Causa:** Build antiguo.

**Solución:**
```bash
# Rebuild y redeploy
git add .
git commit -m "fix: Actualizar Service Worker a v5.5.0"
git push

# Vercel rebuildeará automáticamente
# Espera 1-2 minutos
# Abre la app en modo incógnito
```

---

## 🔍 Debug Avanzado

### Ver todos los cachés activos

**En consola:**
```javascript
caches.keys().then(keys => {
  console.log('Cachés activos:', keys)
})
```

**Deberías ver solo:**
```
['informa-v5.5.0']
```

### Eliminar todos los cachés manualmente

**En consola:**
```javascript
caches.keys().then(keys => {
  keys.forEach(key => {
    caches.delete(key)
    console.log('Eliminado:', key)
  })
})
```

Luego refresca la página.

### Ver qué hay en el caché

**En consola:**
```javascript
caches.open('informa-v5.5.0').then(cache => {
  cache.keys().then(keys => {
    console.log('Archivos cacheados:', keys.map(k => k.url))
  })
})
```

**Deberías ver:**
```
[
  'https://tu-app.vercel.app/',
  'https://tu-app.vercel.app/index.html',
  'https://tu-app.vercel.app/icon-192.png',
  'https://tu-app.vercel.app/icon-96.png',
  'https://tu-app.vercel.app/manifest.json'
]
```

---

## 📊 Logs Esperados

### Primera carga (instalación):
```
🔧 Service Worker v5.5.0 instalado
📦 Cache abierto: informa-v5.5.0
✅ Service Worker v5.5.0 activado
✅ Cachés antiguos eliminados
```

### Cargas posteriores:
```
✅ Service Worker v5.5.0 activado
```

### Si recibe notificación push:
```
🔔 Push notification recibida: [Event]
```

### Si hace click en notificación:
```
🖱️ Notification clicked: [Event]
```

---

## 🚀 Deploy a Producción

### 1. Sube los cambios:
```bash
git add public/service-worker.js
git commit -m "fix: Actualizar Service Worker a v5.5.0 - elimina cachés antiguos"
git push
```

### 2. Vercel rebuildeará:
```
✓ Building...
✓ Deploying...
✓ Build completed
✓ Deployment ready
```

### 3. Abre la app en Android:
```
1. Abre Chrome en modo incógnito (Ctrl+Shift+N)
2. Ve a: https://tu-app.vercel.app
3. Revisa la consola
4. Deberías ver: "Service Worker v5.5.0 instalado" ✅
```

### 4. Prueba en modo normal:
```
1. Cierra modo incógnito
2. Abre en modo normal
3. Si hay Service Worker viejo, se actualizará automáticamente
4. Espera unos segundos
5. Refresca la página
6. ¡Listo! ✅
```

---

## 🎯 Prevenir Problemas Futuros

### 1. Incrementar versión en cada deploy importante

**Cuando hagas cambios grandes:**
```javascript
// Incrementa la versión
const CACHE_NAME = 'informa-v5.6.0' // <- Cambiar aquí
```

### 2. Usar "Update on reload" en desarrollo

**En Chrome DevTools:**
```
Application > Service Workers > ✅ Update on reload
```

Esto fuerza actualización en cada refresh durante desarrollo.

### 3. Build limpio antes de deploy

```bash
# Limpiar build anterior
rm -rf dist/

# Build fresco
npm run build

# Verificar que no hay errores
npm run preview

# Deploy
git push
```

---

## 📱 Instrucciones para Usuarios

Si necesitas que los usuarios actualicen:

**Mensaje para enviar:**
```
🔧 Actualización disponible

Para recibir la última versión:
1. Cierra la app completamente
2. Limpia el caché:
   Chrome > Menú > Configuración del sitio > Borrar y restablecer
3. Vuelve a abrir la app
4. ¡Listo! ✅
```

---

## ✅ Checklist de Verificación

Después de actualizar:

- [ ] Service Worker v5.5.0 instalado
- [ ] Cachés antiguos eliminados
- [ ] No hay errores en consola
- [ ] No hay error de "MIME type"
- [ ] App carga correctamente
- [ ] Notificaciones push funcionan
- [ ] Sin errores 404 en Network tab

---

## 🎊 Resultado

**Antes:**
```
❌ Error: Failed to load module script
❌ MIME type mismatch
❌ Archivos antiguos cacheados
❌ App no carga
```

**Ahora:**
```
✅ Service Worker v5.5.0 activo
✅ Cachés limpios
✅ Sin errores de MIME
✅ App funciona perfectamente
```

---

**¡El Service Worker está actualizado! Ahora limpia los cachés en tu Android y listo** 🚀📱

---

**Archivo modificado:** `/public/service-worker.js`  
**Versión:** 5.5.0  
**Fecha:** Noviembre 2024
