# 🔄 RESET COMPLETO - Instrucciones Paso a Paso

## ⚠️ IMPORTANTE: Sigue estos pasos EN ORDEN

---

## 📋 PASO 1: Descargar Archivos Actualizados de Figma Make

Descarga estos archivos de Figma Make y reemplázalos en tu proyecto local:

1. ✅ `.gitignore` (NUEVO - descarga este archivo)
2. ✅ `vite.config.ts`
3. ✅ `package.json`
4. ✅ `vercel.json`

**Ubicación en tu PC:**
```
F:\Informa\Informa\
├── .gitignore       ← NUEVO - debe estar en la raíz
├── vite.config.ts   ← Reemplazar
├── package.json     ← Verificar que sea correcto
└── vercel.json      ← Verificar que sea correcto
```

---

## 🧹 PASO 2: Limpiar Git y node_modules

Abre **PowerShell** en `F:\Informa\Informa` y ejecuta estos comandos:

```powershell
# 1. Ir a la carpeta del proyecto
cd F:\Informa\Informa

# 2. Ver el estado actual (probablemente mostrará muchos archivos de node_modules)
git status

# 3. DESHACER todos los cambios en node_modules (NO los queremos en Git)
git restore node_modules/ 2>$null

# 4. Limpiar archivos no rastreados en node_modules
git clean -fd node_modules/ 2>$null

# 5. REMOVER node_modules del índice de Git (por si ya estaban agregados)
git rm -r --cached node_modules/ 2>$null

# 6. Verificar el estado - SOLO deben aparecer archivos de configuración
git status
```

**Resultado esperado del `git status`:**
```
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        new file:   .gitignore
        modified:   vite.config.ts

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        (ninguno o muy pocos archivos)
```

**❌ SI ves archivos de `node_modules`:** Repite los comandos del paso 5.

---

## 🗑️ PASO 3: Eliminar node_modules y Reinstalar

```powershell
# 1. Eliminar carpeta node_modules completamente
Remove-Item -Recurse -Force node_modules

# 2. Eliminar package-lock.json (para empezar limpio)
Remove-Item -Force package-lock.json

# 3. Limpiar caché de npm
npm cache clean --force

# 4. Reinstalar todas las dependencias
npm install
```

**Esto tomará 2-3 minutos.** Verás:
```
added 168 packages in 2m
```

---

## ✅ PASO 4: Verificar que TODO esté Correcto

```powershell
# 1. Verificar que vite.config.ts NO tenga "react-swc"
cat vite.config.ts

# Debe mostrar:
# import react from '@vitejs/plugin-react'  ✅ (SIN -swc)
# import tailwindcss from '@tailwindcss/vite'  ✅

# 2. Verificar que .gitignore exista y tenga "node_modules/"
cat .gitignore | Select-String "node_modules"
# Debe mostrar: node_modules/

# 3. Probar build localmente
npm run build
```

**Resultado esperado del build:**
```
vite v5.1.0 building for production...
✓ 145 modules transformed.
dist/index.html                  1.23 kB │ gzip:  0.54 kB
dist/assets/index-a1b2c3d4.js  456.78 kB │ gzip: 123.45 kB
✓ built in 12.34s
```

**Si el build falla:** Copia el error y me lo envías.

---

## 📤 PASO 5: Commit y Push a GitHub

```powershell
# 1. Agregar archivos modificados
git add .gitignore
git add vite.config.ts

# 2. Verificar QUÉ se va a commitear
git status

# IMPORTANTE: NO debe aparecer NADA de node_modules
# Si aparece, vuelve al PASO 2

# 3. Hacer commit
git commit -m "Fix: Reset config - correct vite.config and add .gitignore"

# 4. Push a GitHub
git push
```

---

## 🚀 PASO 6: Redeploy en Vercel con Caché Limpio

### Opción A: Desde el Dashboard (RECOMENDADO)

1. Ve a **https://vercel.com/dashboard**
2. Click en tu proyecto **"Informa"**
3. Click en **"Deployments"** (menú lateral)
4. En el último deployment → Click en **3 puntos verticales** (⋮)
5. Click en **"Redeploy"**
6. ✅ **IMPORTANTE:** Desmarca **"Use existing Build Cache"** o marca **"Clear Build Cache"**
7. Click en **"Redeploy"**

### Opción B: Forzar desde Terminal

```powershell
# Hacer un commit vacío para forzar nuevo deployment
git commit --allow-empty -m "Force Vercel rebuild"
git push
```

Luego ve al Dashboard y haz el Redeploy con caché limpio (Opción A).

---

## 📊 PASO 7: Verificar el Build en Vercel

En los logs de Vercel, debes ver:

```
✅ Skipping build cache, deployment was triggered without cache  ← IMPORTANTE
✅ Cloning completed: 3.664s
✅ Installing dependencies...
✅ added 168 packages in 4s
✅ Running "npm run build"
✅ vite build
✅ ✓ 145 modules transformed
✅ dist/index.html created
✅ Build Completed in 2m 34s
🎉 DEPLOYMENT SUCCESSFUL
```

**❌ SI falla:**
- Copia los logs completos
- Envíamelos y lo arreglaremos

---

## 🎯 Checklist Final

Antes de hacer push, verifica:

- [ ] `.gitignore` existe y contiene `node_modules/`
- [ ] `vite.config.ts` usa `@vitejs/plugin-react` (SIN `-swc`)
- [ ] `npm run build` funciona localmente sin errores
- [ ] `git status` NO muestra archivos de `node_modules`
- [ ] `package.json` tiene `@vitejs/plugin-react` en devDependencies

---

## 💡 Si Algo Sale Mal

**Error: "Cannot find package '@vitejs/plugin-react-swc'"**
→ Tu `vite.config.ts` todavía tiene la versión vieja. Descárgalo de Figma Make.

**Error: Git muestra miles de archivos de node_modules**
→ Repite el PASO 2 completo.

**Error: Build falla en Vercel con caché**
→ Asegúrate de limpiar el caché en el PASO 6.

**Build exitoso pero la app no funciona**
→ Probablemente sea un problema de backend/Supabase, no de build.

---

## 🚀 Después del Deploy Exitoso

1. Abre tu app en Vercel: `https://tu-app.vercel.app`
2. Verifica que cargue correctamente
3. Prueba login/signup
4. ¡Listo! 🎉

---

**¿Necesitas ayuda?** En cualquier paso que te atores, copia el error y envíamelo.
