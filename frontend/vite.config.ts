import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { execSync } from 'child_process'
import { writeFileSync } from 'fs'

// Plugin to inject build version into index.html and create version file
function injectVersion() {
  let buildVersion = 'unknown'
  
  return {
    name: 'inject-version',
    buildStart() {
      // Get git commit hash or timestamp as version
      try {
        buildVersion = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim()
      } catch {
        // Fallback to timestamp if git is not available
        buildVersion = Date.now().toString()
      }
    },
    transformIndexHtml(html: string) {
      // Inject version as meta tag and query parameter
      const versionMeta = `<meta name="build-version" content="${buildVersion}">`
      const versionScript = `<script>window.BUILD_VERSION="${buildVersion}";</script>`
      
      // Insert before closing </head>
      html = html.replace('</head>', `  ${versionMeta}\n  ${versionScript}\n</head>`)
      
      return html
    },
    writeBundle() {
      // Create version file for nginx to read
      const versionFile = path.resolve(__dirname, 'dist', '.version')
      writeFileSync(versionFile, buildVersion, 'utf-8')
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    injectVersion(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'favicon.svg', 'favicon-96x96.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Puzo Fun',
        short_name: 'Puzo',
        description: 'Gamified music discovery and fitness tracking',
        theme_color: '#1a1a2e',
        background_color: '#0f0f1e',
        display: 'standalone',
        icons: [
          {
            src: '/web-app-manifest-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.puzo\.fun\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 // 1 hour
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true
    },
    hmr: {
      host: 'localhost',
      protocol: 'ws'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV !== 'production', // Вимикаємо source maps для production (економія пам'яті)
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'ui-vendor': ['framer-motion', 'lucide-react']
        }
      }
    }
  }
})
