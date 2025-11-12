#!/bin/bash

# 🚀 Script de Deployment Automatizado - Informa
# Uso: ./scripts/deploy.sh

set -e  # Exit on error

echo "🚀 ======================================"
echo "   DEPLOYMENT DE INFORMA"
echo "   Gualán, Zacapa, Guatemala 🇬🇹"
echo "========================================"
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "ℹ️  $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "Error: package.json no encontrado. ¿Estás en el directorio raíz del proyecto?"
    exit 1
fi

print_success "Directorio verificado"
echo ""

# PASO 1: Verificar dependencias instaladas
print_info "📦 PASO 1: Verificando dependencias..."
if [ ! -d "node_modules" ]; then
    print_warning "node_modules no encontrado. Instalando dependencias..."
    npm install
    print_success "Dependencias instaladas"
else
    print_success "Dependencias ya instaladas"
fi
echo ""

# PASO 2: Limpiar build anterior
print_info "🧹 PASO 2: Limpiando build anterior..."
if [ -d "dist" ]; then
    rm -rf dist
    print_success "Build anterior eliminado"
else
    print_info "No hay build anterior"
fi
echo ""

# PASO 3: Build de producción
print_info "🔨 PASO 3: Creando build de producción..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Build exitoso"
else
    print_error "Build falló. Revisa los errores arriba."
    exit 1
fi
echo ""

# PASO 4: Verificar que dist/ existe
if [ ! -d "dist" ]; then
    print_error "Error: carpeta dist/ no fue creada"
    exit 1
fi
print_success "Build verificado en dist/"
echo ""

# PASO 5: Preguntar si quiere hacer deploy del backend
echo "🗄️  PASO 5: Deploy del Backend"
read -p "¿Quieres deployar Supabase Functions? (s/n): " deploy_backend

if [ "$deploy_backend" = "s" ] || [ "$deploy_backend" = "S" ]; then
    print_info "Deploying Supabase Functions..."
    
    # Verificar Supabase CLI
    if ! command -v supabase &> /dev/null; then
        print_error "Supabase CLI no está instalado"
        print_info "Instalar con: npm install -g supabase"
        exit 1
    fi
    
    # Deploy
    supabase functions deploy server
    
    if [ $? -eq 0 ]; then
        print_success "Backend deployado exitosamente"
    else
        print_error "Error al deployar backend"
        exit 1
    fi
else
    print_warning "Backend deployment omitido"
fi
echo ""

# PASO 6: Preguntar plataforma de deploy
echo "🌐 PASO 6: Deploy del Frontend"
echo "Selecciona plataforma:"
echo "1) Vercel (recomendado)"
echo "2) Netlify"
echo "3) Omitir (deploy manual)"
read -p "Opción (1/2/3): " deploy_platform

case $deploy_platform in
    1)
        print_info "Deploying a Vercel..."
        
        # Verificar Vercel CLI
        if ! command -v vercel &> /dev/null; then
            print_warning "Vercel CLI no está instalado"
            read -p "¿Quieres instalarlo ahora? (s/n): " install_vercel
            
            if [ "$install_vercel" = "s" ]; then
                npm install -g vercel
            else
                print_error "No se puede continuar sin Vercel CLI"
                exit 1
            fi
        fi
        
        # Deploy a producción
        read -p "¿Deploy a PRODUCCIÓN? (s/n): " prod_deploy
        
        if [ "$prod_deploy" = "s" ]; then
            vercel --prod
            print_success "Deployado a producción en Vercel"
        else
            vercel
            print_success "Deployado a preview en Vercel"
        fi
        ;;
    2)
        print_info "Deploying a Netlify..."
        
        # Verificar Netlify CLI
        if ! command -v netlify &> /dev/null; then
            print_warning "Netlify CLI no está instalado"
            read -p "¿Quieres instalarlo ahora? (s/n): " install_netlify
            
            if [ "$install_netlify" = "s" ]; then
                npm install -g netlify-cli
            else
                print_error "No se puede continuar sin Netlify CLI"
                exit 1
            fi
        fi
        
        # Deploy
        netlify deploy --prod
        print_success "Deployado a Netlify"
        ;;
    3)
        print_warning "Frontend deployment omitido"
        print_info "Puedes deployar manualmente con:"
        print_info "  - Vercel: vercel --prod"
        print_info "  - Netlify: netlify deploy --prod"
        ;;
    *)
        print_error "Opción inválida"
        exit 1
        ;;
esac
echo ""

# PASO 7: Resumen
echo "📊 ======================================"
echo "   RESUMEN DEL DEPLOYMENT"
echo "========================================"
print_success "Build creado en dist/"

if [ "$deploy_backend" = "s" ] || [ "$deploy_backend" = "S" ]; then
    print_success "Backend deployado a Supabase"
fi

if [ "$deploy_platform" != "3" ]; then
    print_success "Frontend deployado"
fi

echo ""
print_info "Próximos pasos:"
echo "  1. Verificar que la app funciona en producción"
echo "  2. Probar login/signup"
echo "  3. Probar publicar contenido"
echo "  4. Monitorear logs: supabase functions logs server --tail"
echo "  5. ¡Anunciar a la comunidad! 🎉"
echo ""
print_success "¡Deployment completado! 🚀🇬🇹"
echo ""
