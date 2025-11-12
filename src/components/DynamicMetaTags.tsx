import { useEffect } from 'react'

interface DynamicMetaTagsProps {
  title?: string
  description?: string
  imageUrl?: string
  url?: string
  type?: 'news' | 'alert' | 'classified' | 'forum'
}

export function DynamicMetaTags({ title, description, imageUrl, url, type }: DynamicMetaTagsProps) {
  useEffect(() => {
    if (!title && !description && !imageUrl) return

    const defaultTitle = 'Informa - Gualán, Zacapa'
    const defaultDescription = 'Red social comunitaria de Gualán, Zacapa, Guatemala. Noticias verificadas, alertas, clasificados y foros locales.'
    const defaultImage = `${window.location.origin}/icons/og-image.png`
    const currentUrl = url || window.location.href

    const finalTitle = title ? `${title} - Informa Gualán` : defaultTitle
    const finalDescription = description || defaultDescription
    const finalImage = imageUrl || defaultImage

    // Actualizar title
    document.title = finalTitle

    // Actualizar meta tags existentes o crear nuevos
    const updateMetaTag = (property: string, content: string, isProperty = true) => {
      const attribute = isProperty ? 'property' : 'name'
      let element = document.querySelector(`meta[${attribute}="${property}"]`) as HTMLMetaElement
      
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attribute, property)
        document.head.appendChild(element)
      }
      
      element.content = content
    }

    // Open Graph tags
    updateMetaTag('og:title', finalTitle)
    updateMetaTag('og:description', finalDescription)
    updateMetaTag('og:image', finalImage)
    updateMetaTag('og:url', currentUrl)
    updateMetaTag('og:type', 'article')

    // Twitter tags
    updateMetaTag('twitter:title', finalTitle, false)
    updateMetaTag('twitter:description', finalDescription, false)
    updateMetaTag('twitter:image', finalImage, false)
    updateMetaTag('twitter:card', 'summary_large_image', false)

    // Meta description
    updateMetaTag('description', finalDescription, false)

    // WhatsApp specific (uses Open Graph)
    // WhatsApp también respeta og:image, og:title, og:description

    return () => {
      // Restaurar valores por defecto cuando el componente se desmonte
      document.title = defaultTitle
      updateMetaTag('og:title', defaultTitle)
      updateMetaTag('og:description', defaultDescription)
      updateMetaTag('og:image', defaultImage)
      updateMetaTag('twitter:title', defaultTitle, false)
      updateMetaTag('twitter:description', defaultDescription, false)
      updateMetaTag('twitter:image', defaultImage, false)
      updateMetaTag('description', defaultDescription, false)
    }
  }, [title, description, imageUrl, url, type])

  return null // Este componente no renderiza nada
}
