<script lang="ts">
  import RenderedNote from '$lib/components/RenderedNote.svelte';
  export let data;
</script>

<section class="wrapper | flex__grow">
  <RenderedNote note={data.note} fragments={data.fragments} />
</section>
