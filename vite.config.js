import { resolve } from 'path'
import { defineConfig } from 'vite'
import fs from 'fs'

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        games: resolve(__dirname, 'src/games/index.html'),
        docentes: resolve(__dirname, 'src/docentes/index.html'),
        ritmo: resolve(__dirname, 'src/games/ritmo/index.html'),
        instrumentos: resolve(__dirname, 'src/games/instrumentos/index.html'),
        melodia: resolve(__dirname, 'src/games/melodia/index.html'),
        trivia: resolve(__dirname, 'src/games/trivia/index.html'),
        virtuales: resolve(__dirname, 'src/games/virtuales/index.html'),
      }
    }
  },
  plugins: [
    {
      name: 'copy-src-folder',
      closeBundle() {
        const srcPath = resolve(__dirname, 'src')
        const destPath = resolve(__dirname, 'dist/src')
        // Copiamos recursivamente toda la carpeta src dentro de dist/src
        // Esto garantiza que todos los archivos .js y .css que no sean módulos
        // estén disponibles exactamente en la misma ruta que en desarrollo local.
        fs.cpSync(srcPath, destPath, { recursive: true })
        console.log('⚡ ¡Carpeta src copiada con éxito a dist/src para compatibilidad 100%!')

        // También copiamos la carpeta public dentro de dist/public
        // Para que las referencias relativas de favicon e imágenes funcionen sin importar el método de hosting.
        const publicPath = resolve(__dirname, 'public')
        const publicDestPath = resolve(__dirname, 'dist/public')
        if (fs.existsSync(publicPath)) {
          fs.cpSync(publicPath, publicDestPath, { recursive: true })
          console.log('⚡ ¡Carpeta public copiada con éxito a dist/public!')
        }
      }
    }
  ]
})
