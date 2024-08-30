<script lang="ts">
  import RenderedNote from '$lib/components/RenderedNote.svelte';
  export let data;
</script>

<section class="wrapper | flex__grow ">
  <RenderedNote bind:note={data.note} bind:fragments={data.fragments} />
</section>
