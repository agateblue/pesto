<script lang="ts">
  import {db, buildUniqueId} from '$lib/db'
  import type {Note, TextFragment} from '../../ambient.d'

  let files: File[];

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
  function getNoteAndFragmentsFromTempoEntry(entry: object) {
    let created_at = entry.date
    let note: Note = {
      _id: buildUniqueId('note', null, {
        msecs: new Date(created_at).getTime()
      }),
      created_at: created_at,
      modified_at: created_at,
      version: '0',
      title: null,
      tags: []
    }
    if (!entry.text) {
      return [note]
    }
    let fragment: TextFragment = {
      _id: buildUniqueId('fragment', null, {
        msecs: new Date(created_at).getTime()
      }),
      subtype: 'text',
      version: '0',
      text: entry.text.trim(),
      note_id: note._id
    }
    return [note, fragment]
  }
  async function handleImportTempo () {
    let tempoFile = files[0]
    let content = await tempoFile.text()
    content = JSON.parse(content)
    let entries: [] = content.entries
    console.log("Found", entries.length, 'entries to import…')

    let notesAndFragments: DBEntry[] = []

    for (const entry of entries) {
      let converted: DBEntry[] = getNoteAndFragmentsFromTempoEntry(entry)
      notesAndFragments = [...notesAndFragments, ...converted]
      console.log("CONVERTED", converted)
    }
    console.log("Ready to import: ", notesAndFragments.length)

    let result = await db.bulkDocs(notesAndFragments)
    console.log('Finished import', result)
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
      <p>
        Import text entries from Tempo. Other data types are currently unsupported.
      </p>
      <label for="tempo-file">Tempo JSON file</label>
      <input accept=".json,application/json" id="tempo-file" name="tempo-file" type="file" bind:files={files}>
      <div class="flex__row flex__justify-end">
        <button type="submit"> Import </button>
      </div>
    </form>
  </section>
</div>
