<script lang="ts">
  import RenderedNote from '$lib/components/RenderedNote.svelte';
  import NoteForm from '$lib/components/NoteForm.svelte';
  import { createOrUpdate } from '$lib/db';
  export let data;

  let note = data.note;

  async function handleUpdate(n: NoteDocument) {
    note = n;
  }
</script>

<main class="wrapper | flex__grow">
  {#key note._rev}
    <RenderedNote {note}></RenderedNote>
  {/key}
</main>
<aside data-fullpage="true">
  <section class="wrapper">
    <NoteForm
      {note}
      on:update={(e) => {
        handleUpdate(e.detail.note);
      }}
    />
  </section>
</aside>
