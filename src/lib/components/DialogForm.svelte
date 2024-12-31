<script lang="ts">
  interface Props {
    anchorClass: string;
    anchorText?: string;
    title: string;
    anchor: import('svelte').Snippet;
    children: import('svelte').Snippet;
    onsubmit: Function;
    onopen?: Function;
    accesskey?: string;
  }

  let { anchorClass, anchorText, children, anchor, onsubmit, title, onopen, accesskey }: Props = $props();
  let dialog: HTMLDialogElement;
</script>



<button
  type="button"
  class={anchorClass}
  onclick={() => {
    onopen ? onopen() : null;
    dialog.showModal();
  }}
  {accesskey}
>
  {@render anchor?.()}
  {anchorText}
</button>

<dialog bind:this={dialog} aria-labelledby="dialog-title" aria-describedby="dialog-description">
  <form class="flow" {onsubmit}>
    <h2 id="dialog-title" class="m__block-0">{title}</h2>
    <div class="flow" id="dialog-description">
      {@render children?.()}
    </div>
    <hr />
    <div class="flex__row | flex__justify-between">
      <button
        type="button"
        onclick={() => {
          dialog.close();
        }}>Cancel</button
      >
      <button
        type="submit"
        onclick={() => {
          dialog.close();
        }}>Confirm</button
      >
    </div>
  </form>
</dialog>
