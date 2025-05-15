import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: "./public",
  base: "./",
  server: {
       port: 5173,
       open:true,
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
        main: resolve(__dirname, "./index.html"),
        log: resolve(__dirname, "./public/pages/log.html"),
        signup: resolve(__dirname, "./public/pages/signup.html"),
      },
    },
  },
});
