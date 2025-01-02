<script lang="ts">
  import { PUBLIC_BUILD_ID } from '$env/static/public';

  import { preventDefault } from 'svelte/legacy';

  import DialogForm from '$lib/components/DialogForm.svelte';
  import FormResult from '$lib/components/FormResult.svelte';
  import ReplicationForm from '$lib/components/ReplicationForm.svelte';
  import ReplicationCard from '$lib/components/ReplicationCard.svelte';
  import MainNavigation from '$lib/components/MainNavigation.svelte';
  import MainNavigationToggle from '$lib/components/MainNavigationToggle.svelte';
  import { globals, DEFAULT_SIGNALING_SERVER, type AnyReplication } from '$lib/db';
  import { type LogMessage, renderMarkdown, downloadFile } from '$lib/ui';
  import cloneDeep from 'lodash/cloneDeep';
  import {
    handleImportTempo,
    handleImportPesto,
    handleExportPesto,
    handleExportTempo
  } from '$lib/replication';

  let replications: AnyReplication[] = $state([]);
  let newReplication = $state(null);

  let importFiles: FileList | null = $state(null);
  let importMessages: LogMessage[] = $state([]);
  let importType: 'tempo' | 'pesto' = $state('pesto');
  let importTypes = $state({
    tempo: {
      name: 'Tempo',
      help: `
Import from a Tempo JSON file. Visualizations are not supported yet.
      `,
      flags: [
        {
          id: 'entries',
          label: 'Import entries',
          value: true
        },
        {
          id: 'tasks',
          label: 'Import tasks and board',
          value: true
        },
        {
          id: 'forms',
          label: 'Import forms',
          value: true
        },
        {
          id: 'aliases',
          label: 'Import aliases (as collections)',
          value: true
        }
      ],
      handler: handleImportTempo
    },
    pesto: {
      name: 'Pesto',
      help: `
Import from a Pesto JSON file. This is a way to restore a full backup made from another Pesto session. 
      `,
      flags: [
        {
          id: 'notes',
          label: 'Import entries',
          value: true
        },
        {
          id: 'forms',
          label: 'Import forms',
          value: true
        },
        {
          id: 'settings',
          label: 'Import settings',
          value: true
        }
      ],
      handler: handleImportPesto
    }
  });

  let exportMessages: LogMessage[] = $state([]);
  let exportType: 'pesto' = $state('pesto');
  let exportTypes = $state({
    pesto: {
      name: 'Pesto',
      help: `
Export to a Pesto JSON file, creating a full or partial backup depending on your needs. 
      `,
      flags: [
        {
          id: 'notes',
          label: 'Export entries',
          value: true
        },
        {
          id: 'forms',
          label: 'Export forms',
          value: true
        },
        {
          id: 'settings',
          label: 'Export settings',
          value: true
        }
      ],
      handler: handleExportPesto
    },
    tempo: {
      name: 'Tempo',
      help: `
Export to a Tempo JSON file. 
      `,
      flags: [
        {
          id: 'entries',
          label: 'Export entries',
          value: true
        },
        {
          id: 'tasks',
          label: 'Export tasks and board',
          value: true
        }
      ],
      handler: handleExportTempo
    }
  });

  let replicationType: string | null = $state(null);
  globals.uiState.get$('replications').subscribe((newValue: AnyReplication[]) => {
    replications = [...(newValue || [])].map((t) => cloneDeep(t));
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
      return replications.map((t) => cloneDeep(t));
    });
  }

  function getNewReplication(type: 'webrtc' | 'couchdb' | 'couchdb-tempo') {
    if (type === 'webrtc') {
      return {
        type: 'webrtc',
        signalingServer: DEFAULT_SIGNALING_SERVER,
        room: `pesto-${new Date().toISOString()}`,
        push: true,
        pull: true
      };
    }

    let baseCouchDb = {
      type: 'couchdb',
      server: '',
      database: '',
      username: '',
      password: '',
      push: true,
      pull: true
    };
    if (type === 'couchdb') {
      return { ...baseCouchDb, type: 'couchdb' };
    }
    if (type === 'couchdb-tempo') {
      return { ...baseCouchDb, type: 'couchdb-tempo' };
    }
  }
  async function handleSubmit() {
    window.localStorage.clear();
    try {
      await globals.db?.remove();
      await globals.db?.close();
      window.indexedDB.databases().then((r) => {
        for (var i = 0; i < r.length; i++) window.indexedDB.deleteDatabase(r[i].name);
      });
      location.reload();
    } catch (err) {
      console.log(err);
    }
  }
</script>

