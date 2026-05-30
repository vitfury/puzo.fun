import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { execSync } from 'child_process'
import { writeFileSync, readFileSync } from 'fs'

// Plugin to inject build version into index.html and create version file
function injectVersion() {
  let buildVersion = 'unknown'
  let buildDate = ''
  
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
      
      // Format deployment date/time in Kyiv timezone (DDMMYYYY:HHMMSS)
      const now = new Date()
      // Use Intl.DateTimeFormat to get Kyiv timezone values
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Europe/Kyiv',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
      
      const parts = formatter.formatToParts(now)
      const day = parts.find(p => p.type === 'day')?.value || '01'
      const month = parts.find(p => p.type === 'month')?.value || '01'
      const year = parts.find(p => p.type === 'year')?.value || '2024'
      const hours = parts.find(p => p.type === 'hour')?.value || '00'
      const minutes = parts.find(p => p.type === 'minute')?.value || '00'
      const seconds = parts.find(p => p.type === 'second')?.value || '00'
      
      buildDate = `${day}${month}${year}:${hours}${minutes}${seconds}`
    },
    transformIndexHtml(html: string) {
      // Inject version as meta tag and query parameter
      const versionMeta = `<meta name="build-version" content="${buildVersion}">`
      const buildDateMeta = `<meta name="build-date" content="${buildDate}">`
      const versionScript = `<script>window.BUILD_VERSION="${buildVersion}";window.BUILD_DATE="${buildDate}";</script>`
      
      // Insert before closing </head>
      html = html.replace('</head>', `  ${versionMeta}\n  ${buildDateMeta}\n  ${versionScript}\n</head>`)
      
      return html
    },
    writeBundle() {
      // Create version file for nginx to read
      const versionFile = path.resolve(__dirname, 'dist', '.version')
      writeFileSync(versionFile, buildVersion, 'utf-8')
      
      // Modify index.html after bundle is written to add version query params
      const indexPath = path.resolve(__dirname, 'dist', 'index.html')
      try {
        let html = readFileSync(indexPath, 'utf-8')
        
        // Add version as query parameter to all script and link tags for cache busting
        // This ensures browsers fetch new files even if they have cached the HTML
        html = html.replace(
          /(<script[^>]*src=["'])([^"']+)(["'][^>]*>)/gi,
          (match, prefix, src, suffix) => {
            // Skip if already has version param or is inline script
            if (src.startsWith('data:') || src.startsWith('blob:') || src.includes('v=')) {
              return match
            }
            const separator = src.includes('?') ? '&' : '?'
            return `${prefix}${src}${separator}v=${buildVersion}${suffix}`
          }
        )
        html = html.replace(
          /(<link[^>]*href=["'])([^"']+)(["'][^>]*rel=["']stylesheet["'][^>]*>)/gi,
          (match, prefix, href, suffix) => {
            // Skip if already has version param
            if (href.includes('v=')) {
              return match
            }
            const separator = href.includes('?') ? '&' : '?'
            return `${prefix}${href}${separator}v=${buildVersion}${suffix}`
          }
        )
        
        writeFileSync(indexPath, html, 'utf-8')
      } catch (error) {
        console.warn('Could not modify index.html for cache busting:', error)
      }
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    injectVersion()
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
    allowedHosts: true
  },
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV !== 'production', // Вимикаємо source maps для production (економія пам'яті)
    // Ensure content-based hashing for cache busting
    rollupOptions: {
      output: {
        // Use content hash for better cache busting
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || []
          const ext = info[info.length - 1]
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `fonts/[name]-[hash][extname]`
          }
          return `assets/[name]-[hash][extname]`
        },
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'ui-vendor': ['framer-motion', 'lucide-react']
        }
      }
    }
  }
})
