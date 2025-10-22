# 🚀 Guía de Despliegue Rápido - Informa

## ⚠️ ANTES DE EMPEZAR - Requisitos Previos

### 1. Generar Íconos PWA (OBLIGATORIO)

**Opción A: Usar herramienta online (MÁS FÁCIL)**

1. Ve a https://www.pwabuilder.com/imageGenerator
2. Sube el logo circular de Informa (usa la imagen de `logoCircular`)
3. Descarga el ZIP con todos los íconos
4. Extrae y copia todos los archivos `.png` a la carpeta `/public/icons/`

**Opción B: Usar CLI (para desarrolladores)**

```bash
# Instalar herramienta
npm install -g pwa-asset-generator

# Generar íconos (necesitas tener una imagen logo.png de alta resolución)
pwa-asset-generator logo.png ./public/icons \
  --icon-only \
  --favicon \
  --type png \
  --padding "0" \
  --background "#ec4899"
```

**Íconos que DEBES tener en `/public/icons/`:**
```
icon-72x72.png
icon-96x96.png
icon-128x128.png
icon-144x144.png
icon-152x152.png
icon-167x167.png
icon-180x180.png
icon-192x192.png
icon-384x384.png
icon-512x512.png
apple-touch-icon.png (180x180)
favicon-32x32.png
favicon-16x16.png
```

También necesitas crear (opcional pero recomendado):
```
og-image.png (1200x630 para WhatsApp/Facebook)
```

---

## 📦 MÉTODO 1: Desplegar desde GitHub + Vercel (RECOMENDADO)

### Paso 1: Subir a GitHub

```bash
# Si aún no tienes Git inicializado
git init
git add .
git commit -m "Initial commit - Informa PWA con Deep Linking"

# Crear repositorio en GitHub (ve a github.com/new)
# Luego conecta tu repo local:
git remote add origin https://github.com/TU-USUARIO/informa-gualan.git
git branch -M main
git push -u origin main
```

### Paso 2: Conectar con Vercel

1. **Ve a https://vercel.com/new**
2. **Importa tu repositorio de GitHub**
3. **Configura las variables de entorno:**
   - Click en "Environment Variables"
   - Agrega estas 4 variables:

   ```
   SUPABASE_URL = https://tu-proyecto.supabase.co
   SUPABASE_ANON_KEY = eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY = eyJhbGc...
   SUPABASE_DB_URL = postgresql://...
   ```

4. **Vercel detectará automáticamente:**
   - ✅ Framework: Vite
   - ✅ Build Command: `npm run build`
   - ✅ Output Directory: `dist`
   - ✅ Configuración de vercel.json

5. **Click en "Deploy"**

### Paso 3: Espera el Despliegue
- Vercel construirá tu app (2-3 minutos)
- Te dará una URL como: `https://informa-gualan.vercel.app`

---

## 🖥️ MÉTODO 2: Desplegar con Vercel CLI

### Paso 1: Instalar Vercel CLI

```bash
npm install -g vercel
```

### Paso 2: Login

```bash
vercel login
```

### Paso 3: Configurar Variables de Entorno

```bash
# Agregar variables una por una
vercel env add SUPABASE_URL
# Pega tu URL cuando te lo pida

vercel env add SUPABASE_ANON_KEY
# Pega tu key cuando te lo pida

vercel env add SUPABASE_SERVICE_ROLE_KEY
# Pega tu key cuando te lo pida

vercel env add SUPABASE_DB_URL
# Pega tu URL cuando te lo pida
```

### Paso 4: Desplegar

```bash
# Despliegue de prueba
vercel

# Si todo funciona, desplegar a producción
vercel --prod
```

---

## 🔍 POST-DESPLIEGUE: Verificación Obligatoria

### 1. Probar la PWA

**En Chrome Desktop:**
1. Abre tu URL: `https://tu-dominio.vercel.app`
2. Abre DevTools (F12)
3. Ve a Application > Manifest
4. Verifica que se vea correctamente
5. Ve a Application > Service Workers
6. Verifica que esté "activated and running"

**En Chrome Android:**
1. Abre la URL en Chrome
2. Deberías ver un popup "Instalar app"
3. Instálala y pruébala

**En Safari iOS:**
1. Abre la URL en Safari
2. Toca el botón Compartir
3. Selecciona "Añadir a pantalla de inicio"
4. Verifica que abra como app

### 2. Probar Deep Linking

