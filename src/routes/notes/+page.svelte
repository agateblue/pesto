<script lang="ts">
  import { onMount } from 'svelte';
  import { fetchAllByType, groupById } from '$lib/db'
  import RenderedNote from '$lib/components/RenderedNote.svelte';

  $: notes = [];
  $: fragmentsByNote = {};

  onMount(async () => {
    notes = await fetchAllByType('note') as Note[]
    notes.reverse()
    let fragments = await fetchAllByType('fragment') as Fragment[]
    fragmentsByNote = groupById(fragments, 'note_id')
  });
</script>

<div class="flex__row">
  <section class="wrapper | flex__grow ">
    {#each notes as note}
      <RenderedNote bind:note={note} bind:fragments={fragmentsByNote[note._id]} />
    {/each}
  </section>
</div>
