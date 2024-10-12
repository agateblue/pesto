<script lang="ts">
  import MainNavigation from '$lib/components/MainNavigation.svelte';
  import { buildUniqueId, type NoteDocument, globals } from '$lib/db';

  let files: File[];

  async function handleSubmit() {
    if (confirm('Do you confirm data deletion? This action is irreversible.')) {
      window.localStorage.clear();
      try {
        await globals.db.remove();
        window.indexedDB.databases().then((r) => {
          for (var i = 0; i < r.length; i++) window.indexedDB.deleteDatabase(r[i].name);
        });
        location.reload();
      } catch (err) {
        console.log(err);
      }
    }
  }
  function getNoteFromTempoEntry(entry: object) {
    if (!entry.text) {
      return null
    }
    let created_at = entry.date;
    let msecs = Date.parse(created_at)
    let id = buildUniqueId({
      msecs,
      random: Array(16).fill(0),
      seq: Number(0),
    })
    let note: NoteDocument = {
      id,
      title: null,
      created_at: entry.date,
      modified_at: entry.date,
      fragments: {
        text: {
          content: entry.text
        }
      }
    };
    return note;
  }
  async function handleImportTempo() {
    let tempoFile = files[0];
    let content = await tempoFile.text();
    content = JSON.parse(content);
    let entries: [] = content.entries;
    console.log('Found', entries.length, 'entries to import…');

    let notes: NoteDocument[] = [];

    for (const entry of entries) {
      let converted: NoteDocument | null = getNoteFromTempoEntry(entry);
      console.log('CONVERTED', entry, converted);
      if (converted) {
        notes.push(converted);
      }
    }

    console.log('Ready to import notes: ', notes.length);
    console.log();
    let resultNotes = await globals.db.notes.bulkInsert(notes);
    console.log('Finished import', resultNotes);
  }
</script>


<div class="my__layout">
  <MainNavigation />
  <main class="flex__row">
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
  
      <h1>Import from Tempo (Beta)</h1>
      <form on:submit|preventDefault={handleImportTempo}>
        <p>Import text entries from Tempo. Other data types are currently unsupported.</p>
        <label for="tempo-file">Tempo JSON file</label>
        <input
          accept=".json,application/json"
          id="tempo-file"
          name="tempo-file"
          type="file"
          bind:files
        />
        <div class="flex__row flex__justify-end">
          <button type="submit"> Import </button>
        </div>
      </form>
    </section>
  </main>
</div>


