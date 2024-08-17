<script lang="ts">
  import { onMount } from 'svelte';
  import PouchDB from 'pouchdb';

  import DiaryForm from '$lib/components/DiaryForm.svelte';
  import DiaryFeedEntry from '$lib/components/DiaryFeedEntry.svelte';

  $: entries = [];

  const db = new PouchDB('pesto');

  async function saveEntry(event: CustomEvent) {
    let entry = event.detail as DiaryEntry;
    let savedEntry = await db.put(entry);
    entry._rev = savedEntry.rev;
    entries = [entry, ...entries];
  }
  onMount(async () => {
    let docs = await db.allDocs({
      include_docs: true,
      limit: 1000,
      descending: true
    });
    entries = docs.rows.map((d) => {
      return d.doc;
    });
  });
</script>

<div class="flex__row">
  <aside class="wrapper">
    <DiaryForm on:created={saveEntry} cacheKey="new" />
  </aside>
  
  <section class="diary | wrapper | flex__grow ">
    {#each entries as entry}
      <DiaryFeedEntry bind:entry />
    {/each}
  </section>
</div>
