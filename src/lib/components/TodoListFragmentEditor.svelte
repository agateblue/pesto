<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import TodoRow from './TodoRow.svelte';
  import cloneDeep from 'lodash/cloneDeep';
  import { getNewTodo, type TodolistType, type TodoType, buildUniqueId } from '$lib/db';
  import FragmentEditor from './FragmentEditor.svelte';

  const dispatch = createEventDispatcher<{
    update: { fragment: TodolistType };
    delete: {};
  }>();

  export let fragment: TodolistType;
  let todos: TodoType[] = fragment.todos;
  let title: string = fragment.title || '';
  let done: boolean = fragment.done;
  let id: string = buildUniqueId();

  function handleChange() {
    let hasContent =
      !!title ||
      todos.filter((t) => {
        return t.text.trim();
      }).length > 0;
    if (hasContent) {
      dispatch('update', { fragment: { ...fragment, title, done, todos } });
    } else {
      dispatch('delete', {});
    }
  }
  function updateTodo(index: number, todo: TodoType | null) {
    todos = cloneDeep(todos);
    if (todo) {
      todos[index] = todo;
    } else {
      todos.splice(index, 1);
    }
    todos = todos.filter((t) => {
      return t.text.trim();
    });
    if (title) {
      todos = [...todos, getNewTodo()];
    }
    stats = getStats();
    handleChange();
  }
  function getStats() {
    let stats = {
      done: done ? 1 : 0,
      total: title.trim() ? 1 : 0,
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
    Todo-list
    {#if stats.total}
      · {stats.done}/{stats.total}
    {/if}
  </h3>
</div>

<ol class="todolist">
  <li>
    {#key id}
      <TodoRow
        todo={{ text: title, done: done, id }}
        on:update={(e) => {
          done = e.detail.todo.done;
          title = e.detail.todo.text;
          if (done) {
            todos = cloneDeep(todos)
            todos = todos.map(t => {
              return {...t, done: true}
            })
          } else if (title && todos.length === 0) {
            todos = [...todos, getNewTodo()];
          }
          handleChange();
          stats = getStats();
        }}
        on:delete={(e) => {
          title = '';
          done = false;
          todos = []
          handleChange();
          stats = getStats();
          id = buildUniqueId();
        }}
      />
    {/key}
    {#if stats.total > 1 || title}
      <ol class="todolist">
        {#each todos as todo, i (i)}
          <li>
            {#key todo.id}
              <TodoRow
                {todo}
                on:delete={(e) => {
                  updateTodo(i, null);
                }}
                on:update={(e) => {
                  updateTodo(i, e.detail.todo);
                }}
              />
            {/key}
          </li>
        {/each}
      </ol>
    {/if}
  </li>
</ol>
