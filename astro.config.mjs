import node from '@astrojs/node'
import tailwindcss from '@tailwindcss/vite'
import astroIcon from 'astro-icon'
import { defineConfig } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [
    astroIcon(),
  ],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: process.env.DOCKER ? !!process.env.DOCKER : undefined,
    },
  },
})
