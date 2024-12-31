<script lang="ts">
  import NoteForm from '$lib/components/NoteForm.svelte';

  let { data } = $props();
</script>

<main class="wrapper | flex__grow">
  <NoteForm note={data.note || null}>
    <a href="/my" class="button"> Save </a>
  </NoteForm>
</main>
