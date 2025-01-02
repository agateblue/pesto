<script lang="ts">
  import type { FormFieldConfiguration } from '$lib/db';

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

<div class="builder__field flex__row flex__gap flex__equal-size">
  <div class="flow m__block-4">
    <div class="form__field flow">
      <label for={`field-label-${field.id}`}>Label</label>
      <input
        type="text"
        name={`field-label-${field.id}`}
        id={`field-label-${field.id}`}
        bind:value={field.label}
      />
    </div>
    <div class="form__field flow">
      <label for={`field-type-${field.id}`}>Type</label>
      <select name={`field-type-${field.id}`} id={`field-type-${field.id}`} bind:value={field.type}>
        <option value="text">Text</option>
        <option value="number">Number</option>
        <option value="boolean">Yes/no</option>
      </select>
    </div>
    <div class="form__field flow">
      <input
        type="checkbox"
        name={`field-required-${field.id}`}
        id={`field-required-${field.id}`}
        bind:checked={field.required}
      />
      <label for={`field-required-${field.id}`}>This field is required</label>
    </div>

    {#if advanced}
      <div class="form__field flow">
        <label for={`field-id-${field.id}`}>ID</label>
        <input
          type="text"
          name={`field-id-${field.id}`}
          id={`field-id-${field.id}`}
          bind:value={field.id}
        />
        <p class="form__help">
          A unique ID for the field. Used to build visualizations.
        </p>
      </div>
    {/if}
  </div>

  <div class="flow m__block-4">
    <div class="form__field flow">
      <label for={`field-help-${field.id}`}>Help text</label>
      <textarea
        name={`field-help-${field.id}`}
        id={`field-help-${field.id}`}
        class="autoresize"
        bind:value={field.help}
      ></textarea>
      <p class="form__help">A help text that will be displayabed below the field.</p>
    </div>
  </div>
  <div class="flow m__block-4">
    {#if field.type === 'number' || field.type === 'text'}
      <div class="form__field flow">
        <label for={`field-suggestions-${field.id}`}>Suggestions</label>
        <textarea
          name={`field-suggestions-${field.id}`}
          id={`field-suggestions-${field.id}`}
          value={suggestions}
          class="autoresize"
          onkeyup={(e: Event) => {
            field.suggestions = getSuggestions(e.target.value, field.type);
          }}
        ></textarea>
        <p class="form__help">
          Put a suggestion for the field values on each line. They will be available as
          autocomplete.
        </p>
      </div>

      <div class="form__field flow">
        <input
          type="checkbox"
          name={`field-autosuggest-${field.id}`}
          id={`field-autosuggest-${field.id}`}
          bind:checked={field.autosuggest}
        />
        <label for={`field-autosuggest-${field.id}`}
          >Include future entered values in suggestions.</label
        >
      </div>
    {/if}
    <div class="form__field flow m__block-4">
      <button
        type="button"
        class="button__link"
        onclick={(e) => {
          onDelete(e);
        }}>Delete this field</button
      >
    </div>
  </div>
</div>
