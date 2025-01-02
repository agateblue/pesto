<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import TodoRow from './TodoRow.svelte';
  import { writable } from 'svelte/store';
  import cloneDeep from 'lodash/cloneDeep';
  import { getNewTodo, type TodolistType, type TodoType, buildUniqueId } from '$lib/db';
  import { syncPropertiesWithExternalChanges, clearSubscriptions } from '$lib/ui';
  import { onDestroy } from 'svelte';
  const dispatch = createEventDispatcher<{
    update: { fragment: TodolistType };
    delete: {};
  }>();

  interface Props {
    fragment: TodolistType;
    editText: boolean;
    columns: string[] | null;
    autofocus: boolean;
  }

  let { fragment, editText, columns, autofocus = false }: Props = $props();
  let todos: TodoType[] = $state(cloneDeep(fragment.todos));
  $effect(() => {
    if (todos.length === 0) {
      todos.push(getNewTodo())
    }
  })
  let done: boolean = $state(fragment.done);
  let column: number = $state(fragment.column === undefined ? 0 : fragment.column);
  let todosFocused = $state(false);
  let subscriptions = [
    syncPropertiesWithExternalChanges(fragment.todos$, (v) => {
      if (!todosFocused) {
        let n = [...v]
        if (n.slice(-1)[0]?.text?.trim()) {
          n.push(getNewTodo())
        }
        todos = n;
      }
    }),
    syncPropertiesWithExternalChanges(fragment.column$, (v) => {
      column = v;
    }),
    syncPropertiesWithExternalChanges(fragment.done$, (v) => {
      done = v;
    })
  ];

  onDestroy(clearSubscriptions(subscriptions));
  function handleChange() {
    let hasContent = todos.filter((t) => {
      return t.text.trim();
    }).length > 0;
    if (hasContent) {
      dispatch('update', { fragment: { ...fragment, done, todos, column } });
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
    todos = [...todos, getNewTodo()];
    stats = getStats();
    done = stats.complete 
    handleChange();
  }
  function getStats() {
    let stats = {
      done: done ? 1 : 0,
      total: 0,
      complete: false
    };
    for (const todo of todos || []) {
      if (todo.text.trim()) {
        stats.total += 1;
        if (todo.done) {
          stats.done += 1;
        }
      }
    }
    if (stats.done >= stats.total) {
      stats.complete = true;
    }
    return stats;
  }

  let stats = $state(getStats());
</script>

{#if todos[0]?.text?.trim() && columns}
  <div class="form__field">
    <label for="todolist-column">Column</label>
    <select
      name="todolist-column"
      id="todolist-column"
      bind:value={column}
      onchange={(e) => {
        if (column === -1) {
          done = true;
          todos = todos.map((t) => {
            return { ...t, done: true };
          });
        } else {
          done = false;
        }
        handleChange();
      }}
    >
      {#each columns as column, i (i)}
        <option value={i >= columns.length - 1 ? -1 : i}>{column}</option>
      {/each}
    </select>
  </div>
{/if}

<ol class="todolist">
  {#each todos as todo, i (i)}
    {#if editText || todo.text}
      <li>
        {#key todo.id}
          <TodoRow
            todo={todos[i]}
            autofocus={false}
            onblur={() => (todosFocused = false)}
            onfocus={() => (todosFocused = true)}
            {editText}
            on:delete={(e) => {
              updateTodo(i, null);
            }}
            on:update={(e) => {
              updateTodo(i, e.detail.todo);
            }}
          />
        {/key}
      </li>
    {/if}
  {/each}
</ol>
