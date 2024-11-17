<script lang="ts">
  import type { HTMLBaseAttributes } from 'svelte/elements';

  import { globals } from '$lib/db';
  import IconaMoonMenuBurgerHorizontal from 'virtual:icons/iconamoon/menu-burger-horizontal';
  import IconaMoonClose from 'virtual:icons/iconamoon/close';
  interface Props extends HTMLBaseAttributes {}
  let {...restProps} = $props()
  let sidebarFullpage = $state(false);

  const observable = globals.uiState.get$('currentPage');
  observable.subscribe((newValue: string) => {
    sidebarFullpage = newValue === 'mainMenu';
  });
</script>

<button 
  type="button" 
  class={'button__transparent button__icon ' + restProps.class || ''} 
  aria-label={sidebarFullpage ? "Close main navigation" : "Open main navigation"}
  onclick={() => {
    if (sidebarFullpage) {
      globals.uiState.set('currentPage', () => null);
    } else {
      globals.uiState.set('currentPage', () => 'mainMenu');
    }
  }}
>
  {#if sidebarFullpage}
    <IconaMoonClose role="presentation" alt="" />
  {:else}
    <IconaMoonMenuBurgerHorizontal role="presentation" alt="" />
  {/if}
</button>
