<script lang="ts">
  import { clone, cloneDeep } from 'lodash';
  import TextFragmentEditor from './TextFragmentEditor.svelte';
  import type { Fragment, Note } from '../../ambient.d';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    update: { fragments: Fragment[] };
  }>();

  export let fragments: Fragment[];

  let elements = {
    text: TextFragmentEditor
  };

  function updateFragment(fragment, index) {
    fragments[index] = cloneDeep(fragment);
    dispatch('update', { fragments });
  }
</script>

{#each fragments as fragment, i (i)}
  <svelte:component
    this={elements[fragment.type]}
    {fragment}
    on:update={(event) => updateFragment(event.detail.fragment, i)}
  />
{/each}
