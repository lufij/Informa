# Script de Reset Completo para Informa
# Ejecutar desde: F:\Informa\Informa\
# Comando: .\reset-git.ps1

Write-Host "🔄 RESET COMPLETO DE INFORMA" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en la carpeta correcta
if (-not (Test-Path "package.json")) {
    Write-Host "❌ ERROR: No se encontró package.json" -ForegroundColor Red
    Write-Host "Por favor ejecuta este script desde F:\Informa\Informa\" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Carpeta correcta detectada" -ForegroundColor Green
Write-Host ""

# PASO 1: Limpiar Git
Write-Host "📋 PASO 1: Limpiando Git..." -ForegroundColor Yellow
Write-Host ""

Write-Host "→ Deshaciendo cambios en node_modules..." -ForegroundColor Gray
git restore node_modules/ 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Cambios deshechos" -ForegroundColor Green
}

Write-Host "→ Limpiando archivos no rastreados..." -ForegroundColor Gray
git clean -fd node_modules/ 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Archivos limpiados" -ForegroundColor Green
}

Write-Host "→ Removiendo node_modules del índice de Git..." -ForegroundColor Gray
git rm -r --cached node_modules/ 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ node_modules removido del índice" -ForegroundColor Green
} else {
    Write-Host "  ℹ️  node_modules ya no estaba en el índice" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "✅ PASO 1 COMPLETADO" -ForegroundColor Green
Write-Host ""

# PASO 2: Eliminar node_modules
Write-Host "📋 PASO 2: Eliminando node_modules..." -ForegroundColor Yellow
Write-Host ""

if (Test-Path "node_modules") {
    Write-Host "→ Eliminando carpeta node_modules..." -ForegroundColor Gray
    Remove-Item -Recurse -Force node_modules
    Write-Host "  ✅ node_modules eliminado" -ForegroundColor Green
} else {
    Write-Host "  ℹ️  node_modules ya no existe" -ForegroundColor Cyan
}

if (Test-Path "package-lock.json") {
    Write-Host "→ Eliminando package-lock.json..." -ForegroundColor Gray
    Remove-Item -Force package-lock.json
    Write-Host "  ✅ package-lock.json eliminado" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ PASO 2 COMPLETADO" -ForegroundColor Green
Write-Host ""

# PASO 3: Limpiar caché
Write-Host "📋 PASO 3: Limpiando caché de npm..." -ForegroundColor Yellow
Write-Host ""
npm cache clean --force
Write-Host "✅ PASO 3 COMPLETADO" -ForegroundColor Green
Write-Host ""

# PASO 4: Reinstalar dependencias
Write-Host "📋 PASO 4: Reinstalando dependencias..." -ForegroundColor Yellow
Write-Host "⏳ Esto puede tomar 2-3 minutos..." -ForegroundColor Cyan
Write-Host ""
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ PASO 4 COMPLETADO" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ ERROR: npm install falló" -ForegroundColor Red
    exit 1
}

Write-Host ""

# PASO 5: Verificar archivos
Write-Host "📋 PASO 5: Verificando archivos..." -ForegroundColor Yellow
Write-Host ""

# Verificar vite.config.ts
Write-Host "→ Verificando vite.config.ts..." -ForegroundColor Gray
$viteConfig = Get-Content "vite.config.ts" -Raw
if ($viteConfig -match "react-swc") {
    Write-Host "  ❌ ADVERTENCIA: vite.config.ts contiene 'react-swc'" -ForegroundColor Red
    Write-Host "  📥 Descarga el archivo correcto de Figma Make" -ForegroundColor Yellow
} else {
    Write-Host "  ✅ vite.config.ts correcto" -ForegroundColor Green
}

# Verificar .gitignore
if (Test-Path ".gitignore") {
    $gitignore = Get-Content ".gitignore" -Raw
    if ($gitignore -match "node_modules") {
        Write-Host "→ .gitignore correcto" -ForegroundColor Gray
        Write-Host "  ✅ Contiene node_modules/" -ForegroundColor Green
    } else {
        Write-Host "  ❌ .gitignore no contiene node_modules/" -ForegroundColor Red
    }
} else {
    Write-Host "  ❌ .gitignore no existe - descárgalo de Figma Make" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ PASO 5 COMPLETADO" -ForegroundColor Green
Write-Host ""

# PASO 6: Probar build
Write-Host "📋 PASO 6: Probando build local..." -ForegroundColor Yellow
Write-Host ""
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ PASO 6 COMPLETADO" -ForegroundColor Green
    Write-Host "🎉 BUILD EXITOSO" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ ERROR: Build falló" -ForegroundColor Red
    Write-Host "Revisa los errores arriba" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "🎉 RESET COMPLETO EXITOSO" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 PRÓXIMOS PASOS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Verifica el estado de Git:" -ForegroundColor White
Write-Host "   git status" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Agrega los archivos modificados:" -ForegroundColor White
Write-Host "   git add .gitignore vite.config.ts" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Haz commit:" -ForegroundColor White
Write-Host "   git commit -m `"Fix: Reset config - correct vite.config and add .gitignore`"" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Push a GitHub:" -ForegroundColor White
Write-Host "   git push" -ForegroundColor Gray
Write-Host ""
Write-Host "5. En Vercel Dashboard:" -ForegroundColor White
Write-Host "   → Deployments → 3 puntos → Redeploy" -ForegroundColor Gray
Write-Host "   → ✅ Marca 'Clear Build Cache'" -ForegroundColor Gray
Write-Host ""
Write-Host "¡Suerte! 🚀" -ForegroundColor Cyan
