import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { X, ZoomIn, ZoomOut, Download } from 'lucide-react'
import { useState } from 'react'

interface ImageViewerProps {
  imageUrl: string | null
  onClose: () => void
  altText?: string
}

export function ImageViewer({ imageUrl, onClose, altText = 'Imagen' }: ImageViewerProps) {
  const [zoom, setZoom] = useState(1)

  const handleDownload = () => {
    if (!imageUrl) return
    
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `informa-${Date.now()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.5, 3))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.5, 0.5))
  }

  return (
    <Dialog open={!!imageUrl} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 bg-black/95 border-0 overflow-hidden"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Visor de imagen</DialogTitle>
          <DialogDescription>
            Imagen ampliada para ver en detalle
          </DialogDescription>
        </DialogHeader>
        
        {/* Control buttons */}
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            className="bg-white/10 hover:bg-white/20 text-white rounded-full w-10 h-10 p-0 backdrop-blur-sm"
            title="Alejar"
          >
            <ZoomOut className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            className="bg-white/10 hover:bg-white/20 text-white rounded-full w-10 h-10 p-0 backdrop-blur-sm"
            title="Acercar"
          >
            <ZoomIn className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="bg-white/10 hover:bg-white/20 text-white rounded-full w-10 h-10 p-0 backdrop-blur-sm"
            title="Descargar"
          >
            <Download className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 text-white rounded-full w-10 h-10 p-0 backdrop-blur-sm"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Zoom indicator */}
        <div className="absolute top-4 left-4 z-50 bg-white/10 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm">
          {Math.round(zoom * 100)}%
        </div>

        {/* Image container */}
        <div className="relative w-full h-full flex items-center justify-center p-8 overflow-auto">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={altText}
              className="max-w-full max-h-full object-contain transition-transform duration-300 cursor-zoom-in"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'center center'
              }}
              onClick={handleZoomIn}
            />
          )}
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
          Click en la imagen para acercar • ESC para cerrar
        </div>
      </DialogContent>
    </Dialog>
  )
}
