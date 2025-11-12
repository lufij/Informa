# 🚀 Sistema de Onboarding Progresivo - Guía de Implementación

## 📋 ¿Qué es?

Un sistema que motiva a los usuarios a:
1. **Primero**: Instalar la PWA después de ver contenido
2. **Segundo**: Registrarse para acceso completo

## 🎯 Flujo del Usuario

```
┌─────────────────────────┐
│ Usuario sin Instalar    │
│ (puede ver 3 noticias)  │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│ Instalar App Requerido  │ ← Bloqueo después de 3 publicaciones
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│ Usuario con App         │
│ (puede ver 10 noticias) │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│ Registro Requerido      │ ← Bloqueo después de 10 publicaciones
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│ Usuario Registrado      │
│ (acceso completo)       │
└─────────────────────────┘
```

## 📦 Componentes Creados

### 1. `/components/ProgressiveOnboarding.tsx`
Componente principal que gestiona los 3 niveles de acceso:
- **free**: Usuario puede navegar libremente
- **need-install**: Necesita instalar la app
- **need-signup**: Necesita registrarse
- **full-access**: Acceso completo

### 2. `/hooks/useAppInstalled.tsx`
Hook para detectar si la PWA está instalada.

## ⚙️ Configuración

En `/components/ProgressiveOnboarding.tsx` puedes ajustar:

```typescript
const CONFIG = {
  // Sin instalar: puede ver X noticias antes de pedir instalación
  FREE_VIEWS_WITHOUT_INSTALL: 3,
  
  // Instalado pero sin registro: puede ver X noticias más
  FREE_VIEWS_WITH_INSTALL: 10,
  
  // Tiempo antes de mostrar el mensaje (milisegundos)
  DELAY_BEFORE_PROMPT: 30000, // 30 segundos
}
```

## 🔧 Cómo Implementar

### Opción 1: Implementación Manual en App.tsx

Agrega el hook y el componente:

```tsx
import { ProgressiveOnboarding } from './components/ProgressiveOnboarding'
import { useAppInstalled } from './hooks/useAppInstalled'

export default function App() {
  const isAppInstalled = useAppInstalled()
  
  // ... resto del código ...
  
  return (
    <div className="min-h-screen">
      <header>{/* ... header ... */}</header>
      
      <ProgressiveOnboarding
        isAuthenticated={isAuthenticated}
        isInstalled={isAppInstalled}
        onRequestAuth={() => setShowAuthDialog(true)}
        onRequestInstall={handleInstallPWA}
      >
        <main>
          {/* Todo el contenido de tu app */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* ... tabs ... */}
          </Tabs>
        </main>
      </ProgressiveOnboarding>
      
      {/* ... dialogs y demás ... */}
    </div>
  )
}
```

### Opción 2: Envolver Solo las Secciones de Contenido

Si solo quieres aplicarlo a ciertas secciones:

```tsx
<TabsContent value="news">
  <ProgressiveOnboarding
    isAuthenticated={isAuthenticated}
    isInstalled={isAppInstalled}
    onRequestAuth={() => setShowAuthDialog(true)}
    onRequestInstall={handleInstallPWA}
  >
    <NewsSection {...props} />
  </ProgressiveOnboarding>
</TabsContent>
```

## 📊 Tracking de Vistas

Para que el contador funcione, cada vez que el usuario ve una noticia/post, llama a:

```typescript
import { trackContentView } from './components/ProgressiveOnboarding'

// En NewsSection, cuando se renderiza una noticia:
useEffect(() => {
  trackContentView()
}, [newsItem.id])
```

O manualmente en el componente:

```typescript
// Cuando el usuario hace clic en "Ver más"
const handleViewPost = (postId: string) => {
  // Incrementar contador
  window.dispatchEvent(new Event('informa:view-content'))
  
  // ... mostrar post ...
}
```

## 🎨 Personalización de Mensajes

### Cambiar el mensaje de instalación:

```tsx
<ProgressiveOnboarding
  {...props}
>
  {/* En InstallRequiredGate se usa el prop message */}
</ProgressiveOnboarding>
```

