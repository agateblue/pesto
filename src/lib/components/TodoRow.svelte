<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import {
    type TodoType
  } from '$lib/db'

  const dispatch = createEventDispatcher<{
    update: { todo: TodoType };
  }>();

  export let todo: TodoType;
  let text = todo.text;
  let done = todo.done;

  function handleChange() {
    dispatch('update', { todo: { ...todo, text, done} });
  }
</script>

<input
  type="checkbox"
  bind:checked={done}
  on:change={(e) => {
    handleChange();
  }}
/>
<input
  type="text"
  bind:value={text}
  on:keyup={(e) => {
    handleChange()
  }}
/>