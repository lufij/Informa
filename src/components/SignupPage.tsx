import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { projectId, publicAnonKey } from '../utils/supabase/info'
import { getSupabaseClient } from '../utils/supabase/client'
import { UserPlus, Flame, Sparkles } from 'lucide-react'

interface SignupPageProps {
  onSignupSuccess: (accessToken: string, profile: any) => void
  onSwitchToLogin: () => void
  embedded?: boolean
}

export function SignupPage({ onSignupSuccess, onSwitchToLogin, embedded = false }: SignupPageProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
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

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/auth/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            email,
            password,
            name,
            phone: phoneDigits,
            role: 'user',
            organization: ''
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        if (data.error?.includes('already registered')) {
          setError('Este número de celular ya está registrado')
        } else {
          setError(data.error || 'Error al crear la cuenta')
        }
        setIsLoading(false)
        return
      }

      // Auto-login after successful signup
      const supabase = getSupabaseClient()

      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (loginError || !loginData.session) {
        setError('Cuenta creada, pero hubo un error al iniciar sesión automáticamente')
        setIsLoading(false)
        return
      }

      // Fetch user profile
      const profileResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/auth/profile`,
        {
          headers: {
            'Authorization': `Bearer ${loginData.session.access_token}`
          }
        }
      )

      if (profileResponse.ok) {
        const profile = await profileResponse.json()
        onSignupSuccess(loginData.session.access_token, profile)
      } else {
        setError('Error al obtener perfil de usuario')
        setIsLoading(false)
      }
    } catch (err) {
      console.error('Error durante el registro:', err)
      setError('Error al crear la cuenta')
    } finally {
      setIsLoading(false)
    }
  }

  const formContent = (
    <form onSubmit={handleSignup} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre completo</Label>
        <Input
          id="name"
          type="text"
          placeholder="Juan Pérez"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
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
        />
        <p className="text-xs text-gray-500">
          ⚠️ Tu número será tu contraseña. Guárdalo bien.
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
        <UserPlus className="w-5 h-5 mr-2" />
        {isLoading ? '⏳ Creando cuenta...' : '🎉 ¡Crear Cuenta!'}
      </Button>
    </form>
  )

  if (embedded) {
    return (
      <div className="space-y-4">
        {formContent}
        <div className="text-center text-sm">
          <span className="text-gray-600">¿Ya tienes cuenta? </span>
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-pink-600 hover:underline"
          >
            Inicia sesión aquí
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
            ¡Únete al Chisme!
          </CardTitle>
          <CardDescription className="text-center text-base flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            Crea tu cuenta gratis
            <Sparkles className="w-4 h-4" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formContent}
          <div className="mt-4 text-center text-sm">
            <span className="text-gray-600">¿Ya tienes cuenta? </span>
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-blue-600 hover:underline"
            >
              Inicia sesión
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
