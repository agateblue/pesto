<script lang="ts">
  import { onDestroy } from 'svelte';
  import { type FormFragmentType, globals } from '$lib/db';
  import { syncPropertiesWithExternalChanges, clearSubscriptions } from '$lib/ui';

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
  // let subscriptions = [
  //   syncPropertiesWithExternalChanges(fragment.content$, (v) => {content = v})
  // ]
  // onDestroy(clearSubscriptions(subscriptions))
</script>

<table class="table__simpledata">
  <caption>{globals.forms[fragment.id]?.name || fragment.id}</caption>
  <tbody>
    {#each fields as field}
      <tr>
        <td>{fieldsById[field]?.label || field}</td>
        <td>{fragment.data[field]}</td>
      </tr>
    {/each}
  </tbody>
</table>
