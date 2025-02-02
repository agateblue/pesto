<script lang="ts">
  import { _, _n } from '$lib/i18n/index.svelte';
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
      label: $_("Mon champ", ""),
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
  <label for={`form-name-${form.id}`}>{$_("Nom", "")}</label>
  <input
    type="text"
    id={`form-name-${form.id}`}
    name={`form-name-${form.id}`}
    bind:value={form.name}
  />
</div>
{#if advanced}
  <div class="form__field">
    <label for={`form-id-${form.id}`}>{$_("ID", "")}</label>
    <input type="text" id={`form-id-${form.id}`} name={`form-id-${form.id}`} bind:value={form.id} />
    <p class="form__help">{$_("Un identifiant unique pour le formulaire. Utilisé pour construire des visualisations.", "")}</p>
  </div>
{/if}

<div class="form__field">
  <input
    type="checkbox"
    id={`form-advanced-${form.id}`}
    name={`form-advanced-${form.id}`}
    bind:checked={advanced}
  />
  <label for={`form-advanced-${form.id}`}>{$_("Mode avancé", "")}</label>
</div>

<div class="form__field">
  <input
    type="checkbox"
    id={`form-rendered-${form.id}`}
    name={`form-rendered-${form.id}`}
    bind:checked={rendered}
  />
  <label for={`form-rendered-${form.id}`}>{$_("Aperçu du formulaire", "")}</label>
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
    }}>{$_("Ajouter un  nouveau champ", "")}</button
  >
{/if}
