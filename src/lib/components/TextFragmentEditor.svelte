<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { type TextType, buildUniqueId } from '$lib/db';

  const dispatch = createEventDispatcher<{
    update: { fragment: TextType };
    delete: {};
  }>();

  let id: string = buildUniqueId()
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

<label for="{id}">Note content</label>
<textarea 
  id="{id}"
  class="editor autoresize" 
  placeholder="What's on your mind?"
  on:keyup={(e) => handleChange()} 
  bind:value={content} />
