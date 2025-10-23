// Utilidades para prevenir llamadas excesivas y bucles infinitos

import { useCallback, useRef } from 'react'

/**
 * Hook para debounce de funciones, especialmente útil para prevenir llamadas excesivas a APIs
 */
export function useDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      timeoutRef.current = setTimeout(() => {
        fn(...args)
      }, delay)
    }) as T,
    [fn, delay]
  )
}

/**
 * Hook para throttle de funciones, limitando la frecuencia de ejecución
 */
export function useThrottle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): T {
  const lastRun = useRef<number>(0)

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now()
      if (now - lastRun.current >= delay) {
        lastRun.current = now
        fn(...args)
      }
    }) as T,
    [fn, delay]
  )
}

/**
 * Utilidad para prevenir llamadas concurrentes a la misma función
 */
export function createConcurrencyGuard<T extends (...args: any[]) => Promise<any>>(
  fn: T
): T {
  let isRunning = false
  
  return (async (...args: Parameters<T>) => {
    if (isRunning) {
      return Promise.resolve()
    }
    
    isRunning = true
    try {
      return await fn(...args)
    } finally {
      isRunning = false
    }
  }) as T
}

/**
 * Hook para manejar timeouts de forma segura con cleanup automático
 */
export function useSafeTimeout() {
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set())

  const setSafeTimeout = useCallback((callback: () => void, delay: number) => {
    const timeoutId = setTimeout(() => {
      timeoutsRef.current.delete(timeoutId)
      callback()
    }, delay)
    
    timeoutsRef.current.add(timeoutId)
    return timeoutId
  }, [])

  const clearSafeTimeout = useCallback((timeoutId: NodeJS.Timeout) => {
    clearTimeout(timeoutId)
    timeoutsRef.current.delete(timeoutId)
  }, [])

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current.clear()
  }, [])

  // Cleanup automático al desmontar componente
  const cleanup = useCallback(() => {
    clearAllTimeouts()
  }, [clearAllTimeouts])

  return { setSafeTimeout, clearSafeTimeout, clearAllTimeouts, cleanup }
}

/**
 * Crea un AbortController con timeout automático
 */
export function createTimeoutController(timeoutMs: number = 10000) {
  const controller = new AbortController()
  
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, timeoutMs)

  // Método para limpiar el timeout si la operación completa antes
  const cleanup = () => clearTimeout(timeoutId)

  return { controller, cleanup }
}