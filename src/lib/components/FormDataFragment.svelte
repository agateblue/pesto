<script lang="ts">
  import { onDestroy } from 'svelte';
  import { type FormFragmentType, globals } from '$lib/db';

  interface Props {
    fragment: FormFragmentType;
  }

  let { fragment }: Props = $props();

  let fields: string[] = $state(Object.keys(fragment.data));

  let form = globals.forms[fragment.id];
  let fieldsById = {};
  form?.fields.forEach((f) => {
    fieldsById[f.id] = f;
  });

</script>

<table class="table__simpledata">
  <caption>
    <a href={`/my?q=form:${fragment.id}`}>
      {globals.forms[fragment.id]?.name || fragment.id}
    </a>
  </caption>
  <tbody>
    {#each fields as field}
      <tr>
        <td>{fieldsById[field]?.label || field}</td>
        <td>{fragment.data[field]}</td>
      </tr>
    {/each}
  </tbody>
</table>
