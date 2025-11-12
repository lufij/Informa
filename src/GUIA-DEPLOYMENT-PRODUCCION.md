# 🚀 Guía Completa de Deployment - Informa

## 📋 Pre-Requisitos

Antes de comenzar, asegúrate de tener:
- [x] Cuenta de GitHub (ya tienes el repo en https://github.com/lufij/Informa)
- [x] Cuenta de Supabase (ya configurada)
- [ ] Cuenta de Vercel (recomendado) o Netlify
- [x] Node.js instalado
- [x] Git configurado
- [x] Supabase CLI instalado

---

## 🎯 PASO 1: Preparación del Código

### 1.1 Verificar Build Local

```bash
# Navega a tu proyecto
cd /ruta/a/Informa

# Instalar dependencias (si no lo has hecho)
npm install

# Crear build de producción
npm run build

# Verificar que no hay errores
# Deberías ver: "✓ built in XXXms"
```

**✅ Checklist:**
- [ ] Build exitoso sin errores
- [ ] Carpeta `dist/` creada
- [ ] No hay warnings críticos

### 1.2 Probar Build Localmente

```bash
# Preview del build
npm run preview

# Abrir en navegador: http://localhost:4173
# Verificar que todo funciona correctamente
```

**Probar:**
- [ ] Login/Signup funciona
- [ ] Publicar contenido funciona
- [ ] Notificaciones funcionan
- [ ] Navegación entre secciones

### 1.3 Commit y Push a GitHub

```bash
# Ver cambios
git status

# Agregar todos los archivos
git add .

# Commit con mensaje descriptivo
git commit -m "feat: sistema de notificaciones completo - listo para producción"

# Push al repositorio
git push origin main
```

---

## 🗄️ PASO 2: Deploy del Backend (Supabase)

### 2.1 Verificar Supabase CLI

```bash
# Verificar que estás logueado
supabase status

# Si no estás logueado:
supabase login
```

### 2.2 Deploy de Edge Functions

```bash
# Deploy la función del servidor
supabase functions deploy server

# Deberías ver:
# ✓ Deployed Function server successfully
```

### 2.3 Verificar Variables de Entorno

```bash
# Listar secrets
supabase secrets list

# Deberías ver:
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - SUPABASE_DB_URL
```

**Si faltan secrets, agregarlos:**

```bash
# Agregar secret (ejemplo)
supabase secrets set MY_SECRET_KEY=valor_secreto
```

### 2.4 Probar el Backend

```bash
# Obtener URL de tu proyecto
# La tienes en /utils/supabase/info.tsx

# Probar endpoint de salud (reemplaza PROJECT_ID)
curl https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-3467f1c6/health
```

**Respuesta esperada:**
```json
{ "status": "ok" }
```

### 2.5 Ver Logs del Backend

```bash
# Ver logs en tiempo real
supabase functions logs server --tail

# Dejar corriendo en una terminal mientras pruebas
```

---

## 🌐 PASO 3: Deploy del Frontend (Vercel)

### Opción A: Deploy con Vercel (RECOMENDADO)

#### 3.1 Instalar Vercel CLI

```bash
npm install -g vercel
```

#### 3.2 Login a Vercel

```bash
vercel login

# Seguir instrucciones en el navegador
```

#### 3.3 Deploy

```bash
# Desde la raíz del proyecto
vercel

# Primera vez, responder:
# ? Set up and deploy "~/Informa"? [Y/n] Y
# ? Which scope? (tu usuario)
# ? Link to existing project? [y/N] N
# ? What's your project's name? informa
# ? In which directory is your code located? ./
# ? Want to override the settings? [y/N] N

# Deploy a producción
vercel --prod
```

**✅ Al finalizar verás:**
```
✅  Production: https://informa-xxx.vercel.app
```

#### 3.4 Configurar Variables de Entorno en Vercel

1. Ve a tu dashboard: https://vercel.com/dashboard
2. Selecciona el proyecto "informa"
3. Settings > Environment Variables
4. Agregar variables:

```bash
# No necesitas agregar nada si usas los valores por defecto
# Las variables de Supabase ya están en /utils/supabase/info.tsx
```

---

### Opción B: Deploy con Netlify

#### 3.1 Instalar Netlify CLI

```bash
npm install -g netlify-cli
```

#### 3.2 Login a Netlify

```bash
netlify login
```

#### 3.3 Deploy

```bash
# Desde la raíz del proyecto
netlify init

# Responder:
# ? What would you like to do? Create & configure a new site
# ? Team: (tu equipo)
# ? Site name: informa-gualan
# ? Build command: npm run build
# ? Directory to deploy: dist
# ? Netlify functions folder: (dejar vacío)

# Deploy
netlify deploy --prod
```

---

## 🔧 PASO 4: Configuración Post-Deploy

### 4.1 Configurar Dominio Personalizado (Opcional)

#### En Vercel:

1. Dashboard > Project > Settings > Domains
2. Add Domain: `informa.gualan.gt` (ejemplo)
3. Seguir instrucciones DNS

#### En Netlify:

1. Site Settings > Domain Management
2. Add Custom Domain
3. Configurar DNS

### 4.2 Configurar Redirects para PWA

Crear archivo `/public/_redirects` (si usas Netlify):

```
/*    /index.html   200
```

O `vercel.json` (si usas Vercel):

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 4.3 Habilitar HTTPS

**En Vercel:** Automático ✅
**En Netlify:** Automático ✅

### 4.4 Configurar Manifest PWA

Verificar que `/public/manifest.json` tiene la URL correcta:

```json
{
  "name": "Informa - Gualán",
  "short_name": "Informa",
  "start_url": "https://tu-dominio.vercel.app",
  "scope": "/",
  ...
}
```

---

## ✅ PASO 5: Verificación Post-Deploy

### 5.1 Checklist de Funcionalidad

Visita tu URL de producción y verifica:

#### Funcionalidades Básicas:
- [ ] La app carga correctamente
- [ ] El logo aparece
- [ ] Los colores se ven bien
- [ ] Responsive en móvil

#### Autenticación:
- [ ] Registro de nuevo usuario funciona
- [ ] Login funciona
- [ ] Logout funciona
- [ ] Sesión persiste al recargar

#### Contenido:
- [ ] Publicar noticia funciona
- [ ] Publicar alerta funciona
- [ ] Publicar clasificado funciona
- [ ] Publicar foro funciona
- [ ] Subir imágenes funciona
- [ ] Comentarios funcionan
- [ ] Reacciones funcionan

#### Notificaciones:
- [ ] Notificaciones in-app funcionan
- [ ] Banner de nuevo contenido aparece
- [ ] Preferencias se guardan
- [ ] Notificaciones push funcionan (en navegadores compatibles)

#### PWA:
- [ ] Prompt de instalación aparece
- [ ] Se puede instalar la app
- [ ] Funciona offline (básico)
- [ ] Iconos aparecen correctamente

#### Admin/Moderación:
- [ ] Panel de admin funciona (usuario 50404987)
- [ ] Eliminar contenido funciona
- [ ] Asignar moderadores funciona
- [ ] Bomberos pueden publicar alertas por voz

### 5.2 Pruebas en Diferentes Dispositivos

#### Desktop:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

#### Mobile:
- [ ] Android Chrome
- [ ] iOS Safari
- [ ] Samsung Internet

### 5.3 Pruebas de Performance

```bash
# Lighthouse en Chrome DevTools
# F12 > Lighthouse > Analyze page load

# Targets:
# Performance: > 80
# Accessibility: > 90
# Best Practices: > 80
# SEO: > 80
# PWA: > 80
```

### 5.4 Verificar Logs del Backend

```bash
# Terminal abierta con logs
supabase functions logs server --tail

# Ejecutar acciones en la app y verificar logs:
# - Login: ✅ "Login successful for user..."
# - Publicar: ✅ "Created news post..."
# - Notificaciones: ✅ "Notification preferences updated..."
```

---

## 📱 PASO 6: Configuración Móvil

### 6.1 Iconos PWA

Verificar que existen en `/public/`:
- [ ] `icon-192.png` (192x192)
- [ ] `icon-512.png` (512x512)
- [ ] `favicon.ico`

### 6.2 Splash Screens iOS

Agregar en `/index.html` (opcional):

```html
<link rel="apple-touch-startup-image" href="/splash-640x1136.png">
<link rel="apple-touch-startup-image" href="/splash-750x1334.png">
```

### 6.3 Prueba de Instalación

#### Android:
1. Abrir Chrome
2. Visitar tu URL
3. Menú > "Agregar a pantalla de inicio"
4. Verificar que se instala

#### iOS:
1. Abrir Safari
2. Visitar tu URL
3. Compartir > "Añadir a pantalla de inicio"
4. Verificar que se instala

---

## 🔔 PASO 7: Configurar Notificaciones Push

### 7.1 Generar VAPID Keys

```bash
# Instalar web-push
npm install -g web-push

# Generar keys
web-push generate-vapid-keys

# Copiar la PUBLIC KEY
# Pegarla en /components/NotificationPreferences.tsx línea 103
```

**Reemplazar:**
```typescript
applicationServerKey: urlBase64ToUint8Array(
  'TU_PUBLIC_KEY_AQUI' // ← Pegar aquí
)
```

### 7.2 Guardar Private Key en Backend

```bash
# Agregar como secret en Supabase
supabase secrets set VAPID_PRIVATE_KEY="tu_private_key_aqui"
supabase secrets set VAPID_PUBLIC_KEY="tu_public_key_aqui"
```

### 7.3 Probar Notificaciones Push

1. Abrir la app
2. Login
3. Ir a preferencias de notificaciones
4. Activar "Notificaciones Push"
5. Aceptar permiso del navegador
6. Desde otro dispositivo, publicar contenido
7. Verificar que aparece notificación

---

## 📊 PASO 8: Monitoreo y Analytics

### 8.1 Configurar Google Analytics (Opcional)

1. Crear propiedad en https://analytics.google.com
2. Obtener ID de medición (G-XXXXXXXXXX)

Agregar en `/index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### 8.2 Configurar Sentry (Opcional)

```bash
npm install @sentry/react
```

En `/App.tsx`:

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "TU_DSN_AQUI",
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
});
```

### 8.3 Monitoreo de Supabase

Dashboard de Supabase:
- Reports > Database > Queries
- Reports > Functions > Invocations
- Reports > Auth > Users

---

## 🎉 PASO 9: Anuncio a la Comunidad

### 9.1 Crear Post de Lanzamiento

**En WhatsApp:**
```
🎉 ¡GRAN NOTICIA PARA GUALÁN! 🎉

Ya está lista nuestra nueva plataforma comunitaria: 

🔥 INFORMA - Lo que está pasando ahora

✅ Noticias verificadas de Gualán
✅ Alertas de emergencia
✅ Clasificados locales
✅ Foros de la comunidad
✅ ¡100% GRATIS!

📱 Accede ahora: https://tu-url.vercel.app

🎯 Instala la app en tu teléfono:
- Android: Menú > Agregar a inicio
- iPhone: Compartir > Añadir a inicio

¡Únete a tu comunidad digital! 🇬🇹
```

### 9.2 Preparar Material de Marketing

- [ ] Screenshots de la app
- [ ] Video tutorial corto
- [ ] Guía de uso básico
- [ ] FAQ en PDF

### 9.3 Plan de Comunicación

**Día 1:** Anuncio en WhatsApp
**Día 2:** Publicar en Facebook (si tienen)
**Día 3:** Flyers físicos en puntos clave
**Semana 1:** Tutorial en vivo por WhatsApp
**Mes 1:** Encuesta de feedback

---

## 🐛 PASO 10: Solución de Problemas Comunes

### Problema: Build falla

```bash
# Limpiar cache
rm -rf node_modules
rm package-lock.json
npm install

# Intentar build de nuevo
npm run build
```

### Problema: Backend no responde

```bash
# Verificar estado
supabase status

# Ver logs
supabase functions logs server

# Re-deploy
supabase functions deploy server
```

### Problema: Usuarios no pueden registrarse

1. Verificar Supabase Dashboard > Authentication
2. Settings > Auth > Email Auth debe estar habilitado
3. Verificar que la función de signup funciona:

```bash
curl -X POST https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-3467f1c6/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"phone": "12345678", "name": "Test User"}'
```

### Problema: Notificaciones no llegan

1. Verificar localStorage: `informa_last_content_check`
2. Resetear: `localStorage.clear()`
3. Verificar backend logs
4. Probar manualmente: publicar contenido en una ventana, esperar 30s en otra

### Problema: PWA no se instala

1. Verificar HTTPS (requerido)
2. Verificar manifest.json
3. Verificar service worker
4. Chrome DevTools > Application > Manifest

---

## 📈 PASO 11: Optimizaciones Post-Launch

### Semana 1: Monitoreo Intensivo

- [ ] Revisar logs diariamente
- [ ] Responder feedback de usuarios
- [ ] Fix bugs urgentes
- [ ] Monitorear performance

### Semana 2-4: Mejoras

- [ ] Optimizar queries lentas
- [ ] Agregar índices en DB si es necesario
- [ ] Mejorar UX basado en feedback
- [ ] Agregar features solicitadas

### Mes 2+: Escalamiento

- [ ] Considerar CDN para imágenes
- [ ] Implementar caching agresivo
- [ ] Optimizar bundle size
- [ ] Considerar migración a dominio propio

---

## 🎯 CHECKLIST FINAL PRE-LAUNCH

### Código
- [x] ✅ Build exitoso
- [x] ✅ Sin errores críticos
- [x] ✅ Código pusheado a GitHub
- [ ] ⏳ Tags de versión creados

### Backend
- [ ] ⏳ Edge Functions deployadas
- [ ] ⏳ Secrets configurados
- [ ] ⏳ Logs monitoreándose
- [ ] ⏳ Backup plan establecido

### Frontend
- [ ] ⏳ Deployado a Vercel/Netlify
- [ ] ⏳ HTTPS habilitado
- [ ] ⏳ PWA funcional
- [ ] ⏳ URLs de producción actualizadas

### Testing
- [ ] ⏳ Todas las features probadas
- [ ] ⏳ Probado en móvil
- [ ] ⏳ Probado en diferentes navegadores
- [ ] ⏳ Performance aceptable

### Comunicación
- [ ] ⏳ Post de anuncio preparado
- [ ] ⏳ Material de marketing listo
- [ ] ⏳ Guía de usuario creada
- [ ] ⏳ FAQ preparado

---

## 🚀 COMANDO FINAL

```bash
# Todo listo? Ejecuta:

# 1. Backend
supabase functions deploy server

# 2. Frontend
vercel --prod

# 3. Verificar
curl https://tu-url.vercel.app

# 4. Celebrar! 🎉
echo "¡INFORMA ESTÁ VIVO! 🇬🇹"
```

---

## 📞 CONTACTO DE EMERGENCIA

### Si algo sale mal:

1. **No entrar en pánico** 😌
2. **Revisar logs**: `supabase functions logs server`
3. **Rollback si es necesario**: 
   ```bash
   vercel rollback
   ```
4. **Contactar soporte de Supabase/Vercel** si es crítico

---

## 🎊 ¡FELICIDADES!

Si llegaste hasta aquí y todo funciona:

**🎉 ¡ACABAS DE LANZAR INFORMA A PRODUCCIÓN! 🎉**

**La comunidad de Gualán ahora tiene su propia plataforma digital.**

Éxitos con el proyecto! 🚀🇬🇹

---

**Próximos pasos:**
1. Monitorear las primeras 24 horas
2. Recolectar feedback
3. Iterar y mejorar
4. ¡Disfrutar viendo crecer la comunidad! 🌟

**¿Listo para el comando final?** ⚡
