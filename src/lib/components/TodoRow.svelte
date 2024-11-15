<script lang="ts">
  import { preventDefault } from 'svelte/legacy';

  import { createEventDispatcher, onMount } from 'svelte';
  import IconaMoonTrash from 'virtual:icons/iconamoon/trash';
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
    trashIcon: boolean;
  }

  let { todo, editText, autofocus = false, trashIcon = false }: Props = $props();
  let text = $state(todo.text);
  let done = $state(todo.done);
  let id = $state(getRandomId())
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
  {#if text.trim()}
    <div>
      <input
        type="checkbox"
        id={`todo-${id}-done`}
        checked={text.trim() && todo.done}
        onchange={(e) => {
          done = e.target.checked;
          handleChange();
        }}
        disabled={!text.trim()}
        aria-labelledby={editText ? `todo-${id}-text` : undefined}
      />
    </div>
  {/if}
  {#if editText}
    <textarea
      class="flex__grow | input__discrete autoresize"
      type="text"
      autocomplete="off"
      id={`todo-${id}-text`}
      bind:this={textarea}
      bind:value={text}
      onkeyup={ignoreTab((e) => {
        handleChange();
      })}
      placeholder="Add new task…"
      rows="1"
      aria-label="Add a new task"
    ></textarea>
  {:else}
    <label class="flex__grow flow m__block-2" for={`todo-${id}-done`}>
      {@html renderMarkdown(text)}
    </label>
  {/if}
  <button
    class="button__icon"
    onclick={preventDefault((e) => {
      dispatch('delete');
    })}
    aria-label="Delete"
  >
    {#if trashIcon}
      <IconaMoonTrash role="presentation" alt="" />
    {:else}
      <IconaMoonSIgnMinusCircle role="presentation" alt="" />
    {/if}
  </button>
</div>
