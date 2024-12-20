<script lang="ts">
  import FormFieldRendered from '$lib/components/FormFieldRendered.svelte';
  import FormBuilder from '$lib/components/FormBuilder.svelte';
  import DialogForm from '$lib/components/DialogForm.svelte';

  import { type FormConfiguration, createOrUpdateForm, globals, getById } from '$lib/db';
  import { preventDefault } from 'svelte/legacy';
  interface Props {
    children: import('svelte').Snippet;
    form: FormConfiguration;
    id: string;
  }

  let { form, children, id } = $props();
</script>

{#snippet dialogHeaderContent()}
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
    <p>Do you want to delete this form? Form data won't be deleted. This action is irreversible.</p>
  </DialogForm>
{/snippet}

<form class="card card__narrow | flow" action="">
  <div class="flex__row flex__align-center flex__justify-between">
    <h3 class="m__block-0">{form.name} ({form.id})</h3>
    <DialogForm
      anchorClass="button button__link"
      anchorText="Edit"
      title={`Edit form ${form.name}`}
      {dialogHeaderContent}
      onsubmit={async (e: SubmitEvent) => {
        await createOrUpdateForm(id, form);
        return e.preventDefault();
      }}
    >
      <FormBuilder bind:form />
    </DialogForm>
  </div>

  {#each form.fields as field, i (i)}
    <div class="form__field">
      <FormFieldRendered {field} />
    </div>
  {/each}
  {@render children?.()}
</form>
