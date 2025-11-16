import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // eslint-disable-next-line no-undef
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwind()],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            redux: ['@reduxjs/toolkit', 'react-redux'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
      reportCompressedSize: false, // Disable gzip size calculation to speed up build
      sourcemap: false, // Disable sourcemaps in production for faster builds
    },
    test: {
      globals: true,
      environment: 'jsdom',
      threads: false,
      setupFiles: './src/tests/setup.js',
      css: true,
      coverage: {
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'src/tests/setup.js',
          'src/main.jsx',
          'src/vite-env.d.ts',
        ],
      },
    },
  }
})
