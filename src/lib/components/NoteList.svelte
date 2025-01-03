<script lang="ts">
  import RenderedNote from '$lib/components/RenderedNote.svelte';
  import LoadingState from '$lib/components/LoadingState.svelte';
  import { type DocumentDocument, globals, getQueryTokens, tokensToMangoQuery } from '$lib/db';
  import { clearSubscriptions } from '$lib/ui';
  import { onDestroy } from 'svelte';

  interface Props {
    searchQuery: string;
    orderQuery: string;
  }

  let { searchQuery = $bindable(), orderQuery = $bindable() }: Props = $props();

  let notes: DocumentDocument[] = $state([]);
  let isLoading = $state(false);

  function getSortFromOrderQuery(o: string) {
    let field, direction;
    [field, direction] = o.split(':');
    let sort = {};
    sort[field] = direction;
    return sort;
  }

  function getSelector(q: string) {
    if (!q.trim()) {
      return {};
    }

    let tokens = q.split(',').map((v) => getQueryTokens(v));
    let selector = {
      $or: tokens.map((t) => {
        return { $and: tokensToMangoQuery(t) };
      })
    };
    return selector;
  }

  function loadNotes(q: string, o: string) {
    isLoading = true;
    notes = [];
    return globals.db.documents
      .find({
        limit: 20,
        sort: [getSortFromOrderQuery(o)],
        selector: { type: 'note', ...getSelector(q) }
      })
      .$.subscribe((documents) => {
        isLoading = false;
        notes = documents;
      });
  }

  let subscription = null;
  $effect(() => {
    subscription?.unsubscribe();
    subscription = loadNotes(searchQuery, orderQuery);
  });

  onDestroy(() => {
    clearSubscriptions([subscription]);
  });
</script>

<div class="wrapper" role="list" aria-live="polite" aria-busy={isLoading}>
  <LoadingState {isLoading}>Loading data…</LoadingState>
  {#if !isLoading && notes.length === 0}
    <p>No note found.</p>
  {/if}
  {#each notes as note}
    {#key note._rev}
      <RenderedNote
        {note}
        includeHeader={true}
        limitSize={true}
        class="diary__note flow | p__block-3" role="listitem">
      </RenderedNote>
    {/key}
  {/each}
  {#if notes.length > 0}
    <button
      onclick={async (e) => {
        let newNotes = await globals.db.documents
          .find({
            limit: 20,
            sort: [getSortFromOrderQuery(orderQuery)],
            selector: {
              type: 'note',
              id: { $lt: notes.slice(-1)[0].id },
              ...getSelector(searchQuery)
            }
          })
          .exec();
        notes = [...notes, ...newNotes];
      }}>Load more</button
    >
  {/if}
</div>
