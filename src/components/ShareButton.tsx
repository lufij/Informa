import { useState } from 'react'
import { Button } from './ui/button'
import { Share2, Copy, Check, Facebook, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu'

interface ShareButtonProps {
  postId: string
  postType: 'news' | 'alert' | 'classified' | 'forum'
  title: string
  description?: string
  imageUrl?: string
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showLabel?: boolean
}

export function ShareButton({ 
  postId, 
  postType, 
  title, 
  description = '',
  imageUrl,
  variant = 'ghost',
  size = 'sm',
  showLabel = true
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  
  // Construir URL completa del post
  const baseUrl = window.location.origin
  const postUrl = `${baseUrl}/?${postType}=${postId}`
  
  // Preparar texto para compartir
  const shareTitle = `📰 ${title} - Informa Gualán`
  const shareText = description ? `${title}\n\n${description}` : title
  const shareHashtags = '#InformaGualan #Gualan #Zacapa #Guatemala'
  
  // Compartir usando Web Share API (nativo móvil)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: postUrl,
        })
        toast.success('¡Contenido compartido exitosamente!')
      } catch (error: any) {
        // Usuario canceló o error
        if (error.name !== 'AbortError') {
          console.error('Error al compartir:', error)
          toast.error('Error al compartir')
        }
      }
    } else {
      toast.error('Tu navegador no soporta esta función')
    }
  }
  
  // Compartir en WhatsApp
  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`${shareText}\n\n👉 Ver más: ${postUrl}\n\n${shareHashtags}`)
    const whatsappUrl = `https://wa.me/?text=${text}`
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
    toast.success('Abriendo WhatsApp...')
  }
  
  // Compartir en Facebook
  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`
    window.open(facebookUrl, '_blank', 'noopener,noreferrer,width=600,height=400')
    toast.success('Abriendo Facebook...')
  }
  
  // Compartir en Twitter/X
  const shareToTwitter = () => {
    const text = encodeURIComponent(shareText)
    const url = encodeURIComponent(postUrl)
    const hashtags = encodeURIComponent('InformaGualan,Gualan,Zacapa')
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}&hashtags=${hashtags}`
    window.open(twitterUrl, '_blank', 'noopener,noreferrer,width=600,height=400')
    toast.success('Abriendo X (Twitter)...')
  }
  
  // Copiar enlace al portapapeles
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(postUrl)
      setCopied(true)
      toast.success('¡Enlace copiado al portapapeles!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error al copiar:', error)
      toast.error('Error al copiar el enlace')
    }
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <Share2 className="h-4 w-4" />
          {showLabel && <span>Compartir</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {/* Web Share API nativo (móviles) */}
        {navigator.share && (
          <>
            <DropdownMenuItem onClick={handleNativeShare} className="gap-2">
              <Share2 className="h-4 w-4" />
              Compartir...
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        {/* WhatsApp */}
        <DropdownMenuItem onClick={shareToWhatsApp} className="gap-2">
          <MessageCircle className="h-4 w-4 text-green-600" />
          WhatsApp
        </DropdownMenuItem>
        
        {/* Facebook */}
        <DropdownMenuItem onClick={shareToFacebook} className="gap-2">
          <svg 
            className="h-4 w-4 text-blue-600" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Facebook
        </DropdownMenuItem>
        
        {/* Twitter/X */}
        <DropdownMenuItem onClick={shareToTwitter} className="gap-2">
          <svg 
            className="h-4 w-4" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          X (Twitter)
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Copiar enlace */}
        <DropdownMenuItem onClick={copyToClipboard} className="gap-2">
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-600" />
              ¡Copiado!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copiar enlace
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
