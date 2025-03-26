import { defineConfig } from "umi";

export default defineConfig({
  routes: [
    { path: "/", component: "index" },
    { path: "/list", component: "list" },
  ],
  npmClient: 'pnpm',
  proxy: {
    '/api': {
      target: 'http://localhost:25250',
      'changeOrigin': true,
    }
  },
  define: {
    API_LIST: process.env.API_LIST
  }
});
