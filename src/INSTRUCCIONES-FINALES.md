# 🚀 INSTRUCCIONES FINALES - Deploy de Informa

## 📁 Archivos Creados para Ti

He creado 5 archivos nuevos en Figma Make para ayudarte:

1. **`.gitignore`** ← NUEVO - Evita que node_modules vaya a Git
2. **`RESET-COMPLETO.md`** ← Guía detallada paso a paso
3. **`CHECKLIST-VISUAL.md`** ← Checklist con checkboxes
4. **`COMANDOS-RAPIDOS.md`** ← Comandos de copia y pega
5. **`reset-git.ps1`** ← Script automático de PowerShell
6. **`COMANDOS-UTILES.md`** ← Ya existía, actualizado

---

## 🎯 QUÉ HACER AHORA - 3 OPCIONES

### 🥇 OPCIÓN 1: Script Automático (MÁS RÁPIDO)

1. Descarga **TODOS** estos archivos de Figma Make a `F:\Informa\Informa`:
   - `.gitignore`
   - `vite.config.ts`
   - `reset-git.ps1`

2. Abre PowerShell en `F:\Informa\Informa`

3. Ejecuta:
   ```powershell
   .\reset-git.ps1
   ```

4. Sigue las instrucciones que aparecerán al final del script

---

### 🥈 OPCIÓN 2: Manual con Guía Detallada

Lee y sigue **`RESET-COMPLETO.md`** paso a paso.

Cada paso tiene explicaciones claras y resultados esperados.

---

### 🥉 OPCIÓN 3: Comandos Rápidos

Abre **`COMANDOS-RAPIDOS.md`** y copia los bloques de comandos.

Ejecuta cada bloque y verifica los resultados.

---

## ✅ LO MÁS IMPORTANTE

### 1️⃣ `.gitignore` DEBE existir
```
F:\Informa\Informa\.gitignore
```

Contenido mínimo:
```gitignore
node_modules/
/dist
.env
```

---

### 2️⃣ `vite.config.ts` DEBE ser este:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

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

**SIN:**
- `react-swc`
- `import path`
- `resolve: { alias }`
- `optimizeDeps`

---

### 3️⃣ Git NO debe rastrear node_modules

```powershell
git status
```

**✅ CORRECTO:**
```
Changes to be committed:
        modified:   vite.config.ts
        new file:   .gitignore
```

**❌ INCORRECTO:**
```
        modified:   node_modules/...  ← MAL
        deleted:    node_modules/...  ← MAL
```

---

### 4️⃣ Build local DEBE funcionar

```powershell
npm run build
```

**✅ CORRECTO:**
```
✓ 145 modules transformed.
dist/index.html
✓ built in 12.34s
```

**❌ INCORRECTO:**
```
Error: Cannot find package '@vitejs/plugin-react-swc'
```

---

### 5️⃣ Vercel DEBE limpiar el caché

En Vercel Dashboard:
- Deployments → ⋮ → Redeploy
- ✅ **Desmarca "Use existing Build Cache"**

En los logs DEBE aparecer:
```
✅ Skipping build cache, deployment was triggered without cache
```

---

## 🔄 FLUJO COMPLETO EN 5 PASOS

```
1. Descargar archivos de Figma Make
   ↓
2. Ejecutar reset-git.ps1 (o comandos manuales)
   ↓
3. Verificar: npm run build
   ↓
4. Git: add, commit, push
   ↓
5. Vercel: Redeploy con Clear Build Cache
```

---

## 📊 CHECKLIST FINAL

Antes de hacer push a GitHub:

- [ ] `.gitignore` existe y contiene `node_modules/`
- [ ] `vite.config.ts` usa `@vitejs/plugin-react` (SIN `-swc`)
- [ ] `npm install` completó sin errores
- [ ] `npm run build` funciona localmente
- [ ] `git status` NO muestra archivos de `node_modules`

Antes de Redeploy en Vercel:

- [ ] Push a GitHub completado
- [ ] Vas a marcar "Clear Build Cache" en Vercel

---

## 🆘 SI ALGO FALLA

### El script reset-git.ps1 no se ejecuta

```powershell
# Cambiar política de ejecución (una sola vez)
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

# Intentar ejecutar de nuevo
.\reset-git.ps1
```

---

### Git sigue mostrando node_modules

```powershell
# Forzar limpieza
git rm -r --cached node_modules/
git restore node_modules/
git clean -fd node_modules/

# Verificar
git status
```

---

### Build local falla con error de react-swc

```powershell
# Tu vite.config.ts está mal
# Descarga el correcto de Figma Make
# Luego:
npm install
npm run build
```

---

### Build funciona local pero falla en Vercel

**Causa:** Vercel está usando caché viejo

**Solución:**
1. Cancela el deployment actual
2. Ve a Deployments
3. Click ⋮ → Redeploy
4. ✅ Desmarca "Use existing Build Cache"
5. Redeploy

---

### Build exitoso en Vercel pero app no carga

**Causa:** Problema de backend/Supabase, NO de build

**Solución:**
1. Abre la consola del navegador (F12)
2. Ve a la tab Console
3. Copia los errores que aparecen
4. Envíamelos para diagnosticar

---

## 📞 SOPORTE ADICIONAL

Si después de seguir TODAS las instrucciones aún tienes problemas:

**Envíame estos 4 datos:**

1. Resultado de `git status`
2. Contenido de `cat vite.config.ts`
3. Logs completos de Vercel (los primeros 50 líneas)
4. Screenshot del error (si es visual)

---

## 🎉 MENSAJE FINAL

**Los archivos en Figma Make están PERFECTOS.**

El problema está en tu repositorio de GitHub que tiene versiones viejas.

Solo necesitas:
1. Descargar los archivos correctos
2. Limpiar Git y node_modules
3. Hacer push limpio
4. Redeploy con caché limpio en Vercel

**¡Esto va a funcionar! 💪🚀**

---

## 📚 REFERENCIAS RÁPIDAS

- `RESET-COMPLETO.md` - Guía detallada completa
- `CHECKLIST-VISUAL.md` - Checklist con checkboxes
- `COMANDOS-RAPIDOS.md` - Comandos de copia y pega
- `reset-git.ps1` - Script automático

---

**Empieza por aquí: Descarga `.gitignore`, `vite.config.ts` y `reset-git.ps1`**

**Luego ejecuta: `.\reset-git.ps1`**

**¡Vamos a lograrlo! 🚀**
