<script lang="ts">
  import { onMount } from 'svelte';
  import NoteForm from '$lib/components/NoteForm.svelte';
  import RenderedNote from '$lib/components/RenderedNote.svelte';
  import { getNewNote, createOrUpdate, getNewTextFragment, findNotesAndFragments } from '$lib/db';
  import type { Note } from '../../ambient.d';

  export let data;

  $: notes = [];
  $: fragmentsByNote = {};

  let note = getNewNote();
  let fragments = [getNewTextFragment(note.id, '')];

  async function handleUpdate(n: Note, f: Fragment) {
    await createOrUpdate(data.db.notes, n);

    for (const fragment of fragments) {
      await createOrUpdate(data.db.fragments, fragment);
    }
  }

  async function resetToNewEntry() {
    note = getNewNote();
    fragments = [getNewTextFragment(note.id, '')];
    await updateNotes();
  }
  async function updateNotes() {
    let result = await findNotesAndFragments(data.db, { limit: 20, sort: [{ id: 'desc' }] });
    fragmentsByNote = result.fragmentsByNote;
    notes = result.notes;
  }
  onMount(async () => {
    await updateNotes();
  });
</script>

<main class="wrapper | flex__grow">
  {#each notes as note}
    <RenderedNote {note} fragments={fragmentsByNote[note.id]} />
    <hr />
  {/each}
</main>

<aside>
  <section class="wrapper">
    <slot></slot>
    {#if !data.noteId}
      {#key note.id}
        <NoteForm
          {note}
          {fragments}
          on:update={(e) => {
            handleUpdate(e.detail.note, e.detail.fragments);
          }}
          on:submit={(e) => {
            resetToNewEntry();
          }}
        />
      {/key}
    {/if}
  </section>
</aside>
