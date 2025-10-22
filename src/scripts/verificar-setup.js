#!/usr/bin/env node

/**
 * Script de Verificación de Setup - Informa
 * 
 * Verifica que el proyecto esté correctamente configurado antes de desarrollar.
 * 
 * Uso:
 *   node scripts/verificar-setup.js
 *   npm run verify
 */

import { existsSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')

// Colores para terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

const { green, red, yellow, blue, magenta, cyan, reset } = colors

let errorsCount = 0
let warningsCount = 0

console.log(`\n${magenta}╔═══════════════════════════════════════════╗${reset}`)
console.log(`${magenta}║  🔍 VERIFICACIÓN DE SETUP - INFORMA      ║${reset}`)
console.log(`${magenta}╚═══════════════════════════════════════════╝${reset}\n`)

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function checkExists(path, description) {
  const fullPath = join(projectRoot, path)
  const exists = existsSync(fullPath)
  
  if (exists) {
    console.log(`${green}✓${reset} ${description}`)
  } else {
    console.log(`${red}✗${reset} ${description}`)
    errorsCount++
  }
  
  return exists
}

function checkFileContains(path, searchString, description) {
  const fullPath = join(projectRoot, path)
  
  if (!existsSync(fullPath)) {
    console.log(`${red}✗${reset} ${description} (archivo no existe)`)
    errorsCount++
    return false
  }
  
  const content = readFileSync(fullPath, 'utf-8')
  const contains = content.includes(searchString)
  
  if (contains) {
    console.log(`${green}✓${reset} ${description}`)
  } else {
    console.log(`${yellow}⚠${reset} ${description}`)
    warningsCount++
  }
  
  return contains
}

function warn(message) {
  console.log(`${yellow}⚠${reset} ${message}`)
  warningsCount++
}

function info(message) {
  console.log(`${cyan}ℹ${reset} ${message}`)
}

// ============================================
// VERIFICACIONES
// ============================================

console.log(`${blue}📁 Verificando estructura de archivos...${reset}\n`)

// Archivos esenciales
checkExists('package.json', 'package.json existe')
checkExists('tsconfig.json', 'tsconfig.json existe')
checkExists('vite.config.ts', 'vite.config.ts existe')
checkExists('index.html', 'index.html existe')
checkExists('App.tsx', 'App.tsx existe')

console.log()

// Carpetas principales
checkExists('components', 'Carpeta components/ existe')
checkExists('supabase', 'Carpeta supabase/ existe')
checkExists('utils', 'Carpeta utils/ existe')
checkExists('styles', 'Carpeta styles/ existe')
checkExists('public', 'Carpeta public/ existe')

console.log()

// Componentes clave
checkExists('components/ui', 'Componentes ShadCN UI existen')
checkExists('components/NewsSection.tsx', 'NewsSection.tsx existe')
checkExists('components/AlertsSection.tsx', 'AlertsSection.tsx existe')
checkExists('components/ForumsSection.tsx', 'ForumsSection.tsx existe')
checkExists('components/ClassifiedsSection.tsx', 'ClassifiedsSection.tsx existe')

console.log()

// Backend
checkExists('supabase/functions/server/index.tsx', 'Edge Function principal existe')
checkExists('supabase/functions/server/kv_store.tsx', 'KV Store existe')

console.log(`\n${blue}⚙️  Verificando configuración...${reset}\n`)

// Configuración
checkExists('.gitignore', '.gitignore existe')
checkExists('.prettierrc', '.prettierrc existe')
checkExists('.env.example', '.env.example existe')

// Verificar .env.local
const envExists = checkExists('.env.local', '.env.local existe (variables de entorno)')

if (envExists) {
  checkFileContains('.env.local', 'VITE_SUPABASE_URL', '.env.local contiene VITE_SUPABASE_URL')
  checkFileContains('.env.local', 'VITE_SUPABASE_ANON_KEY', '.env.local contiene VITE_SUPABASE_ANON_KEY')
  checkFileContains('.env.local', 'VITE_SUPABASE_SERVICE_ROLE_KEY', '.env.local contiene SERVICE_ROLE_KEY')
} else {
  console.log(`\n${yellow}⚠ Advertencia:${reset} Archivo .env.local no encontrado.`)
  console.log(`${cyan}  →${reset} Crea el archivo .env.local basándote en .env.example`)
  console.log(`${cyan}  →${reset} Comando: cp .env.example .env.local\n`)
}

console.log()

// Verificar node_modules
const nodeModulesExists = checkExists('node_modules', 'node_modules/ instalado')

if (!nodeModulesExists) {
  console.log(`\n${yellow}⚠ Advertencia:${reset} node_modules no encontrado.`)
  console.log(`${cyan}  →${reset} Ejecuta: npm install\n`)
}

console.log(`\n${blue}📦 Verificando dependencias clave...${reset}\n`)

if (nodeModulesExists) {
  checkExists('node_modules/react', 'React instalado')
  checkExists('node_modules/react-dom', 'React DOM instalado')
  checkExists('node_modules/@supabase/supabase-js', 'Supabase Client instalado')
  checkExists('node_modules/lucide-react', 'Lucide Icons instalado')
  checkExists('node_modules/tailwindcss', 'Tailwind CSS instalado')
  checkExists('node_modules/vite', 'Vite instalado')
} else {
  warn('No se pueden verificar dependencias (node_modules no existe)')
}

console.log(`\n${blue}🎨 Verificando estilos...${reset}\n`)

checkExists('styles/globals.css', 'globals.css existe')
checkFileContains('styles/globals.css', '@theme inline', 'Tailwind v4 configurado')

console.log(`\n${blue}🚀 Verificando configuración PWA...${reset}\n`)

checkExists('public/manifest.json', 'manifest.json existe')
checkExists('public/service-worker.js', 'service-worker.js existe')

console.log(`\n${blue}📝 Verificando documentación...${reset}\n`)

checkExists('README.md', 'README.md existe')
checkExists('README-DESARROLLO.md', 'README-DESARROLLO.md existe')
checkExists('GUIA-DESCARGA-VSCODE.md', 'GUIA-DESCARGA-VSCODE.md existe')

// ============================================
// VERIFICACIONES DE SEGURIDAD
// ============================================

console.log(`\n${blue}🔒 Verificando seguridad...${reset}\n`)

if (checkFileContains('.gitignore', '.env.local', '.gitignore incluye .env.local')) {
  info('Las variables de entorno NO se subirán a Git ✓')
}

if (checkFileContains('.gitignore', 'node_modules', '.gitignore incluye node_modules')) {
  info('node_modules NO se subirá a Git ✓')
}

// ============================================
// RESUMEN FINAL
// ============================================

console.log(`\n${magenta}╔═══════════════════════════════════════════╗${reset}`)
console.log(`${magenta}║  📊 RESUMEN DE VERIFICACIÓN              ║${reset}`)
console.log(`${magenta}╚═══════════════════════════════════════════╝${reset}\n`)

if (errorsCount === 0 && warningsCount === 0) {
  console.log(`${green}✓ ¡Todo está configurado correctamente! 🎉${reset}\n`)
  console.log(`${cyan}Próximos pasos:${reset}`)
  console.log(`${cyan}  1.${reset} npm run dev    ${cyan}→${reset} Iniciar servidor de desarrollo`)
  console.log(`${cyan}  2.${reset} Abrir http://localhost:5173 en tu navegador`)
  console.log(`${cyan}  3.${reset} ¡Empezar a desarrollar! 💻\n`)
  process.exit(0)
} else {
  if (errorsCount > 0) {
    console.log(`${red}✗ ${errorsCount} error(es) encontrado(s)${reset}`)
  }
  
  if (warningsCount > 0) {
    console.log(`${yellow}⚠ ${warningsCount} advertencia(s) encontrada(s)${reset}`)
  }
  
  console.log(`\n${yellow}Acción requerida:${reset}`)
  
  if (!nodeModulesExists) {
    console.log(`${cyan}  →${reset} Ejecutar: ${green}npm install${reset}`)
  }
  
  if (!envExists) {
    console.log(`${cyan}  →${reset} Crear archivo: ${green}.env.local${reset}`)
    console.log(`${cyan}     ${reset}Comando: ${green}cp .env.example .env.local${reset}`)
    console.log(`${cyan}     ${reset}Luego completar con tus credenciales de Supabase`)
  }
  
  console.log(`\n${cyan}Consulta:${reset}`)
  console.log(`${cyan}  →${reset} GUIA-DESCARGA-VSCODE.md para más detalles`)
  console.log(`${cyan}  →${reset} CHECKLIST-SETUP.md para checklist completo\n`)
  
  process.exit(errorsCount > 0 ? 1 : 0)
}
