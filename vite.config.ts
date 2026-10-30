import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Caminhos relativos: o site funciona em qualquer subcaminho (GitHub Pages usa /nome-do-repo/).
  base: './',
  plugins: [react()],
  test: { environment: 'node' },
})
