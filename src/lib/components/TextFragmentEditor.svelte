<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher<{
    update: { fragment: Fragment };
  }>();

  export let fragment: Fragment;
  let text = fragment.text;

  function handleChange() {
    dispatch('update', { fragment: { ...fragment, text } });
  }
</script>

<textarea class="editor" on:keyup={(e) => handleChange()} bind:value={text} />
