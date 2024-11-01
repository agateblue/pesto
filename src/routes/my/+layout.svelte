<script>
  import MainNavigation from '$lib/components/MainNavigation.svelte';
  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { children } = $props();
</script>

<div class="my__layout">
  <MainNavigation />
  {@render children?.()}
</div>
