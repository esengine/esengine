import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    format: ["esm"],
    dts: true,
    sourcemap: true,
    clean: true,
    external: [/\.\.\/pkg\/rapier_wasm2d/],
    loader: {
        ".wasm": "base64",
    },
});
