import { defineConfig } from 'vite'
import { redwood } from 'rwsdk/vite'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import { contentPlugin } from './vite/contentPlugin'

export default defineConfig({
  // cloudflare plugin and vitest don't get along
  plugins: process.env.VITEST ? [] : [
    cloudflare({
      viteEnvironment: { name: 'worker' }
    }),
    redwood(),
    tailwindcss(),
    contentPlugin()
  ]
})
