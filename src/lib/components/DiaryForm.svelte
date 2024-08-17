<script lang="ts">
  import { v7 as uuidv7 } from 'uuid';
  import TextEditor from './TextEditor.svelte';
  import { createEventDispatcher } from 'svelte';
  import IconaMoonPen from 'virtual:icons/iconamoon/pen'
  const dispatch = createEventDispatcher<{ created: DiaryEntry }>();

  export let cacheKey: null | string = null;

  $: tree = { version: 0, nodes: [] };

  function handleSubmit() {
    const entry: DiaryEntry = {
      _id: uuidv7(),
      type: 'entry',
      date: (new Date()).toISOString(),
      tree: tree
    };
    dispatch('created', entry);
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <TextEditor bind:tree bind:cacheKey />
  <div class="flex__row flex__justify-end">
    <button type="submit">
      <IconaMoonPen />
      Submit
    </button>
  </div>
</form>
