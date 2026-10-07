import path from 'node:path';
import { defineConfig } from 'vitest/config';

// Test setup: plain Node tests for the logic in lib/ and hooks/. The "@/" alias matches tsconfig.json.
export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname) },
  },
  test: {
    environment: 'node',
    include: ['**/*.test.ts'],
    exclude: ['node_modules/**', '.next/**'],
  },
});