1. **Crea una noticia en tu app**
2. **Usa el botón "Compartir"**
3. **Copia el link generado** (será algo como `https://tu-dominio.vercel.app/?view=news&id=abc123`)
4. **Abre el link en modo incógnito:**
   - ✅ Debe mostrar vista previa bonita del contenido
   - ✅ Debe aparecer el banner de instalación
   - ✅ Meta tags deben funcionar (prueba pegando el link en WhatsApp)
5. **Inicia sesión y verifica:**
   - ✅ Debe navegar automáticamente al contenido

### 3. Ejecutar Lighthouse Audit

1. Abre DevTools (F12)
2. Ve a "Lighthouse"
3. Selecciona "Progressive Web App"
4. Click en "Generate Report"
5. **Objetivo: 90+ puntos**

Si tienes menos de 90, revisa:
- ¿Todos los íconos existen?
- ¿El Service Worker está registrado?
- ¿HTTPS está habilitado?

---

## ⚡ MÉTODO 3: Despliegue Express (Solo Vercel CLI)

Si tienes prisa y ya tienes los íconos:

```bash
# 1. Login
vercel login

# 2. Desplegar (Vercel te preguntará por las env vars)
vercel --prod

# 3. Cuando te pregunte por variables de entorno, ingresa:
# - SUPABASE_URL
# - SUPABASE_ANON_KEY  
# - SUPABASE_SERVICE_ROLE_KEY
# - SUPABASE_DB_URL
```

---

## 🎯 Checklist Final

Antes de considerar el despliegue exitoso:

### Pre-Despliegue
- [ ] Íconos PWA generados y en `/public/icons/`
- [ ] Variables de entorno de Supabase listas
- [ ] Código sin errores (ejecuta `npm run build` localmente)

### Durante Despliegue
- [ ] Variables de entorno configuradas en Vercel
- [ ] Build completado sin errores
- [ ] URL de producción generada

### Post-Despliegue
- [ ] App abre correctamente
- [ ] Login/Signup funciona
- [ ] Puedes crear posts
- [ ] Deep links funcionan
- [ ] PWA es instalable (aparece prompt)
- [ ] Service Worker registrado
- [ ] Lighthouse score > 90
- [ ] Funciona en móvil (Android/iOS)
- [ ] Meta tags correctos (preview en WhatsApp)

---

## 🆘 Solución de Problemas Comunes

### Error: "Build failed"
```bash
# Prueba el build localmente primero
npm install
npm run build

# Si falla, revisa los errores en la consola
```

### Error: "Cannot find module..."
```bash
# Asegúrate de tener todas las dependencias
npm install
```

### Error: "Service Worker not registering"
- Verifica que `/public/service-worker.js` exista
- Asegúrate de que estés en HTTPS
- Limpia caché del navegador

### Los íconos no aparecen
- Verifica que `/public/icons/` tenga todos los archivos
- Revisa que los nombres sean exactos (sin espacios)
- Confirma que sean formato PNG

### Variables de entorno no funcionan
```bash
# Verifica que estén en Vercel
vercel env ls

# Si no están, agrégalas:
vercel env add SUPABASE_URL production
```

---

## 📱 Actualizar la App Después

```bash
# 1. Hacer cambios en el código
git add .
git commit -m "Descripción del cambio"
git push

# 2. Vercel auto-deployará
# O manualmente:
vercel --prod
```

---

## 🎉 ¡Felicidades!

Si completaste todos los pasos, tu app **Informa** está ahora:

✅ Desplegada en producción  
✅ Funcionando como PWA  
✅ Instalable en móviles  
✅ Con deep linking para WhatsApp  
✅ Backend conectado a Supabase  
✅ Lista para usuarios reales  

**Comparte tu URL y empieza a usar la app! 🚀**

---

## 📞 ¿Necesitas Ayuda?

Si encuentras problemas:

1. **Revisa los logs de Vercel:**
   ```bash
   vercel logs --prod
   ```

2. **Revisa la consola del navegador** (F12 → Console)

3. **Verifica Supabase:**
   - Ve a tu dashboard de Supabase
   - Revisa que las Edge Functions estén desplegadas
   - Verifica que la base de datos funcione

4. **Prueba en modo incógnito** para evitar problemas de caché

---

**Última actualización:** Octubre 21, 2025  
**Tiempo estimado total:** 30-40 minutos  
**Dificultad:** ⭐⭐☆☆☆ (Fácil-Intermedio)
