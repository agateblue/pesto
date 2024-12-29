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
  const subscriptions = [
    globals.db?.documents
      .count({ selector: { type: 'note' } })
      .$.subscribe((v) => (totalNotes = v)),
    globals.db?.documents
      .count({ selector: { 'fragments.todolist.done': false } })
      .$.subscribe((v) => (totalTodos = v)),
    globals.db?.documents
      .count({ selector: { starred: true } })
      .$.subscribe((v) => (totalStarred = v))
  ];
  onDestroy(clearSubscriptions(subscriptions));
</script>

<aside data-fullpage={sidebarFullpage}>
  <nav class="nav__main" aria-label="Main menu">
    <ul>
      <li>
        <MainNavigationToggle class="layout__multi-hidden" />
      </li>
      <li>
        <MainNavigationLink 
          href="/my/notes/add" 
          accesskey="a"><IconaMoonPen role="presentation" alt="" /> New note</MainNavigationLink>
      </li>
      <li>
        <MainNavigationLink 
          href="/my" 
          accesskey="n"><IconaMoonCategory role="presentation" alt="" /> All notes · {totalNotes}</MainNavigationLink>
      </li>
      <li>
        <MainNavigationLink href="/my?q=starred:true" accesskey="s"
          ><IconaMoonStarFill role="presentation" alt="" /> Starred · {totalStarred}</MainNavigationLink>
      </li>
      <li>
        <MainNavigationLink href="/my?o=modified_at:desc" accesskey="m"
          ><IconaMoonClock role="presentation" alt="" /> Recently modified</MainNavigationLink>
      </li>
      <li><hr /></li>
      <li>
        <MainNavigationLink href="/board" accesskey="b"><IconaMoonApps role="presentation" alt="" /> Board · {totalTodos}</MainNavigationLink>
      </li>
      <li><hr /></li>
      <li><MainNavigationLink href="/forms" accesskey="f"><IconaMoonFileDocument role="presentation" alt="" /> Forms</MainNavigationLink></li>
      <li><hr /></li>
      <li><MainNavigationLink href="/settings" accesskey="s"><IconaMoonSettings role="presentation" alt="" /> Settings</MainNavigationLink></li>
    </ul>
  </nav>
</aside>
