import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ Simplified config to let Vite auto-detect root and index.html
export default defineConfig({
  plugins: [react()]
})
