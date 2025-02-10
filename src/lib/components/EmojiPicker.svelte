<script lang="ts">
  import { Picker } from 'emoji-picker-element';
  import { onDestroy, onMount } from 'svelte';
  interface Props {
    onEmojiClick: Function;
  }
  let { onEmojiClick }: Props = $props();

  let el
  // we singleton the emoji picker to avoid 
  // https://github.com/nolanlawson/emoji-picker-element/issues/329
  onMount(() => {
    if (!window._emojipicker) {
      window._emojipicker = new Picker();
      window._emojipicker.dataSource = '/emojis.json';
    } 
    el.appendChild(window._emojipicker);
    window._emojipicker.addEventListener('emoji-click', onEmojiClick);
  })
  onDestroy(() => {
    window._emojipicker.removeEventListener('emoji-click', onEmojiClick)
  })
  

</script>
<div bind:this={el}></div>
