<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { type TextType } from '$lib/db';

  const dispatch = createEventDispatcher<{
    update: { fragment: TextType };
    delete: {};
  }>();

  export let fieldId: string;
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

<h3>
  <label for="{fieldId}">Note content</label>
</h3>
<textarea 
  id="{fieldId}"
  class="editor autoresize" 
  placeholder="What's on your mind?"
  on:keyup={(e) => handleChange()} 
  bind:value={content}   
/>
