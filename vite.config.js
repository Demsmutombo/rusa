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
    build: {
      // Les dépendances lourdes sont séparées pour réduire le chunk principal.
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return
            if (id.includes('html2pdf.js')) return 'vendor-html2pdf'
            if (id.includes('sweetalert2')) return 'vendor-sweetalert2'
            if (id.includes('apexcharts') || id.includes('vue3-apexcharts')) return 'vendor-charts'
            if (id.includes('@fullcalendar')) return 'vendor-calendar'
            if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) return 'vendor-vue'
            return 'vendor-misc'
          },
        },
      },
      // Le projet embarque des modules d'export PDF très volumineux.
      chunkSizeWarningLimit: 1100,
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
