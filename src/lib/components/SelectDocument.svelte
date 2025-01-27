<script lang="ts">
  import { globals } from '$lib/db';
  import { onDestroy, onMount } from 'svelte';
  import type { HTMLSelectAttributes } from 'svelte/elements';
  interface Props extends HTMLSelectAttributes {
    findOptions: object;
    choiceConverter: Function;
  }

  let select = $state(document.createElement('select'))
  let choices = $state([])
  let loaded = false
  let subscription = null

  let { findOptions, choiceConverter, ...restProps }: Props = $props();

  onMount(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !subscription) {
          subscription = globals.db?.documents.find(findOptions).$.subscribe(results => {
            choices = results.map(r => choiceConverter(r))
          })
        }
      });
    })
    observer.observe(select)
  })
  onDestroy(() => {
    subscription?.unsubscribe()
  })
</script>

<select bind:this={select} {...restProps}>
  <option value={null}>---</option>
  {#each choices as choice}
    <option value={choice.value}>{choice.text}</option>
  {/each}
</select>
