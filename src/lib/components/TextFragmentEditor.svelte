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
    content = content.trim()
    if (content) {
      dispatch('update', { fragment: { ...fragment, content } });
    } else {
      dispatch('delete', {  });

    }
  }
</script>

<textarea class="editor" on:keyup={(e) => handleChange()} bind:value={content} />
