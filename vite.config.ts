import { sentrySvelteKit } from '@sentry/sveltekit';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import Icons from 'unplugin-icons/vite';
import mkcert from 'vite-plugin-mkcert';
export default defineConfig({
  server: {
    https: true
  },
  plugins: [
    sentrySvelteKit({
      sourceMapsUploadOptions: {
        org: 'pesto-lc',
        project: 'pesto-app'
      }
    }),
    sveltekit(),
    Icons({ compiler: 'svelte' }),
    mkcert()
  ],
  define: { global: 'window' }, // <--- Add "window" here
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}']
  }
});
