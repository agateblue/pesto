<script lang="ts">
  import RenderedNote from '$lib/components/RenderedNote.svelte';
  import NoteForm from '$lib/components/NoteForm.svelte';
  import { goto } from '$app/navigation';
  let { data } = $props();

  let note = $state(data.note);

  async function handleUpdate(n: DocumentDocument) {
    note = n;
  }
</script>

{#if note}
  <main class="wrapper | flex__grow">
    <div class="m__block-4">
      {#key note._rev}
        <RenderedNote {note} limitSize={false} class="diary__note flow" onDelete={() => goto('/my')}
        ></RenderedNote>
      {/key}
    </div>
  </main>
  <aside data-fullpage="true">
    <NoteForm
      {note}
      on:update={(e) => {
        handleUpdate(e.detail.note);
      }}
      on:delete={(e) => {
        goto('/my');
      }}
    />
  </aside>
{:else}
  <main class="wrapper | flex__grow">
    <p>This note doesn't exist.</p>
  </main>
{/if}
