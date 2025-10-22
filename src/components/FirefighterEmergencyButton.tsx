import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Mic, MicOff, AlertTriangle, Loader2, CheckCircle2, Camera } from 'lucide-react'
import { projectId } from '../utils/supabase/info'
import { toast } from 'sonner'

interface FirefighterEmergencyButtonProps {
  token: string
  userProfile: any
  onEmergencyPublished?: () => void
}

export function FirefighterEmergencyButton({ token, userProfile, onEmergencyPublished }: FirefighterEmergencyButtonProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const recognitionRef = useRef<any>(null)
  const [mediaFiles, setMediaFiles] = useState<File[]>()
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([])

  // Check if user is a firefighter
  if (userProfile?.role !== 'firefighter' && userProfile?.role !== 'admin') {
    return null
  }

  useEffect(() => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'es-GT' // Spanish (Guatemala)

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPiece + ' '
          } else {
            interimTranscript += transcriptPiece
          }
        }

        setTranscript(prev => {
          const newText = prev + finalTranscript
          return newText
        })
      }

      recognitionRef.current.onerror = (event: any) => {
        // Only log unexpected errors (not permission or no-speech issues)
        if (event.error !== 'no-speech' && event.error !== 'not-allowed' && event.error !== 'aborted') {
          console.error('Speech recognition error:', event.error)
        }
        
        if (event.error === 'no-speech') {
          toast.error('No se detectó voz. Intenta de nuevo.')
        } else if (event.error === 'not-allowed') {
          toast.error('Permiso de micrófono denegado. Por favor, habilita el micrófono en tu navegador.', {
            description: 'Busca el ícono del micrófono 🎤 en la barra de direcciones de tu navegador y permite el acceso.'
          })
        }
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const startListening = () => {
    if (!recognitionRef.current) {
      toast.error('Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.')
      return
    }

    // Don't start if already listening
    if (isListening) {
      return
    }

    try {
      recognitionRef.current.start()
      setIsListening(true)
      toast.info('🎤 Escuchando... Narra la emergencia')
    } catch (error) {
      // Only log if it's not an "already started" error
      if (error instanceof Error && !error.message.includes('already started')) {
        console.error('Error starting recognition:', error)
        toast.error('Error al iniciar el micrófono')
      }
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop()
      } catch (error) {
        // Ignore errors when stopping
      }
      setIsListening(false)
    }
  }

  const handlePublish = async () => {
    if (!transcript.trim()) {
      toast.error('Por favor, narra la emergencia primero')
      return
    }

    setIsPublishing(true)

    try {
      // Upload media files if any
      let mediaUrls: string[] = []
      if (mediaFiles && mediaFiles.length > 0) {
        const formData = new FormData()
        mediaFiles.forEach(file => {
          formData.append('files', file)
        })

        const uploadResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/upload`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          }
        )

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          mediaUrls = uploadData.urls || []
        }
      }

      // Create emergency alert
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/alerts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: '🚨 EMERGENCIA - BOMBEROS',
            description: transcript.trim(),
            category: 'emergencia',
            priority: 'critica',
            isOfficial: true,
            isEmergency: true,
            mediaUrls
          })
        }
      )

      if (!response.ok) {
        throw new Error('Error al publicar la emergencia')
      }

      setIsSuccess(true)
      toast.success('🚨 ¡Emergencia publicada! La comunidad ha sido alertada.')
      
      setTimeout(() => {
        setShowDialog(false)
        setTranscript('')
        setMediaFiles([])
        setMediaPreviews([])
        setIsSuccess(false)
        if (onEmergencyPublished) {
          onEmergencyPublished()
        }
      }, 2000)
    } catch (error) {
      console.error('Error publishing emergency:', error)
      toast.error('Error al publicar la emergencia')
    } finally {
      setIsPublishing(false)
    }
  }

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setMediaFiles(files)
    
    // Create previews
    const previews = files.map(file => URL.createObjectURL(file))
    setMediaPreviews(previews)
  }

  const handleClose = () => {
    if (isListening) {
      stopListening()
    }
    setShowDialog(false)
    setTranscript('')
    setMediaFiles([])
    setMediaPreviews([])
    setIsSuccess(false)
  }

  return (
    <>
      {/* Floating Emergency Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowDialog(true)}
        className="fixed bottom-6 right-6 z-50 w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 rounded-full shadow-2xl flex items-center justify-center border-4 border-white"
        style={{
          boxShadow: '0 0 40px rgba(220, 38, 38, 0.6), 0 0 80px rgba(220, 38, 38, 0.4), 0 10px 30px rgba(0, 0, 0, 0.3)'
        }}
        title="🚒 Alerta de Emergencia - Bomberos"
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <AlertTriangle className="w-10 h-10 text-white drop-shadow-lg" />
        </motion.div>
        
        {/* Pulse rings */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-red-500"
          animate={{
            scale: [1, 1.8, 1],
            opacity: [0.7, 0, 0.7]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-orange-500"
          animate={{
            scale: [1, 1.8, 1],
            opacity: [0.7, 0, 0.7]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
            delay: 0.5
          }}
        />
      </motion.button>

      {/* Emergency Dialog */}
      <Dialog open={showDialog} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg bg-gradient-to-br from-red-50 to-orange-50 border-4 border-red-500">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
              >
                🚨
              </motion.div>
              Alerta de Emergencia
              <Badge className="bg-red-600 text-white">
                🚒 Bomberos
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Sistema de alertas de emergencia por voz para Bomberos Voluntarios de Gualán
            </DialogDescription>
          </DialogHeader>

          {/* Instructions */}
          <div className="bg-white/80 rounded-lg p-4 -mt-2">
            <p className="text-sm font-medium mb-2">Presiona el botón del micrófono y narra la emergencia. El sistema convertirá tu voz en texto automáticamente.</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-gray-700 font-medium mb-1">📝 Consejos:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Habla claro y describe la emergencia con detalles</li>
                <li>• Menciona la ubicación exacta</li>
                <li>• Puedes editar el texto después de grabar</li>
                <li>• Agrega fotos después de publicar si es necesario</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            {/* Microphone Button */}
            <div className="flex flex-col items-center gap-3">
              <Button
                type="button"
                size="lg"
                onClick={isListening ? stopListening : startListening}
                disabled={isPublishing || isSuccess}
                className={`w-full h-16 text-lg transition-all ${
                  isListening 
                    ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 animate-pulse' 
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-6 h-6 mr-2" />
                    Detener Grabación
                  </>
                ) : (
                  <>
                    <Mic className="w-6 h-6 mr-2" />
                    Iniciar Grabación
                  </>
                )}
              </Button>

              {isListening && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-red-600"
                >
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-3 h-3 bg-red-600 rounded-full"
                  />
                  <span>Escuchando...</span>
                </motion.div>
              )}
            </div>

            {/* Transcript */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción de la emergencia</label>
              <Textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="La narración aparecerá aquí automáticamente... O escribe manualmente si lo prefieres."
                rows={6}
                disabled={isPublishing || isSuccess}
                className="border-2 border-red-300 focus:border-red-500 bg-white"
              />
            </div>

            {/* Media Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Agregar fotos/videos (opcional)
              </label>
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleMediaSelect}
                disabled={isPublishing || isSuccess}
                className="w-full text-sm"
              />
              {mediaPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {mediaPreviews.map((preview, index) => (
                    <img
                      key={index}
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg border-2 border-red-300"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Publish Button */}
            <Button
              onClick={handlePublish}
              disabled={!transcript.trim() || isPublishing || isSuccess}
              className="w-full h-14 text-lg bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-lg"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Publicando Emergencia...
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  ¡Emergencia Publicada!
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Publicar Emergencia
                </>
              )}
            </Button>

            {/* Info */}
            <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-3 text-sm">
              <p className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-yellow-800">
                  Toda la comunidad recibirá una notificación inmediata de esta emergencia.
                </span>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
