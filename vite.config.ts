import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      formats: ["es", "cjs"],
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "eventEmitter",
      fileName: (format) => `index.${format}.js`,
    },
  },
});
