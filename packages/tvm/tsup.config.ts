import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  bundle: true,
  sourcemap: false,
  target: 'es2022',
  clean: true,
  treeshake: true,
  legacyOutput: true,
  noExternal: ['tweetnacl'],
  esbuildOptions(options) {},
});
