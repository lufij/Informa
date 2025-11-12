#!/bin/bash

# 🚀 Script para publicar cambios a GitHub
# Autor: Asistente AI
# Fecha: Noviembre 2025

echo "=================================="
echo "🚀 PUBLICANDO INFORMA A GITHUB"
echo "=================================="
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Verificar que estamos en un repositorio git
echo "📂 Verificando repositorio git..."
if [ ! -d .git ]; then
    echo -e "${RED}❌ Error: No estás en un repositorio git${NC}"
    echo "Por favor ejecuta este script desde la raíz del proyecto Informa"
    exit 1
fi
echo -e "${GREEN}✅ Repositorio git encontrado${NC}"
echo ""

# 2. Mostrar estado actual
echo "📊 Estado actual del repositorio:"
git status --short
echo ""

# 3. Verificar si hay cambios
if [ -z "$(git status --porcelain)" ]; then 
    echo -e "${YELLOW}⚠️  No hay cambios para publicar${NC}"
    exit 0
fi

# 4. Agregar todos los archivos
echo "➕ Agregando archivos..."
git add .
echo -e "${GREEN}✅ Archivos agregados${NC}"
echo ""

# 5. Mostrar archivos que se van a commitear
echo "📝 Archivos a commitear:"
git diff --cached --name-status
echo ""

# 6. Crear commit
echo "💾 Creando commit..."
git commit -m "feat: sistema de compartir en redes sociales y onboarding progresivo

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
- GUIA-PUBLICAR-GITHUB.md"

echo -e "${GREEN}✅ Commit creado${NC}"
echo ""

# 7. Verificar remote
echo "🔗 Verificando remote..."
if ! git remote | grep -q origin; then
    echo -e "${YELLOW}⚠️  Remote 'origin' no encontrado. Agregando...${NC}"
    git remote add origin https://github.com/lufij/Informa.git
    echo -e "${GREEN}✅ Remote agregado${NC}"
fi

REMOTE_URL=$(git remote get-url origin)
echo "Remote URL: $REMOTE_URL"
echo ""

# 8. Mostrar rama actual
BRANCH=$(git branch --show-current)
echo "🌿 Rama actual: $BRANCH"
echo ""

# 9. Hacer push
echo "🚀 Haciendo push a GitHub..."
echo -e "${YELLOW}Esto puede pedir tu usuario y Personal Access Token...${NC}"
echo ""

if git push origin $BRANCH; then
    echo ""
    echo "=================================="
    echo -e "${GREEN}✅ ¡PUBLICADO EXITOSAMENTE!${NC}"
    echo "=================================="
    echo ""
    echo "📍 Revisa tus cambios en:"
    echo "   https://github.com/lufij/Informa"
    echo ""
    echo "🎉 Archivos publicados:"
    echo "   - ShareButton.tsx"
    echo "   - DynamicMetaTags.tsx"
    echo "   - ProgressiveOnboarding.tsx"
    echo "   - useAppInstalled.tsx"
    echo "   - 8 archivos de documentación"
    echo ""
    echo "📝 Próximos pasos:"
    echo "   1. Integrar ShareButton en tus secciones"
    echo "   2. Integrar ProgressiveOnboarding en App.tsx"
    echo "   3. Probar en modo incógnito"
    echo "   4. Desplegar a Vercel: npm run deploy:vercel"
    echo ""
else
    echo ""
    echo "=================================="
    echo -e "${RED}❌ ERROR AL HACER PUSH${NC}"
    echo "=================================="
    echo ""
    echo "Posibles soluciones:"
    echo ""
    echo "1. Si es problema de autenticación:"
    echo "   - Asegúrate de usar tu Personal Access Token (no tu contraseña)"
    echo "   - Crea uno en: https://github.com/settings/tokens"
    echo ""
    echo "2. Si hay conflictos:"
    echo "   - Ejecuta: git pull origin $BRANCH --rebase"
    echo "   - Resuelve conflictos si los hay"
    echo "   - Ejecuta: git push origin $BRANCH"
    echo ""
    echo "3. Si el repositorio no existe:"
    echo "   - Crea el repositorio en GitHub primero"
    echo "   - Ejecuta: git remote set-url origin https://github.com/lufij/Informa.git"
    echo ""
    exit 1
fi

# 10. Final
echo "=================================="
echo "🎊 ¡TODO LISTO!"
echo "=================================="
