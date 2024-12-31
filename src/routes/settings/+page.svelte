<script lang="ts">
  import { PUBLIC_BUILD_ID } from '$env/static/public';

  import { preventDefault } from 'svelte/legacy';

  import DialogForm from '$lib/components/DialogForm.svelte';
  import FormResult from '$lib/components/FormResult.svelte';
  import ReplicationForm from '$lib/components/ReplicationForm.svelte';
  import ReplicationCard from '$lib/components/ReplicationCard.svelte';
  import MainNavigation from '$lib/components/MainNavigation.svelte';
  import MainNavigationToggle from '$lib/components/MainNavigationToggle.svelte';
  import {
    type DocumentDocument,
    globals,
    createOrUpdateSetting,
    getSettingData,
    DEFAULT_SIGNALING_SERVER,
    type AnyReplication,
    type DocumentType,
    type FormConfiguration,
    createOrUpdateForm
  } from '$lib/db';
  import { tempoToPestoDocument, tempoBlueprintsToPestoForm } from '$lib/replication';
  import { delay, type LogMessage } from '$lib/ui';
  import cloneDeep from 'lodash/cloneDeep';

  let replications: AnyReplication[] = $state([]);
  let newReplication = $state(null);
  let files: FileList = $state();
  let replicationType: string = $state(null);
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
      await globals.db.remove();
      window.indexedDB.databases().then((r) => {
        for (var i = 0; i < r.length; i++) window.indexedDB.deleteDatabase(r[i].name);
      });
      location.reload();
    } catch (err) {
      console.log(err);
    }
  }

  let tempoImportMessages: LogMessage[] = $state([]);

  async function handleImportTempo(messages: LogMessage[]) {
    let tempoFile;
    try {
      tempoFile = files[0];
    } catch {
      return messages.push({ type: 'error', text: 'No file was provided' });
    }

    messages.push({ type: 'info', text: 'Opening file…' });
    let content = await tempoFile.text();
    messages.push({ type: 'info', text: 'File read!' });

    messages.push({ type: 'info', text: 'Parsing file…' });
    let data: object = JSON.parse(content);
    messages.push({ type: 'info', text: 'File parsed!' });

    messages.push({ type: 'info', text: 'File parsed!' });

    let blueprints: object[] = data.blueprints || [];
    messages.push({ type: 'info', text: `${blueprints.length} tempo blueprints to import found` });

    const forms: FormConfiguration[] = tempoBlueprintsToPestoForm(blueprints);
    messages.push({ type: 'info', text: `${blueprints.length} tempo forms to import` });

    for (const form of forms) {
      // skip form with existing watching ids
      let existing = await globals.db?.documents
        .findOne({
          selector: { type: 'form', 'data.id': form.id }
        })
        .exec();
      if (existing) {
        messages.push({ type: 'info', text: `Skipping ${form.id} at it already exists` });
      } else {
        // to avoid clashing ids we wait a few milliseconds
        await createOrUpdateForm(null, form);
        messages.push({ type: 'info', text: `Inserted ${form.id}!` });
      }
    }
    let entries: [] = data.entries || [];
    messages.push({ type: 'info', text: `${entries.length} tempo entries found` });
    let tasks: [] = data?.board?.tasks || [];
    messages.push({ type: 'info', text: `${tasks.length} tempo tasks found` });
    let boardConfig: object = data?.board?.settings;
    let settingsById = {}
    for (const setting of (data.settings || [])) {
      settingsById[setting._id] = setting 
    }
    messages.push({
      type: 'info',
      text: boardConfig
        ? `Tempo board config found: ${JSON.stringify(boardConfig.lists)}`
        : `No board config found`
    });

    let pestoNotes: DocumentDocument[] = [];
    let pestoTasks: DocumentDocument[] = [];

    messages.push({ type: 'info', text: `Loading current board config…` });
    let newBoardConfig = await getSettingData('settings:board', {
      columns: ['Todo', 'Doing', 'Done']
    });
    if (settingsById.aliases) {
      messages.push({ type: 'info', text: `Importing ${settingsById.aliases.length} Tempo aliases…` });
      let collections = settingsById.aliases.value.map(a => {
        return {
          id: a._id,
          name: a.name,
          query: a.query,
        }
      })
      await createOrUpdateSetting('settings:collections', {collections});
    }
    if (boardConfig?.lists) {
      messages.push({ type: 'info', text: `Importing Tempo board config…` });
      // Tempo doesn't include the "done" column in the export, we add it manually
      newBoardConfig.columns = [...boardConfig.lists.map((r) => r.label), 'Done'];
      messages.push({
        type: 'info',
        text: `Importing Tempo board columns: ${newBoardConfig.columns.join(', ')}`
      });
      await createOrUpdateSetting('settings:board', newBoardConfig);
    }

    messages.push({ type: 'info', text: `Importing ${entries.length} entries…` });
    for (const entry of entries) {
      let converted: DocumentType | null = tempoToPestoDocument(
        entry,
        newBoardConfig.columns.length - 1
      );
      // console.debug('CONVERTED Tempo note', entry, converted);
      if (converted && converted.type != 'ignored') {
        pestoNotes.push(converted);
      } else {
        console.debug('Ignored tempo entry', entry, converted);
      }
    }

    for (const task of tasks) {
      let converted: DocumentType | null = tempoToPestoDocument(
        task,
        newBoardConfig.columns.length - 1
      );
      // console.debug('CONVERTED Tempo task', task, converted);
      if (converted && converted.type != 'ignored') {
        pestoTasks.push(converted);
      }
    }

    messages.push({ type: 'info', text: `Saving ${pestoNotes.length} converted Tempo notes…` });
    let resultPestoNotes = await globals.db.documents.bulkInsert(pestoNotes);

    console.debug('Saving notes result:', resultPestoNotes);
    messages.push({
      type: 'warning',
      text: `Ignored ${resultPestoNotes.error.length} unsupported notes or duplicates`
    });
    messages.push({ type: 'info', text: `Saving ${pestoTasks.length} converted Tempo tasks…` });

    let resultPestoTasks = await globals.db.documents.bulkInsert(pestoTasks);
    console.debug('Saving tasks result:', resultPestoTasks);
    messages.push({
      type: 'warning',
      text: `Ignored ${resultPestoTasks.error.length} tasks duplicates`
    });
    messages.push({ type: 'success', text: `Import complete!` });
  }
</script>

<div class="my__layout">
  <MainNavigation />
  <main>
    <div class="scroll__wrapper">
      <header class="p__inline-3">
        <MainNavigationToggle class="layout__multi-hidden" />
        <h2>Settings</h2>
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

          <h1>Import from Tempo (Beta)</h1>
          <form
            id="tempo-import"
            class="flow"
            onsubmit={(e) => {
              e.preventDefault();
              tempoImportMessages = [];
              handleImportTempo(tempoImportMessages);
            }}
          >
            <p>
              Import text entries, tasks and board configuration from Tempo. Other data types are
              currently unsupported.
            </p>
            <div class="form__field">
              <label for="tempo-file">Tempo JSON file</label>
              <input
                accept=".json,application/json"
                id="tempo-file"
                name="tempo-file"
                type="file"
                bind:files
              />
            </div>
            <FormResult messages={tempoImportMessages} forEl="tempo-file" />
            <div class="flex__row flex__justify-end">
              <button type="submit"> Import </button>
            </div>
          </form>

          <h1>Keyboard shortcuts</h1>

          <p>Some keyboard shortcuts are available through <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/accesskey">access keys</a>:</p>
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
