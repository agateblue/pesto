<script lang="ts">
  import debounce from 'lodash/debounce';
  import TextFragmentEditor from './TextFragmentEditor.svelte';
  import TodoListFragmentEditor from './TodoListFragmentEditor.svelte';
  import {
    globals,
    buildUniqueId,
    getNewNote,
    getNewTextFragment,
    getNewTodoListFragment,
    getNoteUpdateData,
    type DocumentDocument,
    type TextType,
    type TodolistType,
    type Database
  } from '$lib/db';
  import { createEventDispatcher } from 'svelte';
  import IconaMoonCheckSquare from 'virtual:icons/iconamoon/check-square';
  import IconaMoonPen from 'virtual:icons/iconamoon/pen';

  const dispatch = createEventDispatcher<{
    update: { note: DocumentDocument };
  }>();

  interface Props {
    note: DocumentDocument | null;
    columns: string[] | null;
  }

  let { note = $bindable(), columns }: Props = $props();
  let id: string = note ? note.id : buildUniqueId();
  let db = globals.db;

  async function updateFragment(
    fragmentType: string,
    fragment: TodolistType | TextType | undefined
  ) {
    if (!note) {
      let noteData = getNewNote();
      noteData.id = id;
      note = await db.documents.insert(noteData);
    }
    let updateData = {};
    updateData[`fragments.${fragmentType}`] = fragment;
    updateData[`modified_at`] = new Date().toISOString();
    await note.incrementalUpdate({
      $set: getNoteUpdateData(note, updateData)
    });
    note = await note.getLatest();
    dispatch('update', { note });
  }
</script>

<TextFragmentEditor
  fragment={note?.fragments?.text || getNewTextFragment()}
  fieldId={`note-text-${id}`}
  on:update={debounce((event) => updateFragment('text', event.detail.fragment), 200)}
  on:delete={(event) => updateFragment('text', undefined)}
/>
<TodoListFragmentEditor
  {columns}
  editText={true}
  fragment={note?.fragments?.todolist || getNewTodoListFragment()}
  autofocus={false}
  on:update={debounce((event) => updateFragment('todolist', event.detail.fragment), 200)}
  on:delete={(event) => updateFragment('todolist', undefined)}
/>
