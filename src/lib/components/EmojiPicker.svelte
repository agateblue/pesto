<script lang="ts">
  import 'emoji-picker-element';
  import type { HTMLBaseAttributes } from 'svelte/elements';

  import { onDestroy, onMount } from 'svelte';
  interface Props extends HTMLBaseAttributes {}

  let { ...restProps }: Props = $props();
</script>

<emoji-picker data-source="/emojis.json" {...restProps}></emoji-picker>
