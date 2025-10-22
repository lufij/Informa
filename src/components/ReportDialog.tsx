import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { AlertTriangle } from 'lucide-react'
import { projectId } from '../utils/supabase/info'
import { toast } from 'sonner'

interface ReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contentType: 'news' | 'alert' | 'classified' | 'forum' | 'comment' | 'user'
  contentId: string
  token: string
}

export function ReportDialog({ open, onOpenChange, contentType, contentId, token }: ReportDialogProps) {
  const [reason, setReason] = useState<string>('spam')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const reasons = [
    { value: 'spam', label: 'Spam o publicidad no deseada' },
    { value: 'harassment', label: 'Acoso o intimidación' },
    { value: 'inappropriate', label: 'Contenido inapropiado' },
    { value: 'fake-news', label: 'Información falsa' },
    { value: 'other', label: 'Otro motivo' }
  ]

  const handleSubmit = async () => {
    if (!description.trim() && reason === 'other') {
      toast.error('Por favor describe el motivo del reporte')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/reports`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            contentType,
            contentId,
            reason,
            description
          })
        }
      )

      if (response.ok) {
        toast.success('Reporte enviado. Gracias por ayudarnos a mantener la comunidad segura.')
        onOpenChange(false)
        setReason('spam')
        setDescription('')
      } else {
        toast.error('Error al enviar el reporte')
      }
    } catch (error) {
      console.error('Error reporting content:', error)
      toast.error('Error al enviar el reporte')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-gradient-to-br from-white to-red-50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            Reportar contenido
          </DialogTitle>
          <DialogDescription>
            Ayúdanos a mantener la comunidad segura. Tu reporte será revisado por los administradores.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            <Label>¿Por qué reportas este contenido?</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {reasons.map((r) => (
                <div key={r.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={r.value} id={r.value} />
                  <Label htmlFor={r.value} className="font-normal cursor-pointer">
                    {r.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Descripción {reason === 'other' ? '(requerido)' : '(opcional)'}
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Proporciona más detalles sobre tu reporte..."
              rows={4}
              className="resize-none border-2 focus:border-red-400"
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
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Reporte'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
