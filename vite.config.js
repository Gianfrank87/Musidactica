import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main:        resolve(__dirname, 'index.html'),
        games:       resolve(__dirname, 'src/games/index.html'),
        ritmo:       resolve(__dirname, 'src/games/ritmo/index.html'),
        instrumentos:resolve(__dirname, 'src/games/instrumentos/index.html'),
        melodia:     resolve(__dirname, 'src/games/melodia/index.html'),
        trivia:      resolve(__dirname, 'src/games/trivia/index.html'),
        virtuales:   resolve(__dirname, 'src/games/virtuales/index.html'),
      }
    }
  }
})
