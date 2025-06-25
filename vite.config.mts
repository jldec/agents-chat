import { defineConfig } from 'vite'
import { redwood } from 'rwsdk/vite'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import { contentPlugin } from './vite/contentPlugin'

export default defineConfig({
  plugins: [
    cloudflare({
      viteEnvironment: { name: 'worker' }
    }),
    redwood(),
    tailwindcss(),
    contentPlugin()
  ]
})
