// Service para manejar Push Notifications
import { projectId } from './supabase/info'

const VAPID_PUBLIC_KEY = 'BKSuCU38UwbReXe4F_CNB2EiJJYgHxdcG6SWfmUxPRD3nE_DxjPbWuCetgT8J9qAyh00rzTYr3mHfcbuP0l6WBE'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('Notificaciones no soportadas')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

export async function subscribeToPushNotifications(token: string) {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notifications no soportadas')
      return null
    }

    const registration = await navigator.serviceWorker.ready
    
    // Verificar si ya está suscrito
    let subscription = await registration.pushManager.getSubscription()
    
    if (!subscription) {
      // Crear nueva suscripción
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      })
    }

    // Enviar suscripción al servidor
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/notifications/subscribe`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(subscription)
      }
    )

    if (response.ok) {
      console.log('✅ Suscrito a push notifications')
      return subscription
    } else {
      console.error('Error al guardar suscripción')
      return null
    }
  } catch (error) {
    console.error('Error en subscribeToPushNotifications:', error)
    return null
  }
}

export async function unsubscribeFromPushNotifications(token: string) {
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    
    if (subscription) {
      await subscription.unsubscribe()
      
      // Notificar al servidor
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/notifications/unsubscribe`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(subscription)
        }
      )
      
      console.log('❌ Desuscrito de push notifications')
    }
  } catch (error) {
    console.error('Error al desuscribir:', error)
  }
}
