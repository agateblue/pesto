<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { onDestroy } from 'svelte';
  import { type TextType } from '$lib/db';
  import { syncPropertiesWithExternalChanges, clearSubscriptions } from '$lib/ui';

  const dispatch = createEventDispatcher<{
    update: { fragment: TextType };
    delete: {};
  }>();
  
  interface Props {
    fieldId: string;
    fragment: TextType;
  }
  
  let { fieldId, fragment }: Props = $props();
  let content = $state(fragment.content);

  let subscriptions = [
    syncPropertiesWithExternalChanges(fragment.content$, (v) => {content = v})
  ]

  onDestroy(clearSubscriptions(subscriptions))
  function handleChange(content) {
    if (content) {
      dispatch('update', { fragment: { ...fragment, content } });
    } else {
      dispatch('delete', {});
    }
  }
</script>

<h3>
  <label for={fieldId}>Note content</label>
</h3>
<textarea
  id={fieldId}
  class="editor autoresize"
  placeholder="What's on your mind?"
  onkeyup={(e) => handleChange(e.target.value.trim())}
  value={content}
></textarea>
