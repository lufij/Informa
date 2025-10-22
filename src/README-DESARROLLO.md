# 🚀 Informa - Guía de Desarrollo Local

> Red social comunitaria de Gualán, Zacapa, Guatemala

## 📖 Índice Rápido

- [🎯 Inicio Rápido](#-inicio-rápido)
- [📦 Instalación](#-instalación)
- [⚙️ Configuración](#️-configuración)
- [🛠️ Desarrollo](#️-desarrollo)
- [🏗️ Arquitectura](#️-arquitectura)
- [📚 Tecnologías](#-tecnologías)
- [🔧 Scripts Disponibles](#-scripts-disponibles)
- [🐛 Depuración](#-depuración)

---

## 🎯 Inicio Rápido

```bash
# 1. Clonar o descargar el proyecto
cd informa

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Edita .env.local con tus credenciales de Supabase

# 4. Iniciar servidor de desarrollo
npm run dev

# 5. Abrir en navegador
# http://localhost:5173
```

---

## 📦 Instalación

### Requisitos del Sistema

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Sistema Operativo**: Windows, macOS, o Linux

### Verificar versiones instaladas

```bash
node --version  # Debe mostrar v18.x.x o superior
npm --version   # Debe mostrar 9.x.x o superior
```

### Instalar dependencias

```bash
npm install
```

Esto instalará:
- ✅ React 18 + TypeScript
- ✅ Vite (bundler ultra-rápido)
- ✅ Tailwind CSS v4
- ✅ ShadCN UI Components
- ✅ Supabase Client
- ✅ Lucide React Icons
- ✅ Y más...

---

## ⚙️ Configuración

### 1. Variables de Entorno

Crea el archivo `.env.local` en la raíz del proyecto:

```bash
cp .env.example .env.local
```

Completa con tus credenciales de Supabase:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### 2. Obtener Credenciales de Supabase

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto "Informa"
3. Ve a **Settings → API**
4. Copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`
   - **service_role** → `VITE_SUPABASE_SERVICE_ROLE_KEY`

### 3. Configurar Backend (Edge Functions)

Las Edge Functions de Supabase deben estar desplegadas. Para desplegarlas:

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Desplegar functions
supabase functions deploy server
```

### 4. Configurar Variables en Supabase

Ve a tu proyecto Supabase:
- **Settings → Edge Functions → Secrets**

Agrega las siguientes variables:
```
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
SUPABASE_DB_URL=postgresql://...
```

---

## 🛠️ Desarrollo

### Iniciar Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en:
- **Local**: http://localhost:5173
- **Network**: http://192.168.x.x:5173 (para testing en móviles)

### Hot Reload Automático

Vite detecta cambios automáticamente. Solo guarda el archivo y el navegador se actualizará.

### Probar en Móviles (misma red WiFi)

```bash
npm run dev -- --host
```

Luego accede desde tu móvil usando la IP mostrada en terminal.

---

## 🏗️ Arquitectura

### Estructura del Proyecto

```
informa/
├── components/              # Componentes React
│   ├── ui/                 # ShadCN UI (NO modificar)
│   ├── figma/              # Componentes de Figma (NO modificar)
│   ├── AdminReportsPanel.tsx
│   ├── AlertsSection.tsx
│   ├── NewsSection.tsx
│   ├── ForumsSection.tsx
│   ├── ClassifiedsSection.tsx
│   ├── UserSettings.tsx
│   └── ...
│
├── supabase/               # Backend
│   └── functions/
│       └── server/
│           ├── index.tsx   # API Endpoints
│           └── kv_store.tsx # DB KV (NO modificar)
│
├── utils/                  # Utilidades
│   └── supabase/
│       ├── client.tsx      # Cliente Supabase
│       └── info.tsx        # Config (NO modificar)
│
├── styles/                 # Estilos
│   └── globals.css         # Tailwind v4 config
│
├── public/                 # Assets estáticos
│   ├── manifest.json       # PWA manifest
│   ├── service-worker.js   # PWA service worker
│   └── ...
│
├── App.tsx                 # Componente raíz
├── index.html              # HTML entry point
├── vite.config.ts          # Config de Vite
├── tsconfig.json           # Config TypeScript
└── package.json            # Dependencias
```

### Flujo de Datos

```
Frontend (React)
    ↓
    ↓ HTTP Request (fetch)
    ↓
Edge Function (Hono Server)
    ↓
    ↓ Supabase Client
    ↓
Database (KV Store)
```

### Componentes Principales

| Componente | Descripción |
|------------|-------------|
| `App.tsx` | Punto de entrada, maneja auth y navegación |
| `NewsSection` | Feed de noticias verificadas |
| `AlertsSection` | Alertas comunitarias + emergencias |
| `ClassifiedsSection` | Clasificados locales |
| `ForumsSection` | Foros de discusión |
| `UserSettings` | Configuración de perfil |
| `AdminReportsPanel` | Panel de moderación |

---

## 📚 Tecnologías

### Frontend
- **React 18** - Librería UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool ultra-rápido
- **Tailwind CSS v4** - Estilos utility-first
- **ShadCN UI** - Componentes accesibles
- **Lucide React** - Iconos

### Backend
- **Supabase** - Backend as a Service
- **Edge Functions** - Serverless API
- **Hono** - Web framework
- **PostgreSQL** - Base de datos

### DevOps
- **Vercel** - Hosting frontend
- **Git** - Control de versiones
- **npm** - Gestor de paquetes

---

## 🔧 Scripts Disponibles

### Desarrollo

```bash
npm run dev          # Inicia servidor de desarrollo
npm run dev -- --host    # Expone en red local
npm run dev -- --port 3000   # Usa puerto personalizado
```

### Build y Preview

```bash
npm run build        # Compila para producción
npm run preview      # Preview del build
```

### Verificación

```bash
npm run lint         # Verifica errores ESLint
npm run type-check   # Verifica tipos TypeScript
npm run verify       # Script de verificación completo
```

### Mantenimiento

```bash
npm run clean        # Limpia node_modules y dist
npm run reset        # Limpia y reinstala todo
```

---

## 🐛 Depuración

### Consola del Navegador

Abre las DevTools (F12) y ve a:
- **Console**: Ver logs y errores
- **Network**: Ver requests HTTP
- **Application**: Ver LocalStorage, Cookies, etc.

### VS Code Debugger

Agrega breakpoints en el código y presiona **F5** para iniciar debugger.

### Logs del Backend

Los logs de Edge Functions se ven en:
- Supabase Dashboard → Edge Functions → Logs

### Errores Comunes

#### ❌ "Cannot find module"
```bash
# Solución: Reinstalar dependencias
npm run reset
```

#### ❌ "VITE_SUPABASE_URL is not defined"
```bash
# Solución: Verifica que .env.local exista y tenga las variables
cat .env.local
```

#### ❌ "Network Error"
```bash
# Solución: Verifica que Edge Functions estén desplegadas
supabase functions list
```

#### ❌ Puerto ocupado
```bash
# Solución: Usa otro puerto
npm run dev -- --port 5174
```

---

## 📝 Mejores Prácticas

### 1. Commits de Git

Usa mensajes descriptivos:
```bash
git commit -m "feat: agregar búsqueda en foros"
git commit -m "fix: corregir scroll en móviles"
git commit -m "chore: actualizar dependencias"
```

### 2. Componentización

- Crea componentes pequeños y reutilizables
- Un componente = una responsabilidad
- Usa TypeScript para tipado

### 3. Estilos

- Usa Tailwind CSS para estilos
- NO agregues clases de tamaño de texto (usa defaults de globals.css)
- Prefiere gradientes vibrantes: `bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600`

### 4. Performance

- Usa `React.memo()` para componentes pesados
- Lazy load de imágenes
- Evita renders innecesarios

### 5. Seguridad

- NUNCA expongas `VITE_SUPABASE_SERVICE_ROLE_KEY` en el frontend
- Valida SIEMPRE los inputs del usuario
- Usa autenticación en endpoints sensibles

---

## 🚀 Despliegue

### Vercel (Frontend)

```bash
# Usando Vercel CLI
vercel

# O conecta repo en vercel.com
```

### Supabase (Backend)

```bash
# Desplegar Edge Functions
supabase functions deploy server
```

---

## 🆘 Soporte

### Archivos de Ayuda

- `GUIA-DESCARGA-VSCODE.md` - Guía completa de setup
- `DOCUMENTACION.md` - Documentación técnica
- `DEPLOYMENT.md` - Guía de despliegue

### Recursos

- [Documentación Vite](https://vitejs.dev/)
- [Documentación React](https://react.dev/)
- [Documentación Supabase](https://supabase.com/docs)
- [Documentación Tailwind](https://tailwindcss.com/)

---

## 📄 Licencia

Ver archivo `LICENSE`

---

## 🎉 ¡Listo para Desarrollar!

```bash
npm run dev
```

**¡Feliz coding!** 🚀✨
