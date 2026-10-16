import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const isBuild = process.argv.includes("build");

const rawPort = process.env.PORT;
const port = rawPort ? Number(rawPort) : 5000;

if (!isBuild && (Number.isNaN(port) || port <= 0)) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// BASE_PATH controls the Vite `base` option — defaults to "/"
const basePath = process.env.BASE_PATH ?? "/";

// API_PORT is the Express server port — defaults to 8080 (matching the
// "API Server" workflow command: PORT=8080 BASE_PATH=/api ...).
// The proxy rewrites are not needed: the frontend fetches /api/... and the
// Express app is mounted at /api (app.use("/api", router)), so the paths match.
const apiPort = process.env.API_PORT ? Number(process.env.API_PORT) : 8080;

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react":  ["react", "react-dom"],
          "vendor-framer": ["framer-motion"],
        },
      },
    },
    // Raise the chunk-size warning threshold slightly — framer-motion is
    // intentionally large and we're already splitting it into its own chunk.
    chunkSizeWarningLimit: 700,
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
    // ---------------------------------------------------------------------------
    // API proxy — forwards RSVP and health requests from Vite to Express.
    //
    // changeOrigin: false — keeps the Host header as localhost (Express doesn't
    // use vhost routing, so origin doesn't matter; false avoids any confusion).
    // secure: false — no TLS between Vite and Express in dev.
    // ---------------------------------------------------------------------------
    proxy: {
      "/api": {
        target: `http://localhost:${apiPort}`,
        changeOrigin: false,
        secure: false,
      },
    },
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
