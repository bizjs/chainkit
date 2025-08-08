import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    aptos: 'src/aptos.ts',
    bitcoin: 'src/bitcoin.ts',
    cardano: 'src/cardano.ts',
    evm: 'src/evm.ts',
    starknet: 'src/starknet.ts',
    svm: 'src/svm.ts',
    tvm: 'src/tvm.ts',
    sui: 'src/sui.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: false,
  target: 'es2022',
  clean: true,
  treeshake: true,
  legacyOutput: true,
  noExternal: [],
  esbuildOptions(options) {},
});
