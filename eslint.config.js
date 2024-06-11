import { defineConfig } from '@zhangyu1818/eslint-config'

export default defineConfig(
  {
    presets: {
      next: true,
      prettier: true,
      react: true,
      tailwindcss: true,
      typescript: true,
    },
    reactFramework: {
      next: true,
    },
  },
  [
    {
      ignores: ['.turbo', 'eslint.config.js', 'lint-staged.config.js'],
    },
    {
      settings: {
        next: {
          rootDir: 'apps/*/',
        },
        react: {
          version: '18.3.1',
        },
      },
    },
  ],
)
