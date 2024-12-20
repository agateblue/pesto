<script lang="ts">
  import MainNavigation from '$lib/components/MainNavigation.svelte';
  import MainNavigationToggle from '$lib/components/MainNavigationToggle.svelte';
  import DialogForm from '$lib/components/DialogForm.svelte';
  import FormBuilder from '$lib/components/FormBuilder.svelte';
  import FormRendered from '$lib/components/FormRendered.svelte';

  import { getRandomId, clearSubscriptions } from '$lib/ui';
  import { type FormConfiguration, type DocumentType, createOrUpdateForm, globals } from '$lib/db';
  import { onDestroy } from 'svelte';

  let editedForm: FormConfiguration | null = $state(null);

  let forms: DocumentType = $state([]);
  function loadForms() {
    return globals.db.documents
      .find({
        limit: 20000,
        selector: { type: 'form' }
      })
      .$.subscribe((documents) => {
        forms = documents.map((d) => {
          return d.toMutableJSON();
        });
      });
  }

  let subscription = null;
  $effect(() => {
    subscription?.unsubscribe();
    subscription = loadForms();
  });

  onDestroy(clearSubscriptions([subscription]));
</script>

<div class="my__layout">
  <MainNavigation />
  <main>
    <div class="scroll__wrapper">
      <header class="p__inline-3">
        <MainNavigationToggle class="layout__multi-hidden" />
        <h2 class="flex__grow">Forms</h2>

        <DialogForm
          anchorClass="button"
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
      </header>
      <div class="scroll">
        <div class="grid grid__gap">
          {#each forms as form}
            <FormRendered form={form.data} id={form.id}></FormRendered>
          {/each}
        </div>
      </div>
    </div>
  </main>
</div>
