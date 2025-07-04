import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/': resolve(__dirname, 'src'),
      'lucide-react': resolve(__dirname, 'tests/__mocks__/lucide-react.ts'),
    },
  },
}) 