<script lang="ts">
  import TextEditor from './TextEditor.svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{created: DiaryEntry}>();

  $: tree = {version: 0, nodes: []};

  function handleSubmit () {
    const entry: DiaryEntry = {
      date: new Date(),
      tree: tree,
    }
    dispatch('created', entry);
  }

</script>
{JSON.stringify(tree)}
<form on:submit|preventDefault={handleSubmit}>
  <TextEditor bind:tree={tree} />
  <button type="submit">Submit</button>
</form>