# 🚀 Guía de Despliegue - Informa PWA

## Despliegue en Vercel

### Paso 1: Preparar el Proyecto

1. **Asegúrate de tener todos los archivos PWA:**
   - ✅ `/index.html` - Archivo HTML principal con meta tags
   - ✅ `/public/manifest.json` - Manifiesto de la PWA
   - ✅ `/public/service-worker.js` - Service worker para offline
   - ✅ `/public/browserconfig.xml` - Configuración para Windows
   - ✅ `/components/PWAInstallPrompt.tsx` - Prompt de instalación
   - ✅ `/components/PWANetworkStatus.tsx` - Indicador de conexión

2. **Crear íconos de la aplicación:**
   
   Necesitas crear los siguientes íconos en `/public/icons/`:
   
   ```
   /public/icons/
   ├── icon-72x72.png
   ├── icon-96x96.png
   ├── icon-128x128.png
   ├── icon-144x144.png
   ├── icon-152x152.png
   ├── icon-167x167.png (para iPad)
   ├── icon-180x180.png (para iPhone)
   ├── icon-192x192.png
   ├── icon-384x384.png
   ├── icon-512x512.png
   ├── apple-touch-icon.png (180x180)
   ├── favicon-32x32.png
   ├── favicon-16x16.png
   ├── og-image.png (1200x630 para Open Graph)
   └── twitter-image.png (1200x600)
   ```

   **Herramientas recomendadas:**
   - [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
   - [Favicon Generator](https://realfavicongenerator.net/)
   - Usa el logo circular existente (`logoCircular`) como base

### Paso 2: Configurar Vercel

1. **Instalar Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Iniciar sesión:**
   ```bash
   vercel login
   ```

3. **Configurar el proyecto:**
   Crea un archivo `vercel.json` en la raíz:

   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite",
     "rewrites": [
       { "source": "/(.*)", "destination": "/" }
     ],
     "headers": [
       {
         "source": "/service-worker.js",
         "headers": [
           {
             "key": "Cache-Control",
             "value": "public, max-age=0, must-revalidate"
           },
           {
             "key": "Service-Worker-Allowed",
             "value": "/"
           }
         ]
       },
       {
         "source": "/manifest.json",
         "headers": [
           {
             "key": "Content-Type",
             "value": "application/manifest+json"
           }
         ]
       },
       {
         "source": "/(.*)",
         "headers": [
           {
             "key": "X-Content-Type-Options",
             "value": "nosniff"
           },
           {
             "key": "X-Frame-Options",
             "value": "DENY"
           },
           {
             "key": "X-XSS-Protection",
             "value": "1; mode=block"
           }
         ]
       }
     ]
   }
   ```

### Paso 3: Variables de Entorno

Configura las variables de entorno en Vercel:

```bash
# En el dashboard de Vercel o via CLI:
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

### Paso 4: Desplegar

```bash
# Despliegue de prueba
vercel

# Despliegue a producción
vercel --prod
```

### Paso 5: Configuración Post-Despliegue

1. **Configurar dominio personalizado (opcional):**
   ```bash
   vercel domains add informa-gualan.com
   ```

2. **Habilitar HTTPS:**
   - Vercel automáticamente habilita HTTPS
   - Asegúrate de que todas las URLs usen HTTPS

3. **Configurar Analytics:**
   - Habilita Vercel Analytics en el dashboard
   - Agrega Google Analytics si deseas

## Verificación de PWA

### Después del despliegue, verifica:

1. **Lighthouse Audit:**
   - Abre Chrome DevTools
   - Ve a "Lighthouse"
   - Ejecuta audit para "Progressive Web App"
   - Objetivo: 90+ puntos

2. **Checklist PWA:**
   - ✅ Manifest válido
   - ✅ Service Worker registrado
   - ✅ HTTPS habilitado
   - ✅ Iconos de todos los tamaños
   - ✅ Meta tags para móviles
   - ✅ Responsive design
   - ✅ Funciona offline (caché básico)

3. **Probar en dispositivos:**
   - Android Chrome: "Agregar a pantalla de inicio"
   - iOS Safari: "Agregar a inicio"
   - Desktop Chrome: Ícono de instalación en la barra de direcciones

## Características PWA Implementadas

### ✅ Instalación
- Prompt personalizado para Android/Desktop
- Instrucciones específicas para iOS
- Detección automática de plataforma

### ✅ Funcionalidad Offline
- Service Worker con estrategia de caché inteligente
- Network-first para API calls
- Cache-first para assets estáticos
- Fallback para contenido sin conexión

### ✅ Notificaciones Push (Preparado)
- Service worker listo para push notifications
- Manejadores de eventos configurados
- Integración lista para Supabase Realtime

### ✅ Experiencia Nativa
- Splash screen personalizado
- Theme color matching
- Orientación portrait optimizada
- Shortcuts de acceso rápido

## Optimizaciones para Móviles

### Performance
- Service Worker con caché inteligente
- Lazy loading de imágenes
- Code splitting automático (Vite)
- Compresión de assets

### UX Móvil
- Viewport optimizado
- Touch gestures habilitados
- Prevent double-tap zoom
- Bottom sheet para iOS
- Material Design para Android

### Conectividad
- Indicador online/offline
- Auto-retry en API calls
- Sincronización en background (preparado)
- Optimistic UI updates

## Monitoreo y Mantenimiento

### Actualizar la PWA
```bash
# 1. Hacer cambios en el código
# 2. Actualizar versión en service-worker.js (CACHE_NAME)
# 3. Desplegar
vercel --prod

# Los usuarios verán un prompt para actualizar
```

### Logs y Debugging
```bash
# Ver logs en tiempo real
vercel logs [deployment-url]

# Ver logs de producción
vercel logs --prod
```

### Analytics
- Monitorea instalaciones de la PWA
- Tracking de uso offline
- Errores de Service Worker
- Métricas de performance

## Troubleshooting

### Service Worker no se registra
- Verifica que el archivo esté en `/public/service-worker.js`
- Asegúrate de que la app esté en HTTPS
- Limpia caché del navegador
- Revisa Console en DevTools

### Manifest no se detecta
- Valida el JSON en [Web App Manifest Validator](https://manifest-validator.appspot.com/)
- Verifica que la ruta en index.html sea correcta
- Asegúrate de que Content-Type sea `application/manifest+json`

### Íconos no aparecen
- Verifica que todos los tamaños existan
- Asegúrate de que las rutas en manifest.json sean correctas
- Usa formato PNG (no JPG)
- Tamaños exactos requeridos

### PWA no pasa Lighthouse
- Revisa cada criterio fallado
- Asegúrate de tener HTTPS
- Verifica que el Service Worker esté activo
- Confirma que manifest.json sea válido

## Recursos Adicionales

- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Workbox (Service Worker Library)](https://developers.google.com/web/tools/workbox)
- [Web App Manifest](https://web.dev/add-manifest/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

## Soporte

Para problemas específicos de despliegue:
1. Revisa logs en Vercel Dashboard
2. Verifica Supabase Edge Functions
3. Consulta la documentación de Vercel
4. Revisa la consola del navegador

---

**Versión:** 1.0.0  
**Última actualización:** Octubre 2025  
**Plataforma:** Vercel + Supabase
