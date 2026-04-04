import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    hmr: { overlay: false },
  },
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  root: ".",
  build: {
    outDir: "dist",
    // Warn only if a single chunk > 500kb
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React libs — loaded once, cached forever
          if (id.includes("node_modules/react/") ||
              id.includes("node_modules/react-dom/") ||
              id.includes("node_modules/react-router-dom/")) {
            return "vendor-react";
          }
          // Supabase — separate chunk (big)
          if (id.includes("node_modules/@supabase")) {
            return "vendor-supabase";
          }
          // UI animation
          if (id.includes("node_modules/framer-motion")) {
            return "vendor-motion";
          }
          // Radix UI components
          if (id.includes("node_modules/@radix-ui")) {
            return "vendor-radix";
          }
          // Charts / Excel — only loaded when needed
          if (id.includes("node_modules/recharts") ||
              id.includes("node_modules/xlsx")) {
            return "vendor-charts";
          }
          // Icons
          if (id.includes("node_modules/lucide-react")) {
            return "vendor-icons";
          }
          // Admin pages — grouped together (rarely visited)
          if (id.includes("/pages/admin/")) return "page-admin";
          // Teacher pages
          if (id.includes("/pages/teacher/")) return "page-teacher";
          // Student pages
          if (id.includes("/pages/student/")) return "page-student";
        },
      },
    },
  },
});
