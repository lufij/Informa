import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Camera, AlertCircle } from 'lucide-react'

interface ProfileRequiredDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCompleteProfile: () => void
  missingItems: string[]
}

export function ProfileRequiredDialog({ 
  open, 
  onOpenChange, 
  onCompleteProfile,
  missingItems 
}: ProfileRequiredDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-300">
        <DialogHeader>
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-center text-2xl">
            ⚠️ Completa tu Perfil
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Para publicar en Informa, necesitas completar tu perfil primero
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Missing Items Checklist */}
          <div className="bg-white rounded-lg p-4 border-2 border-pink-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-pink-600" />
              Te falta:
            </h3>
            <ul className="space-y-2">
              {missingItems.map((item, index) => (
                <li key={index} className="flex items-center gap-2 text-gray-700">
                  <span className="text-red-500">✗</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Why it matters */}
          <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg p-4 border border-pink-300">
            <h4 className="font-semibold text-sm text-gray-900 mb-2">
              ¿Por qué es importante?
            </h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span>Tu foto ayuda a la comunidad a conocerte</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span>Genera confianza en tus publicaciones</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span>Hace que Informa sea más personal</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button
            onClick={onCompleteProfile}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-lg py-6"
          >
            <Camera className="w-5 h-5 mr-2" />
            Completar mi Perfil Ahora
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full text-gray-600"
          >
            Después
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
