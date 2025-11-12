# 🚀 Script para publicar cambios a GitHub (Windows PowerShell)
# Autor: Asistente AI
# Fecha: Noviembre 2025

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "🚀 PUBLICANDO INFORMA A GITHUB" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar que estamos en un repositorio git
Write-Host "📂 Verificando repositorio git..." -ForegroundColor Yellow
if (-Not (Test-Path ".git")) {
    Write-Host "❌ Error: No estás en un repositorio git" -ForegroundColor Red
    Write-Host "Por favor ejecuta este script desde la raíz del proyecto Informa" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Repositorio git encontrado" -ForegroundColor Green
Write-Host ""

# 2. Mostrar estado actual
Write-Host "📊 Estado actual del repositorio:" -ForegroundColor Yellow
git status --short
Write-Host ""

# 3. Verificar si hay cambios
$status = git status --porcelain
if ([string]::IsNullOrEmpty($status)) {
    Write-Host "⚠️  No hay cambios para publicar" -ForegroundColor Yellow
    exit 0
}

# 4. Agregar todos los archivos
Write-Host "➕ Agregando archivos..." -ForegroundColor Yellow
git add .
Write-Host "✅ Archivos agregados" -ForegroundColor Green
Write-Host ""

# 5. Mostrar archivos que se van a commitear
Write-Host "📝 Archivos a commitear:" -ForegroundColor Yellow
git diff --cached --name-status
Write-Host ""

# 6. Crear commit
Write-Host "💾 Creando commit..." -ForegroundColor Yellow
$commitMessage = @"
feat: sistema de compartir en redes sociales y onboarding progresivo

- Agregado ShareButton con WhatsApp, Facebook, Twitter
- Agregado DynamicMetaTags para previews de imágenes
- Agregado ProgressiveOnboarding (3 vistas gratis → instalar → 10 vistas → registrar)
- Agregado hook useAppInstalled para detectar PWA instalada
- Agregada documentación completa (guías, ideas, resúmenes)
- Mejorado PostActions con props de title e imageUrl
- Agregados 12 archivos nuevos en total

Componentes:
- /components/ShareButton.tsx
- /components/DynamicMetaTags.tsx
- /components/ProgressiveOnboarding.tsx
- /hooks/useAppInstalled.tsx

Documentación:
- MEJORAS-COMPARTIR-REDES-SOCIALES.md
- GUIA-IMPLEMENTACION-COMPARTIR.md
- IDEAS-ESPECIFICAS-GUALAN.md
- RESUMEN-MEJORAS-COMPARTIR.md
- GUIA-ONBOARDING-PROGRESIVO.md
- RESUMEN-ONBOARDING.md
- RESUMEN-COMPLETO-SESION.md
- GUIA-PUBLICAR-GITHUB.md
"@

git commit -m $commitMessage
Write-Host "✅ Commit creado" -ForegroundColor Green
Write-Host ""

# 7. Verificar remote
Write-Host "🔗 Verificando remote..." -ForegroundColor Yellow
$remotes = git remote
if ($remotes -notcontains "origin") {
    Write-Host "⚠️  Remote 'origin' no encontrado. Agregando..." -ForegroundColor Yellow
    git remote add origin https://github.com/lufij/Informa.git
    Write-Host "✅ Remote agregado" -ForegroundColor Green
}

$remoteUrl = git remote get-url origin
Write-Host "Remote URL: $remoteUrl" -ForegroundColor Cyan
Write-Host ""

# 8. Mostrar rama actual
$branch = git branch --show-current
Write-Host "🌿 Rama actual: $branch" -ForegroundColor Cyan
Write-Host ""

# 9. Hacer push
Write-Host "🚀 Haciendo push a GitHub..." -ForegroundColor Yellow
Write-Host "⚠️  Esto puede pedir tu usuario y Personal Access Token..." -ForegroundColor Yellow
Write-Host ""

$pushResult = git push origin $branch 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Green
    Write-Host "✅ ¡PUBLICADO EXITOSAMENTE!" -ForegroundColor Green
    Write-Host "==================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 Revisa tus cambios en:" -ForegroundColor Cyan
    Write-Host "   https://github.com/lufij/Informa" -ForegroundColor White
    Write-Host ""
    Write-Host "🎉 Archivos publicados:" -ForegroundColor Green
    Write-Host "   - ShareButton.tsx" -ForegroundColor White
    Write-Host "   - DynamicMetaTags.tsx" -ForegroundColor White
    Write-Host "   - ProgressiveOnboarding.tsx" -ForegroundColor White
    Write-Host "   - useAppInstalled.tsx" -ForegroundColor White
    Write-Host "   - 8 archivos de documentación" -ForegroundColor White
    Write-Host ""
    Write-Host "📝 Próximos pasos:" -ForegroundColor Cyan
    Write-Host "   1. Integrar ShareButton en tus secciones" -ForegroundColor White
    Write-Host "   2. Integrar ProgressiveOnboarding en App.tsx" -ForegroundColor White
    Write-Host "   3. Probar en modo incógnito" -ForegroundColor White
    Write-Host "   4. Desplegar a Vercel: npm run deploy:vercel" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Red
    Write-Host "❌ ERROR AL HACER PUSH" -ForegroundColor Red
    Write-Host "==================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error: $pushResult" -ForegroundColor Red
    Write-Host ""
    Write-Host "Posibles soluciones:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Si es problema de autenticación:" -ForegroundColor Cyan
    Write-Host "   - Asegúrate de usar tu Personal Access Token (no tu contraseña)" -ForegroundColor White
    Write-Host "   - Crea uno en: https://github.com/settings/tokens" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Si hay conflictos:" -ForegroundColor Cyan
    Write-Host "   - Ejecuta: git pull origin $branch --rebase" -ForegroundColor White
    Write-Host "   - Resuelve conflictos si los hay" -ForegroundColor White
    Write-Host "   - Ejecuta: git push origin $branch" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Si el repositorio no existe:" -ForegroundColor Cyan
    Write-Host "   - Crea el repositorio en GitHub primero" -ForegroundColor White
    Write-Host "   - Ejecuta: git remote set-url origin https://github.com/lufij/Informa.git" -ForegroundColor White
    Write-Host ""
    exit 1
}

# 10. Final
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "🎊 ¡TODO LISTO!" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
