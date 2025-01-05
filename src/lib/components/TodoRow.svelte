<script lang="ts">
  import { preventDefault } from 'svelte/legacy';

  import { createEventDispatcher, onMount } from 'svelte';
  import IconaMoonSIgnMinusCircle from 'virtual:icons/iconamoon/sign-minus-circle';

  import { type TodoType } from '$lib/db';
  import { ignoreTab, renderMarkdown, getRandomId } from '$lib/ui';

  const dispatch = createEventDispatcher<{
    update: { todo: TodoType };
    delete: {};
  }>();

  interface Props {
    todo: TodoType;
    editText: boolean;
    autofocus: boolean;
    showDelete: boolean;
    onfocus: Function;
    onblur: Function;
  }

  let {
    todo,
    editText,
    autofocus = false,
    onblur,
    onfocus,
    showDelete,
  }: Props = $props();
  let id = $state(getRandomId());
  let textarea: HTMLTextAreaElement;
  function handleChange(args = {}) {
    dispatch('update', { todo: { ...todo, ...args } });
  }
  onMount(() => {
    if (autofocus) {
      textarea.focus();
    }
  });
</script>

<div class="flex__row flex__align-start">
  <div>
    {#key todo.text.trim() + todo.done}
      <input
        type="checkbox"
        id={`todo-${id}-done`}
        checked={todo.text.trim() && todo.done}
        onchange={(e) => {
          handleChange({ done: e.target.checked });
        }}
        disabled={!todo.text.trim()}
        aria-labelledby={editText ? `todo-${id}-text` : undefined}
      />
    {/key}
  </div>
  {#if editText}
    <textarea
      class="flex__grow | input__discrete autoresize"
      type="text"
      autocomplete="off"
      id={`todo-${id}-text`}
      bind:this={textarea}
      value={todo.text || ''}
      onkeyup={ignoreTab((e) => {
        handleChange({ text: e.target.value });
      })}
      placeholder="Add new todo…"
      rows="1"
      aria-label="Add a new todo"
      {onblur}
      {onfocus}
    ></textarea>
  {:else}
    <label class="flex__grow flow m__block-2" for={`todo-${id}-done`}>
      {@html renderMarkdown(todo.text || '')}
    </label>
  {/if}
  {#if showDelete}
  <button
    class="button__icon"
    onclick={preventDefault((e) => {
      dispatch('delete');
    })}
    aria-label="Delete todo"
    title="Delete todo"
  >
    <IconaMoonSIgnMinusCircle role="presentation" alt="" />
  </button>
  {/if}
</div>
