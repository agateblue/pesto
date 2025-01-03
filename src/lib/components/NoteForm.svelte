<script lang="ts">
  import IconaMoonTrash from 'virtual:icons/iconamoon/trash';
  import IconaMoonEye from 'virtual:icons/iconamoon/eye';
  import FragmentEditor from './FragmentEditor.svelte';
  import MainNavigationToggle from './MainNavigationToggle.svelte';
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
  let columns: string[] = $state([]);

  function handleUpdate(n: DocumentDocument) {
    dispatch('update', { note: n });
  }

  globals.db?.documents.findOne({ selector: { id: 'settings:board' } }).$.subscribe((settings) => {
    columns = settings?.data.columns || ['Todo', 'Doing', 'Done'];
  });
</script>

<div class="scroll__wrapper">
  <header class="flex__row flex__justify-between flex__align-center p__inline-3">
    <MainNavigationToggle class="layout__multi-hidden" />
    <h2 class="flex__grow">
      {#if note}
        Edit note
      {:else}
        New note
      {/if}
    </h2>

    {#if note}
      <div>
        <a
          class="button__icon button layout__multi-hidden"
          href={`/my/notes/${note.id}?view=detail`}
          aria-label="View note"
        >
          <IconaMoonEye
            role="presentation"
            alt=""
            class=" icon__size-3"
            height="none"
            width="none"
          />
        </a>
        {#snippet trashIcon()}
          <IconaMoonTrash
            role="presentation"
            class=" icon__size-3"
            height="none"
            width="none"
            alt=""
          />
        {/snippet}
        <DialogForm
          anchorClass="button__icon"
          anchorLabel="Delete note"
          anchor={trashIcon}
          title="Delete this note?"
          accesskey="r"
          onsubmit={(e: SubmitEvent) => {
            e.preventDefault();
            note.remove();
            dispatch('delete', { note });
          }}
        >
          <p>This will remove the note from your diary. This action is irreversible.</p>
        </DialogForm>
      </div>
    {/if}
  </header>
  <form class="flow | scroll" onsubmit={(e) => onSubmitHandler?.(e)}>
    <div class="wrapper p__inline-3">
      <FragmentEditor
        {note}
        {columns}
        on:update={(e) => {
          handleUpdate(e.detail.note);
        }}
      />
      <div class="flex__row flex__justify-between">
        {@render children?.()}
      </div>
    </div>
  </form>
</div>
