<script lang="ts">
  import FragmentEditor from './FragmentEditor.svelte';
  import { createEventDispatcher } from 'svelte';
  import {
    type NoteDocument,
    type Database,
  } from '$lib/db'
  const dispatch = createEventDispatcher<{
    update: { note: NoteDocument};
  }>();

  export let note: NoteDocument | null;
  export let db: Database
  function handleUpdate(n: NoteDocument) {
    dispatch('update', { note: n });
  }
</script>

<form on:submit>
  <FragmentEditor
    {note}
    {db}
    on:update={(e) => {
      handleUpdate(e.detail.note);
    }}
  />
  <div class="flex__row flex__justify-end">
    <button type="submit"> Save </button>
  </div>
</form>
