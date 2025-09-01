import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.js$/,
    exclude: []
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx'
      }
    }
  },
  server: {
    port: 1234,
    proxy: {
      '/api': {
        target: 'http://localhost:9999',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/.netlify/functions/')
      },
      '/rss-full': {
        target: 'http://localhost:9999',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss-full/, '/.netlify/functions/findCast/')
      },
      '/rss-audio': {
        target: 'http://phonograph.app',
        changeOrigin: true
      },
      '/ln': {
        target: 'https://listen-api.listennotes.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ln/, '/api/v2/'),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('X-ListenAPI-Key', process.env.listennotes || 'ebbd0481aa1b4acc8949a9ffeedf4d7b');
            proxyReq.setHeader('X-From', 'Gramophone-DEV');
          });
        }
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      // Force using Rollup instead of Rolldown for JSX compatibility
    }
  },
  resolve: {
    alias: {
      'public': '/public/'
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
})