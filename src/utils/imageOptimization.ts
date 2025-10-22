// Utilidades para optimización de imágenes

export const compressImage = async (file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = (e) => {
      img.src = e.target?.result as string
    }

    img.onload = () => {
      const canvas = document.createElement('canvas')
      let width = img.width
      let height = img.height

      // Calcular nuevas dimensiones manteniendo proporción
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('No se pudo crear el contexto del canvas'))
        return
      }

      // Dibujar la imagen redimensionada
      ctx.drawImage(img, 0, 0, width, height)

      // Convertir a blob con compresión
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('No se pudo comprimir la imagen'))
          }
        },
        'image/jpeg',
        quality
      )
    }

    img.onerror = () => {
      reject(new Error('Error al cargar la imagen'))
    }

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'))
    }

    reader.readAsDataURL(file)
  })
}

export const compressVideo = async (file: File): Promise<File> => {
  // Para videos, solo validamos tamaño (compresión real requiere ffmpeg)
  const maxSize = 50 * 1024 * 1024 // 50MB
  
  if (file.size > maxSize) {
    throw new Error('El video es muy grande. Máximo 50MB.')
  }
  
  return file
}

export const optimizeMediaFile = async (file: File): Promise<Blob | File> => {
  if (file.type.startsWith('image/')) {
    // Comprimir imágenes
    return await compressImage(file, 1920, 0.85)
  } else if (file.type.startsWith('video/')) {
    // Validar videos
    return await compressVideo(file)
  }
  
  return file
}

// Lazy loading de imágenes
export const setupLazyLoading = () => {
  const images = document.querySelectorAll('img[data-src]')
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        const src = img.getAttribute('data-src')
        
        if (src) {
          img.src = src
          img.removeAttribute('data-src')
          observer.unobserve(img)
        }
      }
    })
  }, {
    rootMargin: '50px' // Cargar imágenes 50px antes de que sean visibles
  })
  
  images.forEach(img => imageObserver.observe(img))
  
  return imageObserver
}
