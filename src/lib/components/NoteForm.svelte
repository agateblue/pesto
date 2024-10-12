<script lang="ts">
  import FragmentEditor from './FragmentEditor.svelte';
  import { createEventDispatcher } from 'svelte';
  import { type NoteDocument, type Database } from '$lib/db';
  const dispatch = createEventDispatcher<{
    update: { note: NoteDocument };
  }>();

  export let note: NoteDocument | null;
  function handleUpdate(n: NoteDocument) {
    dispatch('update', { note: n });
  }
</script>

<form on:submit>
  <FragmentEditor
    {note}
    on:update={(e) => {
      handleUpdate(e.detail.note);
    }}
  />
  <slot></slot>
</form>
