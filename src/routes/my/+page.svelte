<script lang="ts">
  import { onMount } from 'svelte';
  import NoteForm from '$lib/components/NoteForm.svelte';
  import RenderedNote from '$lib/components/RenderedNote.svelte';
  import { getNewNote, getNewTextFragment, getByQuery, type NoteDocument } from '$lib/db';

  export let data;

  let notes: NoteDocument[] = [];

  let note: NoteDocument | null = null

  async function handleUpdate(n: NoteDocument) {
    let found = false
    note = n
    for (const [index, element] of notes.entries()) {
      if (element.id === n.id) {
        found = true
        notes[index] = n
        notes = notes
        break
      }
    }
    if (!found) {
      // creation, we insert the note at the top
      notes = [n, ...notes]
    }
  }

  async function updateNotes() {
    notes = await getByQuery(data.db.notes, { limit: 20, sort: [{ id: 'desc' }] });
  }

  async function askDelete(note: NoteDocument) {
    if (confirm('Do you want to delete this note?')) {
      await note.remove();
      notes = notes.filter((e) => {
        return e.id != note.id;
      });
    }
  }

  onMount(async () => {
    await updateNotes();
  });
</script>

<main class="wrapper | flex__grow">
  {#each notes as note}
  {#key note._rev}
    <RenderedNote {note} db={data.db}>
      <div class="flex__row flex__justify-end | m__block-2" slot="footer">
        <button
          class="button__link"
          on:click={(e) => {
            askDelete(note);
          }}
        >
          Delete
        </button>
      </div>
    </RenderedNote>
    <hr />
  {/key}
  {/each}
</main>

<aside>
  <section class="wrapper">
    <slot></slot>
    {#key note?.id}
      <NoteForm
        {note}
        db={data.db}
        on:update={(e) => {
          handleUpdate(e.detail.note);
        }}
        on:submit={(e) => {
          console.log("HELLO", e)
          note = null
        }}
      >
        <div class="flex__row flex__justify-end">
          <button type="submit"> Save and add new </button>
        </div>
      </NoteForm>
    {/key}
  </section>
</aside>
