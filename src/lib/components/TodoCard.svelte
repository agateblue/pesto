<script lang="ts">
  import debounce from 'lodash/debounce';
  import isEmpty from 'lodash/isEmpty';
  import TodoListFragmentEditor from './TodoListFragmentEditor.svelte';
  import {
    type DocumentDocument,
    type TodolistType,
    getNoteUpdateData,
    formatDateShort,
    globals
  } from '$lib/db';
  import { createEventDispatcher } from 'svelte';
  import IconaMoonMoveThin from 'virtual:icons/iconamoon/move-thin';
  import { onDestroy } from 'svelte';
  import { clearSubscriptions } from '$lib/ui';

  const dispatch = createEventDispatcher<{
    delete: { note: DocumentDocument };
  }>();

  interface Props {
    note: DocumentDocument;
    autofocus: boolean;
    dragHandle?: Function;
  }

  let { note, autofocus = false, dragHandle }: Props = $props();

  let deleted = $state(false);

  async function updateFragment(fragment: TodolistType) {
    let updateData = {
      fragments: { ...(note.fragments || {}) }
    };
    if (fragment) {
      updateData.fragments.todolist = fragment;
    }

    note.incrementalUpdate({
      $set: getNoteUpdateData(note, updateData)
    });
  }

  let subscriptions = [
    note.$.subscribe(async (newNote: DocumentDocument) => {
      if (!note.title && isEmpty(newNote.fragments) && !deleted) {
        deleted = true;
        await newNote.incrementalRemove();
      }
    })
  ];
  onDestroy(() => {
    clearSubscriptions(subscriptions);
  });
</script>

<div class="flex__row | flex__justify-between">
  <div class="flow">
    {#if note.title?.trim()}
      <h4>{note.title}</h4>
    {/if}
    <a href={`/my/notes/${note.id}`}>
      <time datetime={note.created_at}>{formatDateShort(note.created_at)}</time>
    </a>
  </div>
  <span use:dragHandle aria-label={`drag-handle for ${note.title || note.fragments?.todolist?.todos[0]?.text}`}>
    <IconaMoonMoveThin role="presentation" alt="" />
  </span>
</div>

<div class="p__block-3">
  <TodoListFragmentEditor
    editText={true}
    fragment={note.fragments.todolist}
    {autofocus}
    on:update={debounce((event) => updateFragment(event.detail.fragment), 200)}
    on:delete={(event) => updateFragment(undefined)}
  />
</div>
