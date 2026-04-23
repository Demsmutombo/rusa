import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_DEV_PROXY_TARGET || 'https://localhost:7110'
  const useHttps = proxyTarget.startsWith('https:')
  const isLocalHost = /localhost|127\.0\.0\.1/i.test(proxyTarget)
  /** Certificats dev ASP.NET souvent auto-signés sur localhost. */
  const secure = useHttps && !isLocalHost

  return {
    plugins: [vue(), vueJsx()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure,
        },
      },
    },
  }
})
