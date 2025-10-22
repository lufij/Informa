# 📁 Estructura del Proyecto Informa

Este documento describe la organización del código del proyecto.

## 🗂️ Estructura de Carpetas

```
informa-gualan/
│
├── 📱 APLICACIÓN FRONTEND
│   ├── App.tsx                    # ⭐ Componente principal
│   ├── index.html                 # Entry point HTML
│   ├── components/                # Componentes React
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── figma/                # Componentes de Figma imports
│   │   ├── AdminReportsPanel.tsx # Panel de moderación
│   │   ├── AlertsSection.tsx     # Sección de alertas
│   │   ├── ClassifiedsSection.tsx # Sección de clasificados
│   │   ├── ForumsSection.tsx     # Sección de foros
│   │   ├── NewsSection.tsx       # Sección de noticias
│   │   ├── UnifiedFeed.tsx       # Feed unificado
│   │   ├── LoginPage.tsx         # Página de login
│   │   ├── SignupPage.tsx        # Página de registro
│   │   └── ... (40+ componentes)
│   └── styles/
│       └── globals.css           # Estilos globales Tailwind v4
│
├── 🔧 BACKEND (Supabase)
│   └── supabase/
│       └── functions/
│           └── server/
│               ├── index.tsx      # ⭐ API completa (Hono)
│               └── kv_store.tsx   # 🔒 Sistema KV (protegido)
│
├── 🛠️ UTILIDADES
│   └── utils/
│       └── supabase/
│           ├── client.tsx         # Cliente Supabase
│           └── info.tsx           # Configuración
│
├── 📦 PWA
│   └── public/
│       ├── manifest.json          # PWA Manifest
│       ├── service-worker.js      # Service Worker
│       ├── icons/                 # Íconos de la app
│       └── robots.txt
│
├── ⚙️ CONFIGURACIÓN
│   ├── package.json               # Dependencias
│   ├── vite.config.ts             # Config Vite
│   ├── tsconfig.json              # Config TypeScript
│   ├── vercel.json                # Config Vercel
│   ├── .env.example               # Variables de entorno (ejemplo)
│   ├── .env                       # 🔒 Variables reales (NO subir a Git)
│   └── .gitignore                 # Archivos a ignorar
│
├── 🎨 ASSETS
│   └── (Importados dinámicamente desde Figma)
│
├── 📚 DOCUMENTACIÓN
│   ├── README.md                  # ⭐ Documentación principal
│   ├── LEEME-PRIMERO.md          # 🚀 Inicio rápido
│   ├── SETUP-COMPLETO.md         # Guía paso a paso
│   ├── PREPARAR-PARA-GIT.md      # Guía de Git
│   ├── COMANDOS-GIT.md           # Comandos Git
│   ├── DEPLOYMENT.md             # Guía de deploy
│   ├── PWA-USER-GUIDE.md         # Guía PWA para usuarios
│   ├── LICENSE                    # Licencia MIT
│   └── Attributions.md           # Créditos
│
└── 🔧 VS CODE
    └── .vscode/
        ├── extensions.json        # Extensiones recomendadas
        └── settings.json          # Configuración del editor
```

---

## 🎯 Archivos Clave

### 🔥 Archivos Más Importantes

| Archivo | Descripción | Editar? |
|---------|-------------|---------|
| `App.tsx` | Componente raíz, routing, auth | ✅ Sí |
| `supabase/functions/server/index.tsx` | API completa del backend | ✅ Sí |
| `.env` | Credenciales de Supabase | ⚠️ Local solo |
| `package.json` | Dependencias y scripts | ⚠️ Con cuidado |
| `index.html` | Meta tags, PWA config | ✅ Sí |
| `public/manifest.json` | Configuración PWA | ✅ Sí |

### 🔒 Archivos Protegidos (NO editar)

| Archivo | Razón |
|---------|-------|
| `supabase/functions/server/kv_store.tsx` | Sistema interno |
| `components/figma/ImageWithFallback.tsx` | Sistema de imágenes |
| `utils/supabase/info.tsx` | Auto-generado |

---

## 🏗️ Arquitectura de Componentes

### Jerarquía Principal

```
App.tsx
├── Header
│   ├── Logo
│   ├── UserAvatar
│   └── Navigation
├── Tabs
│   ├── UnifiedFeed
│   │   └── PostCard[]
│   ├── NewsSection
│   │   └── NewsPost[]
│   ├── AlertsSection
│   │   └── AlertPost[]
│   ├── ClassifiedsSection
│   │   └── ClassifiedPost[]
│   └── ForumsSection
│       └── ForumThread[]
├── Dialogs/Panels
│   ├── LoginPage
│   ├── SignupPage
│   ├── UserSettings
│   ├── NotificationsPanel
│   ├── MessagingPanel
│   ├── GlobalSearch
│   ├── SavedPosts
│   ├── TrendingContent
│   └── AdminReportsPanel
└── Special Components
    ├── FirefighterEmergencyButton
    ├── PWAInstallPrompt
    └── PWANetworkStatus
```

---

## 🔄 Flujo de Datos

```
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│   Frontend (React)      │
│   • Components          │
│   • State Management    │
│   • UI Logic            │
└───────┬─────────────────┘
        │
        │ HTTPS Request
        │ Bearer Token
        ▼
┌─────────────────────────┐
│   Edge Function         │
│   (Hono Server)         │
│   • Auth Verification   │
│   • Business Logic      │
│   • Data Validation     │
└───────┬─────────────────┘
        │
        ▼
┌─────────────────────────┐
│   Supabase Services     │
├─────────────────────────┤
│ • Auth (JWT)            │
│ • Database (PostgreSQL) │
│ • Storage (Multimedia)  │
│ • Realtime (WebSockets) │
└─────────────────────────┘
```

