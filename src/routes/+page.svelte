<script lang="ts">
  import { onMount } from 'svelte';

  import NoteForm from '$lib/components/NoteForm.svelte';

  $: entries = [];

  // onMount(async () => {
  //   let docs = await db.allDocs({
  //     include_docs: true,
  //     limit: 1000,
  //     descending: true
  //   });
  //   entries = docs.rows.map((d) => {
  //     return d.doc;
  //   });
  // });
</script>

<div class="flex__row">
  <section class="wrapper | flex__grow ">
    <NoteForm />
  </section>
</div>
