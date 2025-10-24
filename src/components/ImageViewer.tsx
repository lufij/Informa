import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react'
import { useState, useRef, useEffect, TouchEvent } from 'react'

interface ImageViewerProps {
  imageUrl: string | null
  onClose: () => void
  altText?: string
}

export function ImageViewer({ imageUrl, onClose, altText = 'Imagen' }: ImageViewerProps) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Pinch to zoom
  const [lastTouchDistance, setLastTouchDistance] = useState(0)

  // Reset on image change
  useEffect(() => {
    setZoom(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }, [imageUrl])

  // Handle browser back button to close image viewer
  useEffect(() => {
    if (!imageUrl) return

    // Add history entry when image opens
    const historyEntry = { imageViewer: true }
    window.history.pushState(historyEntry, '', window.location.href)

    const handlePopState = (event: PopStateEvent) => {
      // If back button pressed while image is open, close it
      if (imageUrl) {
        event.preventDefault()
        onClose()
        // Push the state back to prevent app from closing
        window.history.pushState(historyEntry, '', window.location.href)
      }
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
      // Remove the history entry when component unmounts
      if (window.history.state && window.history.state.imageViewer) {
        window.history.back()
      }
    }
  }, [imageUrl, onClose])

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.5, 5))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.5, 1))
  }

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const handleReset = () => {
    setZoom(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Touch handlers for pinch zoom
  const getTouchDistance = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      setLastTouchDistance(getTouchDistance(e.touches))
    } else if (e.touches.length === 1 && zoom > 1) {
      setIsDragging(true)
      setDragStart({ 
        x: e.touches[0].clientX - position.x, 
        y: e.touches[0].clientY - position.y 
      })
    }
  }

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const currentDistance = getTouchDistance(e.touches)
      if (lastTouchDistance > 0) {
        const delta = currentDistance - lastTouchDistance
        const zoomDelta = delta * 0.01
        setZoom(prev => Math.min(Math.max(prev + zoomDelta, 1), 5))
      }
      setLastTouchDistance(currentDistance)
    } else if (e.touches.length === 1 && isDragging && zoom > 1) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      })
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    setLastTouchDistance(0)
  }

  // Prevent context menu and image saving
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    return false
  }

  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault()
    return false
  }

  return (
    <Dialog open={!!imageUrl} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent 
        className="max-w-[100vw] max-h-[100vh] w-full h-full p-0 bg-black border-0 overflow-hidden"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Visor de imagen</DialogTitle>
          <DialogDescription>
            Imagen ampliada - Usa gestos para hacer zoom
          </DialogDescription>
        </DialogHeader>
        
        {/* Control buttons */}
        <div className="absolute top-2 right-2 z-50 flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoom <= 1}
            className="bg-black/60 hover:bg-black/80 text-white rounded-full w-10 h-10 p-0 backdrop-blur-sm touch-manipulation"
            title="Alejar"
          >
            <ZoomOut className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoom >= 5}
            className="bg-black/60 hover:bg-black/80 text-white rounded-full w-10 h-10 p-0 backdrop-blur-sm touch-manipulation"
            title="Acercar"
          >
            <ZoomIn className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRotate}
            className="bg-black/60 hover:bg-black/80 text-white rounded-full w-10 h-10 p-0 backdrop-blur-sm touch-manipulation"
            title="Rotar"
          >
            <RotateCw className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="bg-black/60 hover:bg-black/80 text-white rounded-full w-10 h-10 p-0 backdrop-blur-sm touch-manipulation"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Zoom indicator */}
        <div className="absolute top-2 left-2 z-50 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
          {Math.round(zoom * 100)}%
        </div>

        {/* Reset button (only show when zoomed or rotated) */}
        {(zoom > 1 || rotation !== 0) && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-50">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="bg-black/60 hover:bg-black/80 text-white px-4 py-2 rounded-full backdrop-blur-sm touch-manipulation"
            >
              Restablecer
            </Button>
          </div>
        )}

        {/* Image container */}
        <div 
          ref={containerRef}
          className="relative w-full h-full flex items-center justify-center overflow-hidden touch-none select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        >
          {imageUrl && (
            <img
              ref={imageRef}
              src={imageUrl}
              alt={altText}
              className="max-w-full max-h-full object-contain transition-transform duration-200 pointer-events-none select-none"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                transformOrigin: 'center center',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
                WebkitTouchCallout: 'none'
              }}
              onContextMenu={handleContextMenu}
              onDragStart={handleDragStart}
              draggable={false}
            />
          )}
        </div>

        {/* Instructions */}
        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs max-w-[200px]">
          {zoom > 1 ? '🖐️ Arrastra para mover' : '🤏 Pellizca para hacer zoom'}
        </div>
      </DialogContent>
    </Dialog>
  )
}
