<script lang="ts">
  import IconaMoonTrash from 'virtual:icons/iconamoon/trash';
  import IconaMoonEdit from 'virtual:icons/iconamoon/edit';

  import DialogForm from '$lib/components/DialogForm.svelte';
  import CollectionForm from '$lib/components/CollectionForm.svelte';
  import RenderedNote from '$lib/components/RenderedNote.svelte';
  import LoadingState from '$lib/components/LoadingState.svelte';
  import { type DocumentDocument, globals, getById, type DocumentType, getNoteSelector } from '$lib/db';
  import { clearSubscriptions } from '$lib/ui';
  import { onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import cloneDeep from 'lodash/cloneDeep'
  interface Props {
    searchQuery: string;
    orderQuery: string;
    collection?: DocumentType;
  }
  
  let { searchQuery = $bindable(), orderQuery = $bindable(), collection}: Props = $props();
  
  let notes: DocumentDocument[] = $state([]);
  let matchingCount: number = $state(0);
  let isLoading = $state(false);
  let currentCollection = $state(cloneDeep(collection));
  let editedCollection = $state(cloneDeep(currentCollection));
  let countSubscription = null
  let subscriptions = [];
  const PAGE_SIZE = 20
  function getSortFromOrderQuery(o: string) {
    let field, direction;
    [field, direction] = o.split(':');
    let sort = {};
    sort[field] = direction;
    return sort;
  }

  function loadNotes(q: string, o: string) {
    isLoading = true;
    matchingCount = 0
    notes = [];
    return globals.db.documents
      .find({
        limit: PAGE_SIZE,
        sort: [getSortFromOrderQuery(o)],
        selector: { type: 'note', ...getNoteSelector(q, currentCollection)}
      })
      .$.subscribe((documents) => {
        isLoading = false;
        notes = documents;
        clearSubscriptions([countSubscription])
        countSubscription = globals.db.documents
          .count({
            selector: { type: 'note', ...getNoteSelector(q, currentCollection)}
          })
          .$.subscribe((count) => {
            matchingCount = count;
          }) 
        })
  }
  $effect(() => {
    clearSubscriptions(subscriptions)
    clearSubscriptions([countSubscription])
    subscriptions = loadNotes(searchQuery, orderQuery);
  });

  onDestroy(() => {
    clearSubscriptions(subscriptions);
    clearSubscriptions([countSubscription]);
  });
</script>
<div class="wrapper" role="list" aria-live="polite" aria-busy={isLoading}>
  
  {#if !isLoading}
    <header class="p__block-3 p__inline-3 | flex__row flex__align-center flex__justify-between">
      {#if collection}
        <div class="flex__grow">
          <strong>
            {currentCollection.title} 
          </strong>

          {#snippet editCollectionIcon()}
            <IconaMoonEdit
              role="presentation"
              class=" icon__size-2"
              height="none"
              width="none"
              alt=""
            />
          {/snippet}
          <DialogForm
            anchorClass="button__icon"
            anchorLabel="Edit collection"
            anchor={editCollectionIcon}
            title="Edit collection"
            onopen={(e) => {
              editedCollection = cloneDeep(currentCollection)
            }}
            onsubmit={async (e: SubmitEvent) => {                
              e.preventDefault();
              await globals.db.documents.upsert(cloneDeep(editedCollection))
              currentCollection = editedCollection
              clearSubscriptions(subscriptions)
              subscriptions = loadNotes(searchQuery, orderQuery);
            }}
          > 
            <CollectionForm bind:collection={editedCollection}></CollectionForm>
          </DialogForm>
          {#snippet trashIcon()}
            <IconaMoonTrash
              role="presentation"
              class=" icon__size-2"
              height="none"
              width="none"
              alt=""
            />
          {/snippet}
          <DialogForm
            anchorClass="button__icon"
            anchorLabel={`Delete collection ${collection.title}`}
            anchor={trashIcon}
            title={`Delete collection ${collection.title}`}
            onsubmit={async (e: SubmitEvent) => {
              await globals.db.documents.find({selector: {col: collection.id}}).patch({col: null})
              let document = await getById(globals.db.documents, collection.id);
              await document.remove();
              goto('/my')
              return e.preventDefault();
            }}
          >
            <p>
              Do you want to delete this collection? Associated notes and data will be preserved. This action is
              irreversible.
            </p>
          </DialogForm>
        </div>
      {/if}
      {#if matchingCount >= notes.length}
        <span>
          {matchingCount} notes found
        </span>
      {/if}
    </header>
  {/if}
  <LoadingState {isLoading}>Loading data…</LoadingState>
  {#each notes as note}
    {#key note._rev}
      <RenderedNote
        {note}
        includeHeader={true}
        limitSize={true}
        class="diary__note flow | p__block-3 p__inline-3" role="listitem">
      </RenderedNote>
    {/key}
  {/each}
  {#if notes.length < matchingCount && !isLoading}
    <button
      onclick={async (e) => {
        let newNotes = await globals.db.documents
          .find({
            limit: PAGE_SIZE,
            sort: [getSortFromOrderQuery(orderQuery)],
            selector: {
              type: 'note',
              id: { $lt: notes.slice(-1)[0].id },
              ...getNoteSelector(searchQuery, collection)
            }
          })
          .exec();
        notes = [...notes, ...newNotes];
      }}>Load more</button
    >
  {/if}
</div>
