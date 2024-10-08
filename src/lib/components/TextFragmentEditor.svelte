<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import {
    type TextType
  } from '$lib/db'

  const dispatch = createEventDispatcher<{
    update: { fragment: TextType };
  }>();

  export let fragment: TextType;
  let content = fragment.content;

  function handleChange() {
    dispatch('update', { fragment: { ...fragment, content} });
  }
</script>

<textarea class="editor" on:keyup={(e) => handleChange()} bind:value={content} />
