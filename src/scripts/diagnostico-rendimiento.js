#!/usr/bin/env node

/**
 * Script de Diagnóstico de Rendimiento
 * 
 * Verifica que todas las optimizaciones de rendimiento estén implementadas
 * 
 * Uso: node scripts/diagnostico-rendimiento.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

// Colors para la terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function success(message) {
  log(`✅ ${message}`, 'green')
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

function error(message) {
  log(`❌ ${message}`, 'red')
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue')
}

function title(message) {
  log(`\n${'='.repeat(60)}`, 'magenta')
  log(`🚀 ${message}`, 'bright')
  log(`${'='.repeat(60)}\n`, 'magenta')
}

// Verificar lazy loading en App.tsx
function checkLazyLoading() {
  title('Verificando Lazy Loading')
  
  const appPath = path.join(rootDir, 'App.tsx')
  if (!fs.existsSync(appPath)) {
    error('App.tsx no encontrado')
    return false
  }
  
  const content = fs.readFileSync(appPath, 'utf-8')
  
  // Verificar imports de React
  if (content.includes('import { useState, useEffect, lazy, Suspense }')) {
    success('Imports de React optimizados (incluye lazy y Suspense)')
  } else {
    error('Falta importar lazy o Suspense desde React')
    return false
  }
  
  // Verificar lazy loading de componentes
  const lazyComponents = [
    'LoginPage',
    'SignupPage',
    'NewsSection',
    'AlertsSection',
    'ClassifiedsSection',
    'ForumsSection',
    'UnifiedFeed'
  ]
  
  let allLazy = true
  lazyComponents.forEach(comp => {
    if (content.includes(`const ${comp} = lazy(`)) {
      success(`${comp} usa lazy loading`)
    } else {
      warning(`${comp} NO usa lazy loading`)
      allLazy = false
    }
  })
  
  return allLazy
}

// Verificar Suspense boundaries
function checkSuspenseBoundaries() {
  title('Verificando Suspense Boundaries')
  
  const appPath = path.join(rootDir, 'App.tsx')
  const content = fs.readFileSync(appPath, 'utf-8')
  
  // Contar <Suspense> tags
  const suspenseMatches = content.match(/<Suspense/g)
  const suspenseCount = suspenseMatches ? suspenseMatches.length : 0
  
  if (suspenseCount > 10) {
    success(`${suspenseCount} Suspense boundaries encontrados`)
    return true
  } else if (suspenseCount > 5) {
    warning(`Solo ${suspenseCount} Suspense boundaries (se recomiendan 10+)`)
    return true
  } else {
    error(`Muy pocos Suspense boundaries (${suspenseCount})`)
    return false
  }
}

// Verificar ContentSkeleton
function checkContentSkeleton() {
  title('Verificando ContentSkeleton')
  
  const skeletonPath = path.join(rootDir, 'components', 'ContentSkeleton.tsx')
  
  if (fs.existsSync(skeletonPath)) {
    success('ContentSkeleton.tsx existe')
    
    const content = fs.readFileSync(skeletonPath, 'utf-8')
    if (content.includes('Skeleton') && content.includes('Card')) {
      success('ContentSkeleton implementado correctamente')
      return true
    }
  } else {
    error('ContentSkeleton.tsx no encontrado')
    return false
  }
  
  return true
}

// Verificar optimización de checkExistingSession
function checkSessionOptimization() {
  title('Verificando Optimización de Session Check')
  
  const appPath = path.join(rootDir, 'App.tsx')
  const content = fs.readFileSync(appPath, 'utf-8')
  
  // Buscar la función checkExistingSession
  if (content.includes('setIsCheckingSession(false)') && 
      content.includes('.then(response =>')) {
    success('checkExistingSession usa carga en background')
    return true
  } else {
    warning('checkExistingSession podría estar bloqueando la UI')
    return false
  }
}

// Verificar diferimiento de llamadas
function checkDeferredCalls() {
  title('Verificando Diferimiento de Llamadas No Críticas')
  
  const appPath = path.join(rootDir, 'App.tsx')
  const content = fs.readFileSync(appPath, 'utf-8')
  
  let allDeferred = true
  
  // Verificar migrateFirefighterUser
  if (content.includes('setTimeout(() => {\n      migrateFirefighterUser()') ||
      content.includes('setTimeout(() => migrateFirefighterUser()')) {
    success('migrateFirefighterUser() está diferido')
  } else {
    warning('migrateFirefighterUser() NO está diferido')
    allDeferred = false
  }
  
  // Verificar fetchUnreadCount
  if (content.includes('setTimeout(() => {\n        fetchUnreadCount()') ||
      content.includes('const initialTimeout = setTimeout')) {
    success('fetchUnreadCount() está diferido')
  } else {
    warning('fetchUnreadCount() NO está diferido')
    allDeferred = false
  }
  
  return allDeferred
}

// Verificar renderizado condicional
function checkConditionalRendering() {
  title('Verificando Renderizado Condicional de Modales')
  
  const appPath = path.join(rootDir, 'App.tsx')
  const content = fs.readFileSync(appPath, 'utf-8')
  
  const conditionalComponents = [
    'showSettings &&',
    'showNotifications &&',
    'showSearch &&',
    'showMessages &&',
    'showSaved &&',
    'showTrending &&'
  ]
  
  let allConditional = true
  conditionalComponents.forEach(cond => {
    if (content.includes(cond)) {
      success(`Modal con ${cond} se renderiza condicionalmente`)
    } else {
      warning(`Modal ${cond} podría estar renderizándose siempre`)
      allConditional = false
    }
  })
  
  return allConditional
}

// Calcular tamaño estimado del bundle
function estimateBundleSize() {
  title('Estimando Tamaño del Bundle')
  
  const componentsDir = path.join(rootDir, 'components')
  let totalSize = 0
  let fileCount = 0
  
  function getDirectorySize(dir) {
    const files = fs.readdirSync(dir)
    files.forEach(file => {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)
      
      if (stat.isDirectory()) {
        getDirectorySize(filePath)
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        totalSize += stat.size
        fileCount++
      }
    })
  }
  
  getDirectorySize(componentsDir)
  
  // Agregar App.tsx
  const appStat = fs.statSync(path.join(rootDir, 'App.tsx'))
  totalSize += appStat.size
  fileCount++
  
  const sizeInKB = (totalSize / 1024).toFixed(2)
  
  info(`Total de archivos TypeScript: ${fileCount}`)
  info(`Tamaño total de código fuente: ${sizeInKB} KB`)
  
  // Estimar tamaño compilado (aproximadamente 2-3x el tamaño fuente)
  const estimatedBundleKB = (sizeInKB * 2.5).toFixed(2)
  info(`Tamaño estimado del bundle compilado: ${estimatedBundleKB} KB`)
  
  if (estimatedBundleKB < 500) {
    success('Bundle size estimado es óptimo (< 500 KB)')
  } else if (estimatedBundleKB < 800) {
    warning('Bundle size estimado es aceptable (500-800 KB)')
  } else {
    error('Bundle size estimado es grande (> 800 KB)')
  }
}

// Verificar localStorage cache
function checkLocalStorageCache() {
  title('Verificando Cache con localStorage')
  
  const appPath = path.join(rootDir, 'App.tsx')
  const content = fs.readFileSync(appPath, 'utf-8')
  
  if (content.includes('localStorage.getItem') && 
      content.includes('firefighter_migration_completed')) {
    success('Cache de migración con localStorage implementado')
    return true
  } else {
    warning('Cache con localStorage no encontrado')
    return false
  }
}

// Reporte final
function generateReport(results) {
  title('REPORTE FINAL DE OPTIMIZACIONES')
  
  const passed = results.filter(r => r.status).length
  const total = results.length
  const percentage = ((passed / total) * 100).toFixed(1)
  
  console.log()
  results.forEach(result => {
    if (result.status) {
      success(result.name)
    } else {
      error(result.name)
    }
  })
  
  console.log()
  log('─'.repeat(60), 'blue')
  
  if (percentage >= 90) {
    success(`Score: ${passed}/${total} (${percentage}%) - ¡EXCELENTE! 🎉`)
    info('Tu aplicación está altamente optimizada')
  } else if (percentage >= 70) {
    warning(`Score: ${passed}/${total} (${percentage}%) - BUENO ✓`)
    info('La mayoría de optimizaciones están implementadas')
  } else {
    error(`Score: ${passed}/${total} (${percentage}%) - NECESITA MEJORAS`)
    info('Se recomienda implementar más optimizaciones')
  }
  
  log('─'.repeat(60), 'blue')
  console.log()
  
  // Recomendaciones
  if (percentage < 100) {
    info('💡 RECOMENDACIONES:')
    console.log()
    if (!results.find(r => r.name.includes('Lazy Loading')).status) {
      info('   → Implementar lazy loading en componentes grandes')
    }
    if (!results.find(r => r.name.includes('Suspense')).status) {
      info('   → Agregar Suspense boundaries')
    }
    if (!results.find(r => r.name.includes('Session')).status) {
      info('   → Optimizar checkExistingSession para no bloquear UI')
    }
    console.log()
  }
}

// Ejecutar diagnóstico
async function runDiagnostic() {
  log('\n🚀 DIAGNÓSTICO DE RENDIMIENTO - INFORMA\n', 'bright')
  
  const results = [
    { name: 'Lazy Loading de Componentes', status: checkLazyLoading() },
    { name: 'Suspense Boundaries', status: checkSuspenseBoundaries() },
    { name: 'ContentSkeleton', status: checkContentSkeleton() },
    { name: 'Optimización de Session Check', status: checkSessionOptimization() },
    { name: 'Diferimiento de Llamadas', status: checkDeferredCalls() },
    { name: 'Renderizado Condicional', status: checkConditionalRendering() },
    { name: 'Cache con localStorage', status: checkLocalStorageCache() }
  ]
  
  estimateBundleSize()
  
  generateReport(results)
  
  info('📚 Ver OPTIMIZACIONES-RENDIMIENTO.md para más detalles')
  console.log()
}

// Ejecutar
runDiagnostic().catch(console.error)
