<script>
  import '../style.css';
  import { afterNavigate } from '$app/navigation';
  import { trackRouteChange } from '$lib/plausible';
  import { page } from '$app/stores';
  import { dev } from '$app/environment';
  import { globals } from '$lib/db';
  import { onMount } from 'svelte';
  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { children } = $props();
  afterNavigate(() => {
    globals.uiState.set('currentPage', () => null);
    trackRouteChange($page)
  });

  // to avoid firefox crashing locally because service worker can't register
  onMount(async () => {
    if (dev) {
      console.warn('Will not register service worker in dev mode.');
    } else {
      if ('serviceWorker' in navigator) {
        console.info('Registering service worker…');
        navigator.serviceWorker.register('/service-worker.js', {
          type: dev ? 'module' : 'classic',
        });
      }
    }
  });
</script>


{@render children?.()}
