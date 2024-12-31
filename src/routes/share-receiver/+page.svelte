<script lang="ts">
  import LoadingState from '$lib/components/LoadingState.svelte';
  import MainNavigation from '$lib/components/MainNavigation.svelte';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { globals } from '$lib/db';
  import { delay } from '$lib/ui';

  let isLoading = $state(true);
  onMount(async () => {
    let title = $page.url.searchParams.get('title');
    let text = $page.url.searchParams.get('text');
    let url = $page.url.searchParams.get('url');

    if (!title && !text && !url) {
      console.warn('Empty share');
      await goto('/');
    }
    let noteParts = [];
    if (title) {
      noteParts.push(`# ${title}`);
    }

    if (url) {
      noteParts.push(url);
    }

    if (text) {
      noteParts.push(text);
    }

    let body = noteParts.join('\n\n');

    await globals.uiState.set('sharedNote', () => body);
    await delay(500);
    await goto('/my/notes/add?from=share');
  });
</script>

<div class="my__layout">
  <MainNavigation />
  <main class="p__block-4">
    <LoadingState {isLoading}>Processing share…</LoadingState>
  </main>
</div>
