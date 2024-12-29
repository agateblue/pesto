<script lang="ts">
  import { globals } from '$lib/db';
  import MainNavigationToggle from '$lib/components/MainNavigationToggle.svelte';
  import IconaMoonPen from 'virtual:icons/iconamoon/pen';
  import IconaMoonSettings from 'virtual:icons/iconamoon/settings';
  import IconaMoonApps from 'virtual:icons/iconamoon/apps';
  import IconaMoonClock from 'virtual:icons/iconamoon/clock';
  import IconaMoonFileDocument from 'virtual:icons/iconamoon/file-document';
  import IconaMoonStarFill from 'virtual:icons/iconamoon/star-fill';

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
        <a href="/my"><IconaMoonPen role="presentation" alt="" /> All notes · {totalNotes}</a>
      </li>
      <li>
        <a href="/my?q=starred:true"
          ><IconaMoonStarFill role="presentation" alt="" /> Starred · {totalStarred}</a
        >
      </li>
      <li>
        <a href="/my?o=modified_at:desc"
          ><IconaMoonClock role="presentation" alt="" /> Recently modified</a
        >
      </li>
      <li><hr /></li>
      <li>
        <a href="/board"><IconaMoonApps role="presentation" alt="" /> Board · {totalTodos}</a>
      </li>
      <li><hr /></li>
      <li><a href="/forms"><IconaMoonFileDocument role="presentation" alt="" /> Forms</a></li>
      <li><hr /></li>
      <li><a href="/settings"><IconaMoonSettings role="presentation" alt="" /> Settings</a></li>
    </ul>
  </nav>
</aside>
