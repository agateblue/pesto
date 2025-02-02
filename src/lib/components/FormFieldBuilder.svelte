<script lang="ts">
  import type { FormFieldConfiguration } from '$lib/db';
  import { _, _n } from '$lib/i18n/index.svelte';

  interface Props {
    field: FormFieldConfiguration;
    onDelete: Function;
    advanced: boolean;
  }
  let { field = $bindable(), onDelete, advanced, value } = $props();
  function getSuggestions(s: string, type: FormFieldConfiguration['type']) {
    let values = s.split('\n');

    return values
      .map((s) => s.trim())
      .filter((s) => {
        return s.length > 0;
      });
  }
  let suggestions = field.suggestions?.join('\n') || '';
</script>

<div class="builder__field">
  <div class="flow m__block-4">
    <div class="flex__row flex__gap">
      <div class="form__field flow">
        <label for={`field-label-${field.id}`}>{$_("Libellé", "")}</label>
        <input
          type="text"
          name={`field-label-${field.id}`}
          id={`field-label-${field.id}`}
          bind:value={field.label}
        />
      </div>
      <div class="form__field flow">
        <label for={`field-type-${field.id}`}>{$_("Type", "Nom")}</label>
        <select name={`field-type-${field.id}`} id={`field-type-${field.id}`} bind:value={field.type}>
          <option value="text">Text</option>
          <option value="number">Number</option>
          <option value="boolean">Yes/no</option>
        </select>
      </div>
    </div>
    {#if advanced}
      <div class="form__field flow">
        <label for={`field-id-${field.id}`}>{$_("ID", "")}</label>
        <input
          type="text"
          name={`field-id-${field.id}`}
          id={`field-id-${field.id}`}
          bind:value={field.id}
        />
        <p class="form__help">
          {$_("Un identifiant unique pour ce champ. Utilisé pour construire des visualisations.", "")}
        </p>
      </div>
    {/if}
    <div class="form__field flow">
      <input
        type="checkbox"
        name={`field-required-${field.id}`}
        id={`field-required-${field.id}`}
        bind:checked={field.required}
      />
      <label for={`field-required-${field.id}`}>{$_("Ce champ est requis", "")}</label>
    </div>

  </div>

  <div class="flow m__block-4">
    <div class="form__field flow">
      <label for={`field-help-${field.id}`}>{$_("Texte d'aide", "")}</label>
      <textarea
        name={`field-help-${field.id}`}
        id={`field-help-${field.id}`}
        class="autoresize"
        bind:value={field.help}
      ></textarea>
      <p class="form__help">{$_("Un texte d'aide qui sera affiché sous le champ.", "")}</p>
    </div>
  </div>
  <div class="flow m__block-4">
    {#if field.type === 'number' || field.type === 'text'}
      <div class="form__field flow">
        <label for={`field-suggestions-${field.id}`}>{$_("Suggestions", "")}</label>
        <textarea
          name={`field-suggestions-${field.id}`}
          id={`field-suggestions-${field.id}`}
          value={suggestions}
          class="autoresize"
          oninput={(e: Event) => {
            field.suggestions = getSuggestions(e.target.value, field.type);
          }}
        ></textarea>
        <p class="form__help">
          {$_("Saisissez une suggestion de valeur sur chaque ligne. Elles seront affichées sous forme d'autocomplétion.", "")}
        </p>
      </div>

      <div class="form__field flow">
        <input
          type="checkbox"
          name={`field-autosuggest-${field.id}`}
          id={`field-autosuggest-${field.id}`}
          bind:checked={field.autosuggest}
        />
        <label for={`field-autosuggest-${field.id}`}>
          {$_("Inclure les futures valeurs saisies dans les suggestions.", "")}
        </label
        >
      </div>
    {/if}
    <div class="form__field flow m__block-4">
      <button
        type="button"
        class="button__link"
        onclick={(e) => {
          onDelete(e);
        }}>
          {$_("Supprimer ce champ", "")}
        </button
      >
    </div>
  </div>
</div>
