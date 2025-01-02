<script lang="ts">
  import FormFieldBuilder from './FormFieldBuilder.svelte';
  import FormFieldRendered from './FormFieldRendered.svelte';
  import { type FormFieldConfiguration, type FormConfiguration } from '$lib/db';
  import { getRandomId } from '$lib/ui';

  interface Props {
    form: FormConfiguration;
  }
  let { form = $bindable(), onDelete } = $props();

  let advanced = $state(false);
  let rendered = $state(false);

  function getNewField() {
    let field: FormFieldConfiguration = {
      id: getRandomId().toLowerCase(),
      label: 'My field',
      required: true,
      type: 'text',
      suggestions: [],
      autosuggest: true,
      help: ''
    };
    return field;
  }
</script>

<div class="form__field">
  <label for={`form-name-${form.id}`}>Name</label>
  <input
    type="text"
    id={`form-name-${form.id}`}
    name={`form-name-${form.id}`}
    bind:value={form.name}
  />
</div>
{#if advanced}
  <div class="form__field">
    <label for={`form-id-${form.id}`}>ID</label>
    <input type="text" id={`form-id-${form.id}`} name={`form-id-${form.id}`} bind:value={form.id} />
    <p class="form__help">A unique ID for the form. Used to build visualizations</p>
  </div>
{/if}

<div class="form__field">
  <input
    type="checkbox"
    id={`form-advanced-${form.id}`}
    name={`form-advanced-${form.id}`}
    bind:checked={advanced}
  />
  <label for={`form-advanced-${form.id}`}>Advanced mode</label>
</div>

<div class="form__field">
  <input
    type="checkbox"
    id={`form-rendered-${form.id}`}
    name={`form-rendered-${form.id}`}
    bind:checked={rendered}
  />
  <label for={`form-rendered-${form.id}`}>Preview form</label>
</div>

<div class="flex__stacking-container">
  {#each form.fields as field, i (i)}
    {#if rendered}
      <FormFieldRendered field={form.fields[i]} formId={form.id} bind:value={form.fields[i].default} />
    {:else}
      <hr />
      <FormFieldBuilder
        bind:field={form.fields[i]}
        onDelete={() => form.fields.splice(i, 1)}
        {advanced}
      />
    {/if}
  {/each}
</div>
{#if !rendered}
  <button
    type="button"
    onclick={(e) => {
      form.fields.push(getNewField());
    }}>Add a new field</button
  >
{/if}
