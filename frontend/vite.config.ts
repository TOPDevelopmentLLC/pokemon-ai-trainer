import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const resolveSrc = (dir: string) => fileURLToPath(new URL(`./src/${dir}`, import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Keep in sync with "paths" in tsconfig.app.json.
    // Ordered array rather than an object: the exact-match entry for the
    // types barrel must be tried before the '@app-types/...' prefix rule.
    alias: [
      { find: /^@app-types$/, replacement: resolveSrc('types/index.ts') },
      { find: '@app-types', replacement: resolveSrc('types') },
      { find: '@components', replacement: resolveSrc('components') },
      { find: '@context', replacement: resolveSrc('context') },
      { find: '@data', replacement: resolveSrc('data') },
      { find: '@hooks', replacement: resolveSrc('hooks') },
      { find: '@pages', replacement: resolveSrc('pages') },
      { find: '@services', replacement: resolveSrc('services') },
    ],
  },
})
