<script lang="ts">
  import { page } from '$app/stores';
  import type { HTMLBaseAttributes } from 'svelte/elements';

  interface Props extends HTMLBaseAttributes {
    children: import('svelte').Snippet;
    href: string;
  }
  let { children, href, ...restProps } = $props();

  function isCurrentPage() {
    return $page.url.pathname + $page.url.search === href.replace(' ', '%20');
  }
</script>

<a {href} data-current-page={isCurrentPage()} {...restProps}>{@render children?.()}</a>
