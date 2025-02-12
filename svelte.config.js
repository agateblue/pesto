import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

const CONNECT_SRC = (process.env.VITE_CSP_ALLOWED_CONNECT_SRC || "")
  .split(",")
  .filter((e) => {
    return e.trim();
  })
  .map((e) => {
    return e.trim();
  });

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    serviceWorker: {
      register: false
    },
    adapter: adapter({
      // default options are shown. On some platforms
      // these options are set automatically — see below
      pages: "build",
      assets: "build",
      fallback: "404.html",
      precompress: false,
      strict: true
    }),
    csp: {
      directives: {
        "default-src": ["self"],
        "script-src": ["self", "unsafe-eval"],
        "style-src": ["self"],
        "style-src-attr": ["self", "unsafe-inline"],
        "style-src-elem": ["self", "unsafe-inline"],
        "connect-src": ["self", ...CONNECT_SRC]
      }
    }
  }
};

export default config;