Edita en `/components/ProgressiveOnboarding.tsx`:

```tsx
// Línea ~165
<InstallRequiredGate
  message="¡Instala Informa para seguir viendo noticias de Gualán!"
>
```

### Cambiar beneficios mostrados:

Edita los 3 bloques en `/components/ProgressiveOnboarding.tsx`:
- Líneas 137-172: Beneficios de instalar
- Líneas 199-222: Beneficios de registrarse

## 🧪 Cómo Probar

### 1. Probar sin instalar (0-3 vistas):

```bash
npm run dev
```

1. Abre en incógnito (para simular usuario nuevo)
2. Ve 3 noticias/publicaciones
3. En la 4ta debería aparecer el mensaje de instalar

### 2. Probar con app instalada (3-10 vistas):

1. Instala la PWA
2. Limpia el localStorage: `localStorage.clear()`
3. Refresca la página
4. Ve 10 publicaciones
5. En la 11va debería pedir registro

### 3. Probar registrado:

1. Regístrate o inicia sesión
2. Deberías tener acceso completo sin límites

## 🔄 Resetear Contadores (para testing)

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Resetear contador de vistas
localStorage.removeItem('informa_view_count')

// Resetear si ya vio el prompt de registro
localStorage.removeItem('informa_has_seen_signup_prompt')

// Resetear TODO
localStorage.clear()

// Recargar página
location.reload()
```

## 📱 Indicador de Progreso

El componente muestra un indicador visual (esquina inferior izquierda en desktop) mostrando:
- Cuántas vistas le quedan
- Barra de progreso

Para ocultar el indicador, comenta las líneas 396-414 en `/components/ProgressiveOnboarding.tsx`.

## 🎯 Estrategias de Onboarding

### Conservador (más vistas gratis):
```typescript
const CONFIG = {
  FREE_VIEWS_WITHOUT_INSTALL: 5,   // 5 vistas
  FREE_VIEWS_WITH_INSTALL: 20,     // 20 vistas
  DELAY_BEFORE_PROMPT: 60000,      // 1 minuto
}
```

### Agresivo (menos vistas gratis):
```typescript
const CONFIG = {
  FREE_VIEWS_WITHOUT_INSTALL: 2,   // 2 vistas
  FREE_VIEWS_WITH_INSTALL: 5,      // 5 vistas
  DELAY_BEFORE_PROMPT: 15000,      // 15 segundos
}
```

### Balanceado (recomendado):
```typescript
const CONFIG = {
  FREE_VIEWS_WITHOUT_INSTALL: 3,   // 3 vistas
  FREE_VIEWS_WITH_INSTALL: 10,     // 10 vistas
  DELAY_BEFORE_PROMPT: 30000,      // 30 segundos
}
```

## 🚀 Integración Completa Paso a Paso

### Paso 1: Importar en App.tsx

Al inicio del archivo, después de las importaciones existentes:

```tsx
import { ProgressiveOnboarding } from './components/ProgressiveOnboarding'
import { useAppInstalled } from './hooks/useAppInstalled'
```

### Paso 2: Usar el hook

Dentro del componente App:

```tsx
export default function App() {
  // Estados existentes...
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  
  // ⬇️ AGREGAR ESTO:
  const isAppInstalled = useAppInstalled()
  
  // ... resto del código
}
```

### Paso 3: Envolver el contenido

Busca donde está el `<main>` o el `<Tabs>` y envuélvelo:

```tsx
return (
  <div className="min-h-screen">
    <header>{/* ... */}</header>
    
    {/* ⬇️ AGREGAR WRAPPER AQUÍ */}
    <ProgressiveOnboarding
      isAuthenticated={isAuthenticated}
      isInstalled={isAppInstalled}
      onRequestAuth={() => setShowAuthDialog(true)}
      onRequestInstall={handleInstallPWA}
    >
      <main className="...">
        {/* Todo tu contenido existente */}
        {deepLinkView && deepLinkId && !isAuthenticated ? (
          <PublicContentView {...} />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* ... tabs ... */}
          </Tabs>
        )}
      </main>
    </ProgressiveOnboarding>
    
    {/* Dialogs fuera del wrapper */}
    <Dialog>{/* ... */}</Dialog>
    {/* ... resto ... */}
  </div>
)
```

### Paso 4: Agregar tracking

En cada sección (NewsSection, AlertsSection, etc.), cuando se muestra una publicación:

```tsx
// En NewsSection.tsx
useEffect(() => {
  // Cuando hay noticias y no está autenticado
  if (news.length > 0 && !token) {
    // Solo trackear una vez por carga de sección
    window.dispatchEvent(new Event('informa:view-content'))
  }
}, [news.length, token])
```

## 🎨 Personalizar Apariencia

### Cambiar colores del modal de instalación:

```tsx
// En InstallRequiredGate.tsx, línea 109:
<Card className="max-w-lg w-full bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50">
```

Cambia a tus colores preferidos.

### Cambiar colores del modal de registro:

```tsx
// En ProgressiveOnboarding.tsx, línea 249:
<Card className="max-w-lg w-full bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
```

## 📊 Analytics (Opcional)

Para rastrear conversiones, agrega eventos:

```typescript
// Cuando el usuario instala
const handleInstallSuccess = () => {
  // Google Analytics
  if (window.gtag) {
    gtag('event', 'app_installed')
  }
  
  // O tu sistema de analytics
  analytics.track('App Installed')
}

