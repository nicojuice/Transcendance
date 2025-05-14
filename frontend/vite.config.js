import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: "src",
  base: "./",
  server: {
    proxy: {
      '/api': {
        target: 'http://register-service:8001', // Utilisez le nom du service Docker
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    outDir: "../style/",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "./src/index.html"),
        log: resolve(__dirname, "./pages/log.html"),
        signup: resolve(__dirname, "./pages/signup.html"),
      },
    },
  },
});