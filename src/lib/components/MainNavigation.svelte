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
    <ul>
      <li><a href="/my"><IconaMoonPen role="presentation" alt="" /> All notes</a></li>
      <li><a href="/my?o=modified_at:desc"><IconaMoonClock role="presentation" alt="" /> Recently modified</a></li>
      <li><hr></li>
      <li><a href="/board"><IconaMoonApps role="presentation" alt="" /> Board</a></li>
      <li><hr></li>
      <li><a href="/settings"><IconaMoonSettings role="presentation" alt="" /> Settings</a></li>
    </ul>
  </nav>
</aside>
