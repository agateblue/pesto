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

  let deleted = $state(false)

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
  }
  note.$.subscribe(async (newNote: DocumentDocument) => {
    if (isEmpty(newNote.fragments) && !deleted) {
      deleted = true
      await newNote.incrementalRemove()
    }
  });
</script>

<div class="flex__row | flex__justify-between">
  <a href={`/my/notes/${note.id}`}>
    <time datetime={note.created_at}>{formatDateShort(note.created_at)}</time>
  </a>
  <span use:dragHandle aria-label={`drag-handle for ${note.fragments.todolist?.title}`} >
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
