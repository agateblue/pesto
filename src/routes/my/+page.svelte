<script lang="ts">
  import { onMount } from 'svelte';
  import NoteForm from '$lib/components/NoteForm.svelte';
  import RenderedNote from '$lib/components/RenderedNote.svelte';
  import debounce from 'lodash/debounce';
  import { page } from '$app/stores'
  import {
    getByQuery,
    type NoteDocument,
    globals,
    getQueryTokens,
    tokensToMangoQuery
  } from '$lib/db';
  import {
    updateURLParam
  } from '$lib/ui'
  export let data;

  let notes: NoteDocument[] = [];

  let note: NoteDocument | null = null;

  let searchQuery: string = $page.url.searchParams.get('q') || ''; 

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

  function getSelector(q: string) {
    if (!q.trim()) {
      return {};
    }

    let tokens = getQueryTokens(q);
    return { $and: tokensToMangoQuery(tokens) };
  }

  async function getNotes() {
    return await getByQuery(globals.db.notes, {
      limit: 20,
      sort: [{ id: 'desc' }],
      selector: getSelector(searchQuery)
    });
  }

  onMount(async () => {
    notes = await getNotes();
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
    <input
      class="flex__grow"
      type="search"
      autocomplete="off"
      name="search"
      id="search"
      placeholder="Search"
      bind:value={searchQuery}
      on:keyup={debounce(
        async (e) => {
          notes = await getNotes();
          updateURLParam(window, 'q', searchQuery)
        },
        500,
        { leading: false, trailing: true, maxWait: 1000 }
      )}
    />
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
          selector: { id: { $lt: notes.slice(-1)[0].id }, ...getSelector(searchQuery) }
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
