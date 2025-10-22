# Informa - Red Social Comunitaria

![Informa Logo](src/public/icons/icon-192x192.png)

## 🌟 Descripción

Informa es una Progressive Web App (PWA) de red social comunitaria para Gualán, Zacapa, Guatemala. Permite a la comunidad compartir noticias, alertas, clasificados y participar en foros locales.

## ✨ Características

- 📱 **Progressive Web App (PWA)** - Instalable en Android e iOS
- 🔥 **Noticias Locales** - Mantente informado de lo que pasa en tu comunidad
- 📢 **Alertas Comunitarias** - Sistema de alertas para emergencias y avisos importantes
- 💼 **Clasificados** - Compra, vende y ofrece servicios localmente
- 💬 **Foros** - Discusiones comunitarias
- 🔔 **Notificaciones en Tiempo Real** - Mantente al día con las interacciones
- 💬 **Mensajería Directa** - Comunícate con otros usuarios
- 🚒 **Sistema de Emergencias** - Alertas de emergencia por voz para bomberos
- 🛡️ **Sistema de Moderación** - Panel de administración y moderación
- 🌐 **Funciona Offline** - Service Worker para cache de contenido

## 🚀 Tecnologías

- **Frontend**: React 18 + TypeScript + Vite
- **Estilos**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Base de datos + Auth + Edge Functions)
- **PWA**: Service Worker + Web App Manifest
- **Iconos**: Lucide React
- **Animaciones**: Framer Motion (motion)

## 📦 Instalación

### Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase (ya configurada)

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd Informa
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configuración de Supabase**

El proyecto ya está configurado con Supabase. Las credenciales están en:
- `src/utils/supabase/info.tsx` - Project ID y Anon Key
- `src/utils/supabase/client.tsx` - Cliente de Supabase

4. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

El proyecto estará disponible en `http://localhost:5173`

## 🏗️ Scripts Disponibles

```bash
npm run dev          # Inicia el servidor de desarrollo
npm run build        # Construye la aplicación para producción
```

## 📱 Instalación como PWA

### Android
1. Abre la aplicación en Chrome
2. Verás un botón flotante "Instalar App"
3. Click en el botón y acepta la instalación
4. La app aparecerá en tu pantalla de inicio

### iOS (iPhone/iPad)
1. Abre la aplicación en Safari
2. Click en el botón flotante "Instalar App"
3. Sigue las instrucciones mostradas:
   - Toca el botón de compartir
   - Selecciona "Añadir a pantalla de inicio"
   - Toca "Agregar"

## 🌐 Deployment

El proyecto está configurado para ser desplegado en Vercel:

```bash
npm run build
# Sube la carpeta dist/ a Vercel
```

## 📁 Estructura del Proyecto

```
Informa/
├── src/
│   ├── components/          # Componentes React
│   │   ├── ui/             # Componentes de shadcn/ui
│   │   ├── NewsSection.tsx
│   │   ├── AlertsSection.tsx
│   │   ├── ClassifiedsSection.tsx
│   │   ├── ForumsSection.tsx
│   │   └── ...
│   ├── utils/
│   │   └── supabase/       # Configuración de Supabase
│   ├── supabase/
│   │   └── functions/      # Edge Functions
│   ├── public/
│   │   ├── icons/          # Iconos PWA
│   │   ├── manifest.json   # Web App Manifest
│   │   └── service-worker.js
│   ├── App.tsx             # Componente principal
│   └── main.tsx            # Punto de entrada
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 🔑 Características Principales

### Sistema de Autenticación
- Login con número de teléfono
- Registro de nuevos usuarios
- Perfiles de usuario con foto
- Roles: usuario, moderador, admin, bombero

### Contenido
- **Noticias**: Publicar y ver noticias con imágenes
- **Alertas**: Alertas comunitarias con sistema de emergencias
- **Clasificados**: Publicar ofertas de trabajo, ventas, servicios
- **Foros**: Crear discusiones y comentar

### Interacciones
- Likes, comentarios y compartir
- Guardados de publicaciones
- Reportes de contenido inapropiado
- Sistema de mensajería directa

### PWA Features
- Instalable en dispositivos móviles
- Funciona offline con service worker
- Notificaciones push (preparado)
- Atajos de aplicación
- Share target API

## 🛡️ Seguridad

- Autenticación con Supabase
- Row Level Security (RLS) en la base de datos
- Validación de inputs en frontend y backend
- Sistema de moderación y reportes
- Protección contra spam y contenido inapropiado

## 👥 Roles de Usuario

- **Usuario**: Puede crear, comentar y interactuar con contenido
- **Moderador**: Puede moderar reportes y contenido
- **Admin**: Acceso completo al sistema
- **Bombero**: Acceso a sistema de alertas de emergencia por voz

## 📞 Soporte

Para soporte técnico o reportar problemas:
- Crea un issue en este repositorio
- Contacta al administrador de la comunidad

## 📄 Licencia

Este proyecto es de código propietario para la comunidad de Gualán, Zacapa.

## 🙏 Agradecimientos

- Comunidad de Gualán, Zacapa
- Bomberos Voluntarios de Gualán
- shadcn/ui por los componentes UI
- Supabase por el backend

---

**Desarrollado con ❤️ para la comunidad de Gualán, Zacapa, Guatemala**
