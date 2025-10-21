import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Edit } from 'lucide-react'
import { projectId } from '../utils/supabase/info'
import { toast } from 'sonner@2.0.3'

interface EditPostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  postType: 'news' | 'classified' | 'event'
  postId: string
  initialTitle?: string
  initialContent: string
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
  token,
  onSuccess
}: EditPostDialogProps) {
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('El contenido no puede estar vacío')
      return
    }

    setIsSubmitting(true)
    try {
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
            content
          })
        }
      )

      if (response.ok) {
        const updatedPost = await response.json()
        toast.success('Publicación actualizada')
        onSuccess(updatedPost)
        onOpenChange(false)
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
      <DialogContent className="max-w-md bg-gradient-to-br from-white to-purple-50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-purple-600" />
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
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
