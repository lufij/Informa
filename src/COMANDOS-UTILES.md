# 📝 Comandos Útiles - Informa

## 🚀 Comandos de Desarrollo

### Iniciar Proyecto
```bash
# Desarrollo local (hot reload)
npm run dev

# Se abrirá en http://localhost:3000
# Los cambios se aplican automáticamente
```

### Build y Preview
```bash
# Crear build de producción
npm run build

# Ver el build localmente
npm run preview

# Abrir en http://localhost:4173
```

### Verificación de Código
```bash
# Verificar tipos TypeScript
npm run type-check

# Ejecutar linter
npm run lint

# Verificar configuración
node scripts/verify-setup.js
```

---

## 📦 Gestión de Dependencias

### Instalar/Actualizar
```bash
# Instalar todas las dependencias
npm install

# Instalar una dependencia nueva
npm install nombre-paquete

# Instalar dependencia de desarrollo
npm install -D nombre-paquete

# Actualizar todas las dependencias
npm update

# Ver dependencias desactualizadas
npm outdated
```

### Limpiar Caché
```bash
# Limpiar node_modules
rm -rf node_modules package-lock.json
npm install

# Limpiar caché de Vite
rm -rf node_modules/.vite

# Limpiar build
rm -rf dist
```

---

## 🗄️ Supabase CLI

### Setup Inicial
```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link al proyecto
supabase link --project-ref XXXXX

# Ver proyecto actual
supabase projects list
```

### Edge Functions
```bash
# Deploy todas las functions
supabase functions deploy

# Deploy una función específica
supabase functions deploy make-server-3467f1c6

# Ver logs de una función
supabase functions logs make-server-3467f1c6

# Ejecutar función localmente
supabase functions serve
```

### Base de Datos
```bash
# Ver estado de la DB
supabase db dump

# Reset de la DB (¡cuidado!)
supabase db reset

# Ejecutar migrations
supabase migration up
```

---

## 🚀 Vercel CLI

### Setup
```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Link al proyecto
vercel link
```

### Despliegue
```bash
# Deploy de prueba
vercel

# Deploy a producción
vercel --prod

# Ver deployments
vercel ls

# Ver logs
vercel logs

# Ver logs de producción
vercel logs --prod
```

### Variables de Entorno
```bash
# Agregar variable (producción)
vercel env add NOMBRE_VARIABLE production

# Listar variables
vercel env ls

# Remover variable
vercel env rm NOMBRE_VARIABLE production

# Pull variables a .env.local
vercel env pull
```

---

## 🐙 Git Comandos Esenciales

### Setup Inicial
```bash
# Inicializar Git
git init

# Configurar usuario
git config user.name "Tu Nombre"
git config user.email "tu@email.com"

# Ver configuración
git config --list
```

### Commits
```bash
# Ver estado
git status

# Agregar todos los archivos
git add .

# Agregar archivos específicos
git add archivo1 archivo2

# Commit
git commit -m "Mensaje descriptivo"

# Ver historial
git log --oneline

# Ver cambios
git diff
```

### Branches
```bash
# Ver branches
git branch

# Crear branch
git checkout -b nombre-branch

# Cambiar de branch
git checkout nombre-branch

# Merge branch
git merge nombre-branch

# Eliminar branch
git branch -d nombre-branch
```

### Remote y Push
```bash
# Agregar remote
git remote add origin https://github.com/usuario/repo.git

# Ver remotes
git remote -v

# Push primera vez
git push -u origin main

# Push normal
git push

# Pull cambios
git pull

# Clone repo
git clone https://github.com/usuario/repo.git
```

### Deshacer Cambios
```bash
# Descartar cambios en un archivo
git checkout -- archivo.ts

# Descartar todos los cambios
git checkout -- .

# Deshacer último commit (mantener cambios)
git reset --soft HEAD~1

# Deshacer último commit (eliminar cambios)
git reset --hard HEAD~1

# Ver commits pasados
git reflog
```

---

## 🎨 VS Code Comandos

### Terminal Integrada
```bash
# Abrir terminal
Ctrl + ñ  (Windows/Linux)
Cmd + ñ   (Mac)

# Nueva terminal
Ctrl + Shift + ñ

# Cerrar terminal
Ctrl + D
```

### Buscar y Reemplazar
```bash
# Buscar archivo
Ctrl + P  (Windows/Linux)
Cmd + P   (Mac)

# Buscar en proyecto
Ctrl + Shift + F
Cmd + Shift + F

# Reemplazar en proyecto
Ctrl + Shift + H
Cmd + Shift + H
```

### Formateo
```bash
# Formatear archivo actual
Shift + Alt + F  (Windows/Linux)
Shift + Option + F  (Mac)

# Formatear selección
Ctrl + K, Ctrl + F
```

### Multi-cursor
```bash
# Agregar cursor arriba/abajo
Ctrl + Alt + ↑/↓  (Windows/Linux)
Cmd + Option + ↑/↓  (Mac)

# Seleccionar todas las ocurrencias
Ctrl + Shift + L
Cmd + Shift + L
```

### Navegación
```bash
# Ir a definición
F12

# Ir a referencias
Shift + F12

# Ver definición rápida
Alt + F12
Option + F12

# Volver atrás
Alt + ←
Ctrl + -

# Ir adelante
Alt + →
Ctrl + Shift + -
```

---

## 🔧 Comandos de Sistema

