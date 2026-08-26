import { defineConfig } from 'vitest/config';

/**
 * This file exists so vitest does NOT walk up and pick up an unrelated
 * vite.config.ts sitting in the home directory. Without it, the suite fails
 * to start with a confusing "Failed to resolve entry for package vite".
 */
export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'hono/jsx',
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    pool: 'threads',
  },
});
