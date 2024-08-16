<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{created: DiaryEntry}>();

  $: entryText = 'Hello';

  function handleSubmit () {
    const entry: DiaryEntry = {
      date: new Date(),
      text: entryText,
    }
    dispatch('created', entry);
  }

</script>

<form on:submit|preventDefault={handleSubmit}>
  <textarea name="content" id="content" bind:value={entryText} />
  <button type="submit">Submit</button>
</form>