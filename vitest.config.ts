import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      root: fileURLToPath(new URL('./', import.meta.url)),
      include: ['src/**/*.{test,spec}.{js,ts}', 'electron/**/*.{test,spec}.{js,ts}'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'dist/',
          'dist_electron/',
          '**/*.d.ts',
          '**/*.config.*',
          '**/types/**',
        ],
      },
    },
  })
)
