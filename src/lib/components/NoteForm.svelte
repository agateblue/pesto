<script lang="ts">
  import {getNewNote, createOrUpdate} from '../db'
  import FragmentEditor from './FragmentEditor.svelte';
  import { createEventDispatcher } from 'svelte';
  import IconaMoonPen from 'virtual:icons/iconamoon/pen'
  const dispatch = createEventDispatcher<{ created: DiaryEntry }>();

  $: fragments = [];
  $: note = getNewNote();

  function handleSubmit() {
    createOrUpdate(note)
    fragments.forEach( fragment => {
      createOrUpdate(fragment)
    })
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <FragmentEditor
    bind:fragments={fragments}
    bind:note={note}
  />
  <div class="flex__row flex__justify-end">
    <button type="submit">
      <IconaMoonPen />
      Submit
    </button>
  </div>
</form>
