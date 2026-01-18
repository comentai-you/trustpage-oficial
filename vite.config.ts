import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";
import Sitemap from "vite-plugin-sitemap";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    Sitemap({
      hostname: "https://trustpageapp.com",
      dynamicRoutes: ["/login", "/cadastro", "/pricing", "/blog", "/contato", "/termos", "/privacidade", "/ajuda"],
      robots: [{ userAgent: "*", allow: "/" }],
    }),
    VitePWA({
      // Usamos registro manual (ver src/main.tsx) para conseguir forçar updates em domínios customizados
      registerType: "prompt",
      injectRegister: null,
      includeAssets: ["favicon.png", "favicon.svg"],
      manifest: {
        name: "TrustPage",
        short_name: "TrustPage",
        description: "Crie landing pages profissionais para seus links de bio",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#3b82f6",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        // Garante atualização mais agressiva
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,

        // --- AQUI ESTÁ A CORREÇÃO MÁGICA ---
        // Isso diz ao PWA: "Não se meta nessas URLs, deixe o servidor responder"
        navigateFallbackDenylist: [/^\/sitemap\.xml$/, /^\/robots\.txt$/],
        // ------------------------------------

        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities"],
  },
}));
