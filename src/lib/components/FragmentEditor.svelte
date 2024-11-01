<script lang="ts">
  import debounce from 'lodash/debounce';
  import cloneDeep from 'lodash/cloneDeep';
  import TextFragmentEditor from './TextFragmentEditor.svelte';
  import TodoListFragmentEditor from './TodoListFragmentEditor.svelte';
  import {
    globals,
    buildUniqueId,
    getNewNote,
    getNewTextFragment,
    getNewTodoListFragment,
    type NoteDocument,
    type TextType,
    type TodolistType,
    type Database
  } from '$lib/db';
  import { createEventDispatcher } from 'svelte';
  import IconaMoonCheckSquare from 'virtual:icons/iconamoon/check-square';
  import IconaMoonPen from 'virtual:icons/iconamoon/pen';

  const dispatch = createEventDispatcher<{
    update: { note: NoteDocument };
  }>();

  interface Props {
    note: NoteDocument | null;
  }

  let { note = $bindable() }: Props = $props();
  let id: string = note ? note.id : buildUniqueId()
  let db = globals.db;
  let fragments = $state(note?.toMutableJSON().fragments || {});

  async function updateFragment(
    fragmentType: string,
    fragment: TodolistType | TextType | undefined
  ) {
    if (!note) {
      let noteData = getNewNote();
      noteData.id = id
      note = await db.notes.insert(noteData);
    }
    let updateData = {};
    updateData[`fragments.${fragmentType}`] = fragment;
    updateData[`modified_at`] = new Date().toISOString();
    await note.incrementalUpdate({
      $set: cloneDeep(updateData)
    });
    note = await note.getLatest();
    fragments = note.fragments;
    dispatch('update', { note });
  }
</script>

<TextFragmentEditor
  fragment={fragments.text || getNewTextFragment()}
  fieldId={`note-text-${id}`}
  on:update={debounce((event) => updateFragment('text', event.detail.fragment), 200)}
  on:delete={(event) => updateFragment('text', undefined)}
/>
<TodoListFragmentEditor
  fragment={fragments.todolist || getNewTodoListFragment()}
  on:update={debounce((event) => updateFragment('todolist', event.detail.fragment), 200)}
  on:delete={(event) => updateFragment('todolist', undefined)}
/>
