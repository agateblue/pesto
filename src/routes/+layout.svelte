<script>
  import '../style.css';
  import {
    afterNavigate,
  } from '$app/navigation';

  import {globals} from '$lib/db'
  afterNavigate(() => {
    globals.uiState.set("currentPage", () => null)
  })
</script>

<slot></slot>
