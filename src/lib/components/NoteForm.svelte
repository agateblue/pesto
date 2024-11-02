<script lang="ts">
  import { createBubbler } from 'svelte/legacy';

  const bubble = createBubbler();
  import FragmentEditor from './FragmentEditor.svelte';
  import { createEventDispatcher } from 'svelte';
  import { type Document, type Database } from '$lib/db';
  const dispatch = createEventDispatcher<{
    update: { note: Document };
    delete: { note: Document };
  }>();

  interface Props {
    note: Document | null;
    children?: import('svelte').Snippet;
  }

  let { note, children }: Props = $props();
  function handleUpdate(n: Document) {
    dispatch('update', { note: n });
  }

  async function askDelete(note: Document) {
    if (confirm('Do you want to delete this note?')) {
      await note.remove();
      dispatch('delete', { note });
    }
  }
</script>

<form class="flow" onsubmit={bubble('submit')}>
  <a href="/my" class="layout__multi-hidden">Go back</a>
  <FragmentEditor
    {note}
    on:update={(e) => {
      handleUpdate(e.detail.note);
    }}
  />
  <div class="flex__row flex__justify-between">
    {@render children?.()}
    {#if note}
      <button
        type="button"
        class="button__link"
        onclick={(e) => {
          askDelete(note);
        }}
      >
        Delete
      </button>
    {/if}
  </div>
</form>
