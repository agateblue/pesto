<script lang="ts">
  import { onDestroy } from 'svelte';
  import { type FormFragmentType } from '$lib/db';
  import { syncPropertiesWithExternalChanges, clearSubscriptions } from '$lib/ui';

  
  interface Props {
    fragment: FormFragmentType;
  }
  
  let { fragment }: Props = $props();

  let fields: string[] = $state(Object.keys(fragment.data))

  // let subscriptions = [
  //   syncPropertiesWithExternalChanges(fragment.content$, (v) => {content = v})
  // ]
  // onDestroy(clearSubscriptions(subscriptions))

</script>


<table class="table__simpledata">
  <caption>{fragment.id}</caption>
  <tbody>
    {#each fields as field}
      <tr>
        <td>{field}</td>
        <td>{fragment.data[field]}</td>
      </tr>
    {/each}
  </tbody>
</table>
