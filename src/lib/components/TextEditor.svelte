<script>
	import { onMount, onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
  import { editorExtensions } from '$lib/editor';
  export let tree
	let element;
	let editor;

	onMount(() => {
		editor = new Editor({
			element: element,
			extensions: editorExtensions,
			content: {type: 'doc', content: tree.nodes},
			onTransaction: () => {
				// force re-render so `editor.isActive` works as expected
				editor = editor;
        let data = editor.getJSON()
        tree = {
          version: 0,
          nodes: data.content,
        }
			},
		});
	});

	onDestroy(() => {
		if (editor) {
			editor.destroy();
		}
	});
</script>

<div bind:this={element} />
