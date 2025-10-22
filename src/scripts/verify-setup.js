#!/usr/bin/env node

/**
 * Script de Verificación de Configuración
 * 
 * Verifica que todo esté correctamente configurado antes de iniciar el desarrollo.
 * 
 * Uso: node scripts/verify-setup.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

let hasErrors = false
let hasWarnings = false

// Colors para la terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function success(message) {
  log(`✓ ${message}`, 'green')
}

function error(message) {
  log(`✗ ${message}`, 'red')
  hasErrors = true
}

function warning(message) {
  log(`⚠ ${message}`, 'yellow')
  hasWarnings = true
}

function info(message) {
  log(`ℹ ${message}`, 'blue')
}

function header(message) {
  log(`\n${message}`, 'bright')
  log('='.repeat(message.length), 'bright')
}

// Verificaciones

header('🔍 Verificando Configuración de Informa')

// 1. Verificar Node.js version
header('1. Node.js')
const nodeVersion = process.version
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0])
if (majorVersion >= 18) {
  success(`Node.js ${nodeVersion} (✓ >= 18.0.0)`)
} else {
  error(`Node.js ${nodeVersion} - Se requiere >= 18.0.0`)
}

// 2. Verificar archivos esenciales
header('2. Archivos Esenciales')
const essentialFiles = [
  'package.json',
  'vite.config.ts',
  'tsconfig.json',
  'index.html',
  'App.tsx',
  'vercel.json',
  'public/manifest.json',
  'public/service-worker.js',
  'styles/globals.css',
]

essentialFiles.forEach(file => {
  const filePath = path.join(rootDir, file)
  if (fs.existsSync(filePath)) {
    success(file)
  } else {
    error(`${file} - No encontrado`)
  }
})

// 3. Verificar variables de entorno
header('3. Variables de Entorno')
const envPath = path.join(rootDir, '.env')
const envExamplePath = path.join(rootDir, '.env.example')

if (fs.existsSync(envPath)) {
  success('.env existe')
  
  const envContent = fs.readFileSync(envPath, 'utf-8')
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_SUPABASE_SERVICE_ROLE_KEY',
    'VITE_SUPABASE_DB_URL',
  ]
  
  requiredVars.forEach(varName => {
    if (envContent.includes(`${varName}=`) && !envContent.includes(`${varName}=tu-`)) {
      success(`${varName} configurado`)
    } else {
      warning(`${varName} - No configurado o usa valor de ejemplo`)
    }
  })
} else {
  warning('.env no existe')
  info('Crea el archivo .env copiando .env.example y agrega tus credenciales de Supabase')
}

// 4. Verificar node_modules
header('4. Dependencias')
const nodeModulesPath = path.join(rootDir, 'node_modules')
if (fs.existsSync(nodeModulesPath)) {
  success('node_modules instalado')
  
  // Verificar algunas dependencias críticas
  const criticalDeps = ['react', 'vite', '@supabase/supabase-js', 'tailwindcss']
  criticalDeps.forEach(dep => {
    const depPath = path.join(nodeModulesPath, dep)
    if (fs.existsSync(depPath)) {
      success(`${dep} instalado`)
    } else {
      error(`${dep} - No instalado`)
    }
  })
} else {
  error('node_modules no encontrado')
  info('Ejecuta: npm install')
}

// 5. Verificar íconos PWA
header('5. Íconos PWA')
const iconsDir = path.join(rootDir, 'public/icons')
const requiredIcons = [
  'icon-72x72.png',
  'icon-96x96.png',
  'icon-128x128.png',
  'icon-144x144.png',
  'icon-152x152.png',
  'icon-180x180.png',
  'icon-192x192.png',
  'icon-384x384.png',
  'icon-512x512.png',
  'apple-touch-icon.png',
  'favicon-32x32.png',
  'favicon-16x16.png',
]

if (fs.existsSync(iconsDir)) {
  let iconsFound = 0
  requiredIcons.forEach(icon => {
    const iconPath = path.join(iconsDir, icon)
    if (fs.existsSync(iconPath)) {
      iconsFound++
    }
  })
  
  if (iconsFound === requiredIcons.length) {
    success(`Todos los íconos (${iconsFound}/${requiredIcons.length})`)
  } else if (iconsFound > 0) {
    warning(`Algunos íconos (${iconsFound}/${requiredIcons.length})`)
    info('Faltan algunos íconos PWA. Lee SETUP-VSCODE.md sección 6')
  } else {
    warning('No se encontraron íconos PWA')
    info('Genera los íconos con: https://www.pwabuilder.com/imageGenerator')
  }
} else {
  warning('Carpeta /public/icons/ no existe')
  info('Crea la carpeta y genera los íconos')
}

// 6. Verificar estructura de carpetas
header('6. Estructura de Carpetas')
const requiredDirs = [
  'components',
  'components/ui',
  'public',
  'styles',
  'supabase/functions/server',
  'utils/supabase',
]

requiredDirs.forEach(dir => {
  const dirPath = path.join(rootDir, dir)
  if (fs.existsSync(dirPath)) {
    success(dir)
  } else {
    error(`${dir} - No encontrado`)
  }
})

// Resumen final
header('📊 Resumen')

if (!hasErrors && !hasWarnings) {
  log('\n🎉 ¡Todo está configurado correctamente!', 'green')
  log('\nPróximos pasos:', 'bright')
  log('  1. npm run dev         - Iniciar servidor de desarrollo')
  log('  2. npm run build       - Crear build de producción')
  log('  3. npm run preview     - Ver el build')
  log('\n📚 Lee SETUP-VSCODE.md para más información\n')
} else if (hasErrors && !hasWarnings) {
  log('\n❌ Hay errores que debes corregir antes de continuar', 'red')
  log('\n📚 Lee SETUP-VSCODE.md para instrucciones detalladas\n')
} else if (!hasErrors && hasWarnings) {
  log('\n⚠️  La configuración básica está lista, pero hay algunas advertencias', 'yellow')
  log('\nPuedes iniciar el desarrollo, pero se recomienda resolver las advertencias.', 'yellow')
  log('\nPara iniciar:', 'bright')
  log('  npm run dev\n')
} else {
  log('\n⚠️  Hay errores y advertencias que debes revisar', 'yellow')
  log('\n📚 Lee SETUP-VSCODE.md para instrucciones detalladas\n')
}

process.exit(hasErrors ? 1 : 0)
