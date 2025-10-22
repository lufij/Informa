# ⚡ COMANDOS RÁPIDOS - Copia y Pega

## 🎯 Para ejecutar en PowerShell desde `F:\Informa\Informa`

---

## ✅ OPCIÓN 1: Script Automático (RECOMENDADO)

```powershell
# Un solo comando para resetear todo
.\reset-git.ps1
```

**Esto hará TODO automáticamente:**
- Limpiar Git
- Eliminar node_modules
- Reinstalar dependencias
- Probar build
- Mostrarte los próximos pasos

---

## ✅ OPCIÓN 2: Comandos Manuales

### 🧹 LIMPIEZA COMPLETA (Copia todo este bloque)

```powershell
# Limpiar Git de node_modules
git restore node_modules/ 2>$null
git clean -fd node_modules/ 2>$null
git rm -r --cached node_modules/ 2>$null

# Eliminar node_modules y package-lock
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# Limpiar caché
npm cache clean --force

# Reinstalar
npm install

# Probar build
npm run build
```

---

### 📋 VERIFICACIÓN (Ejecuta uno por uno)

```powershell
# Ver estado de Git
git status

# Ver vite.config.ts
cat vite.config.ts

# Ver .gitignore
cat .gitignore

# Probar build
npm run build
```

---

### 📤 COMMIT Y PUSH (Copia todo este bloque)

```powershell
# Agregar archivos
git add .gitignore
git add vite.config.ts

# Ver qué se va a commitear
git status

# Commit
git commit -m "Fix: Reset config - correct vite.config and add .gitignore"

# Push
git push
```

---

## 🚀 DEPLOYMENT EN VERCEL

### Dashboard Web:
```
1. https://vercel.com/dashboard
2. Click proyecto "Informa"
3. Click "Deployments"
4. Click "⋮" (3 puntos) en el último deployment
5. Click "Redeploy"
6. ✅ Desmarca "Use existing Build Cache"
7. Click "Redeploy"
```

### O Forzar desde Terminal:
```powershell
git commit --allow-empty -m "Force Vercel rebuild"
git push
```

---

## 🔍 DIAGNÓSTICO RÁPIDO

### ¿Qué versión de plugin-react tengo?

```powershell
cat vite.config.ts | Select-String "plugin-react"
```

**✅ CORRECTO:** `@vitejs/plugin-react` (sin -swc)  
**❌ INCORRECTO:** `@vitejs/plugin-react-swc`

---

### ¿Está node_modules en Git?

```powershell
git status | Select-String "node_modules"
```

**✅ CORRECTO:** No muestra nada  
**❌ INCORRECTO:** Muestra archivos de node_modules

---

### ¿Existe .gitignore?

```powershell
Test-Path .gitignore
cat .gitignore | Select-String "node_modules"
```

**✅ CORRECTO:** True y muestra "node_modules/"  
**❌ INCORRECTO:** False o no muestra "node_modules/"

---

## 🆘 COMANDOS DE EMERGENCIA

### Si Git está completamente roto:

```powershell
# CUIDADO: Esto eliminará TODOS los cambios no commiteados
git reset --hard HEAD
git clean -fd
```

### Si node_modules sigue en Git:

```powershell
git rm -r --cached node_modules/
echo "node_modules/" >> .gitignore
git add .gitignore
git commit -m "Remove node_modules from Git"
```

### Si el build local falla:

```powershell
# Reinstalar desde cero
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm cache clean --force
npm install
npm run build
```

---

## 📊 VERIFICAR QUE TODO ESTÉ BIEN

Ejecuta todos estos y todos deben ser ✅:

```powershell
# 1. Git limpio (solo .gitignore y vite.config.ts modificados)
git status

# 2. vite.config correcto (sin react-swc)
cat vite.config.ts | Select-String "plugin-react"

# 3. .gitignore existe
Test-Path .gitignore

# 4. node_modules instalado
Test-Path node_modules

# 5. Build funciona
npm run build
```

---

## 🎯 FLUJO COMPLETO EN 3 BLOQUES

### Bloque 1: Reset y Limpieza
```powershell
git restore node_modules/ 2>$null
git clean -fd node_modules/ 2>$null
git rm -r --cached node_modules/ 2>$null
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm cache clean --force
npm install
```

### Bloque 2: Verificar
```powershell
npm run build
git status
cat vite.config.ts
```

### Bloque 3: Deploy
```powershell
git add .gitignore vite.config.ts
git commit -m "Fix: Reset config"
git push
```

---

**Usa estos comandos según lo necesites. ¡Suerte! 🚀**
