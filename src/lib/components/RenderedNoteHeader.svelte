<script lang="ts">
  import { type DocumentDocument, formatDate, getNoteUpdateData } from '$lib/db';
  import { noteToText } from '$lib/ui';
  import MainNavigationToggle from '$lib/components/MainNavigationToggle.svelte';
  import DropDown from './DropDown.svelte';

  import IconaMoonEdit from 'virtual:icons/iconamoon/edit';
  import IconaMoonCopy from 'virtual:icons/iconamoon/copy';
  import IconaMoonStar from 'virtual:icons/iconamoon/star';
  import IconaMoonStarFill from 'virtual:icons/iconamoon/star-fill';
  import IconaMoonMenuKebabVerticalCircle from 'virtual:icons/iconamoon/menu-burger-horizontal';

  interface Props {
    note: DocumentDocument;
    pageHeader: boolean;
  }

  let { note = $bindable(), pageHeader }: Props = $props();

</script>

<header class="flex__row flex__justify-between flex__align-center">

  {#if pageHeader}
    <MainNavigationToggle class="layout__multi-hidden" />
  {/if}

  <h2 class="flex__grow m__block-0">
    <a href={`/my/notes/${note.id}`}>
      {#if note.title?.trim()}
      {note.title}
      {:else}
      <time datetime={note.created_at}>{formatDate(note.created_at)}</time>
      {/if}
    </a>
  </h2>
  {#snippet dropdownControl()}
    <IconaMoonMenuKebabVerticalCircle
      role="presentation"
      class="icon icon__size-3"
      height="none"
      width="none"
      alt=""
    />
  {/snippet}
  <DropDown control={dropdownControl} controlClass="button__discrete button__icon" class="right">
    <li>
      <a
        class="button button__icon"
        href={`/my/notes/${note.id}?view=edit`}
      >
        <IconaMoonEdit
          role="presentation"
          alt=""
          class="icon icon__size-3"
          height="none"
          width="none"
        />
        Edit note
      </a>
    </li>
    <li>
      
      <button
        class="button__icon"
        type="button"
        onclick={(e) => {
          navigator.clipboard.writeText(noteToText(note));
        }}
      >
        <IconaMoonCopy
          role="presentation" 
          alt=""
          class="icon icon__size-3"
          height="none"
          width="none"
        /> Copy content
      </button>
    </li>
    <li>
      <button
        class="button__icon"
        type="button"
        onclick={(e) => {
          note.incrementalUpdate({
            $set: getNoteUpdateData(note, { starred: !note.starred })
          });
        }}
      >
        {#if note.starred}
          <IconaMoonStarFill
            role="presentation" 
            alt=""
            class="icon icon__size-3"
            height="none"
            width="none"
          />
          Unstar
        {:else}
          <IconaMoonStar
          role="presentation"
          alt="" 
          class="icon icon__size-3"
          height="none"
          width="none"
          />
          Star
        {/if}
      </button>
    </li>
  </DropDown>

</header>