<script lang="ts">
  import debounce from 'lodash/debounce'
  import TodoListFragmentEditor from './TodoListFragmentEditor.svelte';
  import  { type DocumentDocument, type TodolistType, getNoteUpdateData, formatDateShort } from '$lib/db';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    update: { note: DocumentDocument };
    delete: {};
  }>();

  interface Props {
    note: DocumentDocument;
  }

  let { note }: Props = $props();

  let todolist = $state(note.fragments.todolist)

  async function updateFragment(
    fragment: TodolistType
  ) {
    
    let updateData = {};
    updateData[`fragments.todolist`] = fragment;
    await note.incrementalUpdate({
      $set: getNoteUpdateData(note, updateData)
    });
    note = await note.getLatest();
    dispatch('update', { note });
  }

</script>

<TodoListFragmentEditor
  editText={true}
  fragment={todolist}
  on:update={debounce((event) => updateFragment(event.detail.fragment), 200)}
  on:delete={(event) => updateFragment(undefined)}
/>

<div class="flex__row | flex__justify-end | m__block-2">
  <a href={`/my/notes/${note.id}`}>
    <time datetime={note.created_at}>{formatDateShort(note.created_at)}</time>
  </a>
</div>