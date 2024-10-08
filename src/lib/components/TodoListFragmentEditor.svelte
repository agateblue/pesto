<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import cloneDeep from 'lodash/cloneDeep';
  import { getNewTodo } from '$lib/db';
  import FragmentEditor from './FragmentEditor.svelte';

  const dispatch = createEventDispatcher<{
    update: { fragment: Fragment };
  }>();

  export let fragment: Fragment;
  fragment = cloneDeep(fragment);
  let todos: Todo[] = cloneDeep(fragment.data.todos);
  if (todos.length === 0) {
    todos = [...todos, getNewTodo()];
  }

  function handleChange() {
    dispatch('update', { fragment: { ...fragment, data: { todos } } });
  }
  function updateTodo(todo: Todo) {
    let lastTodo = todos.slice(-1)[0];
    if (lastTodo.text.trim().length) {
      todos = [...todos, getNewTodo()];
    }
    stats = getStats();
    handleChange();
  }
  function getStats() {
    let stats = {
      done: 0,
      total: 0,
      complete: false
    };
    for (const todo of todos) {
      if (todo.text.trim()) {
        stats.total += 1;
        if (todo.done) {
          stats.done += 1;
        }
      }
    }
    if (stats.done === stats.total) {
      stats.complete = true;
    }
    return stats;
  }

  let stats = getStats();
</script>

<h3>
  Todo-list:
  <input
    type="text"
    bind:value={fragment.title}
    placeholder="My todolist"
    on:keyup={(e) => {
      handleChange();
    }}
  />
  ({stats.done}/{stats.total})
</h3>
<ol class="todolist">
  {#each todos as todo, i (i)}
    <li>
      <input
        type="checkbox"
        bind:checked={todo.done}
        on:change={(e) => {
          updateTodo(todo);
        }}
      />
      <input
        type="text"
        id={`${fragment.id}-${i}`}
        bind:value={todo.text}
        on:keyup={(e) => {
          updateTodo(todo);
        }}
      />
    </li>
  {/each}
</ol>
