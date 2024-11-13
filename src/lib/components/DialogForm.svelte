<script lang="ts">
  interface Props {
    anchorText: string;
    anchorClass: string;
    title: string;
    children: import('svelte').Snippet;
    onsubmit: Function;
  }
  
  let { anchorClass, anchorText, children, onsubmit, title}: Props = $props();
	let dialog: HTMLDialogElement

</script>

{#snippet anchor(anchorText: string, anchorClass: string)}
  <button type="button" class={anchorClass} onclick={() => dialog.showModal()}>
    {anchorText}
  </button>
{/snippet}

{@render anchor?.(anchorText, anchorClass)}

<dialog bind:this={dialog} aria-labelledby="dialog-title" aria-describedby="dialog-description">
  <form class="flow" {onsubmit}>
    <h2 id="dialog-title">{title}</h2>
    <div class="flow" id="dialog-description">
      {@render children?.()}
    </div>
    <div class="flex__row | flex__justify-between">
      <button type="button" onclick={() => {dialog.close()}}>Cancel</button>
      <button type="submit" onclick={() => {dialog.close()}}>Confirm</button>
    </div>
  </form>
</dialog>
