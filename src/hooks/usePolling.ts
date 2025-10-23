import { useEffect, useRef, useCallback } from 'react'

interface UsePollingOptions {
  interval: number
  immediate?: boolean
  condition?: () => boolean
}

/**
 * Hook para manejar polling de forma segura con cleanup automático
 */
export function usePolling(
  callback: () => void | Promise<void>,
  options: UsePollingOptions
) {
  const { interval, immediate = false, condition } = options
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const callbackRef = useRef(callback)
  const mountedRef = useRef(true)

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    const poll = async () => {
      if (!mountedRef.current) return
      
      if (condition && !condition()) {
        return
      }

      try {
        await callbackRef.current()
      } catch (error) {
        console.error('Polling error:', error)
      }
    }

    if (immediate) {
      poll()
    }

    intervalRef.current = setInterval(poll, interval)
  }, [interval, immediate, condition])

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    startPolling()

    return () => {
      mountedRef.current = false
      stopPolling()
    }
  }, [startPolling, stopPolling])

  return { startPolling, stopPolling }
}

/**
 * Hook optimizado para polling de notificaciones
 */
export function useNotificationPolling(
  fetchNotifications: () => Promise<void>,
  isAuthenticated: boolean,
  token: string | null
) {
  const condition = useCallback(() => {
    return isAuthenticated && !!token && navigator.onLine
  }, [isAuthenticated, token])

  return usePolling(fetchNotifications, {
    interval: 30000, // 30 segundos
    immediate: true,
    condition
  })
}