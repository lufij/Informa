# Pre-Deploy Checklist Script

## Cosas que DEBES verificar antes de desplegar:

### 1. Verificar Íconos PWA

Abre una terminal y ejecuta:

```bash
# En la raíz del proyecto
ls -la public/icons/

# Deberías ver:
# icon-72x72.png
# icon-96x96.png
# icon-128x128.png
# icon-144x144.png
# icon-152x152.png
# icon-167x167.png
# icon-180x180.png
# icon-192x192.png
# icon-384x384.png
# icon-512x512.png
# apple-touch-icon.png
# favicon-32x32.png
# favicon-16x16.png
```

**Si NO los ves**, necesitas generarlos primero. Ve a: `QUICK-DEPLOY-GUIDE.md`

### 2. Verificar que el Build Funcione Localmente

```bash
# Instalar dependencias
npm install

# Intentar build
npm run build

# Si hay errores, corrígelos antes de desplegar
```

Si el build es exitoso, verás:
```
✓ built in XXXms
dist/index.html                   X.XX kB
dist/assets/index-XXXXX.js       XXX.XX kB
```

### 3. Verificar Variables de Entorno

Necesitas tener a mano estas 4 variables de Supabase:

```
SUPABASE_URL = https://xxxxxxx.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_DB_URL = postgresql://postgres:[password]@...
```

**¿Dónde las encuentro?**
1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Settings → API
4. Copia los valores

### 4. Verificar Archivos Importantes

```bash
# Verifica que existan:
ls -la vercel.json
ls -la public/manifest.json
ls -la public/service-worker.js
ls -la index.html
```

Todos deben existir. ✅

### 5. Test Rápido Local (Opcional)

```bash
# Servir el build localmente
npx serve dist

# Abre http://localhost:3000 y prueba:
# - Login funciona
# - Puedes crear posts
# - Las imágenes cargan
```

---

## ✅ Si Todos los Checks Pasaron

**¡Estás listo para desplegar!**

Ve a `QUICK-DEPLOY-GUIDE.md` y sigue las instrucciones del método que prefieras.

---

## ❌ Si Algo Falla

### Build falla
- Lee el error cuidadosamente
- Usualmente es un import roto o dependencia faltante
- Ejecuta `npm install` de nuevo

### Íconos faltantes
- Ve a la sección de íconos en `QUICK-DEPLOY-GUIDE.md`
- Usa la herramienta online (más fácil)
- O genera con CLI

### No tienes las variables de Supabase
- Necesitas acceso al proyecto de Supabase
- Contacta al administrador del proyecto
- O crea un nuevo proyecto en supabase.com
