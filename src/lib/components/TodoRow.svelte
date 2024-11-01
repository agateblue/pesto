<script lang="ts">
  import { preventDefault } from 'svelte/legacy';

  import { createEventDispatcher } from 'svelte';
  import IconaMoonTrash from 'virtual:icons/iconamoon/trash';

  import { type TodoType } from '$lib/db';
  import { ignoreTab } from '$lib/ui';

  const dispatch = createEventDispatcher<{
    update: { todo: TodoType };
    delete: {};
  }>();

  interface Props {
    todo: TodoType;
  }

  let { todo }: Props = $props();
  let text = $state(todo.text);
  let done = $state(todo.done);

  function handleChange() {
    dispatch('update', { todo: { ...todo, text, done } });
  }
</script>

<div class="flex__row">
  <input
    type="checkbox"
    id={`todo-${todo.id}-done`}
    checked={text.trim() && todo.done}
    onchange={(e) => {
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
    onkeyup={ignoreTab((e) => {
      handleChange();
    })}
    placeholder="Add new task…"
    rows="1"
></textarea>
  <button
    class="button__icon"
    onclick={preventDefault((e) => {
      dispatch('delete');
    })}
    aria-label="Delete"
  >
    <IconaMoonTrash />
  </button>
</div>