### Windows
```powershell
# Ver puerto en uso
netstat -ano | findstr :3000

# Matar proceso
taskkill /PID [PID] /F

# Limpiar pantalla
cls

# Ver archivos
dir

# Cambiar directorio
cd carpeta
```

### Mac/Linux
```bash
# Ver puerto en uso
lsof -i :3000

# Matar proceso
kill -9 [PID]

# Limpiar pantalla
clear

# Ver archivos
ls -la

# Cambiar directorio
cd carpeta

# Ver espacio en disco
df -h

# Ver uso de CPU/memoria
top
htop  (si está instalado)
```

---

## 📱 PWA - Testing

### Chrome DevTools
```bash
# Abrir DevTools
F12 (Windows/Linux/Mac)
Ctrl + Shift + I (Windows/Linux)
Cmd + Option + I (Mac)

# Modo responsive
Ctrl + Shift + M (Windows/Linux)
Cmd + Shift + M (Mac)
```

### Lighthouse Audit
1. Abre DevTools (F12)
2. Ve a pestaña "Lighthouse"
3. Selecciona:
   - ✓ Progressive Web App
   - ✓ Performance
   - ✓ Best Practices
   - ✓ Accessibility
   - ✓ SEO
4. Click "Analyze page load"

### Service Worker
```javascript
// En la consola del navegador

// Ver Service Worker actual
navigator.serviceWorker.getRegistration()

// Desregistrar Service Worker
navigator.serviceWorker.getRegistration().then(reg => reg.unregister())

// Ver caché
caches.keys().then(console.log)

// Limpiar caché
caches.keys().then(keys => keys.forEach(key => caches.delete(key)))
```

---

## 🧪 Testing y Debug

### Console Logs
```javascript
// En tu código
console.log('Variable:', variable)
console.error('Error:', error)
console.warn('Advertencia:', data)
console.table(arrayDeObjetos)

// En producción
// Recuerda eliminar todos los console.log antes de desplegar
```

### Network Tab
```javascript
// Ver requests
1. F12 → Network
2. Reload página
3. Ve todas las requests HTTP
4. Click en una para ver detalles
```

### React DevTools
```bash
# Instalar extensión
# Chrome: https://chrome.google.com/webstore/detail/react-developer-tools/
# Firefox: https://addons.mozilla.org/en-US/firefox/addon/react-devtools/

# Usar
F12 → Pestaña "Components" o "Profiler"
```

---

## 📊 Monitoreo

### Ver Logs de Vercel
```bash
# Logs en tiempo real
vercel logs --follow

# Logs de producción
vercel logs --prod

# Logs de una función específica
vercel logs [deployment-url]
```

### Ver Logs de Supabase
```bash
# Edge Functions
supabase functions logs make-server-3467f1c6 --follow

# Database
supabase db logs
```

---

## 🆘 Solución Rápida de Problemas

### La app no inicia
```bash
# 1. Verificar puerto
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# 2. Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm install

# 3. Limpiar caché Vite
rm -rf node_modules/.vite

# 4. Intentar de nuevo
npm run dev
```

### Build falla
```bash
# 1. Verificar TypeScript
npm run type-check

# 2. Ver errores específicos
npm run build 2>&1 | tee build-errors.log

# 3. Limpiar y reintentar
rm -rf dist
npm run build
```

### Service Worker no actualiza
```javascript
// En la consola del navegador
navigator.serviceWorker.getRegistration()
  .then(reg => reg.unregister())
  .then(() => location.reload())
```

### Git push rechazado
```bash
# Pull primero
git pull --rebase origin main

# Resolver conflictos si hay
git add .
git rebase --continue

# Push de nuevo
git push
```

---

## 💡 Tips y Trucos

### Atajos de Productividad
```bash
# npm
alias nrd="npm run dev"
alias nrb="npm run build"
alias nrp="npm run preview"

# git
alias gs="git status"
alias ga="git add ."
alias gc="git commit -m"
alias gp="git push"

# Agregar a ~/.bashrc o ~/.zshrc
```

### VS Code Snippets
```json
// En VS Code: Preferences → User Snippets → typescriptreact.json
{
  "React Component": {
    "prefix": "rfc",
    "body": [
      "export function ${1:ComponentName}() {",
      "  return (",
      "    <div>",
      "      $0",
      "    </div>",
      "  )",
      "}"
    ]
  }
}
```

### Package.json Scripts Personalizados
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "clean": "rm -rf node_modules dist .vite",
    "reset": "npm run clean && npm install",
    "check": "npm run type-check && npm run lint"
  }
}
```

---

## 📚 Recursos Útiles

### Documentación
- **Vite:** https://vitejs.dev/
- **React:** https://react.dev/
- **TypeScript:** https://www.typescriptlang.org/
- **Tailwind CSS:** https://tailwindcss.com/
- **Supabase:** https://supabase.com/docs
- **Vercel:** https://vercel.com/docs

### Herramientas Online
- **PWA Icon Generator:** https://www.pwabuilder.com/imageGenerator
- **Favicon Generator:** https://realfavicongenerator.net/
- **OG Image Generator:** https://og-playground.vercel.app/
- **Gradient Generator:** https://cssgradient.io/
- **Color Picker:** https://coolors.co/

---

**💡 Pro Tip:** Guarda este archivo en tus marcadores para acceso rápido!

[← Volver al README](./README.md)
