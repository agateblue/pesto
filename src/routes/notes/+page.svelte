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


<section class="wrapper | flex__grow ">
  {#each notes as note}
    <RenderedNote note={note} fragments={fragmentsByNote[note._id]} />
    <hr>
  {/each}
</section>
