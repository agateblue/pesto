<script lang="ts">
  import RenderedNote from '$lib/components/RenderedNote.svelte';
  import RenderedNoteHeader from '$lib/components/RenderedNoteHeader.svelte';
  import NoteForm from '$lib/components/NoteForm.svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import type { DocumentDocument } from '$lib/db.js';
  
  let { data } = $props();

  let note: DocumentDocument = $state(data.note);
  let viewQuery: 'detail' | 'edit' = $state('detail');

  $effect(() => {
    viewQuery = $page.url.searchParams.get('view') || 'detail';
  });
  
</script>

{#if note}
  <main class="flex__grow">
    <div class="scroll__wrapper">
      {#key note._rev}
        <RenderedNoteHeader {note} pageHeader={true} />
      {/key}
  
      <div class="scroll">
        {#key note._rev}
          <div class="wrapper p__inline-3">
            <RenderedNote
              {note}
              limitSize={false} 
              class="diary__note flow" 
              onDelete={() => goto('/my')}
              includeHeader={false}
            ></RenderedNote>
          </div>
        {/key}
    </div>
  </main>
  <aside data-fullpage={viewQuery === 'edit'}>
    <NoteForm
      {note}
      on:update={(e) => {
        note = e.detail.note
      }}
      on:delete={(e) => {
        goto('/my');
      }}
    />
  </aside>
{:else}
  <main class="wrapper  p__inline-3 | flex__grow">
    <p>This note doesn't exist.</p>
  </main>
{/if}
