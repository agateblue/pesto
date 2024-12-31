<script>
  import '../style.css';
  import { afterNavigate } from '$app/navigation';
  import { trackRouteChange } from '$lib/plausible';
  import { page } from '$app/stores';
  import { globals } from '$lib/db';
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
</script>


{@render children?.()}
