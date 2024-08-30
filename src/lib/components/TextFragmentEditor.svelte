<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher<{ 
    update: {fragment: Fragment},
  }>();

  export let fragment: Fragment
  $: text = fragment.text

  function handleChange() {
    dispatch('update', {fragment: {...fragment, text}})
  }
</script>
<textarea class="editor" bind:value={text} on:input={(e) => handleChange()} />

