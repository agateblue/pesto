<script lang="ts">
  import debounce from 'lodash/debounce'
  import isEmpty from 'lodash/isEmpty'
  import TodoListFragmentEditor from './TodoListFragmentEditor.svelte';
  import  { type DocumentDocument, type TodolistType, getNoteUpdateData, formatDateShort, globals } from '$lib/db';
  import { createEventDispatcher } from 'svelte';
  import IconaMoonMoveThin from 'virtual:icons/iconamoon/move-thin';

  const dispatch = createEventDispatcher<{
    delete: { note: DocumentDocument };
  }>();

  interface Props {
    note: DocumentDocument;
    autofocus: boolean;
    dragHandle?: Function;
  }

  let { note, autofocus = false, dragHandle }: Props = $props();

  let todolist = $state(note.fragments.todolist)

  async function updateFragment(
    fragment: TodolistType
  ) {
    
    let updateData = {
      fragments: {...note.fragments || {}}
    };
    if (fragment) {
      updateData.fragments.todolist = fragment;
    } else {
      delete updateData.fragments.todolist
    }

    note.incrementalUpdate({
      $set: getNoteUpdateData(note, updateData),
    });
    
    note.get$('fragments').subscribe(fragments => {
      if (isEmpty(fragments)) {
        dispatch('delete', { note });
      } else {
        dispatch('update', { note });
      }
    });
</script>

<div class="flex__row | flex__justify-between">
  <span use:dragHandle aria-label={`drag-handle for ${todolist?.title}`} >
    <IconaMoonMoveThin  />
  </span>
  <a href={`/my/notes/${note.id}`}>
    <time datetime={note.created_at}>{formatDateShort(note.created_at)}</time>
  </a>
</div>


<TodoListFragmentEditor
  editText={true}
  fragment={todolist}
  {autofocus}
  on:update={debounce((event) => updateFragment(event.detail.fragment), 200)}
  on:delete={(event) => updateFragment(undefined)}
/>
