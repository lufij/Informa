import { useState } from 'react'
import { X } from 'lucide-react'

interface MediaFile {
  url: string
  type: string
  fileName: string
}

interface ImageGridProps {
  images: MediaFile[]
}

export function ImageGrid({ images }: ImageGridProps) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images || images.length === 0) return null

  const openGallery = (index: number) => {
    setCurrentIndex(index)
    setIsGalleryOpen(true)
  }

  const closeGallery = () => {
    setIsGalleryOpen(false)
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  // Solo 1 imagen - mostrar completa
  if (images.length === 1) {
    return (
      <>
        <div 
          className="rounded-xl overflow-hidden cursor-pointer relative group"
          onClick={() => openGallery(0)}
        >
          <img
            src={images[0].url}
            alt="Imagen"
            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        </div>
        {isGalleryOpen && (
          <ImageGalleryModal
            images={images}
            currentIndex={currentIndex}
            onClose={closeGallery}
            onNext={nextImage}
            onPrev={prevImage}
          />
        )}
      </>
    )
  }

  // 2 imágenes - Grid 1x2
  if (images.length === 2) {
    return (
      <>
        <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden cursor-pointer">
          {images.map((image, index) => (
            <div 
              key={index}
              className="relative group aspect-square overflow-hidden"
              onClick={() => openGallery(index)}
            >
              <img
                src={image.url}
                alt={`Imagen ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
          ))}
        </div>
        {isGalleryOpen && (
          <ImageGalleryModal
            images={images}
            currentIndex={currentIndex}
            onClose={closeGallery}
            onNext={nextImage}
            onPrev={prevImage}
          />
        )}
      </>
    )
  }

  // 3 imágenes - 1 grande arriba, 2 abajo
  if (images.length === 3) {
    return (
      <>
        <div className="rounded-xl overflow-hidden cursor-pointer">
          <div 
            className="relative group aspect-video overflow-hidden mb-2"
            onClick={() => openGallery(0)}
          >
            <img
              src={images[0].url}
              alt="Imagen 1"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {images.slice(1, 3).map((image, index) => (
              <div 
                key={index + 1}
                className="relative group aspect-square overflow-hidden"
                onClick={() => openGallery(index + 1)}
              >
                <img
                  src={image.url}
                  alt={`Imagen ${index + 2}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </div>
            ))}
          </div>
        </div>
        {isGalleryOpen && (
          <ImageGalleryModal
            images={images}
            currentIndex={currentIndex}
            onClose={closeGallery}
            onNext={nextImage}
            onPrev={prevImage}
          />
        )}
      </>
    )
  }

  // 4+ imágenes - Grid 2x2 con overlay "+X" en la última
  const displayImages = images.slice(0, 4)
  const remainingCount = images.length - 4

  return (
    <>
      <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden cursor-pointer">
        {displayImages.map((image, index) => (
          <div 
            key={index}
            className="relative group aspect-square overflow-hidden"
            onClick={() => openGallery(index)}
          >
            <img
              src={image.url}
              alt={`Imagen ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            
            {/* Overlay "+X más" en la última imagen si hay más de 4 */}
            {index === 3 && remainingCount > 0 && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-white text-4xl block mb-1">+{remainingCount}</span>
                  <span className="text-white text-sm uppercase tracking-wide">más fotos</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {isGalleryOpen && (
        <ImageGalleryModal
          images={images}
          currentIndex={currentIndex}
          onClose={closeGallery}
          onNext={nextImage}
          onPrev={prevImage}
        />
      )}
    </>
  )
}

// Modal de galería fullscreen
interface ImageGalleryModalProps {
  images: MediaFile[]
  currentIndex: number
  onClose: () => void
  onNext: () => void
  onPrev: () => void
}

function ImageGalleryModal({ images, currentIndex, onClose, onNext, onPrev }: ImageGalleryModalProps) {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowRight') onNext()
    if (e.key === 'ArrowLeft') onPrev()
  }

  // Event listener para teclas
  useState(() => {
    window.addEventListener('keydown', handleKeyDown as any)
    return () => window.removeEventListener('keydown', handleKeyDown as any)
  })

  return (
    <div 
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Botón cerrar */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Contador */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
        {currentIndex + 1} de {images.length}
      </div>

      {/* Botón anterior */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPrev()
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Imagen actual */}
      <div className="max-w-6xl max-h-[90vh] w-full h-full flex items-center justify-center">
        <img
          src={images[currentIndex].url}
          alt={`Imagen ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Botón siguiente */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onNext()
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Thumbnails en la parte inferior (opcional, solo si hay 2+ imágenes) */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4 py-2 bg-black/30 rounded-lg">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation()
                onNext()
              }}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex 
                  ? 'border-white scale-110' 
                  : 'border-white/30 hover:border-white/60 opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={image.url}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
