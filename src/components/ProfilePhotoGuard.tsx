import { AlertCircle } from 'lucide-react'
import { Button } from './ui/button'

interface ProfilePhotoGuardProps {
  userProfile: any
  onOpenSettings: () => void
  children?: React.ReactNode
}

export function ProfilePhotoGuard({ userProfile, onOpenSettings, children }: ProfilePhotoGuardProps) {
  if (!userProfile?.profilePhoto) {
    return (
      <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 rounded-lg p-4 text-center">
        <div className="flex flex-col items-center gap-3">
          <AlertCircle className="w-12 h-12 text-yellow-600" />
          <div>
            <h3 className="text-yellow-900 mb-2">Foto de perfil requerida</h3>
            <p className="text-sm text-yellow-800 mb-3">
              Para publicar contenido y comentar en la comunidad, necesitas configurar tu foto de perfil.
              Esto ayuda a mantener la seguridad y confianza en nuestra comunidad.
            </p>
          </div>
          <Button
            onClick={onOpenSettings}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
          >
            📸 Configurar Foto de Perfil
          </Button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
