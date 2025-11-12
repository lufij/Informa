import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react'

interface DiagnosticResult {
  name: string
  status: 'ok' | 'error' | 'checking'
  message: string
}

export function PWADiagnostics({ onClose }: { onClose: () => void }) {
  const [results, setResults] = useState<DiagnosticResult[]>([])

  useEffect(() => {
    runDiagnostics()
  }, [])

  const runDiagnostics = async () => {
    const checks: DiagnosticResult[] = []

    // 1. HTTPS Check
    checks.push({
      name: 'HTTPS',
      status: window.location.protocol === 'https:' || window.location.hostname === 'localhost' ? 'ok' : 'error',
      message: window.location.protocol === 'https:' ? 'Sitio seguro ✓' : 'Necesita HTTPS para PWA'
    })

    // 2. Service Worker
    const swStatus = 'serviceWorker' in navigator
    checks.push({
      name: 'Service Worker',
      status: swStatus ? 'ok' : 'error',
      message: swStatus ? 'Navegador soporta SW ✓' : 'Navegador NO soporta Service Worker'
    })

    // 3. Service Worker Registrado
    if (swStatus) {
      const registration = await navigator.serviceWorker.getRegistration()
      checks.push({
        name: 'SW Registrado',
        status: registration ? 'ok' : 'error',
        message: registration ? `Activo ✓` : 'NO registrado'
      })
    }

    // 4. Manifest
    const manifestLink = document.querySelector('link[rel="manifest"]')
    checks.push({
      name: 'Manifest Link',
      status: manifestLink ? 'ok' : 'error',
      message: manifestLink ? 'Link presente ✓' : 'NO hay link al manifest'
    })

    // 5. Fetch Manifest
    try {
      const manifestRes = await fetch('/manifest.json')
      const manifest = await manifestRes.json()
      checks.push({
        name: 'Manifest Válido',
        status: 'ok',
        message: `${manifest.name} ✓`
      })

      // 6. Iconos
      const icon192 = manifest.icons?.find((i: any) => i.sizes === '192x192')
      if (icon192) {
        try {
          const iconRes = await fetch(icon192.src)
          checks.push({
            name: 'Icono 192x192',
            status: iconRes.ok ? 'ok' : 'error',
            message: iconRes.ok ? 'Existe ✓' : `NO existe en ${icon192.src}`
          })
        } catch {
          checks.push({
            name: 'Icono 192x192',
            status: 'error',
            message: `Error al cargar ${icon192.src}`
          })
        }
      } else {
        checks.push({
          name: 'Icono 192x192',
          status: 'error',
          message: 'NO definido en manifest'
        })
      }
    } catch {
      checks.push({
        name: 'Manifest',
        status: 'error',
        message: 'Error al cargar manifest.json'
      })
    }

    // 7. Display Mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    checks.push({
      name: 'Display Mode',
      status: isStandalone ? 'error' : 'ok',
      message: isStandalone ? '¡YA ESTÁ INSTALADA!' : 'En navegador (no instalada)'
    })

    // 8. beforeinstallprompt
    setTimeout(() => {
      setResults(prev => {
        const hasPrompt = (window as any).__deferredPrompt !== undefined
        return [...prev.filter(r => r.name !== 'beforeinstallprompt'), {
          name: 'beforeinstallprompt',
          status: hasPrompt ? 'ok' : 'error',
          message: hasPrompt ? 'Evento DISPARADO ✓' : 'Evento NO disparado (no se puede instalar automáticamente)'
        }]
      })
    }, 4000)

    setResults(checks)
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-auto">
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-pink-600">
          <h2 className="text-white font-semibold">
            🔍 Diagnóstico PWA
          </h2>
          <p className="text-white/80 text-sm mt-1">
            Por qué no se puede instalar automáticamente
          </p>
        </div>

        <div className="p-4 space-y-3">
          {results.map((result) => (
            <div key={result.name} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
              {result.status === 'ok' ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : result.status === 'error' ? (
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5 animate-pulse" />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900">{result.name}</div>
                <div className="text-sm text-gray-600 mt-0.5">{result.message}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-700 mb-3">
            <strong>¿Por qué no funciona?</strong>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Si dice "YA ESTÁ INSTALADA": Desinstala la app primero</li>
              <li>Si "beforeinstallprompt NO disparado": Chrome bloqueó la instalación (probablemente rechazaste antes)</li>
              <li>Solución: Usa el menú de Chrome (⋮ → Instalar app)</li>
            </ul>
          </div>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
