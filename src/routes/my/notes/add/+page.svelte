<script lang="ts">
  import NoteForm from '$lib/components/NoteForm.svelte';
  import { goto } from '$app/navigation';
</script>

<main class="wrapper | flex__grow">
  <NoteForm note={null}>
    <a href="/my" class="button"> Save </a>
  </NoteForm>
</main>
