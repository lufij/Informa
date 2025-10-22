# 🔍 Diagnóstico PWA - Android

## Cambios Realizados

### ✅ 1. Service Worker Registrado
- **Archivo**: `src/main.tsx`
- **Acción**: Se agregó el registro automático del Service Worker
- **Verificación**: Abre la consola del navegador (Chrome DevTools) y busca el mensaje:
  ```
  SW registrado: https://tu-dominio/
  ```

### ✅ 2. Manifest.json Configurado
- **Ubicación**: Movido de `src/public/` a `public/` (raíz del proyecto)
- **Link agregado** en `index.html`:
  ```html
  <link rel="manifest" href="/manifest.json" />
  ```

### ✅ 3. Meta Tags PWA
- **Archivo**: `index.html`
- Se agregaron todos los meta tags necesarios:
  - `theme-color`
  - `apple-mobile-web-app-capable`
  - Apple Touch Icons
  - Microsoft Tiles

### ✅ 4. Instalación Android Mejorada
- **Archivo**: `src/components/FloatingInstallButton.tsx`
- **Cambio**: Ahora verifica si hay `deferredPrompt` antes de intentar instalar
- **Fallback**: Si no hay prompt, muestra instrucciones manuales

### ✅ 5. Cámara de Perfil
- **Archivo**: `src/components/UserSettings.tsx`
- **Cambio**: `capture="environment"` → `capture="user"`
- **Motivo**: Para usar la cámara **frontal** (selfie) en lugar de la trasera

---

## 🧪 Cómo Verificar en Android

### Paso 1: Verificar Service Worker
1. Abre Chrome en tu Android
2. Visita tu app: `https://tu-dominio.com`
3. En la barra de direcciones, toca los 3 puntos (⋮)
4. Selecciona **"Información del sitio"** o **"Site settings"**
5. Verifica que aparezca:
   - ✅ **Service Worker**: Activo
   - ✅ **Manifest**: Detectado

**Alternativa con Chrome DevTools:**
1. Conecta tu Android al PC por USB
2. En Chrome PC, ve a `chrome://inspect#devices`
3. Inspecciona tu página
4. Ve a la pestaña **Application**
5. Verifica:
   - **Service Workers**: Debe aparecer registrado
   - **Manifest**: Debe mostrar el nombre "Informa"

### Paso 2: Verificar Criterios de Instalabilidad
Para que aparezca el prompt de instalación, se deben cumplir:

✅ **HTTPS**: Tu app debe estar en HTTPS (Vercel lo hace automáticamente)
✅ **Manifest válido**: Con name, icons, start_url, display
✅ **Service Worker**: Registrado y activo
✅ **No instalada previamente**: Si ya la instalaste, desinstálala primero
✅ **Engagement**: Chrome puede requerir 30 segundos de interacción

### Paso 3: Probar Instalación

#### Opción A: Con el Botón Flotante
1. Espera a que aparezca el botón flotante morado (esquina inferior derecha)
2. Toca el botón
3. Deberías ver el diálogo nativo de Chrome: **"¿Instalar Informa?"**
4. Toca **"Instalar"**

#### Opción B: Desde el Menú de Chrome
1. Toca los 3 puntos (⋮) en Chrome
2. Busca la opción **"Instalar aplicación"** o **"Agregar a pantalla de inicio"**
3. Toca esa opción
4. Confirma la instalación

### Paso 4: Verificar la Cámara
1. Inicia sesión en la app
2. Ve a tu perfil (icono de usuario arriba a la derecha)
3. Toca **"Cambiar foto de perfil"**
4. Selecciona **"O elegir desde galería/cámara"**
5. Deberías ver 2 opciones:
   - 📷 **Cámara** (debería abrir la cámara frontal directamente)
   - 🖼️ **Galería** (para seleccionar una foto existente)

---

## 🐛 Problemas Comunes y Soluciones

### ❌ Problema: No aparece el botón de instalar

**Causas posibles:**
1. **Ya instalaste la app antes**: Desinstálala completamente
   - Mantén presionado el icono de la app → "Desinstalar"
   - Limpia datos de Chrome: Configuración → Apps → Chrome → Almacenamiento → Borrar datos

2. **Service Worker no se registró**: Verifica en DevTools
   ```javascript
   // En la consola del navegador, ejecuta:
   navigator.serviceWorker.getRegistrations().then(r => console.log(r))
   ```
   Debería mostrar al menos 1 registro.

3. **Manifest no se carga**: Verifica en DevTools → Application → Manifest
   - Si no aparece, verifica que `/manifest.json` sea accesible

4. **Criterios no cumplidos**: Asegúrate de estar en HTTPS

### ❌ Problema: La cámara no se abre

**Soluciones:**
1. **Permisos**: Ve a Configuración → Apps → Chrome → Permisos → Cámara → Permitir
2. **Alternativa con getUserMedia**: Si `capture="user"` no funciona en tu dispositivo:
   - Usa el botón de cámara que captura con getUserMedia API
   - Este método es más robusto y compatible

3. **Prueba manual**: 
   - Selecciona "Galería/Cámara"
   - Si tu sistema te pregunta qué app usar, elige "Cámara"

### ❌ Problema: El prompt de instalación no aparece

**Solución temporal:**
1. En Chrome, ve a: `chrome://flags/#bypass-app-banner-engagement-checks`
2. Actívalo (Enable)
3. Reinicia Chrome
4. Esto elimina el requisito de 30 segundos de engagement

---

## 📊 Logs de Diagnóstico

Para ayudarme a diagnosticar, envíame los logs de la consola:

1. Abre Chrome DevTools (Remote Debugging o en el navegador)
2. Ve a la pestaña **Console**
3. Busca estos mensajes:

```javascript
// Service Worker
✅ "SW registrado: ..."
❌ "Error al registrar SW: ..."

// PWA Install
✅ "Evento beforeinstallprompt capturado"
✅ "Intentando instalar PWA..."
✅ "Prompt mostrado: ..."
✅ "Resultado de instalación: accepted"
❌ "No hay deferredPrompt disponible"
❌ "Error al instalar PWA: ..."
```

---

## 🚀 Próximos Pasos

Si todo funciona:
1. ✅ La app se instala desde el botón flotante
2. ✅ La cámara se abre correctamente
3. ✅ Las notificaciones funcionan

Si algo falla, envíame:
1. Screenshots de Chrome DevTools → Application → Manifest
2. Screenshots de Chrome DevTools → Application → Service Workers
3. Logs de la consola (busca errores en rojo)
4. Modelo y versión de Android
5. Versión de Chrome

---

## 📝 Notas Técnicas

### Archivos Modificados
```
✅ index.html - Meta tags y manifest link
✅ src/main.tsx - Registro del Service Worker
✅ src/App.tsx - Mejor manejo de handleInstallPWA con logs
✅ src/components/FloatingInstallButton.tsx - Verificación de deferredPrompt
✅ src/components/UserSettings.tsx - capture="user" para cámara frontal
✅ public/ - Movido desde src/public/ (manifest, service-worker, icons)
```

### Service Worker Path
- **Desarrollo**: `/service-worker.js` (servido desde `public/`)
- **Producción**: `/service-worker.js` (copiado automáticamente por Vite)

### Manifest Path
- **Desarrollo**: `/manifest.json` (servido desde `public/`)
- **Producción**: `/manifest.json` (copiado automáticamente por Vite)

---

**Última actualización**: ${new Date().toISOString()}
**Build Version**: Vercel auto-deploy desde GitHub
