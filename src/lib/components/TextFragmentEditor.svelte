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
    dispatch('update', { fragment: { ...fragment, content } });
  }
</script>

<div class="flex__row | flex__justify-between">
  <div></div>
  <button
    class="button__link"
    on:click|preventDefault={(e) => {
      if (confirm('Do you want to delete this text?')) {
        dispatch('delete', {});
      }
    }}
  >
    Delete
  </button>
</div>
<textarea class="editor" on:keyup={(e) => handleChange()} bind:value={content} />
