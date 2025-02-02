<script lang="ts">
  import { _, _n } from '$lib/i18n/index.svelte';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { globals } from '$lib/db';

  let migrationNeeded: boolean | null = $state(null);
  let migrationState: object | null = $state(null);
  onMount(async () => {
    migrationNeeded = await globals.db.documents.migrationNeeded();
    if (migrationNeeded) {
      globals.db.documents.startMigration(50);
      globals.db.documents.getMigrationState().$.subscribe(
        (state) => {
          migrationState = state;
          console.log('State', state);
          if (state.status === 'DONE') {
            setTimeout(async () => {
              location.reload();
            }, 3000);
          }
        },
        (error) => {
          migrationError = error;
          console.log('HELLO', migrationError);
        }
      );
    } else {
      await goto('/my');
    }
  });
</script>

<div class="my__layout">
  <main>
    <div class="wrapper">
      <header class="p__inline-3">
        <h1>{$_("Chargement de Pesto", "")}</h1>
        {#if migrationNeeded}
          <p>{$_("Préparation des données pour la nouvelle version", "")}</p>
          <div role="status" aria-live="polite">
            {#if migrationState}
              <p>
                {migrationState.status}: Document {migrationState.count.handled}/{migrationState
                  .count.total}
                ({migrationState.count.percent}%)
              </p>
              {#if migrationState.error}
                <p><strong>{migrationState.error.message}</strong></p>
              {/if}
              {#if migrationState.status === 'DONE'}
                <p>{$_("Préparation des données terminée, vous serez redirigé·e sous peu…", "")}</p>
              {/if}
            {/if}
          </div>
        {/if}
      </header>
    </div>
  </main>
</div>
