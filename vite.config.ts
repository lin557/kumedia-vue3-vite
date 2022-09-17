import { defineConfig, loadEnv, splitVendorChunkPlugin } from 'vite'
import path from 'path'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Unocss from 'unocss/vite'
import {
  presetAttributify,
  presetIcons,
  presetUno,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'
import eslintPlugin from 'vite-plugin-eslint'

// https://vitejs.dev/config/
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default defineConfig(({ command, mode, ssrBuild }) => {
  const pathSrc = path.resolve(__dirname, 'src')
  const env = loadEnv(mode, __dirname)
  return {
    resolve: {
      alias: {
        '~/': `${pathSrc}/`,
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "~/styles/element/index.scss" as *;`,
        },
      },
    },
    server: {
      // 让本地ip可以访问
      host: '0.0.0.0',
    },
    // 打包后可以直接打开
    base: env.VITE_MODE === 'production' ? './' : './',
    build: {
      rollupOptions: {
        output: {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          manualChunks(id, { getModuleInfo }) {
            // 使用axios后 打包出来的出来的程序无法直接在浏览中打开 可以使用liveserver解决
            // 创建一个vendor包含所有依赖项的块node_modules
            console.log(id)
            if (id.includes('element-plus')) {
              return 'element-plus'
            }
            if (id.includes('videojs') || id.includes('video.js')) {
              return 'videojs'
            }
            // if (id.includes('node_modules')) {
            //   return 'vendor'
            // }
            // if (id.includes('node_modules')) {
            //   return id
            //     .toString()
            //     .split('node_modules/')[1]
            //     .split('/')[0]
            //     .toString()
            // }
          },
          // 用于从入口点创建的块的打包输出格式[name]表示文件名,[hash]表示该文件内容hash值
          // 用于命名代码拆分时创建的共享块的输出命名
          entryFileNames: 'js/[name].[hash].js',
          // 用于输出静态资源的命名，[ext]表示文件扩展名
          chunkFileNames: 'js/[name].[hash].js',
          assetFileNames: '[ext]/[name].[hash].[ext]',
        },
      },
    },
    plugins: [
      vue(),
      eslintPlugin,
      splitVendorChunkPlugin(),
      Components({
        // allow auto load markdown components under `./src/components/`
        extensions: ['vue', 'md'],
        // allow auto import and register components used in markdown
        include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
        resolvers: [
          ElementPlusResolver({
            importStyle: 'sass',
          }),
        ],
        dts: 'src/components.d.ts',
      }), // https://github.com/antfu/unocss
      // see unocss.config.ts for config
      Unocss({
        presets: [
          presetUno(),
          presetAttributify(),
          presetIcons({
            scale: 1.2,
            warn: true,
          }),
        ],
        transformers: [transformerDirectives(), transformerVariantGroup()],
      }),
    ],
  }
})
