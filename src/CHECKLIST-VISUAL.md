# ✅ CHECKLIST VISUAL - Reset Completo de Informa

## 🎯 TU MISIÓN: Deploy Exitoso en Vercel

---

## 📥 FASE 1: DESCARGAR ARCHIVOS

Descarga estos 4 archivos de Figma Make y reemplázalos en tu PC:

```
F:\Informa\Informa\
│
├── [ ] .gitignore          ← NUEVO - Crear
├── [ ] vite.config.ts      ← Reemplazar completamente
├── [ ] package.json        ← Verificar que sea igual
└── [ ] vercel.json         ← Verificar que sea igual
```

### Contenido de `.gitignore` (NUEVO ARCHIVO):
```gitignore
# Dependencies
node_modules/
/.pnp
.pnp.js

# Production
/build
/dist
.vercel

# Misc
.DS_Store
.env
.env.local

# Logs
npm-debug.log*
yarn-debug.log*

# Vite
.vite
*.local

# TypeScript
*.tsbuildinfo
```

### Contenido de `vite.config.ts` (DEBE SER EXACTAMENTE ASÍ):
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
```

**❌ NO DEBE TENER:**
- `import path from 'path'`
- `react-swc`
- `resolve: { alias: {...} }`
- `optimizeDeps`

---

## 🤖 FASE 2: EJECUTAR SCRIPT AUTOMÁTICO

### Opción A: Script PowerShell (Automático - Recomendado)

```powershell
# 1. Abre PowerShell en F:\Informa\Informa

# 2. Ejecuta el script
.\reset-git.ps1
```

**El script hará:**
1. ✅ Limpiar Git de archivos de node_modules
2. ✅ Eliminar node_modules y package-lock.json
3. ✅ Limpiar caché de npm
4. ✅ Reinstalar dependencias limpias
5. ✅ Probar build local
6. ✅ Mostrarte los próximos pasos

---

### Opción B: Manual (Si el script no funciona)

```powershell
# 1. Limpiar Git
git restore node_modules/ 2>$null
git clean -fd node_modules/ 2>$null
git rm -r --cached node_modules/ 2>$null

# 2. Eliminar node_modules
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# 3. Limpiar caché
npm cache clean --force

# 4. Reinstalar
npm install

# 5. Probar build
npm run build
```

---

## ✅ FASE 3: VERIFICACIÓN

Ejecuta estos comandos y verifica los resultados:

### 1️⃣ Verificar Git Status
```powershell
git status
```

**✅ CORRECTO:**
```
Changes to be committed:
        new file:   .gitignore
        modified:   vite.config.ts
```

**❌ INCORRECTO (si ves esto):**
```
        modified:   node_modules/lucide-react/...
        modified:   node_modules/motion/...
        ...  (miles de archivos)
```
→ **SOLUCIÓN:** Vuelve a la FASE 2

---

### 2️⃣ Verificar vite.config.ts
```powershell
cat vite.config.ts
```

**✅ CORRECTO:**
```typescript
import react from '@vitejs/plugin-react'     # ✅ SIN -swc
import tailwindcss from '@tailwindcss/vite'  # ✅ Tiene Tailwind
```

**❌ INCORRECTO:**
```typescript
import react from '@vitejs/plugin-react-swc'  # ❌ Tiene -swc
```
→ **SOLUCIÓN:** Descarga vite.config.ts de Figma Make nuevamente

---

### 3️⃣ Verificar Build Local
```powershell
npm run build
```

**✅ CORRECTO:**
```
vite v5.1.0 building for production...
✓ 145 modules transformed.
dist/index.html                  1.23 kB │ gzip:  0.54 kB
dist/assets/index-a1b2c3d4.js  456.78 kB │ gzip: 123.45 kB
✓ built in 12.34s
```

**❌ INCORRECTO:**
```
Error: Cannot find package '@vitejs/plugin-react-swc'
```
→ **SOLUCIÓN:** Tu vite.config.ts está mal. Descárgalo de Figma Make.

---

## 📤 FASE 4: COMMIT Y PUSH

```powershell
# 1. Agregar archivos
git add .gitignore
git add vite.config.ts

# 2. Verificar QUÉ se va a commitear (IMPORTANTE)
git status

# 3. Commit
git commit -m "Fix: Reset config - correct vite.config and add .gitignore"

# 4. Push
git push
```

---

## 🚀 FASE 5: REDEPLOY EN VERCEL

### 🎯 PASO CRÍTICO: Limpiar Caché

1. Ve a **https://vercel.com/dashboard**
2. Click en tu proyecto **"Informa"**
3. Click en **"Deployments"**
4. En el último deployment → Click en **⋮** (3 puntos)
5. Click en **"Redeploy"**
6. 🔴 **IMPORTANTE:** Desmarca **"Use existing Build Cache"**
   O marca **"Clear Build Cache and Redeploy"**
7. Click en **"Redeploy"**

---

## 📊 FASE 6: VERIFICAR DEPLOYMENT

### En los Logs de Vercel, debes ver:

```
✅ Skipping build cache, deployment was triggered without cache  ← MUY IMPORTANTE
✅ Cloning github.com/lufij/Informa
✅ Installing dependencies...
✅ added 168 packages in 4s
✅ Running "npm run build"
✅ vite build
✅ ✓ 145 modules transformed
✅ dist/index.html                  1.23 kB
✅ dist/assets/index-a1b2c3d4.js  456.78 kB
✅ Build Completed in 2m 34s
🎉 Deployment Ready
```

**❌ SI VES ESTO:**
```
❌ Restored build cache from previous deployment  ← MAL - No limpiaste el caché
```
→ **SOLUCIÓN:** Cancela el deployment y haz Redeploy con "Clear Build Cache"

---

## 🎉 ÉXITO - Verificación Final

1. [ ] Build completado sin errores en Vercel
2. [ ] La URL de tu app abre correctamente
3. [ ] Puedes hacer login/signup
4. [ ] Las imágenes cargan
5. [ ] No hay errores en la consola del navegador

---

## 🆘 SI ALGO FALLA

### Error: "Cannot find package '@vitejs/plugin-react-swc'"
→ Tu `vite.config.ts` tiene la versión vieja
→ Descarga el archivo correcto de Figma Make

### Error: Git muestra miles de archivos de node_modules
→ Ejecuta el script `reset-git.ps1` nuevamente
→ O ejecuta manualmente los comandos de limpieza de Git

### Error: Build funciona localmente pero falla en Vercel
→ Asegúrate de haber limpiado el caché de Vercel
→ En Vercel Dashboard → Redeploy → Desmarca "Use existing Build Cache"

### Error: Build exitoso pero app no carga
→ Probablemente es un problema de backend/Supabase
→ Revisa la consola del navegador (F12)

---

## 📞 SOPORTE

Si después de seguir todos los pasos aún tienes problemas:

1. Copia el error completo de Vercel
2. Copia el resultado de `git status`
3. Copia el resultado de `cat vite.config.ts`
4. Envíame todo junto

---

**¡Vamos a lograrlo! 💪🚀**
