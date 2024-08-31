<script lang="ts">
  import { renderMarkdown } from '$lib/db';
  import type { Note, Fragment } from '../../ambient.d';
  export let note: Note[];
  export let fragments: Fragment[];
</script>

<article class="diary__note">
  <a href={`/my/notes/${note.id}`}>
    <time datetime={note.created_at}>{note.created_at}</time>
  </a>
  {#if fragments}
    {#each fragments as fragment}
      {#if fragment.type === 'text'}
        {@html renderMarkdown(fragment.data.text)}
      {/if}
    {/each}
  {/if}
</article>
