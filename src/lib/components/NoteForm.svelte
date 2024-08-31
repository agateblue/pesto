<script lang="ts">
  import type { Note, Fragment } from '../../ambient';
  import FragmentEditor from './FragmentEditor.svelte';
  import { createEventDispatcher } from 'svelte';
  import IconaMoonPen from 'virtual:icons/iconamoon/pen';

  const dispatch = createEventDispatcher<{
    update: { note: Note; fragments: Fragment[] };
  }>();

  export let fragments: Fragment[];
  export let note: Note;

  function handleUpdate(n: Note, f: Fragment[]) {
    fragments = f;
    dispatch('update', { note, fragments });
  }
</script>

<form on:submit>
  <FragmentEditor
    {fragments}
    on:update={(e) => {
      handleUpdate(note, e.detail.fragments);
    }}
  />
  <div class="flex__row flex__justify-end">
    <button type="submit">
      <IconaMoonPen />
      Save
    </button>
  </div>
</form>
