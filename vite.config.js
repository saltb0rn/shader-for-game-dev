import { globSync } from 'glob'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const inputs = Object.fromEntries(globSync('html/**/*').map(file => {
  return [
    // path.relative('html', file.slice(0, file.length - path.extname(file).length)),
    path.basename(file, 'html'),
    path.resolve(__dirname, file)
  ]
}))

inputs['index'] = 'index.html'

export default defineConfig({
  build: {
    emptyOutDir: true,
    
    rollupOptions: {
      input: inputs,
      output: {
        manualChunks(id, /*sed*/) {
          if (id.includes('node_modules')) {
            const moduleName = id.split('node_modules/')[1].split('/')[0].toString()
            return moduleName
          }
          return null
        }
      }
    },
  },
})
