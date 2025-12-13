import {fileURLToPath, URL} from 'node:url'

import {defineConfig, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({command, mode}) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: '',
    plugins: [
      vue(),
    ],
    server: {
      host: '127.0.0.1',
      port: 5173,
      proxy: {
        '/api': {
          target: 'https://server.pptist.cn',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        }
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
          @import '@/assets/styles/variable.scss';
          @import '@/assets/styles/mixin.scss';
        `
        },
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    define: {
      /* 用户中心接口地址 */
      UCENTER_API_BASE: JSON.stringify(env.UCENTER_API_BASE || 'http://localhost:12001'),
      /* 用户中心平台地址 */
      UCENTER_PLATFORM_BASE: JSON.stringify(env.UCENTER_PLATFORM_BASE || 'http://localhost:11002'),
      /* 文件服务地址 */
      DOC_API_BASE: JSON.stringify(env.DOC_API_BASE || 'http://localhost:12004'),
      UPLOAD_FILE_SIZE_LIMIT: JSON.stringify(env.UPLOAD_FILE_SIZE_LIMIT || 500 * 1024 * 1024),
      /* 在线课件接口地址 */
      PPTONLINE_API_BASE: JSON.stringify(env.PPTONLINE_API_BASE || 'http://localhost:12005'),
      /* 资源服务地址 */
      RESOURCE_API_BASE: JSON.stringify(env.RESOURCE_API_BASE || 'http://localhost:12007'),
      /* 资源平台地址 */
      RESOURCE_PLATFORM_BASE: JSON.stringify(env.RESOURCE_PLATFORM_BASE || 'http://localhost:11007'),
    },
  }
})
