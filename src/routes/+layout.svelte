<script>
  import '../style.css';
  export const ssr = false;
</script>
<nav>
  <ul class="wrapper">
    <li><a href="/">Write</a></li>
    <li><a href="/diary">Diary</a></li>
    <li><a href="/settings">Settings</a></li>
  </ul>
</nav>
<main>
  <slot></slot>
</main>
