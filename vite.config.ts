import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'node:path';
import UnoCSS from 'unocss/vite'

// https://vite.dev/config/
export default defineConfig({
  base:  './',
  server: {
    // Tauri 工作于固定端口，如果端口不可用则报错
    strictPort: true,
    host: '0.0.0.0',
    port: 5173,
  },
  clearScreen: false,
  // 添加有关当前构建目标的额外前缀，使这些 CLI 设置的 Tauri 环境变量可以在客户端代码中访问
  envPrefix: ['VITE_', 'TAURI_ENV_*'],
  build: {
    // Tauri 在 Windows 上使用 Chromium，在 macOS 和 Linux 上使用 WebKit
    target:
      process.env.TAURI_ENV_PLATFORM === 'windows'
        ? 'chrome105'
        : 'safari13',
    // 在 debug 构建中不使用 minify
    minify: !process.env.TAURI_ENV_DEBUG ? 'esbuild' : false,
    // 在 debug 构建中生成 sourcemap
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
  },
  plugins: [react(),UnoCSS()],
  resolve: {
    // 设置文件./src路径为 @
    alias: [
      {
        find: '@',
        replacement: resolve(__dirname, './src')
      }
    ]
  }

})
