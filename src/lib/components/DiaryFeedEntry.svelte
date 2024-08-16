<script lang="ts">
  import { renderHTML } from "$lib/editor";
  export let entry

</script>

<article>
  {@html renderHTML(entry.tree.nodes)}
  {entry.date}
</article>