<div class="my__layout">
  <MainNavigation />
  <main>
    <div class="scroll__wrapper">
      <header class="flex__row flex__justify-between flex__align-center p__inline-3">
        <MainNavigationToggle class="layout__multi-hidden" />
        <h2 class="flex__grow">Settings</h2>
      </header>
      <section class="flow | scroll">
        <div class="wrapper">
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
                  bind:replication={replications[i]}
                  class="card"
                  role="listitem"
                  on:submit={async (e) => {
                    await handleSubmitReplication(e.detail.replication, i);
                  }}
                  on:delete={async () => {
                    replications.splice(i, 1);
                    replications = [...replications];
                    await globals.uiState.set('replications', () => {
                      return replications.map((t) => cloneDeep(t));
                    });
                  }}
                />
              {/each}
            </div>
          {/if}
          <DialogForm
            anchorClass="button"
            anchorText="Setup synchronisation…"
            title="Setup a new synchronisation"
            onsubmit={async (e: SubmitEvent) => {
              e.preventDefault();
              await handleSubmitReplication(newReplication, null);
              newReplication = null;
              replicationType = null;
            }}
          >
            <div class="form__field">
              <label for="replication-type">Type</label>
              <select
                name="replication-type"
                id="replication-type"
                bind:value={replicationType}
                onchange={() => {
                  newReplication = getNewReplication(replicationType);
                }}
              >
                <option value={null}>---</option>
                <option value="webrtc">WebRTC</option>
                <option value="couchdb">CouchDB</option>
                <option value="couchdb-tempo">CouchDB (with Tempo compatibility)</option>
              </select>
            </div>
            {#if newReplication}
              <ReplicationForm bind:replication={newReplication} />
            {/if}
          </DialogForm>

          <form
            id="export"
            class="flow m__block-3"
            onsubmit={async (e) => {
              e.preventDefault();
              exportMessages = [];
              let flags = {};
              for (const flag of exportTypes[exportType].flags) {
                flags[flag.id] = flag.value;
              }
              let data = await exportTypes[exportType].handler(exportMessages, flags);
              let d = new Date().toISOString().slice(0, 16);
              let filename = `pesto_to_${exportType}_${d}.json`;
              downloadFile(JSON.stringify(data, null, 2), 'application/json', filename);
            }}
          >
            <h1>Export data</h1>
            <p>
              Export data from Pesto. This can be used to create a backup or convert Pesto data to
              other applications.
            </p>
            <div class="form__field">
              <label for="export-format">Export format</label>
              <select name="export-format" id="export-format" bind:value={exportType}>
                <option value="pesto">Pesto</option>
                <option value="tempo">Tempo</option>
              </select>
            </div>

            {#if exportType}
              {@html renderMarkdown(exportTypes[exportType].help)}

              {#if exportTypes[exportType].flags.length > 0}
                {#each exportTypes[exportType].flags as flag, i (i)}
                  <div class="form__field">
                    <input
                      type="checkbox"
                      name={`export-flag-${flag.id}`}
                      id={`export-flag-${flag.id}`}
                      bind:checked={exportTypes[exportType].flags[i].value}
                    />
                    <label for={`export-flag-${flag.id}`}>{flag.label}</label>
                  </div>
                {/each}
              {/if}
              <FormResult messages={exportMessages} forEl="export-format" />
              <div class="flex__row flex__justify-end">
                <button type="submit"> Export </button>
              </div>
            {/if}
          </form>

          <form
            id="import"
            class="flow m__block-3"
            onsubmit={(e) => {
              e.preventDefault();
              importMessages = [];
              let flags = {};
              for (const flag of importTypes[importType].flags) {
                flags[flag.id] = flag.value;
              }
              importTypes[importType].handler(importFiles, importMessages, flags);
            }}
          >
            <h1>Import data</h1>
            <p>
              Import data into Pesto from another source. Duplicates are discarded and your local
              Pesto data will always be preserved in case of a conflict.
            </p>
            <div class="form__field">
              <label for="import-source">Import source</label>
              <select name="import-source" id="import-source" bind:value={importType}>
                <option value="pesto">Pesto</option>
                <option value="tempo">Tempo</option>
              </select>
            </div>

            {#if importType}
              {@html renderMarkdown(importTypes[importType].help)}
              <div class="form__field">
                <label for="import-file">Select the import file</label>
                <input
                  accept=".json,application/json"
                  id="import-file"
                  name="import-file"
                  type="file"
                  bind:files={importFiles}
                />
              </div>
              {#if importTypes[importType].flags.length > 0}
                {#each importTypes[importType].flags as flag, i (i)}
                  <div class="form__field">
                    <input
                      type="checkbox"
                      name={`import-flag-${flag.id}`}
                      id={`import-flag-${flag.id}`}
                      bind:checked={importTypes[importType].flags[i].value}
                    />
                    <label for={`import-flag-${flag.id}`}>{flag.label}</label>
                  </div>
                {/each}
              {/if}
              <FormResult messages={importMessages} forEl="import-file" />
              <div class="flex__row flex__justify-end">
                <button type="submit"> Import </button>
              </div>
            {/if}
          </form>

          <h1>Keyboard shortcuts</h1>

          <p>
            Some keyboard shortcuts are available through <a
              href="https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/accesskey"
              >access keys</a
            >:
          </p>
          <ul>
            <li>
              <kbd>a</kbd> : Add a new note
            </li>
            <li>
              <kbd>n</kbd> : List notes
            </li>
            <li>
              <kbd>f</kbd> : List starred notes
            </li>
            <li>
              <kbd>m</kbd> : List last modified notes
            </li>
            <li>
              <kbd>b</kbd> : View board page
            </li>
            <li>
              <kbd>d</kbd> : View forms/data entry page
            </li>
            <li>
              <kbd>s</kbd> : View settings page
            </li>
            <li>
              <kbd>w</kbd> : On note edition page, focus the note field
            </li>
            <li>
              <kbd>t</kbd> : On note edition page, focus the task field
            </li>
            <li>
              <kbd>r</kbd> : On note edition page, open the deletion modal
            </li>
          </ul>
          <h1>Clear data</h1>

          <p>You can remove all your Pesto data if needed. You will be asked for confirmation</p>
          <DialogForm
            anchorClass="button"
            anchorText="Remove all data…"
            title="Remove all Pesto data?"
            onsubmit={(e: SubmitEvent) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <p>
              Remove all local data including entries, tasks, settings and drafts. This action is
              irreversible.
            </p>
          </DialogForm>

          <h1>Application information</h1>
          <p>Build ID: {PUBLIC_BUILD_ID}</p>
        </div>
      </section>
    </div>
  </main>
</div>
