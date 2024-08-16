<script lang="ts">
  import DiaryForm from '$lib/components/DiaryForm.svelte'
  import DiaryFeed from '$lib/components/DiaryFeed.svelte'

  $: entries = [] 

  function saveEntry(event: CustomEvent) {
    let entry = event.detail
    entries = [entry, ...entries]
  }
</script>
<h1>Diary</h1>

<DiaryForm on:created={saveEntry} />
<DiaryFeed entries={entries} />