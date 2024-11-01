<script>
  import '../style.css';
  import { afterNavigate } from '$app/navigation';

  import { globals } from '$lib/db';
  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { children } = $props();
  afterNavigate(() => {
    globals.uiState.set('currentPage', () => null);
  });
</script>

{@render children?.()}
