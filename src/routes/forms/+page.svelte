<script lang="ts">
  import MainNavigation from '$lib/components/MainNavigation.svelte';
  import MainNavigationToggle from '$lib/components/MainNavigationToggle.svelte';
  import DialogForm from '$lib/components/DialogForm.svelte';
  import FormBuilder from '$lib/components/FormBuilder.svelte';
  import FormRendered from '$lib/components/FormRendered.svelte';
  import { goto } from '$app/navigation';

  import { getRandomId, clearSubscriptions } from '$lib/ui';
  import {
    type FormConfiguration,
    type DocumentType,
    createOrUpdateForm,
    globals,
    getNewNote,
    createOrUpdateSetting,
    getSetting,
  } from '$lib/db';
  import { onDestroy } from 'svelte';
  import sortBy from 'lodash/sortBy';

  let editedForm: FormConfiguration | null = $state(null);
  let webhookUrl = $state('')
  let subscriptions = [
    getSetting('settings:form-webhook-url')?.$.subscribe(s => {
      webhookUrl = s?.data?.url || ''
    })
  ]
  let forms: DocumentType = $state([]);
  function loadForms() {
    return globals.db.documents
      .find({
        limit: 20000,
        selector: { type: 'form' }
      })
      .$.subscribe((documents) => {
        forms = sortBy(
          documents.map((d) => {
            return d.toMutableJSON();
          }),
          ['data.name']
        );
      });
  }

  let subscription = null;
  $effect(() => {
    subscription?.unsubscribe();
    subscription = loadForms();
  });

  onDestroy(clearSubscriptions([...subscriptions, subscription]));
</script>

<div class="my__layout">
  <MainNavigation />
  <main>
    <div class="scroll__wrapper">
      <header class="p__inline-3">
        <MainNavigationToggle class="layout__multi-hidden" />
        <h2 class="flex__grow">Forms</h2>

        <DialogForm
          anchorClass="m__inline-2 button"
          anchorText="Add a new form"
          title="Add a new form"
          onopen={() =>
            (editedForm = {
              id: getRandomId().toLowerCase(),
              name: 'My form',
              fields: []
            })}
          onsubmit={async (e: SubmitEvent) => {
            e.preventDefault();
            await createOrUpdateForm(null, editedForm);
            editedForm = null;
          }}
        >
          {#if editedForm}
            <FormBuilder bind:form={editedForm} />
          {/if}
        </DialogForm>
        <DialogForm
          anchorClass="button__discrete button__outlined"
          anchorText="Settings"
          title="Form settings"
          onsubmit={async (e: SubmitEvent) => {
            e.preventDefault();
            await createOrUpdateSetting('settings:form-webhook-url', {url: webhookUrl})
          }}
        >
          <div class="form__field">
            <label for="form-webhook-url">Webhook URL</label>
            <input name="form-webhook-url" id="form-webhook-url" type="url" bind:value={webhookUrl}>
            <p class="form__help">Notify an URL via a POST request when an form entry is created, updated or deleted.</p>
          </div>
        </DialogForm>
      </header>
      <div class="scroll">
        <div class="grid grid__gap">
          {#each forms as form}
            <FormRendered
              elClass="card card__narrow | flow"
              form={form.data}
              id={form.id}
              {webhookUrl}
              onsubmit={async (values: object) => {
                let noteData = getNewNote();
                noteData.fragments = {
                  form: { id: form.data.id, data: values }
                };
                let note = await globals.db.documents.insert(noteData);
                await goto(`/my/notes/${note.id}`);
              }}
            ></FormRendered>
          {/each}
        </div>
      </div>
    </div>
  </main>
</div>
