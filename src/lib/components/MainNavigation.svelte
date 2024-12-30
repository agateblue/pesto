<script lang="ts">
  import { globals } from '$lib/db';
  import MainNavigationLink from './MainNavigationLink.svelte'
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
  let boardColumns = $state([])

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
    globals.db?.documents.findOne({ selector: { id: 'settings:board' } }).$.subscribe((settings) => {
      let columns = settings?.data.columns || ['Todo', 'Doing', 'Done'];
      boardColumns = columns.map(c => {return {name: c, total: 0}})
      boardColumns.pop()
      // for (var i=0; i < columns.length; i++) {
        
      // }
    }),
  ];
  onDestroy(clearSubscriptions(subscriptions));
</script>

<aside data-fullpage={sidebarFullpage}>
  <nav class="nav__main" aria-label="Main menu">
    <ul class="flex__column">
      <li>
        <MainNavigationToggle class="layout__multi-hidden" />
      </li>
      <li><h2>Diary</h2></li>
      <li>
        <MainNavigationLink 
          href="/my/notes/add" 
          accesskey="a"><IconaMoonPen role="presentation" alt="" /> New note</MainNavigationLink>
      </li>
      <li>
        <MainNavigationLink 
          href="/my" 
          accesskey="n">
            <IconaMoonCategory role="presentation" alt="" /> 
              All notes <span class="badge float__end">{totalNotes}</span>
        </MainNavigationLink>
      </li>
      <li>
        <MainNavigationLink href="/my?q=starred:true" accesskey="f"
          >
          <IconaMoonStarFill role="presentation" alt="" />
          Starred 
          <span class="badge float__end">{totalStarred}</span>
        </MainNavigationLink>
      </li>
      <li>
        <MainNavigationLink href="/my?o=modified_at:desc" accesskey="m"
          ><IconaMoonClock role="presentation" alt="" /> Recently modified</MainNavigationLink>
      </li>
      <li><h2>To-dos</h2></li>
      <li>
        <MainNavigationLink href="/board" accesskey="b">
          <IconaMoonApps role="presentation" alt="" />
            Board
            <span class="badge float__end">{totalTodos}</span>
        </MainNavigationLink>
      </li>
      {#each boardColumns as column, i (i)}
      <li>
        <MainNavigationLink href={`/my?q=is:todo column:${i}`}>
          <IconaMoonMenuKebabVerticalSquare role="presentation" alt="" />{column.name}</MainNavigationLink>
      </li>
      {/each}
      <li><h2>Data</h2></li>
      <li><MainNavigationLink href="/forms" accesskey="d"><IconaMoonFileDocument role="presentation" alt="" /> Forms</MainNavigationLink></li>
      <li class="flex__grow"></li>
      <li><hr /></li>
      <li><MainNavigationLink href="/settings" accesskey="s"><IconaMoonSettings role="presentation" alt="" /> Settings</MainNavigationLink></li>
    </ul>
  </nav>
</aside>
