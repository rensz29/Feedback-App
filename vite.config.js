import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const SERVER = `http://localhost:${process.env.PORT ?? 6080}`;

export default defineConfig({
  root: "client",
  plugins: [react()],
  build: { outDir: "../dist", emptyOutDir: true },
  server: {
    fs: { allow: [".."] }, // shared/ sits outside client/
    proxy: {
      "/api": SERVER,
      "/health": SERVER,
      // /admin itself is a React page; only what's below it lives on the server
      "^/admin/.+": SERVER,
    },
  },
});
