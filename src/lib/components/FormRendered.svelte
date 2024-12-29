<script lang="ts">
  import FormFieldRendered from '$lib/components/FormFieldRendered.svelte';
  import FormBuilder from '$lib/components/FormBuilder.svelte';
  import DialogForm from '$lib/components/DialogForm.svelte';
  import cloneDeep from 'lodash/cloneDeep';
  import { type FormConfiguration, createOrUpdateForm, globals, getById } from '$lib/db';

  interface Props {
    children: import('svelte').Snippet;
    form: FormConfiguration;
    id: string;
    onsubmit: Function;
    showActions: boolean;
    values?: object;
    elClass?: string;
  }

  let { form, children, id, onsubmit, showActions = true, values, elClass } = $props();

  let v = $state(values || {});
  function setDefaultValues() {
    for (const field of form.fields) {
      v[field.id] = field.default || null;
    }
  }
  if (!values) {
    setDefaultValues();
  }
</script>

<div class={elClass}>
  <div class="flex__row flex__align-top flex__justify-between">
    <h3 class="m__block-0">{form.name}</h3>
    {#if showActions}
      <div>
        <DialogForm
          anchorClass="button button__link"
          anchorText="Edit…"
          title={`Edit form ${form.name}`}
          onsubmit={async (e: SubmitEvent) => {
            await createOrUpdateForm(id, form);
            return e.preventDefault();
          }}
        >
          <FormBuilder bind:form />
        </DialogForm>
        <br />
        <DialogForm
          anchorClass="button button__link"
          anchorText="Delete…"
          title={`Delete form ${form.name}`}
          onsubmit={async (e: SubmitEvent) => {
            let form = await getById(globals.db.documents, id);
            await form.remove();
            return e.preventDefault();
          }}
        >
          <p>
            Do you want to delete this form? Form data won't be deleted. This action is
            irreversible.
          </p>
        </DialogForm>
      </div>
    {/if}
  </div>
  <form
    class="flow"
    onsubmit={(e) => {
      e.preventDefault();
      onsubmit(cloneDeep(v));
    }}
  >
    {#each form.fields as field, i (i)}
      <FormFieldRendered {field} bind:value={v[field.id]} />
    {/each}

    <div class="flex__row flex__justify-between">
      <button type="submit">Save</button>
      <button type="button" class="button__link" onclick={async () => {
        let last = await globals.db.documents.findOne({
          selector: {'fragments.form.id': form.id},
          sort: [{id: 'desc'}]
        }).exec()
        if (last) {
          v = cloneDeep(last.fragments.form.data)
        }
      }}>Use last values</button>
    </div>
    {@render children?.()}
  </form>
</div>
