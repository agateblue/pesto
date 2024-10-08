<script lang="ts">
  import cloneDeep from 'lodash/cloneDeep';
  import TextFragmentEditor from './TextFragmentEditor.svelte';
  import TodoListFragmentEditor from './TodoListFragmentEditor.svelte';
  import type { Fragment, Note } from '../../ambient.d';
  import { getNewTextFragment, getNewTodoListFragment } from '$lib/db';
  import { createEventDispatcher } from 'svelte';
  import IconaMoonCheckSquare from 'virtual:icons/iconamoon/check-square';
  import IconaMoonPen from 'virtual:icons/iconamoon/pen';

  const dispatch = createEventDispatcher<{
    update: { fragments: Fragment[] };
  }>();

  export let fragments: Fragment[];
  export let note: Note;

  let elements = {
    text: TextFragmentEditor,
    todolist: TodoListFragmentEditor
  };

  function updateFragment(fragment, index) {
    fragments[index] = cloneDeep(fragment);
    dispatch('update', { fragments });
  }
  function addFragment(fragment: Fragment) {
    fragments = [...fragments, fragment];
  }
</script>

{#each fragments as fragment, i (i)}
  <svelte:component
    this={elements[fragment.type]}
    {fragment}
    on:update={(event) => updateFragment(event.detail.fragment, i)}
  />
{/each}

<div class="flex__row flex__grow flex__gap">
  <button
    on:click|preventDefault={(e) => {
      addFragment(getNewTextFragment(note.id));
    }}
    class="flex__grow | button__outlined button__discrete"
  >
    <IconaMoonPen /> Add text
  </button>
  <button
    on:click|preventDefault={(e) => {
      addFragment(getNewTodoListFragment(note.id));
    }}
    class="flex__grow | button__outlined button__discrete"
  >
    <IconaMoonCheckSquare /> Add todo-list
  </button>
</div>
