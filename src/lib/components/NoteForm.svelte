<script lang="ts">
  import FragmentEditor from './FragmentEditor.svelte';
  import { createEventDispatcher } from 'svelte';
  import { type DocumentDocument, type Database, globals } from '$lib/db';
  import { isRxDocument } from 'rxdb';
  import DialogForm from './DialogForm.svelte';
  const dispatch = createEventDispatcher<{
    update: { note: DocumentDocument };
    delete: { note: DocumentDocument };
  }>();

  interface Props {
    note: DocumentDocument | null;
    children?: import('svelte').Snippet;
    onSubmitHandler?: Function;
  }

  let { note, children, onSubmitHandler }: Props = $props();
  let columns: string[] = $state([])

  function handleUpdate(n: DocumentDocument) {
    dispatch('update', { note: n });
  }

  globals.db?.documents.findOne({selector: {id: 'settings:board'}}).$.subscribe(
    (settings) => {
      columns = settings?.data.columns || ['Todo', 'Doing', 'Done']
    }
  )

</script>

<form class="flow" onsubmit={(e) => onSubmitHandler?.(e)}>
  <a href="/my" class="layout__multi-hidden">Go back</a>
  <FragmentEditor
    {note}
    {columns}
    on:update={(e) => {
      handleUpdate(e.detail.note);
    }}
  />
  <div class="flex__row flex__justify-between">
    {@render children?.()}
    {#if note}
      <DialogForm 
        anchorClass="button__link"
        anchorText="Delete..."
        title="Delete this note?"
        onsubmit={(e: SubmitEvent) => {
          e.preventDefault()
          note.remove()
          dispatch('delete', { note });
        }}
      >
        <p>This will remove the note from your diary. This action is irreversible.</p>
      </DialogForm>
      
    {/if}
  </div>
</form>
