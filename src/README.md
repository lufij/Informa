# 🚀 Informa - Red Social Comunitaria

<div align="center">

![Informa Logo](./public/icons/icon-192x192.png)

**Red social comunitaria de Gualán, Zacapa, Guatemala**

Noticias verificadas • Alertas • Clasificados • Foros

[Demo](https://informa-gualan.vercel.app) • [Documentación](#documentación) • [Contribuir](#contribuir)

</div>

---

## 📋 Tabla de Contenido

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Inicio Rápido](#-inicio-rápido)
- [Configuración](#-configuración)
- [Desarrollo](#-desarrollo)
- [Despliegue](#-despliegue)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Documentación](#-documentación)
- [Licencia](#-licencia)

---

## ✨ Características

### 🔥 Funcionalidades Principales

- **📰 Noticias Verificadas** - Sistema de noticias comunitarias
- **🚨 Alertas de Emergencia** - Notificaciones en tiempo real
- **💼 Clasificados Locales** - Venta, alquiler, empleos y servicios
- **💬 Foros Temáticos** - Discusiones comunitarias
- **📅 Calendario de Eventos** - Eventos locales

### 🎯 Características Avanzadas

- **🔗 Deep Linking** - Links compartibles por WhatsApp con previews ricos
- **📱 PWA (Progressive Web App)** - Instalable en móviles y desktop
- **🔔 Notificaciones en Tiempo Real** - Con Supabase Realtime
- **💬 Mensajería Directa** - Chat entre usuarios
- **🔥 Sistema de Reacciones** - 🔥❤️😱😢😡
- **💾 Guardado de Posts** - Guarda contenido favorito
- **📈 Trending Content** - Contenido más popular
- **🔍 Búsqueda Global** - Busca en todo el contenido
- **🚒 Sistema de Emergencias** - Para bomberos (alertas por voz)
- **👮 Panel de Administración** - Gestión de reportes

### 🔐 Seguridad y Privacidad

- **📸 Foto de Perfil Obligatoria** - Tomada con la cámara del celular
- **✅ Verificación de Usuarios** - Sistema de autenticación robusto
- **🛡️ Reportes de Contenido** - Sistema anti-abuso
- **🔒 Datos Encriptados** - Con Supabase

---

## 🛠 Tecnologías

### Frontend
- **React 18** - Library UI
- **TypeScript** - Type safety
- **Vite** - Build tool ultra-rápido
- **Tailwind CSS v4** - Styling moderno
- **shadcn/ui** - Componentes UI
- **Lucide React** - Iconos

### Backend
- **Supabase** - Backend as a Service
  - Auth - Autenticación
  - Database - PostgreSQL
  - Storage - Archivos multimedia
  - Edge Functions - API serverless
  - Realtime - WebSockets

### PWA
- **Service Worker** - Funcionalidad offline
- **Web App Manifest** - Instalación
- **Push Notifications** - Notificaciones

---

## 🚀 Inicio Rápido

### Prerrequisitos

```bash
# Node.js 18 o superior
node --version  # v18.0.0+

# npm 9 o superior
npm --version   # 9.0.0+

# Git
git --version
```

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/informa-gualan.git
cd informa-gualan

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env

# Edita .env y agrega tus credenciales de Supabase
# VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
# VITE_SUPABASE_ANON_KEY=tu-anon-key
# etc.

# 4. Iniciar servidor de desarrollo
npm run dev

# La app se abrirá en http://localhost:3000
```

---

## ⚙️ Configuración

### 1. Configurar Supabase

#### Crear Proyecto
1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta (gratis)
3. Crea un nuevo proyecto
4. Espera 2-3 minutos mientras se inicializa

#### Obtener Credenciales
1. Ve a **Settings** → **API**
2. Copia los valores:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`
   - **service_role** → `VITE_SUPABASE_SERVICE_ROLE_KEY`
3. Ve a **Settings** → **Database**
   - Copia **Connection String** → `VITE_SUPABASE_DB_URL`

#### Configurar Edge Functions
```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link al proyecto
supabase link --project-ref tu-project-ref

# Deploy Edge Functions
supabase functions deploy make-server-3467f1c6
```

### 2. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Supabase (REQUERIDO)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
VITE_SUPABASE_DB_URL=postgresql://postgres:...

# App (OPCIONAL)
VITE_APP_NAME=Informa
VITE_APP_VERSION=2.0.0
NODE_ENV=development
```

### 3. Generar Íconos PWA

**Opción A: Herramienta Online (Recomendado)**
1. Ve a https://www.pwabuilder.com/imageGenerator
2. Sube tu logo (usa `logoCircular` de Figma)
3. Descarga el ZIP
4. Extrae los archivos a `/public/icons/`

**Opción B: CLI**
```bash
npm install -g pwa-asset-generator

pwa-asset-generator logo.png ./public/icons \
  --icon-only \
  --favicon \
  --type png \
  --padding "0" \
  --background "#ec4899"
```

---

## 💻 Desarrollo

### Comandos Disponibles

```bash
# Desarrollo (con hot reload)
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Verificar tipos TypeScript
npm run type-check

# Lint
npm run lint
```

### Estructura de Carpetas

```
informa-gualan/
├── components/           # Componentes React
│   ├── ui/              # Componentes shadcn/ui
│   ├── figma/           # Componentes de Figma
│   └── *.tsx            # Componentes de la app
├── public/              # Archivos estáticos
│   ├── icons/           # Íconos PWA
│   ├── manifest.json    # PWA Manifest
│   └── service-worker.js # Service Worker
├── styles/              # Estilos globales
│   └── globals.css      # Tailwind + tokens
├── supabase/            # Backend
│   └── functions/       # Edge Functions
├── utils/               # Utilidades
│   └── supabase/        # Helpers de Supabase
├── App.tsx              # Componente principal
├── index.html           # HTML entry point
└── vite.config.ts       # Configuración Vite
```

### Agregar Nuevas Funcionalidades

#### 1. Crear un Componente
```bash
# Crear archivo en /components
touch components/MiNuevoComponente.tsx
```

```tsx
// components/MiNuevoComponente.tsx
import { Button } from './ui/button'

export function MiNuevoComponente() {
  return (
    <div>
      <Button>Hola Mundo</Button>
    </div>
  )
}
```

#### 2. Usar shadcn/ui
Todos los componentes están pre-instalados en `/components/ui/`

```tsx
import { Button } from './components/ui/button'
import { Card } from './components/ui/card'
import { Dialog } from './components/ui/dialog'
```

#### 3. Agregar Endpoints al Backend
Edita `/supabase/functions/server/index.tsx`:

```tsx
// Nuevo endpoint
app.get('/make-server-3467f1c6/mi-endpoint', async (c) => {
  const token = c.req.header('Authorization')?.split(' ')[1]
  
  // Tu lógica aquí
  
  return c.json({ success: true })
})
```

---

## 🚀 Despliegue

### Opción 1: Vercel (Recomendado)

#### Via GitHub (Automático)
```bash
# 1. Sube a GitHub
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tu-usuario/informa-gualan.git
git push -u origin main

# 2. Conecta en Vercel
# - Ve a vercel.com/new
# - Importa tu repositorio
# - Agrega las variables de entorno
# - Deploy!
```

#### Via CLI
```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod

# 4. Agrega variables de entorno cuando te las pida
```

### Opción 2: Netlify
```bash
# 1. Instalar Netlify CLI
npm i -g netlify-cli

# 2. Login
netlify login

# 3. Deploy
netlify deploy --prod
```

### Configuración Post-Despliegue

1. **Actualizar URLs**
   - Edita `/index.html` líneas 45, 53 (Open Graph URLs)
   - Cambia `https://informa-gualan.vercel.app` por tu dominio

2. **Verificar PWA**
   - Abre Chrome DevTools → Lighthouse
   - Ejecuta audit "Progressive Web App"
   - Objetivo: 90+ puntos

3. **Probar Deep Linking**
   - Crea un post
   - Comparte el link
   - Abre en modo incógnito
   - Verifica que funcione

---

## 📚 Documentación

### Guías Disponibles

- 📘 [**QUICK-DEPLOY-GUIDE.md**](./QUICK-DEPLOY-GUIDE.md) - Guía rápida de despliegue
- 📗 [**DEPLOYMENT-CHECKLIST.md**](./DEPLOYMENT-CHECKLIST.md) - Checklist completo
- 📙 [**DEPLOYMENT.md**](./DEPLOYMENT.md) - Guía detallada PWA
- 📕 [**PWA-USER-GUIDE.md**](./PWA-USER-GUIDE.md) - Guía para usuarios

### Arquitectura

```
┌─────────────┐
│   Frontend  │ (React + Vite)
│  (Vercel)   │
└──────┬──────┘
       │
       │ HTTPS
       │
┌──────▼───────────────────┐
│   Supabase Backend       │
├──────────────────────────┤
│ • Auth (Login/Signup)    │
│ • Database (PostgreSQL)  │
│ • Storage (Media)        │
│ • Edge Functions (API)   │
│ • Realtime (WebSockets)  │
└──────────────────────────┘
```

### Deep Linking Flow

```
Usuario recibe link de WhatsApp
          ↓
https://tu-dominio.com/?view=news&id=abc123
          ↓
¿Usuario autenticado?
    ├─ NO  → Muestra vista pública + banner instalación
    │         ↓
    │      Usuario instala app / Login
    │         ↓
    └─ SÍ  → Navega directamente al contenido
```

---

## 🧪 Testing

```bash
# Build local para verificar errores
npm run build

# Preview del build
npm run preview

# Type checking
npm run type-check
```

### Checklist de Testing Manual

- [ ] Login funciona
- [ ] Signup funciona
- [ ] Crear post (noticia/alerta/clasificado/foro)
- [ ] Comentar en post
- [ ] Reaccionar a post
- [ ] Compartir post (deep link)
- [ ] Abrir deep link en modo incógnito
- [ ] Instalar PWA en móvil
- [ ] Probar offline (PWA)
- [ ] Notificaciones en tiempo real
- [ ] Mensajería directa
- [ ] Búsqueda global
- [ ] Panel de admin (si eres admin)

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 🐛 Reportar Problemas

Si encuentras un bug o tienes una sugerencia:

1. Abre un [Issue](https://github.com/tu-usuario/informa-gualan/issues)
2. Describe el problema con el mayor detalle posible
3. Incluye screenshots si es relevante
4. Especifica tu navegador/dispositivo

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](./LICENSE) para más detalles.

---

## 👨‍💻 Autor

**Comunidad de Gualán, Zacapa**

- 🌐 Website: [informa-gualan.vercel.app](https://informa-gualan.vercel.app)
- 📧 Email: contacto@informa-gualan.com

---

## 🙏 Agradecimientos

- shadcn/ui por los componentes
- Supabase por el backend
- Lucide por los iconos
- La comunidad de Gualán por el apoyo

---

<div align="center">

**Hecho con ❤️ para Gualán, Zacapa, Guatemala**

[⬆ Volver arriba](#-informa---red-social-comunitaria)

</div>
