<script lang="ts">
  import { _, _n } from '$lib/i18n/index.svelte';
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
    columns?: string[] | null;
    autofocus?: boolean;
  }

  let { fragment, editText, columns = null, autofocus = false }: Props = $props();
  let todos: TodoType[] = $state(cloneDeep(fragment.todos));
  $effect(() => {
    if (todos.length === 0) {
      todos.push(getNewTodo());
    }
  });
  let done: boolean = $state(fragment.done);
  let column: number = $state(fragment.column === undefined ? 0 : fragment.column);
  let todosFocused = $state(false);
  let subscriptions = [
    syncPropertiesWithExternalChanges(fragment.todos$, (v) => {
      if (!todosFocused) {
        let n = [...(v || [])];
        if (n.slice(-1)[0]?.text?.trim()) {
          n.push(getNewTodo());
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
    dispatch('update', { fragment: { ...fragment, done, todos, column } });
  }
  function updateTodo(index: number, todo: TodoType | null) {
    todos = cloneDeep(todos);
    if (todo) {
      todos[index] = todo;
    } else {
      todos.splice(index, 1);
    }
    if (todos.slice(-1)[0].text.trim()) {
      todos = [...todos, getNewTodo()];
    }
    stats = getStats();
    done = stats.complete;
    if (done) {
      column = -1;
    } else if (column === -1) {
      column = 0;
    }
    handleChange();
  }
  function getStats() {
    let stats = {
      done: 0,
      total: 0,
      complete: false
    };
    let t = [...todos];
    if (!t.slice(-1)[0]?.text.trim()) {
      t.pop();
    }
    for (const todo of t || []) {
      stats.total += 1;
      if (todo.done) {
        stats.done += 1;
      }
    }

    if (t.length > 0 && stats.done >= stats.total) {
      stats.complete = true;
    }
    return stats;
  }

  let stats = $state(getStats());
</script>

{#if todos[0]?.text?.trim() && columns}
  <div class="form__field">
    <label for="todolist-column">{$_('Colonne', 'Tableau')}</label>
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
            showDelete={i < todos.length - 1}
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
