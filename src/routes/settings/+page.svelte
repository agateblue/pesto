<script lang="ts">
  import PouchDB from 'pouchdb';

  const db = new PouchDB('pesto');

  async function handleSubmit() {
    if (confirm('Do you confirm data deletion? This action is irreversible.')) {
      window.localStorage.clear();
      try {
        await db.destroy();
        location.reload();
      } catch (err) {
        console.log(err);
      }
    }
  }
</script>

<div class="flex__row">
  <section class="wrapper | flex__grow">
    <h1>Clear data</h1>
    <form on:submit|preventDefault={handleSubmit}>
      <p>
        Remove all local data including entries, tasks, settings and drafts. You will be asked for
        confirmation.
      </p>
      <div class="flex__row flex__justify-end">
        <button type="submit"> Remove all data… </button>
      </div>
    </form>
  </section>
</div>
