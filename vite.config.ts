import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/components': resolve(__dirname, 'src/components'),
      '@/pages': resolve(__dirname, 'src/pages'),
      '@/stores': resolve(__dirname, 'src/stores'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/api': resolve(__dirname, 'src/api'),
      '@/types': resolve(__dirname, 'src/types'),
      '@/constants': resolve(__dirname, 'src/constants'),
      '@/hooks': resolve(__dirname, 'src/hooks'),
      '@/assets': resolve(__dirname, 'src/assets')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "@/assets/styles/variables.scss";'
      }
    }
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    open: true
  },
  build: {
    target: 'es6',
    cssTarget: 'chrome61',
    rollupOptions: {
      output: {
        manualChunks: {
          'uni-ui': ['@dcloudio/uni-ui']
        }
      }
    }
  },
  define: {
    __UNI_PLATFORM__: JSON.stringify(process.env.UNI_PLATFORM)
  }
})