import { useEffect, useRef, useCallback } from 'react'

/**
 * Hook personalizado para manejar efectos de autenticación de forma segura
 * Previene bucles infinitos y re-ejecuciones innecesarias
 */
export function useAuthEffect(
  effect: () => void | (() => void),
  deps: any[],
  options: {
    debounceMs?: number
    skipOnMount?: boolean
    runOnce?: boolean
  } = {}
) {
  const { debounceMs = 0, skipOnMount = false, runOnce = false } = options
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hasRunRef = useRef(false)
  const mountedRef = useRef(false)

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      if (skipOnMount) return
    }

    if (runOnce && hasRunRef.current) {
      return
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (debounceMs > 0) {
      timeoutRef.current = setTimeout(() => {
        const cleanup = effect()
        hasRunRef.current = true
        return cleanup
      }, debounceMs)
    } else {
      const cleanup = effect()
      hasRunRef.current = true
      return cleanup
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, deps)
}

/**
 * Hook para manejar fetch requests de forma segura con prevención de bucles
 */
export function useSafeFetch<T>(
  fetcher: () => Promise<T>,
  deps: any[],
  options: {
    retryCount?: number
    retryDelay?: number
    timeout?: number
  } = {}
) {
  const { retryCount = 0, retryDelay = 1000, timeout = 10000 } = options
  const abortControllerRef = useRef<AbortController | null>(null)
  const retryCountRef = useRef(0)

  const safeFetch = useCallback(async () => {
    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Crear nuevo AbortController
    abortControllerRef.current = new AbortController()
    
    try {
      // Timeout
      const timeoutId = setTimeout(() => {
        abortControllerRef.current?.abort()
      }, timeout)

      const result = await fetcher()
      clearTimeout(timeoutId)
      retryCountRef.current = 0 // Reset retry count on success
      return result
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error // Don't retry aborted requests
      }

      // Retry logic
      if (retryCountRef.current < retryCount) {
        retryCountRef.current++
        await new Promise(resolve => setTimeout(resolve, retryDelay))
        return safeFetch()
      }

      throw error
    }
  }, deps)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return safeFetch
}

/**
 * Hook para manejar intersection observers de forma segura
 */
export function useSafeIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {},
  deps: any[] = []
) {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const elementRef = useRef<Element | null>(null)

  const observe = useCallback((element: Element | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    if (!element) return

    observerRef.current = new IntersectionObserver(callback, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    })

    observerRef.current.observe(element)
    elementRef.current = element
  }, [callback, ...deps])

  const disconnect = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return { observe, disconnect }
}