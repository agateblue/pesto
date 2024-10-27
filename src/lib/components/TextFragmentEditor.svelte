<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { type TextType } from '$lib/db';

  const dispatch = createEventDispatcher<{
    update: { fragment: TextType };
    delete: {};
  }>();

  export let fragment: TextType;
  let content = fragment.content;

  function handleChange() {
    if (content) {
      dispatch('update', { fragment: { ...fragment, content: content.trim() } });
    } else {
      dispatch('delete', {});
    }
  }
</script>

<textarea 
  class="editor autoresize" 
  placeholder="What's on your wind?"
  on:keyup={(e) => handleChange()} 
  bind:value={content} />
