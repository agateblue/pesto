// import { sentrySvelteKit } from '@sentry/sveltekit';
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";
import Icons from "unplugin-icons/vite";

export default defineConfig({
  server: {
    https: false
  },
  plugins: [
    // sentrySvelteKit({
    //   sourceMapsUploadOptions: {
    //     org: 'pesto-lc',
    //     project: 'pesto-app'
    //   }
    // }),
    sveltekit(),
    Icons({ compiler: "svelte" })
  ],
  define: { global: "window" }, // <--- Add "window" here
  test: {
    include: ["src/**/*.{test,spec}.{js,ts}"]
  }
});
