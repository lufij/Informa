import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Optimización de chunks para mejor carga
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar React y librerías grandes
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Separar componentes de UI
          'ui-vendor': ['motion/react', 'lucide-react', 'sonner'],
          // Separar recharts (librería grande de gráficos)
          'charts': ['recharts'],
          // Separar react-slick (carrusel)
          'slick': ['react-slick'],
        },
      },
    },
    // Aumentar el límite de advertencia (opcional)
    chunkSizeWarningLimit: 800,
  },
})