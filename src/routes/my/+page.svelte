<script lang="ts">
  import { _, _n } from "$lib/i18n/index.svelte";
  import IconaMoonClose from "virtual:icons/iconamoon/close";

  import MainNavigationToggle from "$lib/components/MainNavigationToggle.svelte";
  import NoteForm from "$lib/components/NoteForm.svelte";
  import NoteList from "$lib/components/NoteList.svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { updateURLParam } from "$lib/ui";
  import { tick } from "svelte";
  import { title } from "$lib/store.js";

  let { data, children } = $props();

  let searchQuery = $state("");
  let orderQuery = $state("id:desc");
  let action = $state("");
  let noteFormKey = $state(0);
  let searchInput: HTMLInputElement;
  function triggerSearch() {
    let params = updateURLParam($page.url.searchParams, [
      { param: "q", value: searchQuery },
      { param: "action", value: "search" }
    ]);
    goto(`?${params.toString()}`);
  }
  $effect(() => {
    if (data.collection?.id) {
      title.set(data.collection.title)
    } else {
      title.set($_("Notes", ""))
    }
    searchQuery = $page.url.searchParams.get("q") || "";
    orderQuery = $page.url.searchParams.get("o") || "id:desc";
    action = $page.url.searchParams.get("action") || "";
    tick().then(() => {
      if (action === "search") {
        searchInput.focus();
      }
    });
  });
</script>

<main class="flex__grow">
  <div class="scroll__wrapper">
    <header class="p__inline-3 hide-for-print">
      <MainNavigationToggle class="layout__multi-hidden" />
      <input
        bind:this={searchInput}
        class="flex__grow"
        type="search"
        autocomplete="off"
        name="search"
        id="search"
        placeholder={$_("Rechercher", "")}
        value={searchQuery}
        onkeydown={async (e) => {
          if (e.key === "Enter") {
            action = "";
            searchQuery = e.target.value.trim();
            triggerSearch();
          }
        }}
      />
      {#if searchQuery.trim()}
        <button
          type="button"
          class="button__icon"
          aria-label={$_("Effacer la recherche", "")}
          onclick={() => {
            searchQuery = "";
            triggerSearch();
          }}
        >
          <IconaMoonClose
            role="presentation"
            class=" icon__size-3"
            height="none"
            width="none"
            alt=""
          />
        </button>
      {/if}
    </header>

    <div class="scroll">
      {#key data.collection?.id + searchQuery}
        <NoteList collection={data.collection} {searchQuery} {orderQuery} />
      {/key}
    </div>
  </div>
</main>

<aside>
  <section>
    {@render children?.()}
    {#key data.collection?.id + noteFormKey}
      <NoteForm
        note={null}
        collection={data.collection?.id || null}
        onSubmitHandler={(e) => {
          noteFormKey++;
          e.preventDefault();
        }}
        on:delete={(e) => {
          noteFormKey++;
        }}
      >
        <button type="submit"> {$_("Enregistrer et rédiger une nouvelle note", "")} </button>
      </NoteForm>
    {/key}
  </section>
</aside>
