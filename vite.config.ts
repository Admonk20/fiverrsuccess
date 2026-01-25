import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries into separate chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-openai': ['openai'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-utils': ['zustand', 'lucide-react'],
        },
      },
    },
    // Increase chunk size warning limit (optional, but good to have)
    chunkSizeWarningLimit: 500,
  },
})
