<script lang="ts">
  import { getNewTextFragment } from '$lib/db'
  import BlockTextEditor from './TextFragmentEditor.svelte';
  import type {Fragment, Note} from '../../ambient.d'

  export let fragments: Fragment[];
  export let note: Note;

  if (fragments.length === 0) {
    fragments.push(getNewTextFragment(note._id, 'Hello'))
  }

  let elements = {
    'text': BlockTextEditor
  }

  function updateFragment () {

  }
</script>


{#each fragments as fragment, i (i)}
  {i}
  <svelte:component this={elements[fragment.subtype]} bind:fragment={fragment} on:update={event => updateFragment(event, i)}/>
{/each}

