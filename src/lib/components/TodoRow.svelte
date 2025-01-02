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
    onfocus: Function;
    onblur: Function;
    accesskey?: string;
  }

  let {
    todo,
    editText,
    autofocus = false,
    onblur,
    onfocus,
    accesskey
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
  {#if todo.text?.trim()}
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
  {/if}
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
      placeholder="Add new task…"
      rows="1"
      aria-label="Add a new task"
      {onblur}
      {onfocus}
      {accesskey}
    ></textarea>
  {:else}
    <label class="flex__grow flow m__block-2" for={`todo-${id}-done`}>
      {@html renderMarkdown(todo.text || '')}
    </label>
  {/if}
  <button
    class="button__icon"
    onclick={preventDefault((e) => {
      dispatch('delete');
    })}
    aria-label="Delete"
  >
    {#if todo.text}
      <IconaMoonSIgnMinusCircle role="presentation" alt="" />
    {/if}
  </button>
</div>
