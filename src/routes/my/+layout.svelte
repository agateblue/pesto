<script>
  import MainNavigation from '$lib/components/MainNavigation.svelte';
  import { globals, launchReplications } from '$lib/db';
  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { children } = $props();
  launchReplications(globals.uiState, globals.db);
</script>

<div class="my__layout">
  <MainNavigation />
  {@render children?.()}
</div>
