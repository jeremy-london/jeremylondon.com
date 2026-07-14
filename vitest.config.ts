import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@assets': `${root}src/assets`,
      '@components': `${root}src/components`,
      '@content': `${root}src/content`,
      '@data': `${root}src/data`,
      '@layouts': `${root}src/layouts`,
      '@lib': `${root}src/lib`,
      '@pages': `${root}src/pages`,
      '@styles': `${root}src/styles`,
      '@utils': `${root}src/utils`,
    },
  },
  test: {
    environment: 'node',
    globals: false,
    include: ['tests/**/*.test.{js,mjs,ts,mts}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/pages/rss.xml.js',
        'src/utils/all.js',
        'src/utils/content-core.js',
        'src/utils/content.js',
        'src/utils/rss-core.js',
        'src/utils/webmcp-core.ts',
        'src/utils/webmcp.ts',
      ],
      exclude: ['src/content/**/*', 'src/**/*.d.ts', 'tests/**/*'],
    },
  },
})