---

## 📊 Tecnologías por Capa

### Frontend
```
React 18
├── TypeScript (Type safety)
├── Vite (Build tool)
├── Tailwind CSS v4 (Styling)
├── shadcn/ui (Components)
├── Lucide React (Icons)
├── Motion/React (Animations)
└── Sonner (Toasts)
```

### Backend
```
Supabase Edge Functions
├── Hono (Web framework)
├── PostgreSQL (Database)
├── Supabase Auth (Authentication)
├── Supabase Storage (Files)
└── Supabase Realtime (WebSockets)
```

### PWA
```
Progressive Web App
├── Service Worker (Offline)
├── Web App Manifest
├── Push Notifications
└── Install Prompt
```

---

## 🗃️ Estructura de Base de Datos

El proyecto usa un sistema **Key-Value** simple:

```typescript
// Tabla: kv_store_3467f1c6
{
  key: string      // Identificador único
  value: JSON      // Datos en formato JSON
  created_at: date // Timestamp
  updated_at: date // Timestamp
}
```

### Keys usadas:

- `user:{userId}` - Perfil de usuario
- `news:{newsId}` - Publicación de noticia
- `alert:{alertId}` - Publicación de alerta
- `classified:{classifiedId}` - Clasificado
- `forum:{forumId}` - Hilo de foro
- `comment:{commentId}` - Comentario
- `notification:{notificationId}` - Notificación
- `message:{messageId}` - Mensaje privado

---

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor dev (puerto 5173)
npm run build            # Build para producción
npm run preview          # Preview del build

# Calidad
npm run type-check       # Verifica tipos TypeScript
npm run lint             # Linting (si está configurado)

# Supabase
supabase login           # Login en Supabase
supabase link            # Link al proyecto
supabase functions deploy # Deploy edge functions
```

---

## 🎨 Sistema de Diseño

### Colores Principales

```css
/* Tema de Gualán */
--yellow: #facc15      /* Amarillo vibrante */
--pink: #ec4899        /* Rosa energético */
--purple: #a855f7      /* Morado moderno */
--orange: #f97316      /* Naranja cálido */
--red: #ef4444         /* Rojo para alertas */
```

### Reacciones Emocionales
- 🔥 Fuego (trending)
- ❤️ Amor
- 😱 Sorpresa
- 😢 Tristeza
- 😡 Enojo

---

## 📱 Responsive Breakpoints

```css
/* Tailwind default breakpoints */
sm: 640px   /* Móvil grande */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop pequeño */
xl: 1280px  /* Desktop */
2xl: 1536px /* Desktop grande */
```

La app está **optimizada para móvil first**.

---

## 🔐 Sistema de Roles

```typescript
type Role = 
  | 'user'        // Usuario normal
  | 'moderator'   // Puede moderar contenido
  | 'admin'       // Control total
  | 'firefighter' // Bomberos (alertas especiales)
```

### Permisos

| Acción | User | Moderator | Admin | Firefighter |
|--------|------|-----------|-------|-------------|
| Publicar | ✅ | ✅ | ✅ | ✅ |
| Comentar | ✅ | ✅ | ✅ | ✅ |
| Reportar | ✅ | ✅ | ✅ | ✅ |
| Moderar | ❌ | ✅ | ✅ | ❌ |
| Banear | ❌ | ❌ | ✅ | ❌ |
| Asignar roles | ❌ | ❌ | ✅ | ❌ |
| Alerta voz | ❌ | ❌ | ❌ | ✅ |

---

## 🔍 Navegación y Routing

```typescript
// Navegación por tabs
'feed'        → UnifiedFeed
'news'        → NewsSection
'alerts'      → AlertsSection
'classifieds' → ClassifiedsSection
'forums'      → ForumsSection

// Deep linking
?view=news&id=abc123    → Vista pública de noticia
?view=alert&id=xyz789   → Vista pública de alerta
```

---

## 📝 Convenciones de Código

### Nombres de Archivos
- Componentes: `PascalCase.tsx`
- Utilidades: `camelCase.tsx`
- Estilos: `kebab-case.css`

### Nombres de Funciones
- Componentes: `PascalCase`
- Funciones: `camelCase`
- Handlers: `handleActionName`

### Estado
- useState: `[value, setValue]`
- Props: interfaces con sufijo `Props`

---

## 🐛 Debugging

### Logs del Frontend
```javascript
console.log('✅', 'Success message')
console.error('❌', 'Error message')
console.warn('⚠️', 'Warning message')
```

### Logs del Backend
Los logs de Edge Functions se ven en:
- Supabase Dashboard → Edge Functions → Logs
- Terminal: `supabase functions serve --debug`

---

## 🚀 Deployment Flow

```mermaid
Código local
    │
    ├── git add .
    ├── git commit
    ├── git push origin main
    │
    ▼
GitHub
    │
    │ (Webhook)
    ▼
Vercel
    │
    ├── npm install
    ├── npm run build
    ├── Deploy to CDN
    │
    ▼
Producción ✨
```

---

## 📚 Recursos Relacionados

- [React Docs](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase Docs](https://supabase.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [shadcn/ui](https://ui.shadcn.com/)

---

**Última actualización:** Enero 2025  
**Versión:** 2.0.0
