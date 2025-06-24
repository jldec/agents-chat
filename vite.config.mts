import { defineConfig } from 'vite'
import { redwood } from 'rwsdk/vite'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import customContentPlugin from './vite/content'

export default defineConfig({
  plugins: [
    cloudflare({
      viteEnvironment: { name: 'worker' }
    }),
    redwood(),
    tailwindcss(),
    customContentPlugin()
  ]
})
