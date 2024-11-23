<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import TodoRow from './TodoRow.svelte';
  import cloneDeep from 'lodash/cloneDeep';
  import { getNewTodo, type TodolistType, type TodoType, buildUniqueId } from '$lib/db';
  import { syncPropertiesWithExternalChanges } from '$lib/ui';
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
  let title: string = $state(fragment.title || '');
  let done: boolean = $state(fragment.done);
  let column: number = $state(fragment.column === undefined ? 0 : fragment.column);
  let id: string = $state(buildUniqueId());

  let subscriptions = []
  $effect(() => {
    subscriptions.push(syncPropertiesWithExternalChanges(fragment.todos$, (v) => {todos = v;}))
    subscriptions.push(syncPropertiesWithExternalChanges(fragment.column$, (v) => {column = v;}))
    subscriptions.push(syncPropertiesWithExternalChanges(fragment.done$, (v) => {done = v;}))
    subscriptions.push(syncPropertiesWithExternalChanges(fragment.title$, (v) => {title = v;}))
  })

  onDestroy(() => {
    subscriptions.forEach(s => {s?.unsubscribe()})
  })
  function handleChange() {
    let hasContent =
      !!title ||
      todos.filter((t) => {
        return t.text.trim();
      }).length > 0;
    if (hasContent) {
      dispatch('update', { fragment: { ...fragment, title, done, todos, column } });
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
    for (const todo of todos || []) {
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

  let stats = $state(getStats());
</script>

{#if title && columns}
  <div class="form__field">
    <label for="todolist-column">Column</label>
    <select 
      name="todolist-column" 
      id="todolist-column" 
      bind:value={column}
      onchange={(e) => {
        if (column === -1) {
          done = true
          todos = todos.map((t) => {
            return { ...t, done: true };
          });
        } else {
          done = false
        } 
        handleChange()
      }}
    >
      {#each columns as column, i (i)}
        <option value={i >= columns.length -1 ? -1 : i }>{column}</option>
      {/each}
    </select>
  </div>
{/if}

<ol class="todolist">
  <li>
    {#key id}
      <TodoRow
        {editText}
        trashIcon={true}
        autofocus={autofocus}
        todo={{ text: title, done: done, id }}
        on:update={(e) => {
          done = e.detail.todo.done;
          title = e.detail.todo.text;
          column = done ? -1 : 0
          if (done) {
            todos = cloneDeep(todos);
            todos = todos.map((t) => {
              return { ...t, done: true };
            });
          } else if (title && todos.length === 0) {
            todos = [...todos, getNewTodo()];
          }
          handleChange();
          stats = getStats();
        }}
        on:delete={(e) => {
          title = '';
          done = false;
          todos = [];
          handleChange();
          stats = getStats();
          id = buildUniqueId();
        }}
      />
    {/key}
    {#if stats.total > 1 || title}
      <ol class="todolist">
        {#each todos as todo, i (i)}
          {#if editText || todo.text.trim()}
            <li>
              {#key todo.id}
                <TodoRow
                  todo={todos[i]}
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
    {/if}
  </li>
</ol>
