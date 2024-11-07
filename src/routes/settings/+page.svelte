<script lang="ts">
  import { preventDefault } from 'svelte/legacy';

  import { v4 as uuidv4 } from 'uuid';
  import ReplicationForm from '$lib/components/ReplicationForm.svelte';
  import ReplicationCard from '$lib/components/ReplicationCard.svelte';
  import MainNavigation from '$lib/components/MainNavigation.svelte';
  import {
    type DocumentDocument,
    globals,
    DEFAULT_SIGNALING_SERVER,
    type AnyReplication,
    buildUniqueId,
    createOrUpdateSetting,
  } from '$lib/db';
  import { parseTags } from '$lib/ui';
  import cloneDeep from 'lodash/cloneDeep';




  let boardColumns = $state([])
  let settingsBoard: null | DocumentDocument = $state(null)
  globals.db?.documents.findOne({selector: {id: 'settings:board'}}).$.subscribe((n: DocumentDocument) => {
    settingsBoard = n
    boardColumns = [...settingsBoard?.data?.columns || ['Todo', 'Doing', 'Done']]
  })

  async function saveBoard () {
    let s = await createOrUpdateSetting('settings:board', {columns: boardColumns})
  }
  let replications: AnyReplication[] = $state([]);
  let newReplication = $state(null);
  let files: File[] = $state();
  let replicationType: string = $state('webrtc');
  globals.uiState.get$('replications').subscribe((newValue: AnyReplication[]) => {
    replications = [...(newValue || [])];
  });

  async function handleSubmitReplication(replication: AnyReplication, index: number | null) {
    replications = [...replications];
    if (index === null) {
      replications.push(replication);
    } else {
      // editing an existing replication
      replications[index] = replication;
    }

    replications = [...replications];
    await globals.uiState.set('replications', () => {
      return cloneDeep(replications);
    });
  }

  function getNewReplication(type: 'webrtc' | 'couchdb') {
    if (type === 'webrtc') {
      return {
        type: 'webrtc',
        signalingServer: DEFAULT_SIGNALING_SERVER,
        room: `pesto-${uuidv4()}`,
        push: true,
        pull: true
      };
    }

    if (type === 'couchdb') {
      return {
        type: 'couchdb',
        server: '',
        database: '',
        username: '',
        password: '',
        push: true,
        pull: true
      };
    }
  }
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
      return null;
    }
    let created_at: string = entry.date;
    let msecs = Date.parse(created_at);
    let id: string = buildUniqueId({
      msecs,
      random: Array(16).fill(0),
      seq: Number(0)
    });
    let content: string = entry.text;
    let note: NoteDocType = {
      id: id,
      title: null,
      created_at: created_at,
      modified_at: created_at,
      tags: parseTags(content || '').map((t) => {
        return t.id;
      }),
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
      return null;
    }
    let list: number = task.list;
    let created_at: string = task.date;
    let msecs = Date.parse(created_at);
    let id: string = buildUniqueId({
      msecs,
      random: Array(16).fill(0),
      seq: Number(0)
    });
    let content: string = task.text;
    let note: NoteDocType = {
      id: id,
      type: 'note',
      title: null,
      created_at: created_at,
      modified_at: created_at,
      tags: [],
      fragments: {
        todolist: {
          done: list >= doneList,
          title: task.text,
          column: list >= doneList ? -1 : list,
          todos: task.subtasks.map((t) => {
            return {
              id: buildUniqueId({
                msecs
              }),
              done: t.done,
              text: t.label
            };
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
    let boardConfig: object = data?.board?.settings || { lists: [] };
    let doneList = boardConfig.lists.length;

    console.log('Found', entries.length + tasks.length, 'entries to import…');

    let notes: DocumentDocument[] = [];

    for (const entry of entries) {
      let converted: Document | null = getNoteFromTempoEntry(entry);
      console.debug('CONVERTED Tempo note', entry, converted);
      if (converted) {
        notes.push(converted);
      }
    }

    if (boardConfig?.lists) {
      let newBoardConfig = {columns: boardConfig.lists.map(r => r.label)}
      // Tempo doesn't include the "done" column in the export, we add it manually
      newBoardConfig.columns.push('Done')
      console.log('Importing new board config…', newBoardConfig)
      await createOrUpdateSetting('settings:board', newBoardConfig)

    }
    createOrUpdateSetting
    for (const task of tasks) {
      let converted: DocumentDocument | null = getNoteFromTempoTask(task, doneList);
      console.debug('CONVERTED Tempo task', task, converted);
      if (converted) {
        notes.push(converted);
      }
    }

    console.log('Ready to import notes: ', notes.length);
    console.log();
    let resultNotes = await globals.db.documents.bulkInsert(notes);
    console.log('Finished import', resultNotes);
  }
</script>

<div class="my__layout">
  <MainNavigation />
  <main class="flex__row">
    <section class="wrapper | flex__grow | flow">
      <h1>Board</h1>
      <form
        onsubmit={(e) => {
        saveBoard();
        e.preventDefault()
      }}
      >
        {#each boardColumns as column, i (i)}
        <div class="form__field">
          <label for={`column-${i}`}>Column #{i + 1}</label>
          <input type="text" id={`column-${i}`} name={`column-${i}`} bind:value={boardColumns[i]} />
          {#if i < boardColumns.length - 1 && i > 0}
            <button 
              type="button" 
              onclick={()=> {
                boardColumns.splice(i, 1)
                boardColumns = [...boardColumns]
              }}>Delete</button>
          {/if}
        </div>
        {/each}
        <button 
          type="button" 
          onclick={ () => {
            boardColumns = [
              ...boardColumns.slice(0, boardColumns.length - 1),
              'New column',
              ...boardColumns.slice(-1)
            ]
          }
        }>Add column</button>
        <button type="submit">Update board</button>
      </form>
      <h1>Synchronisation</h1>
      <p>
        Pesto data can be synchronized with other devices. With WebRTC, the data transit only
        between devices and stay safe from third-parties.
      </p>
      {#if replications.length > 0}
        <h2>Existing synchronisations</h2>
        <div class="flow" role="list">
          {#each replications as replication, i (i)}
            <ReplicationCard
              {replication}
              class="card"
              role="listitem"
              on:submit={async (e) => {
                await handleSubmitReplication(e.detail.replication, i);
              }}
              on:delete={async () => {
                replications.splice(i, 1);
                replications = [...replications];
                await globals.uiState.set('replications', () => {
                  return replications;
                });
              }}
            />
          {/each}
        </div>
      {/if}
      {#if newReplication}
        <ReplicationForm
          replication={newReplication}
          on:submit={async (e) => {
            await handleSubmitReplication(e.detail.replication, null);
            newReplication = null;
          }}
        />
      {:else}
        <form
          onsubmit={(e) => {
            newReplication = getNewReplication(replicationType);
          }}
        >
          <div class="form__field">
            <label for="replication-type">Type</label>
            <select name="replication-type" id="replication-type" bind:value={replicationType}>
              <option value="webrtc">WebRTC</option>
              <option value="couchdb">CouchDB</option>
            </select>
          </div>
          <button type="submit">Setup synchronisation…</button>
        </form>
      {/if}

      <h1>Clear data</h1>
      <form onsubmit={preventDefault((e) => handleSubmit())}>
        <p>
          Remove all local data including entries, tasks, settings and drafts. You will be asked for
          confirmation.
        </p>
        <div class="flex__row flex__justify-end">
          <button type="submit"> Remove all data… </button>
        </div>
      </form>

      <h1>Import from Tempo (Beta)</h1>
      <form onsubmit={preventDefault((e) => handleImportTempo())}>
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
