<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import IconaMoonTrash from 'virtual:icons/iconamoon/trash';

  import { type TodoType } from '$lib/db';
  import { ignoreTab } from '$lib/ui';

  const dispatch = createEventDispatcher<{
    update: { todo: TodoType };
    delete: {};
  }>();

  export let todo: TodoType;
  let text = todo.text;
  let done = todo.done;

  function handleChange() {
    dispatch('update', { todo: { ...todo, text, done } });
  }
</script>

<div class="flex__row">
  <input
    type="checkbox"
    id={`todo-${todo.id}-done`}
    checked={text.trim() && todo.done}
    on:change={(e) => {
      done = e.target.checked
      handleChange();
    }}
    disabled={!text.trim()}
  />
  <textarea
    class="flex__grow | input__discrete autoresize"
    type="text"
    autocomplete="off"
    id={`todo-${todo.id}-text`}
    bind:value={text}
    on:keyup={ignoreTab((e) => {
      handleChange();
    })}
    placeholder="Add new task…"
    rows="1"
  />
  <button
    class="button__icon"
    on:click|preventDefault={(e) => {
      dispatch('delete');
    }}
    aria-label="Delete"
  >
    <IconaMoonTrash />
  </button>
</div>
