<script lang="ts">
  import NoteForm from '$lib/components/NoteForm.svelte';
  import RenderedNote from '$lib/components/RenderedNote.svelte';
  import { page } from '$app/stores'
  import { goto } from '$app/navigation';
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

  let noteFormKey = 0

  $: searchQuery = $page.url.searchParams.get('q') || ''; 

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

  function getSelector(q: string) {
    if (!q.trim()) {
      return {};
    }

    let tokens = getQueryTokens(q);
    return { $and: tokensToMangoQuery(tokens) };
  }

  async function getNotes(q: string) {
    return await getByQuery(globals.db.notes, {
      limit: 20,
      sort: [{ id: 'desc' }],
      selector: getSelector(q)
    });
  }

  async function loadNotes (q: string) {
    notes = await getNotes(q)
  }

  $: loadNotes(searchQuery)
  
</script>

<main class="flex__grow">
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
      value={searchQuery}
      on:keydown={
        async (e) => {
          if (e.key === 'Enter') {
            searchQuery = e.target.value.trim()
            let params = updateURLParam($page.url, 'q', searchQuery)
            goto(`?${params.toString()}`)
          }
        }
      }
    />
    <a href="/my/notes/add" class="button | layout__multi-hidden">New note</a>
  </div>
  <div class="wrapper | m__block-3" role="list">
    {#each notes as note}
      {#key note._rev}
        <RenderedNote {note} class="diary__note flow | p__block-3" role="listitem"></RenderedNote>
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
  </div>
</main>

<aside>
  <section class="wrapper">
    <slot></slot>
    {#key noteFormKey}
      <NoteForm
        {note}
        on:update={(e) => {
          note = e.detail.note;
        }}
        on:submit={(e) => {
          handleUpdate(note);
          note = null;
          noteFormKey++
        }}
        on:delete={(e) => {
          note = null;
          noteFormKey++
        }}
      >
        <button type="submit"> Save and add new </button>
      </NoteForm>
    {/key}
  </section>
</aside>
