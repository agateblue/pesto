<script lang="ts">
  import IconaMoonClose from 'virtual:icons/iconamoon/close';

  interface Props {
    anchorClass: string;
    anchorText?: string;
    anchorLabel?: string;
    title: string;
    anchor: import('svelte').Snippet;
    children: import('svelte').Snippet;
    onsubmit: Function;
    onopen?: Function;
    accesskey?: string;
  }

  let {
    anchorClass,
    anchorText,
    anchorLabel,
    children,
    anchor,
    onsubmit,
    title,
    onopen,
    accesskey
  }: Props = $props();
  let dialog: HTMLDialogElement;
</script>

<button
  type="button"
  class={anchorClass}
  aria-label={anchorLabel}
  onclick={() => {
    onopen ? onopen() : null;
    dialog.showModal();
  }}
  {accesskey}
>
  {@render anchor?.()}
  {anchorText}
</button>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog
  bind:this={dialog}
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <div class="scroll__wrapper">
    <header class="flex__row flex__justify-between flex__align-center p__inline-3">
      <h2 id="dialog-title" class="m__block-0">{title}</h2>

      <button
        type="button"
        class="button__icon"
        onclick={() => {
          dialog.close();
        }}
      >
        <IconaMoonClose
          role="presentation"
          class=" icon__size-3"
          height="none"
          width="none"
          alt=""
        />
      </button>
    </header>
    <form class="scroll" {onsubmit}>
      <div id="dialog-description">
        <div class="p__inline-2 | flow">
          {@render children?.()}
        </div>
      </div>
      <hr />
      <button
        type="submit"
        onclick={() => {
          dialog.close();
        }}>Confirm</button
      >
    </form>
  </div>
</dialog>
