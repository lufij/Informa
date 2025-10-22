# 🎨 Configuración de Visual Studio Code

## 📋 Guía Paso a Paso

### 1️⃣ Descargar el Proyecto

Tienes dos opciones:

#### Opción A: Descargar ZIP (Más Fácil)
1. Haz click en el botón de descarga de Figma Make
2. Extrae el ZIP en una carpeta de tu computadora
3. Abre Visual Studio Code
4. Ve a **File** → **Open Folder**
5. Selecciona la carpeta extraída

#### Opción B: Clonar desde Git (Si ya está en GitHub)
```bash
# En tu terminal
git clone https://github.com/tu-usuario/informa-gualan.git
cd informa-gualan
code .  # Abre VS Code
```

---

### 2️⃣ Instalar Extensiones Recomendadas

Cuando abras el proyecto en VS Code, verás una notificación que dice:
**"This workspace has extension recommendations"**

Click en **"Install All"** para instalar:

- ✅ **ESLint** - Linting de código
- ✅ **Prettier** - Formateo automático
- ✅ **Tailwind CSS IntelliSense** - Autocompletado de Tailwind
- ✅ **TypeScript** - Soporte TypeScript
- ✅ **Error Lens** - Muestra errores inline
- ✅ **Path Intellisense** - Autocompletado de rutas
- ✅ **ES7+ React Snippets** - Snippets de React

**O instálalas manualmente:**
1. Presiona `Ctrl+Shift+X` (Windows/Linux) o `Cmd+Shift+X` (Mac)
2. Busca cada extensión y dale "Install"

---

### 3️⃣ Configurar Variables de Entorno

#### Paso 1: Crear archivo `.env`
```bash
# En la raíz del proyecto
cp .env.example .env
```

O crea manualmente un archivo llamado `.env` en la raíz.

#### Paso 2: Obtener Credenciales de Supabase

1. **Ve a Supabase Dashboard:**
   - https://supabase.com/dashboard
   - Login o crea una cuenta gratis

2. **Crea un Proyecto (si no tienes uno):**
   - Click en **"New Project"**
   - Nombre: `informa-gualan`
   - Database Password: Crea una contraseña segura
   - Region: Elige la más cercana (ej: South America)
   - Click **"Create new project"**
   - Espera 2-3 minutos

3. **Obtener las Keys:**
   - En tu proyecto, ve a **Settings** (⚙️ abajo a la izquierda)
   - Click en **API**
   - Copia estos valores:

   ```
   Project URL → VITE_SUPABASE_URL
   Project API keys → anon/public → VITE_SUPABASE_ANON_KEY
   Project API keys → service_role → VITE_SUPABASE_SERVICE_ROLE_KEY
   ```

4. **Obtener Database URL:**
   - En **Settings** → **Database**
   - Busca **Connection string** → **URI**
   - Copia el string completo
   - Reemplaza `[YOUR-PASSWORD]` con tu password real

#### Paso 3: Pegar en `.env`

Edita tu archivo `.env` y pega los valores:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
VITE_SUPABASE_DB_URL=postgresql://postgres:[TU-PASSWORD]@db.xxxxx.supabase.co:5432/postgres

VITE_APP_NAME=Informa
VITE_APP_VERSION=2.0.0
NODE_ENV=development
```

⚠️ **IMPORTANTE:** Nunca subas el archivo `.env` a GitHub. Ya está en `.gitignore`.

---

### 4️⃣ Instalar Dependencias

Abre la terminal integrada de VS Code:
- **Windows/Linux:** `Ctrl + ñ` o `Ctrl + ``
- **Mac:** `Cmd + ``

O ve a **Terminal** → **New Terminal**

```bash
# Instalar todas las dependencias
npm install

# Esto puede tomar 2-5 minutos
```

Verás algo como:
```
added 1423 packages in 3m
```

---

### 5️⃣ Desplegar Edge Functions a Supabase

#### Instalar Supabase CLI

```bash
# Windows (con npm)
npm install -g supabase

# Mac (con Homebrew)
brew install supabase/tap/supabase

# Linux
npm install -g supabase
```

#### Login y Deploy

```bash
# 1. Login a Supabase
supabase login

# Se abrirá tu navegador para autorizar

# 2. Link al proyecto
supabase link --project-ref XXXXX

# Encuentra el project-ref en:
# Settings → General → Project Settings → Reference ID

# 3. Deploy las Edge Functions
supabase functions deploy make-server-3467f1c6

# Verás:
# ✓ Deployed Function make-server-3467f1c6
```

---

### 6️⃣ Generar Íconos PWA (IMPORTANTE)

La app necesita íconos para funcionar como PWA.

#### Opción A: Herramienta Online (Recomendado)

1. Ve a: https://www.pwabuilder.com/imageGenerator
2. Sube una imagen del logo (mínimo 512x512px)
   - Puedes usar cualquier logo circular
   - Idealmente en formato PNG con fondo transparente
3. Click en **"Generate"**
4. Descarga el ZIP
5. Extrae y copia TODOS los archivos `.png` a `/public/icons/`

**Archivos que necesitas:**
```
/public/icons/
├── icon-72x72.png
├── icon-96x96.png
├── icon-128x128.png
├── icon-144x144.png
├── icon-152x152.png
├── icon-167x167.png
├── icon-180x180.png
├── icon-192x192.png
├── icon-384x384.png
├── icon-512x512.png
├── apple-touch-icon.png
├── favicon-32x32.png
└── favicon-16x16.png
```

#### Opción B: Generar con CLI

```bash
# Instalar herramienta
npm install -g pwa-asset-generator

