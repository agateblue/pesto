<script lang="ts">
  import { onMount } from 'svelte';
  import NoteForm from '$lib/components/NoteForm.svelte';
  import { fetchAllByType, groupById } from '$lib/db';
  import RenderedNote from '$lib/components/RenderedNote.svelte';
  import { getNewNote, createOrUpdate, getNewTextFragment } from '$lib/db';
  import type { Note } from '../../ambient.d';

  export let data;

  $: notes = [];
  $: fragmentsByNote = {};

  let note = getNewNote();
  let fragments = [getNewTextFragment(note._id, '')];

  async function handleUpdate(n: Note, f: Fragment) {
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
  
  async function resetToNewEntry () {
    note = getNewNote()
    fragments = [getNewTextFragment(note._id, '')];
    await updateNotes()
  }
  async function updateNotes() {
    let fragments = (await fetchAllByType('fragment')) as Fragment[];
    fragmentsByNote = groupById(fragments, 'note_id');
    notes = (await fetchAllByType('note')) as Note[];
    notes.reverse();
  }
  onMount(async () => {
    await updateNotes()
  });

</script>


<main class="wrapper | flex__grow">
  {#each notes as note}
    <RenderedNote {note} fragments={fragmentsByNote[note._id]} />
    <hr />
  {/each}
</main>

<aside>
  <section class="wrapper">
    <slot></slot>
    {#if !data.noteId}
      {#key note._id}
        <NoteForm

          {note}
          {fragments}
          on:update={(e) => {
            handleUpdate(e.detail.note, e.detail.fragments);
          }}
          on:submit={(e) => {
            resetToNewEntry()
          }}
        />
      {/key}
    {/if}
  </section>
</aside>
