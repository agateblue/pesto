<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import TodoRow from './TodoRow.svelte';
  import cloneDeep from 'lodash/cloneDeep';
  import { getNewTodo, type TodolistType, type TodoType } from '$lib/db';

  const dispatch = createEventDispatcher<{
    update: { fragment: TodolistType };
    delete: {  };
  }>();

  export let fragment: TodolistType;
  export let showDelete: boolean = true;
  let todos: TodoType[] = fragment.todos;
  let title: string = fragment.title

  if (todos.length === 0) {
    todos = [...todos, getNewTodo()];
  }

  function handleChange() {
    dispatch('update', { fragment: { ...fragment, title, todos } });
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

<div class="flex__row | flex__justify-between">
  <h3>
    Todo-list:
    <input
      type="text"
      bind:value={title}
      placeholder="My todolist"
      on:keyup={(e) => {
        handleChange();
      }}
    />
    ({stats.done}/{stats.total})
  </h3>
  {#if showDelete}
    <button 
      class="button__link" 
      on:click|preventDefault={
        (e) => {
          if (confirm('Do you want to delete this todolist?')) {
            dispatch('delete', {})
          }
        }}>
      Delete
    </button>
  {/if}
</div>
<ol class="todolist">
  {#each todos as todo, i (i)}
    <li>
      <TodoRow {todo} on:update={(e) => {updateTodo(i, e.detail.todo)}} />
    </li>
  {/each}
</ol>
