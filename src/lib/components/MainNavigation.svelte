<script>
  import { globals } from '$lib/db';

  let sidebarFullpage = $state(false);

  const observable = globals.uiState.get$('currentPage');
  observable.subscribe((newValue) => {
    sidebarFullpage = newValue === 'mainMenu';
  });
</script>

<aside data-fullpage={sidebarFullpage}>
  <nav class="nav__main" aria-label="Main menu">
    <ul>
      <li><a href="/">Notes</a></li>
      <li><a href="/board">Board</a></li>
      <li><a href="/settings">Settings</a></li>
    </ul>
  </nav>
</aside>
