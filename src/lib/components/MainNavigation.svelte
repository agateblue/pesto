<script lang="ts">
  import { globals } from '$lib/db';
  import MainNavigationLink from './MainNavigationLink.svelte';
  import MainNavigationToggle from '$lib/components/MainNavigationToggle.svelte';
  import IconaMoonPen from 'virtual:icons/iconamoon/pen';
  import IconaMoonSettings from 'virtual:icons/iconamoon/settings';
  import IconaMoonApps from 'virtual:icons/iconamoon/apps';
  import IconaMoonClock from 'virtual:icons/iconamoon/clock';
  import IconaMoonFileDocument from 'virtual:icons/iconamoon/file-document';
  import IconaMoonStarFill from 'virtual:icons/iconamoon/star-fill';
  import IconaMoonCategory from 'virtual:icons/iconamoon/category';
  import IconaMoonMenuKebabVerticalSquare from 'virtual:icons/iconamoon/menu-kebab-vertical-square';

  import { onDestroy } from 'svelte';
  import { clearSubscriptions } from '$lib/ui';

  let sidebarFullpage = $state(false);

  const observable = globals.uiState.get$('currentPage');
  observable.subscribe((newValue) => {
    sidebarFullpage = newValue === 'mainMenu';
  });

  let totalNotes: number | null = $state(null);
  let totalTodos: number | null = $state(null);
  let totalStarred: number | null = $state(null);
  let boardColumns = $state([]);
  let collections = $state([]);

  const subscriptions = [
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
      .findOne({ selector: { id: 'settings:board' } })
      .$.subscribe((settings) => {
        let columns = settings?.data.columns || ['Todo', 'Doing', 'Done'];
        boardColumns = columns.map((c) => {
          return { name: c, total: 0 };
        });
        boardColumns.pop();
      }),
    globals.db?.documents
      .findOne({ selector: { id: 'settings:collections' } })
      .$.subscribe((settings) => {
        collections = settings?.toMutableJSON()?.data?.collections || [];
      })
  ];
  onDestroy(clearSubscriptions(subscriptions));
</script>

<aside data-fullpage={sidebarFullpage}>
  <nav class="nav__main" aria-label="Main menu">
    <header class="flex__row flex__justify-between flex__align-center">
      <MainNavigationToggle class="layout__multi-hidden" />
      <h1 class="m__block-1 p__inline-1 flex__grow">Pesto</h1>
      <a href="/settings" class="button__icon p__inline-2" aria-label="Settings" title="Settings" accesskey="s">
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
      <li>
        <MainNavigationLink href="/my/notes/add" accesskey="a"
          ><IconaMoonPen role="presentation" alt="" /><span class="flex__grow">New note</span
          ></MainNavigationLink
        >
      </li>
      <li>
        <MainNavigationLink href="/my" accesskey="n">
          <IconaMoonCategory role="presentation" alt="" /><span class="flex__grow">All notes</span>
          <span class="badge float__end">{totalNotes}</span>
        </MainNavigationLink>
      </li>
      <li>
        <MainNavigationLink href="/my?q=starred:true" accesskey="f">
          <IconaMoonStarFill role="presentation" alt="" /><span class="flex__grow">Starred</span>
          <span class="badge float__end">{totalStarred}</span>
        </MainNavigationLink>
      </li>
      <li>
        <MainNavigationLink href="/my?o=modified_at:desc" accesskey="m"
          ><IconaMoonClock role="presentation" alt="" /><span class="flex__grow"
            >Recently modified</span
          ></MainNavigationLink
        >
      </li>
      <li><h2>To-dos</h2></li>
      <li>
        <MainNavigationLink href="/board" accesskey="b">
          <IconaMoonApps role="presentation" alt="" /><span class="flex__grow">Board</span>
          <span class="badge float__end">{totalTodos}</span>
        </MainNavigationLink>
      </li>
      {#each boardColumns as column, i (i)}
        <li>
          <MainNavigationLink href={`/my?q=is:todo column:${i}`}>
            <IconaMoonMenuKebabVerticalSquare
              role="presentation"
              alt=""
            />{column.name}</MainNavigationLink
          >
        </li>
      {/each}
      {#if collections.length}
        <li>
          <h2>Collections</h2>
        </li>
        {#each collections as collection}
          <li>
            <MainNavigationLink href={`/my?q=${collection.query}`}>
              {collection.name}
            </MainNavigationLink>
          </li>
        {/each}
      {/if}
      <li><h2>Data</h2></li>
      <li>
        <MainNavigationLink href="/forms" accesskey="d"
          ><IconaMoonFileDocument role="presentation" alt="" /><span class="flex__grow">Forms</span
          ></MainNavigationLink
        >
      </li>
      <li class="p__block-2"></li>
    </ul>
  </nav>
</aside>
