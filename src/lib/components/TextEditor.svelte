<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Editor } from '@tiptap/core';
  import { editorExtensions } from '$lib/editor';

  export let cacheKey: null | string = null;
  export let tree;
  let element;
  let editor;

  onMount(() => {
    if (cacheKey && tree.nodes.length === 0) {
      // try to load draft from local storage, if any
      tree.nodes = JSON.parse(localStorage.getItem(`editor-${cacheKey}`) || '[]');
    }
    editor = new Editor({
      element: element,
      extensions: editorExtensions,
      content: { type: 'doc', content: tree.nodes },
      onTransaction: () => {
        // force re-render so `editor.isActive` works as expected
        editor = editor;
        let data = editor.getJSON();
        tree = {
          version: 0,
          nodes: data.content || []
        };
        if (cacheKey) {
          localStorage.setItem(`editor-${cacheKey}`, JSON.stringify(data.content || []));
        }
      }
    });
  });

  onDestroy(() => {
    if (editor) {
      editor.destroy();
    }
  });
</script>

<div bind:this={element} />
