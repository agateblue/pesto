<script lang="ts">
  import RenderedNote from '$lib/components/RenderedNote.svelte';
  import NoteForm from '$lib/components/NoteForm.svelte';
  import { createOrUpdate } from '$lib/db';
  import type { Note, Fragment } from '../../../../ambient.d';
  export let data;

  let note = data.note;
  let fragments = data.fragments;

  async function handleUpdate(n: Note, f: Fragment[]) {
    await createOrUpdate(data.db.notes, n.toJSON());

    for (const fragment of f) {
      await createOrUpdate(data.db.fragments, fragment);
    }
    fragments = f;
  }
</script>

<section class="wrapper | flex__grow">
  <RenderedNote {note} {fragments}></RenderedNote>
</section>
<aside>
  <section class="wrapper">
    <NoteForm
      {note}
      {fragments}
      on:update={(e) => {
        handleUpdate(e.detail.note, e.detail.fragments);
      }}
      on:submit={(e) => {
        note = e.detail.note;
        fragments = e.detail.fragments;
      }}
    />
  </section>
</aside>