# Generar (necesitas tener logo.png en la raíz)
pwa-asset-generator logo.png ./public/icons \
  --icon-only \
  --favicon \
  --type png \
  --padding "0" \
  --background "#ec4899"
```

---

### 7️⃣ Iniciar el Servidor de Desarrollo

```bash
# Iniciar
npm run dev
```

Verás:
```
  VITE v5.1.0  ready in 543 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

🎉 **¡Tu app está corriendo!**

La app se abrirá automáticamente en http://localhost:3000

---

## 🔍 Verificar que Todo Funciona

### Checklist:

1. **✅ La app carga sin errores**
   - Deberías ver la pantalla de login/signup

2. **✅ Puedes crear una cuenta**
   - Click en "Registrarse"
   - Ingresa nombre y celular
   - Toma una foto de perfil

3. **✅ No hay errores en la consola**
   - Presiona F12 para abrir DevTools
   - Ve a la pestaña "Console"
   - No debería haber errores en rojo (warnings en amarillo son OK)

4. **✅ El Service Worker se registra**
   - En DevTools → Application → Service Workers
   - Debería decir "activated and running"

---

## 🛠️ Comandos Útiles de VS Code

### Atajos de Teclado

| Comando | Windows/Linux | Mac |
|---------|---------------|-----|
| Abrir terminal | `Ctrl + ñ` | `Cmd + ñ` |
| Comando rápido | `Ctrl + Shift + P` | `Cmd + Shift + P` |
| Buscar archivo | `Ctrl + P` | `Cmd + P` |
| Buscar en proyecto | `Ctrl + Shift + F` | `Cmd + Shift + F` |
| Formatear código | `Shift + Alt + F` | `Shift + Option + F` |
| Ir a definición | `F12` | `F12` |
| Cerrar pestaña | `Ctrl + W` | `Cmd + W` |

### Comandos de Terminal

```bash
# Desarrollo
npm run dev          # Iniciar servidor

# Build
npm run build        # Crear build de producción
npm run preview      # Ver el build localmente

# Verificación
npm run type-check   # Verificar TypeScript
npm run lint         # Verificar código
```

---

## 🐛 Solución de Problemas

### Error: "Cannot find module"
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error: "ENOENT: no such file or directory"
```bash
# Verificar que estás en la carpeta correcta
pwd  # Debería mostrar /ruta/a/informa-gualan

# Verificar estructura
ls  # Deberías ver: package.json, App.tsx, etc.
```

### Error: "Port 3000 is already in use"
```bash
# Opción 1: Cerrar el proceso que usa el puerto
# Opción 2: Usar otro puerto
npm run dev -- --port 3001
```

### Los cambios no se reflejan
```bash
# 1. Detener el servidor (Ctrl+C)
# 2. Limpiar caché
rm -rf node_modules/.vite
# 3. Reiniciar
npm run dev
```

### TypeScript Errors en VS Code
```bash
# Recargar VS Code
# Ctrl+Shift+P → "TypeScript: Restart TS Server"

# O cerrar y abrir VS Code
```

---

## 📁 Estructura del Proyecto en VS Code

```
informa-gualan/
├── 📁 components/          ← Componentes React
│   ├── 📁 ui/             ← Componentes shadcn
│   ├── 📄 LoginPage.tsx
│   ├── 📄 NewsSection.tsx
│   └── ...
├── 📁 public/             ← Archivos estáticos
│   ├── 📁 icons/          ← Íconos PWA (generar)
│   ├── 📄 manifest.json
│   └── 📄 service-worker.js
├── 📁 styles/             ← Estilos CSS
│   └── 📄 globals.css
├── 📁 supabase/           ← Backend
│   └── 📁 functions/
│       └── 📁 server/
│           └── 📄 index.tsx
├── 📁 utils/              ← Utilidades
│   └── 📁 supabase/
├── 📄 App.tsx             ← Componente principal ⭐
├── 📄 index.html          ← HTML principal
├── 📄 package.json        ← Dependencias
├── 📄 vite.config.ts      ← Config Vite
├── 📄 tsconfig.json       ← Config TypeScript
├── 📄 .env                ← Variables (crear) 🔒
└── 📄 README.md           ← Documentación
```

---

## ✨ Tips de Desarrollo

### 1. **Hot Reload Automático**
Los cambios se aplican automáticamente sin recargar la página

### 2. **TypeScript IntelliSense**
VS Code te mostrará autocompletado y errores en tiempo real

### 3. **Prettier Format on Save**
Tu código se formatea automáticamente al guardar (`Ctrl+S`)

### 4. **Import Shortcuts**
```tsx
// Escribe 'rfc' y presiona Tab
// Se creará automáticamente:
import React from 'react'

export default function Component() {
  return <div>Component</div>
}
```

### 5. **DevTools React**
Instala la extensión React Developer Tools para Chrome/Firefox

---

## 🎯 Próximos Pasos

Una vez que todo funcione localmente:

1. **Hacer cambios al código**
   - Edita componentes en `/components/`
   - Los cambios se verán automáticamente

2. **Agregar funcionalidades**
   - Crea nuevos componentes
   - Agrega endpoints al backend

3. **Preparar para despliegue**
   - Lee `QUICK-DEPLOY-GUIDE.md`
   - Despliega a Vercel

---

## 📞 ¿Necesitas Ayuda?

Si tienes problemas:

1. **Revisa la consola** (F12 → Console)
2. **Revisa la terminal** en VS Code
3. **Lee el error cuidadosamente** - generalmente dice qué falta
4. **Busca en Google** el mensaje de error completo

---

**¡Listo! Ahora tienes todo configurado para desarrollar Informa en Visual Studio Code! 🚀**

[← Volver al README](./README.md)
