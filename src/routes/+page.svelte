<script lang="ts">
  import isEqual from 'lodash/isEqual';
  import NoteForm from '$lib/components/NoteForm.svelte';
  import { getNewNote, createOrUpdate, getNewTextFragment } from '$lib/db';
  import { create } from 'lodash';
  import type { Note } from '../ambient';

  let note = getNewNote();
  let fragments = [getNewTextFragment(note._id, 'totototot')];

  async function handleUpdate(n: Note, f: Fragment[]) {
    let rev: string = await createOrUpdate(n);
    if (rev) {
      note._rev = rev;
    }
    for (const fragment of fragments) {
      let rev: string = await createOrUpdate(fragment);
      if (rev) {
        fragment._rev = rev;
      }
    }
  }
</script>

<div class="flex__row">
  <section class="wrapper | flex__grow">
    <NoteForm
      {note}
      {fragments}
      on:update={(e) => {
        handleUpdate(e.detail.note, e.detail.fragments);
      }}
    />
  </section>
</div>
