<script lang="ts">
  import {renderMarkdown} from '$lib/db'

  export let note: Note[];
  export let fragments: Fragment[];
</script>

<article class="diary__note">
  <!-- {JSON.stringify(fragments)} -->
  <time datetime="{note.created_at}">{note.created_at}</time>
  {#if fragments}
    {#each fragments as fragment}
      {#if fragment.subtype === 'text'} 
        {@html renderMarkdown(fragment.text)}
      {/if}
    {/each}
  {/if}
</article>
