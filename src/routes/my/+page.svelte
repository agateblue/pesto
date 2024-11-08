<script lang="ts">
  import NoteForm from '$lib/components/NoteForm.svelte';
  import RenderedNote from '$lib/components/RenderedNote.svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { type DocumentDocument, globals, getQueryTokens, tokensToMangoQuery } from '$lib/db';
  import { updateURLParam } from '$lib/ui';
  let { data, children } = $props();

  let notes: DocumentDocument[] = $state([]);

  let note: DocumentDocument | null = $state(null);

  let noteFormKey = $state(0);

  let searchQuery = $state('');

  function getSelector(q: string) {
    if (!q.trim()) {
      return {};
    }

    let tokens = getQueryTokens(q);
    return { $and: tokensToMangoQuery(tokens) };
  }

  function loadNotes(q: string) {
    globals.db.documents.find({
      limit: 20,
      sort: [{ id: 'desc' }],
      selector: getSelector(q)
    }).$.subscribe(documents => {
      notes = documents
    });
  }

  $effect(() => {
    searchQuery = $page.url.searchParams.get('q') || '';
    loadNotes(searchQuery);
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
          searchQuery = e.target.value.trim();
          let params = updateURLParam($page.url, 'q', searchQuery);
          goto(`?${params.toString()}`);
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
          let newNotes = await globals.db.documents.find({
            limit: 20,
            sort: [{ id: 'desc' }],
            selector: {
              type: 'note',
              id: { $lt: notes.slice(-1)[0].id },
              ...getSelector(searchQuery)
            }
          }).exec();
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
          note = null;
          noteFormKey++;
        }}
        on:delete={(e) => {
          note = null;
          noteFormKey++;
        }}
      >
        <button type="submit"> Save and add new </button>
      </NoteForm>
    {/key}
  </section>
</aside>
