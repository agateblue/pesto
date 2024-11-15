<script lang="ts">
  import NoteForm from '$lib/components/NoteForm.svelte';
  import NoteList from '$lib/components/NoteList.svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  import { globals } from '$lib/db';
  import { updateURLParam } from '$lib/ui';

  let { data, children } = $props();

  let searchQuery = $state('')
  let orderQuery = $state('id:desc')

  let noteFormKey = $state(0);
  $effect(() => {
    searchQuery = $page.url.searchParams.get('q') || '';
    orderQuery = $page.url.searchParams.get('o') || 'id:desc';
  })


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

  <NoteList {searchQuery} {orderQuery} />
</main>

<aside>
  <section class="wrapper">
    {@render children?.()}
    {#key noteFormKey}
      <NoteForm
        note={null}
        onSubmitHandler={(e) => {
          noteFormKey++;
          e.preventDefault()
        }}
        on:delete={(e) => {
          noteFormKey++;
        }}
      >
        <button type="submit"> Save and add new </button>
      </NoteForm>
    {/key}
  </section>
</aside>
