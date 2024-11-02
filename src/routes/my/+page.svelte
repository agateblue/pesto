<script lang="ts">
  import { run } from 'svelte/legacy';

  import NoteForm from '$lib/components/NoteForm.svelte';
  import RenderedNote from '$lib/components/RenderedNote.svelte';
  import { page } from '$app/stores'
  import { goto } from '$app/navigation';
  import {
    getByQuery,
    type Document,
    globals,
    getQueryTokens,
    tokensToMangoQuery
  } from '$lib/db';
  import {
    updateURLParam
  } from '$lib/ui'
  let { data, children } = $props();

  let notes: Document[] = $state([]);

  let note: Document | null = $state(null);

  let noteFormKey = $state(0)

  let searchQuery = $state('');
  run(() => {
    searchQuery = $page.url.searchParams.get('q') || '';
  }); 

  async function handleUpdate(n: Document) {
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
    return await getByQuery(globals.db.documents, {
      limit: 20,
      sort: [{ id: 'desc' }],
      selector: getSelector(q)
    });
  }

  async function loadNotes (q: string) {
    notes = await getNotes(q)
  }

  run(() => {
    loadNotes(searchQuery)
  });
  
</script>

<main class="flex__grow">
  <div class="flex__row | flex__justify-between">
    <button
      class="layout__multi-hidden"
      onclick={() => {
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
      onkeydown={async (e) => {
          if (e.key === 'Enter') {
            searchQuery = e.target.value.trim()
            let params = updateURLParam($page.url, 'q', searchQuery)
            goto(`?${params.toString()}`)
          }
        }}
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
        onclick={async (e) => {
          let newNotes = await getByQuery(globals.db.documents, {
            limit: 20,
            sort: [{ id: 'desc' }],
            selector: { type: 'note', id: { $lt: notes.slice(-1)[0].id }, ...getSelector(searchQuery) }
          });
          notes = [...notes, ...newNotes];
        }}>Load more</button
      >
    {/if}
  </div>
</main>

<aside>
  <section class="wrapper">
    {@render children?.()}
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
