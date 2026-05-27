import {fileURLToPath, URL} from 'node:url'

import {defineConfig, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'
import {FileSystemIconLoader} from 'unplugin-icons/loaders'
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'

// https://vitejs.dev/config/
export default defineConfig(({command, mode}) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: '',
    plugins: [
      vue(),
      Components({
        dirs: [],
        resolvers: [
          IconsResolver({
            prefix: 'i',
            customCollections: ['custom'],
          }),
        ],
      }),
      Icons({
        compiler: 'vue3',
        autoInstall: false,
        customCollections: {
          custom: FileSystemIconLoader('src/assets/icons'),
        },
        scale: 1,
        defaultClass: 'i-icon',
      }),
      {
        name: 'inject-env',
        transformIndexHtml: {
          order: 'pre',
          handler() {
            return [
              {
                tag: 'script',
                attrs: {type: 'text/javascript'},
                children: `
    /*用户中心接口地址*/
    UCENTER_API_BASE='${env.UCENTER_API_BASE || 'http://localhost:12001'}';
    /*用户中心平台地址*/
    UCENTER_PLATFORM_BASE='${env.UCENTER_PLATFORM_BASE || 'http://localhost:11002'}';
    /*文件服务地址*/
    DOC_API_BASE='${env.DOC_API_BASE || 'http://localhost:12004'}';
    UPLOAD_FILE_SIZE_LIMIT=parseInt('${env.UPLOAD_FILE_SIZE_LIMIT || 500 * 1024 * 1024}');
    /*在线课件接口地址*/
    PPTONLINE_API_BASE='${env.PPTONLINE_API_BASE || 'http://localhost:12005'}';
    /*资源服务地址*/
    RESOURCE_API_BASE='${env.RESOURCE_API_BASE || 'http://localhost:12007'}';
    /*资源平台地址*/
    RESOURCE_PLATFORM_BASE='${env.RESOURCE_PLATFORM_BASE || 'http://localhost:11007'}';
    `,
              },
            ]
          },
        },
      },
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
  }
})
