import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'EchoFeedback',
      formats: ['es', 'umd'],
      fileName: (format) => format === 'es' ? 'web.esm.js' : 'web.js'
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'themes/base.css';
          return assetInfo.name || '';
        }
      }
    }
  }
});
