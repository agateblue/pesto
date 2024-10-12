<script lang="ts">
  import MainNavigation from '$lib/components/MainNavigation.svelte';
  import { buildUniqueId, type NoteDocType, globals } from '$lib/db';

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
    let created_at: string = entry.date;
    let msecs = Date.parse(created_at)
    let id: string = buildUniqueId({
      msecs,
      random: Array(16).fill(0),
      seq: Number(0),
    })
    let content: string  = entry.text
    let note: NoteDocType = {
      id: id,
      title: null,
      created_at: created_at,
      modified_at: created_at,
      tags: [],
      fragments: {
        text: {
          content
        }
      }
    };
    return note;
  }

  function getNoteFromTempoTask(task: object, doneList: number) {

    // {"subtasks":[{"label":"Et rachat par Audrey","done":false},{"label":"Rachat de soulte","done":false},{"label":"Désolidarisation prêt","done":false}],"date":"2023-04-11T08:21:21.851Z","text":"Demander notaire pour succession maison","list":0,"category":null,"_id":"2023-04-11T08:21:21.851Z","_rev":"5-bd6f820ede5ef5fd8cff29c434d27962"}
    if (!task.text) {
      return null
    }
    let list: number = task.list
    let created_at: string = task.date;
    let msecs = Date.parse(created_at)
    let id: string = buildUniqueId({
      msecs,
      random: Array(16).fill(0),
      seq: Number(0),
    })
    let content: string  = task.text
    let note: NoteDocType = {
      id: id,
      title: null,
      created_at: created_at,
      modified_at: created_at,
      tags: [],
      fragments: {
        todolist: {
          done: list >= doneList,
          title: task.text,
          todos: task.subtasks.map(t => {
            return {
              id: buildUniqueId({
                msecs,
              }),
              done: t.done,
              text: t.label,
            }
          })
        }
      }
    };
    return note;
  }

  async function handleImportTempo() {
    let tempoFile = files[0];
    let content = await tempoFile.text();
    let data: object = JSON.parse(content);
    let entries: [] = data.entries || [];
    let tasks: [] = data?.board?.tasks || [];
    let boardConfig: object = data?.board?.settings || {lists: []};
    let doneList = boardConfig.lists.length

    console.log('Found', entries.length + tasks.length, 'entries to import…');

    let notes: NoteDocument[] = [];

    for (const entry of entries) {
      let converted: NoteDocument | null = getNoteFromTempoEntry(entry);
      console.log('CONVERTED Tempo note', entry, converted);
      if (converted) {
        notes.push(converted);
      }
    }
    for (const task of tasks) {
      let converted: NoteDocument | null = getNoteFromTempoTask(task, doneList);
      console.log('CONVERTED Tempo task', task, converted);
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


