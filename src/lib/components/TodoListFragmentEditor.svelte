<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import TodoRow from './TodoRow.svelte';
  import cloneDeep from 'lodash/cloneDeep';
  import { getNewTodo, type TodolistType, type TodoType } from '$lib/db';
  import FragmentEditor from './FragmentEditor.svelte';

  const dispatch = createEventDispatcher<{
    update: { fragment: TodolistType };
    delete: {  };
  }>();

  export let fragment: TodolistType;
  let todos: TodoType[] = fragment.todos;
  let title: string = fragment.title
  let done: boolean = fragment.done

  function handleChange() {
    dispatch('update', { fragment: { ...fragment, title, done, todos } });
  }
  function updateTodo(index: number, todo: TodoType | null) {
    todos = cloneDeep(todos)
    if (todo) {
      todos[index] = todo
    } else {
      todos.splice(index, 1)
    }
    todos = todos.filter(t => {
      return t.text.trim()
    })
    if (title) {
      todos = [...todos, getNewTodo()]
    }
    stats = getStats();
    handleChange();
  }
  function getStats() {
    let stats = {
      done: done ? 1 : 0,
      total: 1,
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
    ({stats.done}/{stats.total})
  </h3>
</div>



<ol class="todolist">
  <li>
    <TodoRow 
      todo={{text: fragment.title, done: fragment.done, id: 'noop'}} 
      on:update={
        (e) => {
          done = e.detail.todo.done
          title = e.detail.todo.text
          if (title && todos.length === 0) {
            todos = [...todos, getNewTodo()]
          }
          handleChange()
          stats = getStats()
        }
      }
      on:delete={
        (e) => {
          if (confirm('Do you want to delete this todolist?')) {
            dispatch('delete', {})
          }
        }
      }
    />
    {#if title} 
      <ol class="todolist">
        {#each todos as todo, i (i)}
          <li>
            {#key todo.id}
              <TodoRow 
                {todo}
                on:delete={(e) => {updateTodo(i, null)}}
                on:update={(e) => {updateTodo(i, e.detail.todo)}} 
              />
            {/key}
          </li>
        {/each}
      </ol>
    {/if}
  </li>
</ol>
