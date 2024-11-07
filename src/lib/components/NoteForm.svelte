<script lang="ts">
  import { createBubbler } from 'svelte/legacy';

  const bubble = createBubbler();
  import FragmentEditor from './FragmentEditor.svelte';
  import { createEventDispatcher } from 'svelte';
  import { type DocumentDocument, type Database, globals } from '$lib/db';
  import { isRxDocument } from 'rxdb';
  const dispatch = createEventDispatcher<{
    update: { note: DocumentDocument };
    delete: { note: DocumentDocument };
  }>();

  interface Props {
    note: DocumentDocument | null;
    children?: import('svelte').Snippet;
  }

  let { note, children }: Props = $props();
  let columns: string[] = $state([])

  function handleUpdate(n: DocumentDocument) {
    dispatch('update', { note: n });
  }

  async function askDelete(note: DocumentDocument) {
    if (confirm('Do you want to delete this note?')) {
      await note.remove();
      dispatch('delete', { note });
    }
  }

  globals.db?.documents.findOne({selector: {id: 'settings:board'}}).$.subscribe(
    (settings) => {
      columns = settings?.data.columns || ['Todo', 'Doing', 'Done']
    }
  )

</script>

<form class="flow" onsubmit={bubble('submit')}>
  <a href="/my" class="layout__multi-hidden">Go back</a>
  <FragmentEditor
    {note}
    {columns}
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
