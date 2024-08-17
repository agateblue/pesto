<script lang="ts">
  import { renderHTML } from '$lib/editor';
  export let entry;
</script>

<article class="diary__entry">
  {@html renderHTML(entry.tree.nodes || [])}
  {entry.date}
</article>
