<script lang="ts">
  import cloneDeep from 'lodash/cloneDeep';
  import TextFragmentEditor from './TextFragmentEditor.svelte';
  import TodoListFragmentEditor from './TodoListFragmentEditor.svelte';
  import { globals, getNewNote, getNewTextFragment, getNewTodoListFragment, type NoteDocument, type TextType, type TodolistType, type Database} from '$lib/db';
  import { createEventDispatcher } from 'svelte';
  import IconaMoonCheckSquare from 'virtual:icons/iconamoon/check-square';
  import IconaMoonPen from 'virtual:icons/iconamoon/pen';

  const dispatch = createEventDispatcher<{
    update: { note: NoteDocument };
  }>();

  export let note: NoteDocument | null;
  let db = globals.db

  let types = ['text', 'todolist']
  let elements = {
    text: TextFragmentEditor,
    todolist: TodoListFragmentEditor
  };

  async function updateFragment(fragmentType: string, fragment: TodolistType | TextType | undefined) {
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
      on:delete={
        (event) => updateFragment(fragmentType, undefined)
      }
    />
    {/if}
  {/each}
{/if}

<div class="flex__row flex__gap">
  {#if !note?.fragments.text}
    <button
    on:click|preventDefault={(e) => {
      updateFragment('text', getNewTextFragment());
    }}
        class="button__outlined button__discrete"
        >
        <IconaMoonPen /> Add text
      </button>
  {/if}
  {#if !note?.fragments.todolist}
    <button
      on:click|preventDefault={(e) => {
        updateFragment('todolist', getNewTodoListFragment());
      }}
      class="button__outlined button__discrete"
    >
      <IconaMoonCheckSquare /> Add todo-list
    </button>
  
  {/if}
</div>
