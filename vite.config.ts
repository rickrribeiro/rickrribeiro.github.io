/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { contentPlugin } from './scripts/vite-plugin-content';

export default defineConfig({
  base: '/',
  plugins: [react(), contentPlugin()],
  define: {
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
  build: {
    target: 'es2022',
    cssMinify: true,
    assetsInlineLimit: 2048,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});
