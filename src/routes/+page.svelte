<script lang="ts">
  import DiaryForm from '$lib/components/DiaryForm.svelte'
  import DiaryFeedEntry from '$lib/components/DiaryFeedEntry.svelte'
  
  $: entries = [] 

  function saveEntry(event: CustomEvent) {
    let entry = event.detail as DiaryEntry
    entries = [entry, ...entries]
  }
</script>
<h1>Diary</h1>

<DiaryForm on:created={saveEntry} />

{#each entries as entry}
  <DiaryFeedEntry bind:entry={entry} />
{/each}