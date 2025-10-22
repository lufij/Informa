import { useState } from 'react'
import { Button } from './ui/button'
import { toast } from 'sonner'
import { Wrench } from 'lucide-react'
import { projectId, publicAnonKey } from '../utils/supabase/info'

export function FixPhoneButton() {
  const [isFixing, setIsFixing] = useState(false)
  const [isFixed, setIsFixed] = useState(false)

  const handleFix = async () => {
    setIsFixing(true)
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/auth/fix-phone-fields`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        toast.success('✅ Migración Completada', {
          description: `Se actualizaron ${data.fixed} usuarios. Ahora cierra sesión y vuelve a ingresar.`,
          duration: 8000
        })
        setIsFixed(true)
      } else {
        toast.error('Error en la migración')
      }
    } catch (error) {
      console.error('Error fixing phone fields:', error)
      toast.error('Error al ejecutar migración')
    } finally {
      setIsFixing(false)
    }
  }

  if (isFixed) {
    return null
  }

  return (
    <div className="fixed bottom-20 left-4 z-50">
      <Button
        onClick={handleFix}
        disabled={isFixing}
        className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg animate-pulse"
      >
        <Wrench className="w-4 h-4 mr-2" />
        {isFixing ? 'Arreglando...' : '🔧 Arreglar Admin'}
      </Button>
    </div>
  )
}
