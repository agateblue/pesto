<script lang="ts">
  import { globals, syncReplications, getNewCollection } from '$lib/db';
  import MainNavigationLink from './MainNavigationLink.svelte';
  import DialogForm from './DialogForm.svelte';
  import CollectionForm from './CollectionForm.svelte';
  import MainNavigationToggle from '$lib/components/MainNavigationToggle.svelte';
  import IconaMoonSearch from 'virtual:icons/iconamoon/search';
  import IconaMoonSignPlusCircle from 'virtual:icons/iconamoon/sign-plus-circle';
  import IconaMoonSynchronize from 'virtual:icons/iconamoon/synchronize';
  import IconaMoonSettings from 'virtual:icons/iconamoon/settings';
  import IconaMoonApps from 'virtual:icons/iconamoon/apps';
  import IconaMoonClock from 'virtual:icons/iconamoon/clock';
  import IconaMoonFileDocument from 'virtual:icons/iconamoon/file-document';
  import IconaMoonStarFill from 'virtual:icons/iconamoon/star-fill';
  import IconaMoonCategory from 'virtual:icons/iconamoon/category';
  import IconaMoonMenuKebabVerticalSquare from 'virtual:icons/iconamoon/menu-kebab-vertical-square';

  import cloneDeep from 'lodash/cloneDeep'

  import { onDestroy } from 'svelte';
  import { clearSubscriptions } from '$lib/ui';

  let sidebarFullpage = $state(false);
  let isSyncing = $state(false);

  const observable = globals.uiState.get$('currentPage');
  observable.subscribe((newValue) => {
    sidebarFullpage = newValue === 'mainMenu';
  });

  let totalNotes: number | null = $state(null);
  let totalTodos: number | null = $state(null);
  let totalStarred: number | null = $state(null);
  let collections = $state([]);
  let replications: [] = $state([]);
  let newCollection = $state(getNewCollection())

  const subscriptions = [
    globals.uiState.get$('replications').subscribe((newValue) => {
      replications = newValue || []
    }),
    globals.db?.documents
      .count({ selector: { type: 'note' } })
      .$.subscribe((v) => (totalNotes = v)),
    globals.db?.documents
      .count({ selector: { 'fragments.todolist.done': false } })
      .$.subscribe((v) => (totalTodos = v)),
    globals.db?.documents
      .count({ selector: { starred: true } })
      .$.subscribe((v) => (totalStarred = v)),
    globals.db?.documents
      .find({ selector: { type: 'collection' } })
      .$.subscribe((documents) => {
        collections = documents.map(d => d.toMutableJSON())
      })
  ];
  onDestroy(clearSubscriptions(subscriptions));
</script>

<aside data-fullpage={sidebarFullpage}>
  <nav class="nav__main" aria-label="Main menu">
    <header class="flex__row flex__justify-between flex__align-center">
      <MainNavigationToggle class="layout__multi-hidden" />
      <h1 class="m__block-1 p__inline-1 flex__grow">Pesto</h1>

      {#if replications.length > 0}
        <button
          type="button" 
          class="button__icon p__inline-2 m__inline-1"
          aria-label="Synchronize" 
          title="Synchronize"
          onclick={async (e) => {
            isSyncing = true
            await syncReplications(globals.replications)
            setTimeout(() => {
              isSyncing = false
            }, 1000)
          }}
        >
          <IconaMoonSynchronize
            role="presentation"
            class={`icon__size-3 ` + (isSyncing ? 'rotating' : '')}
            height="none"
            width="none"
            alt=""
          />
        </button>
      {/if}
      <a href="/my?action=search" class="button__icon p__inline-2 m__inline-1" aria-label="Search" title="Search">
        <IconaMoonSearch
          role="presentation"
          class=" icon__size-3"
          height="none"
          width="none"
          alt=""
        />
      </a>
      <a href="/settings" class="button__icon p__inline-2 m__inline-1" aria-label="Settings" title="Settings">
        <IconaMoonSettings
          role="presentation"
          class=" icon__size-3"
          height="none"
          width="none"
          alt=""
        />
      </a>
    </header>
    <ul class="flex__column">
      <li class="flex__row flex__justify-between flex__align-center">
        <h2>Notes</h2>
        <a href="/my/notes/add" class="button button__icon"
          ><IconaMoonSignPlusCircle role="presentation" alt="" /><span class="flex__grow"></span
          ></a>
      </li>
      <li>
      </li>
      <li>
        <MainNavigationLink href="/my">
          <IconaMoonCategory role="presentation" alt="" /><span class="flex__grow">All notes</span>
          <span class="badge float__end">{totalNotes}</span>
        </MainNavigationLink>
      </li>
      <li>
        <MainNavigationLink href="/my?q=starred:true">
          <IconaMoonStarFill role="presentation" alt="" /><span class="flex__grow">Starred</span>
          <span class="badge float__end">{totalStarred}</span>
        </MainNavigationLink>
      </li>
      <li>
        <MainNavigationLink href="/my?o=modified_at:desc"
          ><IconaMoonClock role="presentation" alt="" /><span class="flex__grow"
            >Recently modified</span
          ></MainNavigationLink
        >
      </li>
      <li>
        <MainNavigationLink href={`/my?q=is:todo`}>
          <IconaMoonMenuKebabVerticalSquare
            role="presentation"
            alt=""
          />Todos</MainNavigationLink
        >
      </li>
      <li>
        <MainNavigationLink href="/board">
          <IconaMoonApps role="presentation" alt="" /><span class="flex__grow">Board</span>
          <span class="badge float__end">{totalTodos}</span>
        </MainNavigationLink>
      </li>
      <li class="flex__row flex__justify-between flex__align-center">
        <h2>
          Collections
        </h2>

        {#snippet newCollectionIcon()}
          <IconaMoonSignPlusCircle
            role="presentation"
            class=" icon__size-2"
            height="none"
            width="none"
            alt=""
          />
        {/snippet}
        <DialogForm
          anchorClass="button__icon"
          anchorLabel="Add collection"
          anchor={newCollectionIcon}
          title="Add collection"
          onopen={() => {
            newCollection = getNewCollection()
          }}
          onsubmit={async (e: SubmitEvent) => {                
            e.preventDefault();
            await globals.db.documents.upsert(cloneDeep(newCollection))
            newCollection = getNewCollection()
          }}
        > 
          <CollectionForm bind:collection={newCollection}></CollectionForm>
        </DialogForm>

      </li>
      {#each collections as collection, i (i)}
        <li>    
          <MainNavigationLink href={`/my?collection=${collection.id}`}>
            <span class="icon">
              {collection.data.emoji || '📋️'} 
            </span>
            {collection.title}
          </MainNavigationLink>
        </li>
      {/each}
      <li><h2>Data</h2></li>
      <li>
        <MainNavigationLink href="/forms"
          ><IconaMoonFileDocument role="presentation" alt="" /><span class="flex__grow">Forms</span
          ></MainNavigationLink
        >
      </li>
      <li class="p__block-2"></li>
    </ul>
  </nav>
</aside>
