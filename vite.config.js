import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// Library build: the host app provides Vue (and, from M3, AG Grid), so they
// stay external and the host bundles a single copy.
export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.js', import.meta.url)),
      formats: ['es'],
      fileName: 'report-generator',
    },
    rollupOptions: {
      external: ['vue', /^ag-grid-/],
    },
    sourcemap: true,
  },
  test: {
    environment: 'jsdom',
  },
});
