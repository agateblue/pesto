<script lang="ts">
  import { type DocumentDocument, formatDate, getNoteUpdateData } from '$lib/db';
  import { noteToText } from '$lib/ui';
  import MainNavigationToggle from '$lib/components/MainNavigationToggle.svelte';
  
  import IconaMoonEdit from 'virtual:icons/iconamoon/edit';
  import IconaMoonCopy from 'virtual:icons/iconamoon/copy';
  import IconaMoonStar from 'virtual:icons/iconamoon/star';
  import IconaMoonStarFill from 'virtual:icons/iconamoon/star-fill';

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

  <div>
    <a
      class="button__icon button layout__multi-hidden"
      href={`/my/notes/${note.id}?view=edit`}
      aria-label="Edit note"
      title="Edit note"
    >
      <IconaMoonEdit
        role="presentation"
        alt=""
        class=" icon__size-3"
        height="none"
        width="none"
      />
    </a>

    <button
      class="button__icon"
      type="button"
      onclick={(e) => {
        navigator.clipboard.writeText(noteToText(note));
      }}
      aria-label="Copy note contents to clipboard"
      title="Copy note contents to clipboard"
    >
      <IconaMoonCopy
        role="presentation" 
        alt=""
        class=" icon__size-3"
        height="none"
        width="none"
      />
    </button>

    <button
      class="button__icon"
      type="button"
      onclick={(e) => {
        note.incrementalUpdate({
          $set: getNoteUpdateData(note, { starred: !note.starred })
        });
      }}
      aria-label={note.starred ? 'Unstar' : 'Star'}
      title={note.starred ? 'Unstar' : 'Star'}
    >
      {#if note.starred}
        <IconaMoonStarFill
          role="presentation" 
          alt=""
          class=" icon__size-3"
          height="none"
          width="none"
        />
      {:else}
        <IconaMoonStar
          role="presentation"
          alt="" 
          class=" icon__size-3"
          height="none"
          width="none"
        />
      {/if}
    </button>
  </div>
</header>