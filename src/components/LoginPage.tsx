import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { getSupabaseClient } from '../utils/supabase/client'
import { projectId, publicAnonKey } from '../utils/supabase/info'
import { LogIn, Flame, Sparkles } from 'lucide-react'

interface LoginPageProps {
  onLoginSuccess: (token: string, user: any) => void
  onSwitchToSignup: () => void
  embedded?: boolean
}

export function LoginPage({ onLoginSuccess, onSwitchToSignup, embedded = false }: LoginPageProps) {
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Create email from phone: phone@informa.local
      const phoneDigits = phone.replace(/\D/g, '')
      if (phoneDigits.length < 8) {
        setError('Por favor ingresa un número de celular válido')
        setIsLoading(false)
        return
      }

      const email = `${phoneDigits}@informa.local`
      const password = phoneDigits // Use phone as password

      const supabase = getSupabaseClient()

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError('Número de celular incorrecto o no registrado')
        setIsLoading(false)
        return
      }

      if (data.session) {
        // Fetch user profile
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/auth/profile`,
          {
            headers: {
              'Authorization': `Bearer ${data.session.access_token}`
            }
          }
        )

        if (response.ok) {
          const profile = await response.json()
          console.log('🔑 LoginPage - Perfil obtenido:', profile)
          console.log('📱 LoginPage - Teléfono:', profile.phone)
          console.log('👤 LoginPage - Rol:', profile.role)
          onLoginSuccess(data.session.access_token, profile)
        } else {
          console.error('❌ LoginPage - Error al obtener perfil:', response.status)
          setError('Error al obtener perfil de usuario')
        }
      }
    } catch (err) {
      console.error('Error durante el inicio de sesión:', err)
      setError('Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  const formContent = (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone">Número de celular</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="5555-1234"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          pattern="[0-9-]+"
          className="text-lg h-12"
        />
        <p className="text-xs text-gray-500">
          Ingresa el número que usaste al registrarte
        </p>
      </div>
      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}
      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-lg py-6" 
        disabled={isLoading}
      >
        <LogIn className="w-5 h-5 mr-2" />
        {isLoading ? '⏳ Entrando...' : '🚀 Entrar Ahora'}
      </Button>
    </form>
  )

  if (embedded) {
    return (
      <div className="space-y-4">
        {formContent}
        <div className="text-center text-sm">
          <span className="text-gray-600">¿No tienes cuenta? </span>
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-pink-600 hover:underline"
          >
            Regístrate aquí
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 bg-gradient-to-br from-pink-50 to-purple-50">
          <div className="flex items-center justify-center mb-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <Flame className="w-10 h-10 text-orange-500" />
            </div>
          </div>
          <CardTitle className="text-center text-3xl bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Informa
          </CardTitle>
          <CardDescription className="text-center text-base flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            ¡Entérate de todo lo que pasa!
            <Sparkles className="w-4 h-4" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formContent}
          <div className="mt-4 text-center text-sm">
            <span className="text-gray-600">¿No tienes cuenta? </span>
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="text-blue-600 hover:underline"
            >
              Regístrate
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
