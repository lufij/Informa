import React from 'react'
import { Sparkles, RefreshCw, AlertTriangle } from 'lucide-react'
import { Button } from './ui/button'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error | null; retry: () => void }>
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })
    
    // Log error for debugging
    console.error('Error Boundary caught an error:', error, errorInfo)
    
    // TODO: Send to error reporting service
    // reportError(error, errorInfo)
  }

  retry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback component
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} retry={this.retry} />
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50 p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mx-auto">
              <AlertTriangle className="w-10 h-10 text-yellow-500" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-gray-800">
                ¡Oops! Algo salió mal
              </h2>
              <p className="text-gray-600">
                Ha ocurrido un error inesperado. No te preocupes, puedes intentar recargar la página.
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={this.retry}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-12"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Reintentar
              </Button>
              
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full h-12"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Recargar página
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left bg-gray-100 p-4 rounded-lg mt-4">
                <summary className="cursor-pointer font-medium text-sm text-gray-700 mb-2">
                  Detalles del error (desarrollo)
                </summary>
                <pre className="text-xs text-red-600 whitespace-pre-wrap overflow-auto max-h-40">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary