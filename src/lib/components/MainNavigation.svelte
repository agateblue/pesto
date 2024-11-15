<script>
  import { globals } from '$lib/db';
  import IconaMoonPen from 'virtual:icons/iconamoon/pen';
  import IconaMoonSettings from 'virtual:icons/iconamoon/settings';
  import IconaMoonApps from 'virtual:icons/iconamoon/apps';
  import IconaMoonClock from 'virtual:icons/iconamoon/clock';

  let sidebarFullpage = $state(false);

  const observable = globals.uiState.get$('currentPage');
  observable.subscribe((newValue) => {
    sidebarFullpage = newValue === 'mainMenu';
  });
</script>

<aside data-fullpage={sidebarFullpage}>
  <nav class="nav__main" aria-label="Main menu">
    <ul class="flow">
      <li><a href="/my"><IconaMoonPen /> All notes</a></li>
      <li><a href="/my?o=modified_at:desc"><IconaMoonClock /> Recently modified</a></li>
      <li><a href="/board"><IconaMoonApps /> Board</a></li>
      <li><a href="/settings"><IconaMoonSettings /> Settings</a></li>
    </ul>
  </nav>
</aside>
