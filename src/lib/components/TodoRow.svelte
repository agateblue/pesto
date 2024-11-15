<script lang="ts">
  import { preventDefault } from 'svelte/legacy';

  import { createEventDispatcher, onMount } from 'svelte';
  import IconaMoonTrash from 'virtual:icons/iconamoon/trash';

  import { type TodoType } from '$lib/db';
  import { ignoreTab, renderMarkdown } from '$lib/ui';

  const dispatch = createEventDispatcher<{
    update: { todo: TodoType };
    delete: {};
  }>();

  interface Props {
    todo: TodoType;
    editText: boolean;
    autofocus: boolean;
  }

  let { todo, editText, autofocus = false }: Props = $props();
  let text = $state(todo.text);
  let done = $state(todo.done);
  let textarea: HTMLTextAreaElement
  function handleChange() {
    dispatch('update', { todo: { ...todo, text, done } });
  }
  onMount(() => {
    if (autofocus) {
      textarea.focus()
    }
  })
</script>

<div class="flex__row flex__align-start">
  <div class="m__block-1">
    <input
      type="checkbox"
      id={`todo-${todo.id}-done`}
      checked={text.trim() && todo.done}
      onchange={(e) => {
        done = e.target.checked;
        handleChange();
      }}
      disabled={!text.trim()}
      aria-label={`Mark ${text} as done`}
      />
    </div>
    {#if editText}
    <textarea
      class="flex__grow | input__discrete autoresize"
      type="text"
      autocomplete="off"
      id={`todo-${todo.id}-text`}
      bind:this={textarea}
      bind:value={text}
      onkeyup={ignoreTab((e) => {
        handleChange();
      })}
      placeholder="Add new task…"
      rows="1"
    ></textarea>
  {:else}
    <div class="flex__grow flow m__block-2">
      {@html renderMarkdown(text)}
    </div>
  {/if}
  <button
    class="button__icon"
    onclick={preventDefault((e) => {
      dispatch('delete');
    })}
    aria-label="Delete"
  >
    <IconaMoonTrash role="presentation" alt="" />
  </button>
</div>
