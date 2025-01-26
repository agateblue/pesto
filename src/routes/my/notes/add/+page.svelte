<script lang="ts">
  import NoteForm from '$lib/components/NoteForm.svelte';

  let { data } = $props();
  let key = $state(0)
</script>

<main class="flex__grow">
  <NoteForm note={data.note || null}>
    <a href="/my" class="button" on:delete={(e) => {key++}}> Save </a>
  </NoteForm>
</main>
