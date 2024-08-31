<script lang="ts">
  import { buildUniqueId } from '$lib/db';
  import type { Fragment, Note, TextFragment } from '../../ambient.d';
  export let data;
  let files: File[];

  async function handleSubmit() {
    if (confirm('Do you confirm data deletion? This action is irreversible.')) {
      window.localStorage.clear();
      try {
        await data.db.remove();
        location.reload();
      } catch (err) {
        console.log(err);
      }
    }
  }
  function getNoteAndFragmentsFromTempoEntry(entry: object) {
    let created_at = entry.date;
    let note: Note = {
      id: buildUniqueId({
        msecs: new Date(created_at).getTime()
      }),
      created_at: created_at
    };
    if (!entry.text) {
      return null;
    }
    let fragment: TextFragment = {
      id: buildUniqueId({
        msecs: new Date(created_at).getTime()
      }),
      created_at: created_at,
      type: 'text',
      data: { text: entry.text.trim() },
      note_id: note.id
    };
    return [note, fragment];
  }
  async function handleImportTempo() {
    let tempoFile = files[0];
    let content = await tempoFile.text();
    content = JSON.parse(content);
    let entries: [] = content.entries;
    console.log('Found', entries.length, 'entries to import…');

    let notes: Note[] = [];
    let fragments: Fragment[] = [];

    for (const entry of entries) {
      let converted: DBEntry[] | null = getNoteAndFragmentsFromTempoEntry(entry);
      console.log('CONVERTED', converted);
      if (converted) {
        notes.push(converted[0]);
        fragments.push(converted[1]);
      }
    }

    console.log('Ready to import notes: ', notes.length);
    console.log();
    let resultNotes = await data.db.notes.bulkInsert(notes);
    console.log('Ready to import fragments: ', fragments.length);
    let resultFragments = await data.db.fragments.bulkInsert(fragments);
    console.log('Finished import', resultNotes, resultFragments);
  }
</script>

<div class="flex__row">
  <section class="wrapper | flex__grow">
    <a href="/">Back to home</a>
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
</div>
