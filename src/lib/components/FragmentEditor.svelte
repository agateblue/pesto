<script lang="ts">
  import cloneDeep from 'lodash/cloneDeep';
  import TextFragmentEditor from './TextFragmentEditor.svelte';
  import TodoListFragmentEditor from './TodoListFragmentEditor.svelte';
  import { getNewNote, getNewTextFragment, getNewTodoListFragment, type NoteDocument, type TextType, type TodolistType, type Database} from '$lib/db';
  import { createEventDispatcher } from 'svelte';
  import IconaMoonCheckSquare from 'virtual:icons/iconamoon/check-square';
  import IconaMoonPen from 'virtual:icons/iconamoon/pen';

  const dispatch = createEventDispatcher<{
    update: { note: NoteDocument };
  }>();

  export let note: NoteDocument | null;
  export let db: Database;

  let types = ['text', 'todolist']
  let elements = {
    text: TextFragmentEditor,
    todolist: TodoListFragmentEditor
  };

  async function updateFragment(fragmentType: string, fragment: TodolistType | TextType) {
    if (!note) {
      let noteData = getNewNote()
      note = await db.notes.insert(noteData)
    }
    let updateData = {}
    updateData[`fragments.${fragmentType}`] = fragment
    await note.incrementalUpdate({
      $set: updateData
    })
    note = await note.getLatest()
    dispatch('update', { note });
  }
</script>

{#if note}
  {#each types as fragmentType}
    {#if note.fragments[fragmentType]}
    <svelte:component
      this={elements[fragmentType]}
      fragment={note.toMutableJSON().fragments[fragmentType]}
      on:update={(event) => updateFragment(fragmentType, event.detail.fragment)}
    />
    {/if}
  {/each}
{/if}

<div class="flex__row flex__grow flex__gap">
  <button
    on:click|preventDefault={(e) => {
      updateFragment('text', getNewTextFragment());
    }}
    class="flex__grow | button__outlined button__discrete"
  >
    <IconaMoonPen /> Add text
  </button>
  <button
    on:click|preventDefault={(e) => {
      updateFragment('todolist', getNewTodoListFragment());
    }}
    class="flex__grow | button__outlined button__discrete"
  >
    <IconaMoonCheckSquare /> Add todo-list
  </button>
</div>
