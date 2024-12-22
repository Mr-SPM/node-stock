import { defineConfig } from "umi";

export default defineConfig({
  routes: [
    { path: "/", component: "index" },
    { path: "/docs", component: "docs" },
    { path: "/list", component: "list" },
  ],
  npmClient: 'pnpm',
  proxy: {
    '/api': {
      target: 'http://localhost:3002',
      'changeOrigin': true,

      'pathRewrite': { '^/api': '' },
    }
  }

});
