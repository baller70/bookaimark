import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    background: 'background.ts',
    content: 'content.ts',
    popup: 'popup.tsx'
  },
  format: ['iife'],
  target: 'es2020',
  outDir: 'dist',
  clean: true,
  minify: false,
  sourcemap: true,
  splitting: false,
  treeshake: true,
  globalName: 'LinkPilot',
  esbuildOptions: (options) => {
    options.drop = ['console', 'debugger'];
  }
}); 