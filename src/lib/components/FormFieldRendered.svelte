<script lang="ts">
  import { formatDate, type FormFieldConfiguration } from '$lib/db';
  interface Props {
    children: import('svelte').Snippet;
    field: FormFieldConfiguration;
    label?: string;
    value?: boolean | number | string;
  }

  let { field, label, children, value = $bindable() } = $props();
</script>

<div class="form__field">
  {#if field.type === 'text' || field.type === 'number'}
    <label for={`field-${field.id}`}>{label || field.label}</label>
    <input
      id={`field-${field.id}`}
      name={`field-${field.id}`}
      type="text"
      list={`field-autocomplete-${field.id}`}
      bind:value
    />
    <datalist id={`field-autocomplete-${field.id}`}>
      {#each field.suggestions as suggestion}
        <option value={suggestion}>{suggestion}</option>
      {/each}
    </datalist>
  {/if}
  {#if field.type === 'boolean'}
    <input
      id={`field-${field.id}`}
      name={`field-${field.id}`}
      type="checkbox"
      bind:checked={value}
    />
    <label for={`field-${field.id}`}>{field.label}</label>
  {/if}
  {#if field.help}
    <p class="form__help">{field.help}</p>
  {/if}

  {@render children?.()}
</div>
