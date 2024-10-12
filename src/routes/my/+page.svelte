<script lang="ts">
  import { onMount } from 'svelte';
  import NoteForm from '$lib/components/NoteForm.svelte';
  import RenderedNote from '$lib/components/RenderedNote.svelte';
  import { getByQuery, type NoteDocument, globals } from '$lib/db';

  export let data;

  let notes: NoteDocument[] = [];

  let note: NoteDocument | null = null;

  async function handleUpdate(n: NoteDocument) {
    let found = false;
    note = n;
    for (const [index, element] of notes.entries()) {
      if (element.id === n.id) {
        found = true;
        notes[index] = n;
        notes = notes;
        break;
      }
    }
    if (!found) {
      // creation, we insert the note at the top
      notes = [n, ...notes];
    }
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
    notes = await getByQuery(globals.db.notes, { limit: 20, sort: [{ id: 'desc' }] });
  });
</script>

<main class="wrapper | flex__grow">
  <div class="flex__row | flex__justify-between">
    <button
      class="layout__multi-hidden"
      on:click={() => {
        globals.uiState.set('currentPage', () => 'mainMenu');
      }}
    >
      Menu
    </button>

    <a href="/my/notes/add" class="button | layout__multi-hidden">New note</a>
  </div>
  {#each notes as note}
    {#key note._rev}
      <RenderedNote {note}>
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
  {#if notes.length > 0}
    <button
      on:click={async (e) => {
        let newNotes = await getByQuery(globals.db.notes, {
          limit: 20,
          sort: [{ id: 'desc' }],
          selector: { id: { $lt: notes.slice(-1)[0].id } }
        });
        notes = [...notes, ...newNotes];
      }}>Load more</button
    >
  {/if}
</main>

<aside>
  <section class="wrapper">
    <slot></slot>
    {#key note?.id}
      <NoteForm
        {note}
        on:update={(e) => {
          note = e.detail.note;
        }}
        on:submit={(e) => {
          handleUpdate(note);
          note = null;
        }}
      >
        <div class="flex__row flex__justify-end">
          <button type="submit"> Save and add new </button>
        </div>
      </NoteForm>
    {/key}
  </section>
</aside>
