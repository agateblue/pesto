<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import TodoRow from './TodoRow.svelte';
  import cloneDeep from 'lodash/cloneDeep';
  import { getNewTodo, type TodolistType, type TodoType } from '$lib/db';

  const dispatch = createEventDispatcher<{
    update: { fragment: TodolistType };
  }>();

  export let fragment: TodolistType;
  let todos: TodoType[] = fragment.todos;
  if (todos.length === 0) {
    todos = [...todos, getNewTodo()];
  }

  function handleChange() {
    dispatch('update', { fragment: { ...fragment, todos } });
  }
  function updateTodo(index: number, todo: TodoType) {
    todos = cloneDeep(todos)
    todos[index] = todo
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
  <!-- <input
    type="text"
    bind:value={fragment.title}
    placeholder="My todolist"
    on:keyup={(e) => {
      handleChange();
    }}
  /> -->
  ({stats.done}/{stats.total})
</h3>
<ol class="todolist">
  {#each todos as todo, i (i)}
    <li>
      <TodoRow {todo} on:update={(e) => {updateTodo(i, e.detail.todo)}} />
    </li>
  {/each}
</ol>
