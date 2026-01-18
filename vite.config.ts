import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";
import Sitemap from "vite-plugin-sitemap";

// Supabase config (public keys)
const SUPABASE_URL = "https://myqrydgbrxhrjkrvkgqq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15cXJ5ZGdicnhocmprcnZrZ3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1OTU3NTYsImV4cCI6MjA4MjE3MTc1Nn0.IaczJplwUvk8xn_tOP3_KnKjP8MKvZ6oa0nm-62GQNc";

// Static routes for sitemap
const staticRoutes = ["/login", "/cadastro", "/pricing", "/blog", "/contato", "/termos", "/privacidade", "/ajuda"];

// Fetch blog post slugs from Supabase during build
async function fetchBlogSlugs(): Promise<string[]> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/blog_posts?select=slug&is_published=eq.true&published_at=not.is.null`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.warn('[Sitemap] Failed to fetch blog posts:', response.statusText);
      return [];
    }

    const posts = (await response.json()) as Array<{ slug: string }>;
    const slugs = posts.map((post) => `/blog/${post.slug}`);
    console.log(`[Sitemap] Found ${slugs.length} blog posts`);
    return slugs;
  } catch (error) {
    console.warn('[Sitemap] Error fetching blog posts:', error);
    return [];
  }
}

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  // Fetch blog slugs during build (not in dev to avoid delays)
  const blogRoutes = mode === "production" ? await fetchBlogSlugs() : [];
  const dynamicRoutes = [...staticRoutes, ...blogRoutes];
  
  console.log(`[Sitemap] Total routes: ${dynamicRoutes.length}`);

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
      Sitemap({
        hostname: "https://trustpageapp.com",
        dynamicRoutes,
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
  };
});
