import { defineConfig } from 'rolldown';

export default defineConfig([
  {
    input: 'src/index.ts',
    output: {
      format: 'esm',
      dir: 'dist/esm',
    },
  },
  {
    input: 'src/index.ts',
    output: {
      format: 'cjs',
      dir: 'dist/cjs',
    },
  },
]);
