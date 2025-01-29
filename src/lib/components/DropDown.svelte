<script lang="ts">
  import { onMount } from 'svelte';
  import type { HTMLBaseAttributes } from 'svelte/elements';
  interface Props extends HTMLBaseAttributes {
    children: import('svelte').Snippet;
    control: import('svelte').Snippet;
    controlClass?: string;
  }
  let el
  let { children, control, controlClass, ...restProps }: Props = $props();
</script>

<details bind:this={el} class={'dropdown ' + (restProps.class || '')} onfocusout={(event) => {
  if (el.contains(event.relatedTarget)) return;
  el.open = false
}}>
  <summary class={controlClass}>
    {@render control?.()}
  </summary>
  <ul>
    {@render children?.()}
  </ul>
</details>