// Cuando el usuario se registra después del prompt
const handleSignupFromPrompt = () => {
  analytics.track('Signup from Onboarding')
}
```

## 🐛 Solución de Problemas

### "El contador no se incrementa"

Verifica que estés emitiendo el evento:
```javascript
window.dispatchEvent(new Event('informa:view-content'))
```

### "Siempre pide instalar, incluso instalado"

El hook `useAppInstalled()` puede tardar. Verifica en consola:
```javascript
console.log('Instalado:', window.matchMedia('(display-mode: standalone)').matches)
```

### "No muestra el modal de registro"

Verifica que:
1. La app esté instalada
2. El usuario haya visto 10+ posts
3. Han pasado 30 segundos navegando

## 💡 Tips Pro

### Tip 1: Prompts más sutiles
En lugar de bloquear, solo mostrar un banner:

```tsx
{viewCount >= 3 && !isInstalled && (
  <div className="fixed top-16 left-0 right-0 bg-purple-600 text-white p-3 text-center z-40">
    📱 Instala Informa para mejor experiencia
    <Button onClick={onRequestInstall}>Instalar</Button>
  </div>
)}
```

### Tip 2: Diferentes límites por tipo de contenido

```typescript
// Noticias: 3 vistas gratis
// Clasificados: 5 vistas gratis
// Foros: 10 vistas gratis
```

### Tip 3: Usuarios recurrentes
Detectar usuarios que visitan frecuentemente:

```typescript
const visits = parseInt(localStorage.getItem('visit_count') || '0') + 1
localStorage.setItem('visit_count', visits.toString())

if (visits >= 5 && !isAuthenticated) {
  // Mostrar mensaje especial para usuarios frecuentes
}
```

## ✅ Checklist de Implementación

- [ ] Archivos creados (ProgressiveOnboarding.tsx, useAppInstalled.tsx)
- [ ] Hook importado en App.tsx
- [ ] ProgressiveOnboarding envolviendo el contenido
- [ ] Configuración ajustada a tus necesidades
- [ ] Tracking de vistas implementado
- [ ] Probado en modo incógnito
- [ ] Probado con app instalada
- [ ] Probado con usuario registrado
- [ ] Mensajes personalizados
- [ ] Analytics configurado (opcional)

## 🚀 Resultado Final

Con esto implementado, tu app tendrá:
- ✅ Onboarding progresivo y no intrusivo
- ✅ Motivación para instalar la PWA
- ✅ Motivación para registrarse
- ✅ Mejor retención de usuarios
- ✅ Más instalaciones de la app
- ✅ Más registros de usuarios

---

**¿Listo para implementar? Sigue la Guía Paso a Paso y cualquier duda, pregunta!**
