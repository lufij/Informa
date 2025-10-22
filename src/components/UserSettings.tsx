import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Button } from './ui/button'
import { Camera, User, CheckCircle, X, RefreshCw, AlertTriangle, Upload, MapPin, Heart, Sparkles, Save, Users, MessageSquare, Flame, Zap, Star, Award, Crown, Trophy, TrendingUp, Calendar, Shield, ZoomIn, ZoomOut, RotateCcw, Move } from 'lucide-react'
import { toast } from 'sonner'
import { projectId, publicAnonKey } from '../utils/supabase/info'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader } from './ui/card'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { Slider } from './ui/slider'

interface UserSettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  token: string
  userProfile: any
  onProfileUpdate: (profile: any) => void
}

export function UserSettings({ open, onOpenChange, token, userProfile, onProfileUpdate }: UserSettingsProps) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [useFileUpload, setUseFileUpload] = useState(false)
  const [activeTab, setActiveTab] = useState('view')
  
  // Profile info states
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [interests, setInterests] = useState('')
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  
  // Profile stats
  const [stats, setStats] = useState<any>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [isChangingRole, setIsChangingRole] = useState(false)
  
  // Photo editor states
  const [photoScale, setPhotoScale] = useState(1)
  const [photoPosition, setPhotoPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Cleanup stream when component unmounts or dialog closes
    if (!open && stream) {
      stopCamera()
    }
    // Reset states when dialog opens
    if (open) {
      setCameraError(null)
      setUseFileUpload(false)
      setActiveTab('view')
      // Load existing profile info
      setBio(userProfile?.bio || '')
      setLocation(userProfile?.location || '')
      setInterests(userProfile?.interests || '')
      // Load profile stats
      loadProfileStats()
    }
  }, [open, userProfile])

  const loadProfileStats = async () => {
    if (!userProfile?.id) return
    
    setIsLoadingStats(true)
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/users/${userProfile.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error loading profile stats:', error)
    } finally {
      setIsLoadingStats(false)
    }
  }

  const startCamera = async () => {
    setCameraError(null)
    setUseFileUpload(false)
    
    try {
      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('UNSUPPORTED')
      }

      // Request camera permissions with better error handling
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user', // Front camera for selfies
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      })
      
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play()
      }
      setIsCapturing(true)
      setCameraError(null)
      
    } catch (error: any) {
      console.error('Error al acceder a la cámara:', error)
      
      let errorMessage = 'UNKNOWN'
      let toastMessage = 'No se pudo acceder a la cámara'
      let toastDescription = 'Intenta usar la opción de subir desde archivos'
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = 'PERMISSION_DENIED'
        toastMessage = '🔒 Permiso de cámara denegado'
        toastDescription = 'Habilita el permiso de cámara en tu navegador y presiona "Reintentar"'
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = 'NO_CAMERA'
        toastMessage = '📷 No se encontró ninguna cámara'
        toastDescription = 'Usa la opción de subir foto desde tus archivos'
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = 'CAMERA_IN_USE'
        toastMessage = '⚠️ Cámara en uso'
        toastDescription = 'Cierra otras aplicaciones que usen la cámara e intenta de nuevo'
      } else if (error.message === 'UNSUPPORTED') {
        errorMessage = 'UNSUPPORTED'
        toastMessage = '❌ Navegador no compatible'
        toastDescription = 'Tu navegador no soporta acceso a cámara. Sube una foto desde archivos.'
      }
      
      setCameraError(errorMessage)
      
      toast.error(toastMessage, {
        description: toastDescription,
        duration: 6000
      })
      
      // Automatically switch to file upload option
      setUseFileUpload(true)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsCapturing(false)
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // Draw the video frame to the canvas
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          setCapturedPhoto(url)
          // Reset photo editor states
          setPhotoScale(1)
          setPhotoPosition({ x: 0, y: 0 })
          stopCamera()
        }
      }, 'image/jpeg', 0.9)
    }
  }

  const retakePhoto = () => {
    if (capturedPhoto) {
      URL.revokeObjectURL(capturedPhoto)
      setCapturedPhoto(null)
    }
    setPhotoScale(1)
    setPhotoPosition({ x: 0, y: 0 })
    startCamera()
  }

  // Photo editor functions
  const handlePhotoMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - photoPosition.x,
      y: e.clientY - photoPosition.y
    })
  }

  const handlePhotoTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setIsDragging(true)
    setDragStart({
      x: touch.clientX - photoPosition.x,
      y: touch.clientY - photoPosition.y
    })
  }

  const handlePhotoMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPhotoPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  const handlePhotoTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    e.preventDefault() // Prevent scrolling while dragging
    const touch = e.touches[0]
    setPhotoPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    })
  }

  const handlePhotoMouseUp = () => {
    setIsDragging(false)
  }

  const handlePhotoTouchEnd = () => {
    setIsDragging(false)
  }

  const resetPhotoEditor = () => {
    setPhotoScale(1)
    setPhotoPosition({ x: 0, y: 0 })
  }

  const uploadPhoto = async () => {
    if (!capturedPhoto || !canvasRef.current) return

    setIsUploading(true)
    try {
      // Create a new canvas for the cropped/zoomed image
      const cropCanvas = document.createElement('canvas')
      const cropSize = 400 // Final profile photo size
      cropCanvas.width = cropSize
      cropCanvas.height = cropSize
      const cropCtx = cropCanvas.getContext('2d')
      
      if (!cropCtx) {
        throw new Error('No se pudo crear el canvas')
      }

      // Load the captured photo
      const img = new Image()
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = capturedPhoto
      })

      // Calculate scale ratio between preview (280px) and image dimensions
      const previewSize = 280
      const imgDisplayWidth = previewSize
      const scaleRatio = img.width / imgDisplayWidth

      // Calculate the source dimensions based on zoom and position
      const viewportSize = cropSize / photoScale // Size of viewport at current zoom
      const sourceX = (img.width / 2) - (viewportSize * scaleRatio / 2) - (photoPosition.x * scaleRatio)
      const sourceY = (img.height / 2) - (viewportSize * scaleRatio / 2) - (photoPosition.y * scaleRatio)
      const sourceSize = viewportSize * scaleRatio

      // Draw the cropped and zoomed portion
      cropCtx.drawImage(
        img,
        sourceX, sourceY, sourceSize, sourceSize, // Source rectangle
        0, 0, cropSize, cropSize // Destination rectangle
      )

      // Convert cropped canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        cropCanvas.toBlob((blob) => {
          resolve(blob!)
        }, 'image/jpeg', 0.92)
      })

      // Create form data
      const formData = new FormData()
      formData.append('file', blob, 'profile-photo.jpg')
      formData.append('isProfilePhoto', 'true')

      // Upload to server
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

      if (!uploadResponse.ok) {
        throw new Error('Error al subir la foto')
      }

      const uploadData = await uploadResponse.json()

      // Update user profile with photo
      const updateResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/auth/update-profile`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            profilePhoto: uploadData.url
          })
        }
      )

      if (!updateResponse.ok) {
        throw new Error('Error al actualizar el perfil')
      }

      const updatedProfile = await updateResponse.json()
      onProfileUpdate(updatedProfile)
      
      toast.success('📸 ¡Foto de perfil actualizada!', {
        description: 'Tu nueva foto se ve increíble 🌟',
        duration: 4000
      })
      
      // Cleanup
      URL.revokeObjectURL(capturedPhoto)
      setCapturedPhoto(null)
      setPhotoScale(1)
      setPhotoPosition({ x: 0, y: 0 })
      onOpenChange(false)
    } catch (error) {
      console.error('Error al subir la foto:', error)
      toast.error('Error al actualizar la foto de perfil')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen válida')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen es muy grande. Máximo 5MB')
      return
    }

    // Read file and create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        // Draw image to canvas
        if (canvasRef.current) {
          const canvas = canvasRef.current
          const ctx = canvas.getContext('2d')
          
          // Calculate dimensions to maintain aspect ratio
          const maxSize = 1280
          let width = img.width
          let height = img.height
          
          if (width > height && width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          } else if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
          
          canvas.width = width
          canvas.height = height
          
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height)
            
            // Convert to blob and create preview
            canvas.toBlob((blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob)
                setCapturedPhoto(url)
                // Reset photo editor states
                setPhotoScale(1)
                setPhotoPosition({ x: 0, y: 0 })
              }
            }, 'image/jpeg', 0.9)
          }
        }
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = async () => {
    setIsSavingProfile(true)
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/auth/update-profile`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            bio: bio.trim(),
            location: location.trim(),
            interests: interests.trim()
          })
        }
      )

      if (!response.ok) {
        throw new Error('Error al actualizar el perfil')
      }

      const updatedProfile = await response.json()
      onProfileUpdate(updatedProfile)
      
      toast.success('¡Perfil actualizado con éxito! 🎉')
      loadProfileStats() // Refresh stats
      setActiveTab('view')
    } catch (error) {
      console.error('Error al actualizar perfil:', error)
      toast.error('Error al actualizar el perfil')
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleChangeToFirefighter = async () => {
    if (!confirm('🚒 ¿Deseas activar el perfil de Bombero Voluntario?\n\nTendrás acceso a:\n• Botón de emergencia flotante\n• Publicación por voz\n• Alertas destacadas\n• Edición de emergencias\n\n¿Continuar?')) {
      return
    }

    setIsChangingRole(true)
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3467f1c6/auth/update-profile`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            role: 'firefighter'
          })
        }
      )

      if (!response.ok) {
        throw new Error('Error al cambiar el rol')
      }

      const updatedProfile = await response.json()
      onProfileUpdate(updatedProfile)
      
      toast.success('🚒 ¡Perfil de Bombero Voluntario activado exitosamente!')
      
      // Show instructions
      setTimeout(() => {
        toast.info('Mira en la esquina inferior derecha 👉 Verás un botón rojo flotante para emergencias', {
          duration: 5000
        })
      }, 1000)
      
      // Pequeño delay para que el usuario vea el toast antes de cerrar
      setTimeout(() => {
        handleClose()
      }, 2000)
    } catch (error) {
      console.error('Error changing role:', error)
      toast.error('Error al cambiar el rol. Por favor intenta de nuevo.')
    } finally {
      setIsChangingRole(false)
    }
  }

  const handleClose = () => {
    stopCamera()
    if (capturedPhoto) {
      URL.revokeObjectURL(capturedPhoto)
      setCapturedPhoto(null)
    }
    setCameraError(null)
    setUseFileUpload(false)
    setActiveTab('view')
    onOpenChange(false)
  }

  const getUserLevelInfo = (level: string) => {
    const levels: Record<string, { icon: any; label: string; color: string; bgColor: string; gradient: string }> = {
      'nuevo': { 
        icon: Sparkles, 
        label: 'Miembro Nuevo', 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-100',
        gradient: 'from-blue-400 to-cyan-500'
      },
      'activo': { 
        icon: Zap, 
        label: 'Miembro Activo', 
        color: 'text-green-600', 
        bgColor: 'bg-green-100',
        gradient: 'from-green-400 to-emerald-500'
      },
      'veterano': { 
        icon: Star, 
        label: 'Veterano', 
        color: 'text-purple-600', 
        bgColor: 'bg-purple-100',
        gradient: 'from-purple-400 to-pink-500'
      },
      'leyenda': { 
        icon: Crown, 
        label: 'Leyenda Local', 
        color: 'text-yellow-600', 
        bgColor: 'bg-yellow-100',
        gradient: 'from-yellow-400 to-orange-500'
      },
    }
    return levels[level] || levels['nuevo']
  }

  const getBadgeInfo = (badge: string) => {
    const badges: Record<string, { icon: any; label: string; color: string; bgGradient: string }> = {
      'verified': { 
        icon: Award, 
        label: 'Verificado', 
        color: 'text-blue-500',
        bgGradient: 'from-blue-100 to-blue-200'
      },
      'founder': { 
        icon: Crown, 
        label: 'Miembro Fundador', 
        color: 'text-purple-500',
        bgGradient: 'from-purple-100 to-purple-200'
      },
      'top_contributor': { 
        icon: Trophy, 
        label: 'Top Contribuidor', 
        color: 'text-yellow-500',
        bgGradient: 'from-yellow-100 to-yellow-200'
      },
      'helpful': { 
        icon: Heart, 
        label: 'Usuario Servicial', 
        color: 'text-pink-500',
        bgGradient: 'from-pink-100 to-pink-200'
      },
    }
    return badges[badge] || { icon: Star, label: badge, color: 'text-gray-500', bgGradient: 'from-gray-100 to-gray-200' }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50 mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-pink-500" />
            Mi Perfil
          </DialogTitle>
          <DialogDescription className="text-center text-sm">
            Gestiona y personaliza tu perfil de Informa
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-6 bg-white/80 backdrop-blur-sm shadow-md">
            <TabsTrigger value="view" className="flex items-center justify-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <User className="w-4 h-4" />
              Mi Perfil
            </TabsTrigger>
            <TabsTrigger value="photo" className="flex items-center justify-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              <Camera className="w-4 h-4" />
              Foto
            </TabsTrigger>
            <TabsTrigger value="info" className="flex items-center justify-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-orange-500 data-[state=active]:text-white">
              <Sparkles className="w-4 h-4" />
              Información
            </TabsTrigger>
          </TabsList>

          {/* Profile View Tab */}
          <TabsContent value="view" className="space-y-4">
            {isLoadingStats ? (
              <Card className="bg-white/60 backdrop-blur-sm border-2 border-purple-200 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Profile Header Card */}
                <Card className="bg-white/60 backdrop-blur-sm border-2 border-purple-200 shadow-lg overflow-hidden">
                  <div className={`h-24 bg-gradient-to-r ${stats?.userLevel ? getUserLevelInfo(stats.userLevel).gradient : 'from-purple-400 to-pink-500'}`} />
                  <CardContent className="relative px-6 pb-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12">
                      <div 
                        onClick={() => setActiveTab('photo')}
                        className="relative group cursor-pointer transition-all hover:scale-105"
                        title="Click para cambiar foto de perfil"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            setActiveTab('photo')
                          }
                        }}
                      >
                        <Avatar className="w-24 h-24 border-4 border-white shadow-xl ring-4 ring-pink-200 group-hover:ring-pink-400 transition-all">
                          <AvatarImage src={userProfile.profilePhoto} />
                          <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white">
                            <User className="w-12 h-12" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      
                      <div className="flex-1 text-center sm:text-left mt-2">
                        <h2 className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                          {userProfile.name}
                          {stats?.badges?.includes('verified') && (
                            <Award className="w-5 h-5 text-blue-500" />
                          )}
                        </h2>
                        {userProfile.organization && (
                          <p className="text-sm text-gray-600 mb-2">{userProfile.organization}</p>
                        )}
                        <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                          {stats?.userLevel && (() => {
                            const levelInfo = getUserLevelInfo(stats.userLevel)
                            const LevelIcon = levelInfo.icon
                            return (
                              <Badge className={`${levelInfo.bgColor} ${levelInfo.color} border-0`}>
                                <LevelIcon className="w-3 h-3 mr-1" />
                                {levelInfo.label}
                              </Badge>
                            )
                          })()}
                          {userProfile.role === 'admin' && (
                            <Badge className="bg-gradient-to-r from-red-500 to-pink-600 text-white border-0">
                              👑 Administrador
                            </Badge>
                          )}
                          {userProfile.role === 'firefighter' && (
                            <Badge className="bg-gradient-to-r from-red-600 to-orange-600 text-white border-0">
                              🚒 Bombero Voluntario
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    {userProfile.bio && (
                      <div className="mt-4 bg-gradient-to-br from-yellow-50 to-pink-50 rounded-lg p-4 border-2 border-pink-200">
                        <p className="text-sm text-gray-700 text-center sm:text-left">{userProfile.bio}</p>
                      </div>
                    )}

                    {/* Location and Interests */}
                    {(userProfile.location || userProfile.interests) && (
                      <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                        {userProfile.location && (
                          <div className="flex items-center gap-1 bg-pink-100 px-3 py-1.5 rounded-full border border-pink-300">
                            <MapPin className="w-3 h-3 text-pink-600" />
                            <span className="text-xs text-pink-700">{userProfile.location}</span>
                          </div>
                        )}
                        {userProfile.interests && userProfile.interests.split(',').slice(0, 3).map((interest: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-1 bg-purple-100 px-3 py-1.5 rounded-full border border-purple-300">
                            <Heart className="w-3 h-3 text-purple-600" />
                            <span className="text-xs text-purple-700">{interest.trim()}</span>
                          </div>
                        ))}
                        {userProfile.interests && userProfile.interests.split(',').length > 3 && (
                          <div className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-300">
                            <span className="text-xs text-gray-600">+{userProfile.interests.split(',').length - 3} más</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Member Since */}
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Miembro desde {new Date(userProfile.createdAt).toLocaleDateString('es-GT', { month: 'long', year: 'numeric' })}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Achievements Section */}
                {stats?.badges && stats.badges.length > 0 && (
                  <Card className="bg-white/60 backdrop-blur-sm border-2 border-yellow-300 shadow-lg">
                    <CardHeader>
                      <h3 className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-600" />
                        Mis Insignias
                      </h3>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {stats.badges.map((badge: string, idx: number) => {
                          const badgeInfo = getBadgeInfo(badge)
                          const BadgeIcon = badgeInfo.icon
                          return (
                            <div key={idx} className={`bg-gradient-to-br ${badgeInfo.bgGradient} rounded-lg p-4 text-center border-2 border-yellow-300 shadow-md transform hover:scale-105 transition-transform`}>
                              <BadgeIcon className={`w-8 h-8 ${badgeInfo.color} mx-auto mb-2`} />
                              <p className="text-xs">{badgeInfo.label}</p>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Card className="bg-gradient-to-br from-pink-100 to-pink-200 border-2 border-pink-300 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Users className="w-5 h-5 text-pink-600" />
                        <span className="text-2xl text-pink-700">{stats?.followersCount || 0}</span>
                      </div>
                      <p className="text-xs text-pink-600">Seguidores</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-100 to-purple-200 border-2 border-purple-300 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Users className="w-5 h-5 text-purple-600" />
                        <span className="text-2xl text-purple-700">{stats?.followingCount || 0}</span>
                      </div>
                      <p className="text-xs text-purple-600">Siguiendo</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-blue-300 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                        <span className="text-2xl text-blue-700">{stats?.postsCount || 0}</span>
                      </div>
                      <p className="text-xs text-blue-600">Posts</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-orange-100 to-orange-200 border-2 border-orange-300 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Flame className="w-5 h-5 text-orange-600" />
                        <span className="text-2xl text-orange-700">{stats?.totalReactions || 0}</span>
                      </div>
                      <p className="text-xs text-orange-600">Reacciones</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Active Streak */}
                {stats?.activeStreak && stats.activeStreak > 0 && (
                  <Card className="bg-gradient-to-r from-yellow-100 via-orange-100 to-pink-100 border-2 border-yellow-300 shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-center gap-3">
                        <Zap className="w-6 h-6 text-orange-500" />
                        <span className="text-2xl">🔥</span>
                        <div className="text-center">
                          <p className="text-2xl text-orange-700">{stats.activeStreak}</p>
                          <p className="text-sm text-gray-600">días en la comunidad</p>
                        </div>
                        <TrendingUp className="w-6 h-6 text-orange-500" />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Motivational Message */}
                <Card className="bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 border-2 border-purple-300 shadow-lg">
                  <CardContent className="p-4">
                    <p className="text-sm text-center text-gray-700 flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4 text-pink-500" />
                      <span>
                        {stats?.userLevel === 'leyenda' && '¡Eres una leyenda de Informa! 👑'}
                        {stats?.userLevel === 'veterano' && '¡Sigue así! Eres un miembro veterano de la comunidad 🌟'}
                        {stats?.userLevel === 'activo' && '¡Excelente participación! La comunidad te agradece ⚡'}
                        {(!stats?.userLevel || stats?.userLevel === 'nuevo') && '¡Bienvenido a Informa! Comparte y conecta con tu comunidad 🎉'}
                      </span>
                    </p>
                  </CardContent>
                </Card>

                {/* Quick Edit Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => setActiveTab('photo')}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 shadow-md"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Cambiar Foto
                  </Button>
                  <Button
                    onClick={() => setActiveTab('info')}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 shadow-md"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Editar Info
                  </Button>
                </div>
              </>
            )}
          </TabsContent>

          {/* Photo Tab */}
          <TabsContent value="photo" className="space-y-4">
          {/* Current Profile Photo */}
          {userProfile?.profilePhoto && !isCapturing && !capturedPhoto && (
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <img
                  src={userProfile.profilePhoto}
                  alt="Foto de perfil actual"
                  className="w-32 h-32 rounded-full object-cover border-4 border-pink-300 shadow-lg"
                />
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-sm text-center text-gray-600">Tu foto de perfil actual</p>
            </div>
          )}

          {/* Camera View */}
          {isCapturing && !capturedPhoto && (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full rounded-lg border-4 border-purple-300 shadow-lg"
              />
              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                EN VIVO
              </div>
            </div>
          )}

          {/* Captured Photo Preview with Editor */}
          {capturedPhoto && (
            <div className="flex flex-col items-center gap-4">
              {/* Photo Editor Header */}
              <div className="w-full bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-green-900"><strong>¡Foto capturada!</strong></p>
                      <p className="text-xs text-green-700">Ajusta tu foto de perfil</p>
                    </div>
                  </div>
                  <Badge className="bg-green-600 text-white border-0">
                    <Move className="w-3 h-3 mr-1" />
                    Editar
                  </Badge>
                </div>

                {/* Crop Area Container */}
                <div className="relative mx-auto bg-white rounded-xl p-4 shadow-inner">
                  <div 
                    ref={imageContainerRef}
                    className="relative mx-auto overflow-hidden rounded-lg border-4 border-dashed border-green-400 bg-gray-100"
                    style={{ width: '280px', height: '280px' }}
                    onMouseMove={handlePhotoMouseMove}
                    onMouseUp={handlePhotoMouseUp}
                    onMouseLeave={handlePhotoMouseUp}
                    onTouchMove={handlePhotoTouchMove}
                    onTouchEnd={handlePhotoTouchEnd}
                  >
                    {/* Draggable Image */}
                    <img
                      src={capturedPhoto}
                      alt="Foto capturada"
                      className={`absolute top-1/2 left-1/2 select-none touch-none transition-opacity ${
                        isDragging ? 'cursor-grabbing opacity-80' : 'cursor-grab opacity-100'
                      }`}
                      style={{
                        transform: `translate(-50%, -50%) translate(${photoPosition.x}px, ${photoPosition.y}px) scale(${photoScale})`,
                        maxWidth: 'none',
                        width: '280px',
                        height: 'auto',
                        transition: isDragging ? 'none' : 'opacity 0.2s'
                      }}
                      onMouseDown={handlePhotoMouseDown}
                      onTouchStart={handlePhotoTouchStart}
                      draggable={false}
                    />
                    
                    {/* Center Guide Lines */}
                    <div className="absolute top-0 left-1/2 w-px h-full bg-green-300/30 pointer-events-none" />
                    <div className="absolute top-1/2 left-0 w-full h-px bg-green-300/30 pointer-events-none" />
                  </div>

                  {/* Instructions */}
                  <div className="mt-3 text-center">
                    {isDragging ? (
                      <p className="text-xs text-green-700 flex items-center justify-center gap-1 animate-pulse">
                        <Move className="w-3 h-3" />
                        <strong>Arrastrando...</strong>
                      </p>
                    ) : (
                      <p className="text-xs text-gray-600 flex items-center justify-center gap-1">
                        <Move className="w-3 h-3" />
                        Arrastra la foto para centrarla
                      </p>
                    )}
                  </div>
                </div>

                {/* Zoom Controls */}
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <ZoomOut className="w-5 h-5 text-green-700 flex-shrink-0" />
                    <Slider
                      value={[photoScale]}
                      onValueChange={(values) => setPhotoScale(values[0])}
                      min={1}
                      max={3}
                      step={0.1}
                      className="flex-1"
                    />
                    <ZoomIn className="w-5 h-5 text-green-700 flex-shrink-0" />
                    <span className="text-xs text-green-700 w-12 text-right">
                      {photoScale.toFixed(1)}x
                    </span>
                  </div>

                  {/* Reset Button */}
                  <Button
                    onClick={resetPhotoEditor}
                    variant="outline"
                    size="sm"
                    className="w-full border-green-300 text-green-700 hover:bg-green-50"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restablecer zoom y posición
                  </Button>
                </div>
              </div>

              {/* Preview Circle */}
              <div className="flex flex-col items-center gap-2">
                <p className="text-xs text-gray-600">Vista previa del perfil:</p>
                <div 
                  className="relative overflow-hidden rounded-full border-4 border-pink-300 shadow-lg bg-gray-100"
                  style={{ width: '120px', height: '120px' }}
                >
                  <img
                    src={capturedPhoto}
                    alt="Vista previa"
                    className="absolute top-1/2 left-1/2 pointer-events-none select-none"
                    style={{
                      transform: `translate(-50%, -50%) translate(${photoPosition.x * 0.43}px, ${photoPosition.y * 0.43}px) scale(${photoScale})`,
                      maxWidth: 'none',
                      width: '120px',
                      height: 'auto'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Hidden Canvas for photo capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Camera Error Message */}
          {cameraError && !isCapturing && !capturedPhoto && (
            <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300 rounded-xl p-5 space-y-4 shadow-md">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 space-y-3">
                  {cameraError === 'PERMISSION_DENIED' && (
                    <>
                      <p className="text-red-900">
                        <strong>🔒 Permiso de cámara denegado</strong>
                      </p>
                      <p className="text-sm text-red-800">
                        Para tomar una foto con la cámara, necesitas permitir el acceso:
                      </p>
                      <div className="bg-white/60 rounded-lg p-3 space-y-2">
                        <p className="text-xs text-red-800"><strong>Instrucciones:</strong></p>
                        <ol className="text-xs text-red-700 list-decimal list-inside space-y-1.5 ml-1">
                          <li>Busca el ícono de <strong>candado 🔒</strong> o <strong>información ⓘ</strong> en la barra de direcciones (arriba)</li>
                          <li>Click en él y busca la opción <strong>"Cámara"</strong></li>
                          <li>Cambia el permiso a <strong>"Permitir"</strong></li>
                          <li>Presiona el botón <strong>"Reintentar"</strong> abajo</li>
                        </ol>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setCameraError(null)
                            setUseFileUpload(false)
                            startCamera()
                          }}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Reintentar
                        </Button>
                      </div>
                    </>
                  )}
                  {cameraError === 'NO_CAMERA' && (
                    <>
                      <p className="text-red-900">
                        <strong>📷 No se encontró ninguna cámara</strong>
                      </p>
                      <p className="text-sm text-red-800">
                        Tu dispositivo no tiene una cámara disponible. No te preocupes, puedes subir una foto desde tus archivos.
                      </p>
                    </>
                  )}
                  {cameraError === 'CAMERA_IN_USE' && (
                    <>
                      <p className="text-red-900">
                        <strong>⚠️ Cámara ocupada</strong>
                      </p>
                      <p className="text-sm text-red-800">
                        La cámara está siendo usada por otra aplicación. Cierra otras apps que estén usando la cámara (como Zoom, Meet, etc.) e intenta de nuevo.
                      </p>
                      <Button
                        onClick={() => {
                          setCameraError(null)
                          setUseFileUpload(false)
                          startCamera()
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reintentar
                      </Button>
                    </>
                  )}
                  {cameraError === 'UNSUPPORTED' && (
                    <>
                      <p className="text-red-900">
                        <strong>❌ Navegador no compatible</strong>
                      </p>
                      <p className="text-sm text-red-800">
                        Tu navegador no soporta el acceso a la cámara. Por favor, sube una foto desde tus archivos.
                      </p>
                    </>
                  )}
                  {cameraError === 'UNKNOWN' && (
                    <>
                      <p className="text-red-900">
                        <strong>⚠️ Error desconocido</strong>
                      </p>
                      <p className="text-sm text-red-800">
                        Ocurrió un error inesperado. Puedes intentar de nuevo o subir una foto desde tus archivos.
                      </p>
                      <Button
                        onClick={() => {
                          setCameraError(null)
                          setUseFileUpload(false)
                          startCamera()
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reintentar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            {!isCapturing && !capturedPhoto && !useFileUpload && !cameraError && (
              <>
                <Button
                  onClick={startCamera}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 shadow-md"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {userProfile?.profilePhoto ? 'Cambiar Foto con Cámara' : 'Tomar Foto con Cámara'}
                </Button>
                <Button
                  onClick={() => setUseFileUpload(true)}
                  variant="outline"
                  className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  O elegir desde galería/cámara
                </Button>
              </>
            )}

            {!isCapturing && !capturedPhoto && useFileUpload && (
              <>
                <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center bg-white/50">
                  <Upload className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-700 mb-3">
                    Selecciona desde tu galería o toma una foto
                  </p>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={handleFileSelect}
                    className="max-w-full"
                  />
                </div>
                {!cameraError && (
                  <Button
                    onClick={() => setUseFileUpload(false)}
                    variant="outline"
                    className="w-full border-pink-300 text-pink-700 hover:bg-pink-50"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Usar cámara en su lugar
                  </Button>
                )}
              </>
            )}

            {isCapturing && !capturedPhoto && (
              <div className="flex gap-2">
                <Button
                  onClick={capturePhoto}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Capturar
                </Button>
                <Button
                  onClick={stopCamera}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {capturedPhoto && (
              <div className="flex gap-2">
                <Button
                  onClick={uploadPhoto}
                  disabled={isUploading}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Usar esta foto
                    </>
                  )}
                </Button>
                <Button
                  onClick={retakePhoto}
                  variant="outline"
                  disabled={isUploading}
                  className="border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

            {/* Info Message */}
            {!userProfile?.profilePhoto && (
              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 text-sm text-yellow-800">
                <p className="flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  <span>Necesitas una foto de perfil para poder publicar contenido y comentar en la comunidad.</span>
                </p>
              </div>
            )}
          </TabsContent>

          {/* Info Tab */}
          <TabsContent value="info" className="space-y-4 sm:space-y-6">
            {/* Account Information Card */}
            <div className="bg-gradient-to-br from-purple-100 via-pink-50 to-yellow-50 border-2 border-purple-300 rounded-lg p-4 sm:p-5 shadow-md">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm sm:text-base">Información de Cuenta</h3>
              </div>
              
              <div className="space-y-2">
                {/* Email */}
                <div className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
                  <span className="text-xs sm:text-sm text-gray-600">Email:</span>
                  <span className="text-xs sm:text-sm text-gray-900 truncate ml-2">{userProfile.email}</span>
                </div>
                
                {/* Phone */}
                <div className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
                  <span className="text-xs sm:text-sm text-gray-600">Teléfono:</span>
                  <span className="text-xs sm:text-sm text-gray-900">{userProfile.phone}</span>
                </div>
                
                {/* Role */}
                <div className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
                  <span className="text-xs sm:text-sm text-gray-600">Rol:</span>
                  <div className="flex items-center gap-2">
                    {userProfile.role === 'admin' ? (
                      <Badge className="bg-gradient-to-r from-red-500 to-pink-600 text-white border-0 text-xs">
                        🛡️ Administrador
                      </Badge>
                    ) : userProfile.role === 'firefighter' ? (
                      <Badge className="bg-gradient-to-r from-red-600 to-orange-600 text-white border-0 text-xs">
                        🚒 Bombero
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-200 text-gray-700 border-0 text-xs">
                        👤 Usuario
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Help to become admin */}
                {userProfile.role !== 'admin' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                    <p className="text-xs text-blue-800 mb-2">
                      💡 <strong>¿Quieres ser administrador?</strong>
                    </p>
                    <p className="text-xs text-blue-700 mb-2">
                      Los administradores pueden moderar contenido, ver reportes y banear usuarios.
                    </p>
                    <p className="text-xs text-blue-600">
                      📖 Lee la guía <strong>COMO-SER-ADMIN.md</strong> para instrucciones completas.
                    </p>
                  </div>
                )}
                
                {/* Admin info */}
                {userProfile.role === 'admin' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                    <p className="text-xs text-green-800 mb-1">
                      ✅ <strong>Acceso de Administrador Activo</strong>
                    </p>
                    <p className="text-xs text-green-700">
                      Tienes acceso al Panel de Moderación desde el botón "Admin" en el header.
                    </p>
                  </div>
                )}
              </div>
            </div>
          
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 sm:p-6 space-y-4 border-2 border-purple-200 shadow-md">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="flex items-center gap-2 text-sm sm:text-base">Cuéntanos sobre ti</h3>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Personaliza tu perfil de la comunidad</p>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio" className="flex items-center gap-2 text-purple-700 text-sm">
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>Biografía</span>
                  </Label>
                  <Textarea
                    id="bio"
                    placeholder="Cuéntale a la comunidad quién eres... 🌟"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={200}
                    rows={4}
                    className="resize-none border-purple-200 focus:border-purple-400 bg-white w-full text-sm sm:text-base"
                  />
                  <p className="text-xs text-gray-500 text-right">{bio.length}/200 caracteres</p>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-2 text-pink-700 text-sm">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>Ubicación</span>
                  </Label>
                  <Input
                    id="location"
                    placeholder="Ej: Centro, Barrio El Rosario, etc."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    maxLength={50}
                    className="border-pink-200 focus:border-pink-400 bg-white w-full text-sm sm:text-base"
                  />
                  <p className="text-xs text-gray-500">Ayuda a la comunidad a ubicarte mejor</p>
                </div>

                {/* Interests */}
                <div className="space-y-2">
                  <Label htmlFor="interests" className="flex items-center gap-2 text-orange-700 text-sm">
                    <Heart className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>Intereses</span>
                  </Label>
                  <Input
                    id="interests"
                    placeholder="Ej: Deportes, Comida, Negocios, etc."
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    maxLength={100}
                    className="border-orange-200 focus:border-orange-400 bg-white w-full text-sm sm:text-base"
                  />
                  <p className="text-xs text-gray-500">Separa tus intereses con comas</p>
                </div>
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="w-full bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-white hover:from-yellow-500 hover:via-pink-600 hover:to-purple-700 shadow-lg h-11 sm:h-12 text-sm sm:text-base"
              >
                {isSavingProfile ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin flex-shrink-0" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>Guardar Cambios</span>
                  </>
                )}
              </Button>

              <div className="bg-gradient-to-r from-yellow-100 via-pink-100 to-purple-100 border-2 border-purple-300 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-center text-gray-700 flex flex-col sm:flex-row items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-pink-500 flex-shrink-0" />
                  <span className="text-center">Esta información será visible en tu perfil público</span>
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
