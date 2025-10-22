import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Edit, Image, Video, Upload, X, Play, Camera, RefreshCw } from 'lucide-react'
import { projectId } from '../utils/supabase/info'
import { toast } from 'sonner'
import { optimizeMediaFile } from '../utils/imageOptimization'

interface MediaFile {
  url: string
  type: string
  fileName: string
}

interface EditPostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  postType: 'news' | 'classified' | 'event'
  postId: string
  initialTitle?: string
  initialContent: string
  initialMediaFiles?: MediaFile[]
  token: string
  onSuccess: (updatedData: any) => void
}

export function EditPostDialog({
  open,
  onOpenChange,
  postType,
  postId,
  initialTitle = '',
  initialContent,
  initialMediaFiles = [],
  token,
  onSuccess
}: EditPostDialogProps) {
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [existingMedia, setExistingMedia] = useState<MediaFile[]>(initialMediaFiles)
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)

  // Update state when dialog opens with new data
  useEffect(() => {
    if (open) {
      setTitle(initialTitle)
      setContent(initialContent)
      setExistingMedia(initialMediaFiles)
      setNewFiles([])
    }
  }, [open, initialTitle, initialContent, initialMediaFiles])

  // Update state when dialog opens with new data
  useEffect(() => {
    if (open) {
      setTitle(initialTitle)
      setContent(initialContent)
      setExistingMedia(initialMediaFiles)
      setNewFiles([])
    }
  }, [open, initialTitle, initialContent, initialMediaFiles])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Validate file types
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
      return validTypes.includes(file.type)
    })

    if (validFiles.length !== files.length) {
      toast.error('Algunos archivos no son válidos. Solo se permiten imágenes y videos.')
    }

    // Optimize files before adding them
    const optimizedFiles: File[] = []
    for (const file of validFiles) {
      try {
        const optimized = await optimizeMediaFile(file)
        const optimizedFile = new File([optimized], file.name, { type: optimized.type })
        optimizedFiles.push(optimizedFile)
      } catch (error) {
        console.error('Error optimizing file:', error)
        optimizedFiles.push(file)
      }
    }

    setNewFiles(prev => [...prev, ...optimizedFiles])
  }

  const removeNewFile = (index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingMedia = (index: number) => {
    setExistingMedia(prev => prev.filter((_, i) => i !== index))
  }

  const uploadNewFiles = async () => {
    if (newFiles.length === 0) return []

    setIsUploading(true)
    const uploadedFiles: MediaFile[] = []

    try {
      for (const file of newFiles) {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/upload`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          }
        )

        if (response.ok) {
          const data = await response.json()
          uploadedFiles.push(data)
        } else {
          const error = await response.json()
          toast.error(`Error al subir ${file.name}: ${error.error}`)
        }
      }

      return uploadedFiles
    } catch (error) {
      console.error('Error uploading files:', error)
      toast.error('Error al subir archivos')
      return []
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('El contenido no puede estar vacío')
      return
    }

    setIsSubmitting(true)
    try {
      // Upload new files first
      const uploadedNewFiles = await uploadNewFiles()
      
      // Combine existing media with newly uploaded files
      const allMediaFiles = [...existingMedia, ...uploadedNewFiles]

      // Map postType to correct endpoint
      const endpointMap: Record<string, string> = {
        'news': 'news',
        'classified': 'classifieds',
        'event': 'events'
      }
      const endpoint = endpointMap[postType] || postType

      console.log(`Editando ${postType} con ID ${postId}`)
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/${endpoint}/${postId}/edit`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: title || undefined,
            description: content,
            content,
            mediaFiles: allMediaFiles.length > 0 ? allMediaFiles : undefined
          })
        }
      )

      if (response.ok) {
        const updatedPost = await response.json()
        toast.success('✅ Publicación actualizada correctamente')
        onSuccess(updatedPost)
        onOpenChange(false)
        // Reset states
        setNewFiles([])
      } else {
        const error = await response.json()
        console.error('Error del servidor:', error)
        toast.error(error.error || 'Error al actualizar')
      }
    } catch (error) {
      console.error('Error updating post:', error)
      toast.error('Error al actualizar')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-purple-50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-purple-600">
            <Edit className="w-5 h-5" />
            Editar Publicación
          </DialogTitle>
          <DialogDescription>
            Modifica tu publicación. Se marcará como editada.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {initialTitle !== undefined && (
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título de la publicación"
                className="border-2 focus:border-purple-400"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="content">Contenido</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              placeholder="Escribe el contenido..."
              className="resize-none border-2 focus:border-purple-400"
            />
          </div>

          {/* Existing Media Files */}
          {existingMedia.length > 0 && (
            <div className="space-y-2">
              <Label>Archivos actuales</Label>
              <div className="grid grid-cols-2 gap-2">
                {existingMedia.map((media, index) => (
                  <div key={index} className="relative group">
                    {media.type.startsWith('image/') ? (
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={media.url}
                          alt={`Media ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-square bg-purple-100 rounded-lg flex items-center justify-center">
                        <Play className="w-8 h-8 text-purple-600" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeExistingMedia(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Files Preview */}
          {newFiles.length > 0 && (
            <div className="space-y-2">
              <Label>Nuevos archivos a subir</Label>
              <div className="grid grid-cols-2 gap-2">
                {newFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    {file.type.startsWith('image/') ? (
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-square bg-blue-100 rounded-lg flex items-center justify-center">
                        <Play className="w-8 h-8 text-blue-600" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeNewFile(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Media Buttons */}
          <div className="space-y-2">
            <Label>Agregar fotos o videos</Label>
            <div className="grid grid-cols-2 gap-2">
              {/* Camera Photo */}
              <label className="cursor-pointer">
                <div className="flex flex-col items-center gap-2 p-3 border-2 border-pink-200 rounded-lg hover:border-pink-400 hover:bg-pink-50 transition-colors">
                  <Camera className="w-5 h-5 text-pink-600" />
                  <span className="text-xs font-medium text-pink-700">📷 Tomar Foto</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>

              {/* Camera Video */}
              <label className="cursor-pointer">
                <div className="flex flex-col items-center gap-2 p-3 border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors">
                  <Video className="w-5 h-5 text-purple-600" />
                  <span className="text-xs font-medium text-purple-700">🎥 Grabar Video</span>
                </div>
                <input
                  type="file"
                  accept="video/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>

              {/* Gallery Photos */}
              <label className="cursor-pointer">
                <div className="flex flex-col items-center gap-2 p-3 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors">
                  <Image className="w-5 h-5 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700">🖼️ Galería</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>

              {/* Gallery Videos */}
              <label className="cursor-pointer">
                <div className="flex flex-col items-center gap-2 p-3 border-2 border-indigo-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
                  <Upload className="w-5 h-5 text-indigo-600" />
                  <span className="text-xs font-medium text-indigo-700">📹 Videos</span>
                </div>
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting || isUploading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isUploading}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : isUploading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Edit className="w-4 h-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
