<script lang="ts">
  import { type Database, type DocumentDocument, formatDate, getNoteUpdateData } from '$lib/db';
  import { renderMarkdown } from '$lib/ui';
  import FormDataFragment from './FormDataFragment.svelte';
  import TodoListFragmentEditor from './TodoListFragmentEditor.svelte';
  import CollapsableContent from './CollapsableContent.svelte';
  import isEmpty from 'lodash/isEmpty';
  import IconaMoonStar from 'virtual:icons/iconamoon/star';
  import IconaMoonStarFill from 'virtual:icons/iconamoon/star-fill';

  interface Props {
    note: DocumentDocument;
    footer?: import('svelte').Snippet;
    limitSize: boolean;
    onDelete?: Function;
    [key: string]: any;
  }

  let { note = $bindable(), footer, limitSize = true, onDelete, ...rest }: Props = $props();
</script>

<article {...rest}>
  <div class="flex__row flex__justify-between">
    <div class="flow">
      {#if note.title?.trim()}
        <h2>
          <a href={`/my/notes/${note.id}`}>
            {note.title}
          </a>
        </h2>
      {/if}
      <div>
        <a class="button__link" href={`/my/notes/${note.id}`}>
          <time datetime={note.created_at}>{formatDate(note.created_at)}</time>
        </a>
      </div>
    </div>

    <button
      class="button__icon"
      type="button"
      onclick={(e) => {
        note.incrementalUpdate({
          $set: getNoteUpdateData(note, { starred: !note.starred })
        });
      }}
      aria-label={note.starred ? 'Unstar' : 'Star'}
    >
      {#if note.starred}
        <IconaMoonStarFill role="presentation" alt="" />
      {:else}
        <IconaMoonStar role="presentation" alt="" />
      {/if}
    </button>
  </div>
  {#if note.fragments.form}
    <FormDataFragment fragment={note.fragments.form} />
  {/if}
  {#if note.fragments.text}
    <CollapsableContent class="flow prose" {limitSize}>
      {@html renderMarkdown(note.fragments.text.content)}
    </CollapsableContent>
  {/if}
  {#if note.fragments.todolist}
    <TodoListFragmentEditor
      fragment={note.fragments.todolist}
      editText={false}
      on:update={async (e) => {
        await note.incrementalUpdate({
          $set: getNoteUpdateData(note, { 'fragments.todolist': e.detail.fragment })
        });
      }}
      on:delete={async (e) => {
        await note.incrementalUpdate({
          $set: getNoteUpdateData(note, { 'fragments.todolist': undefined })
        });
        note = await note.getLatest();
        note.toJSON().fragments;
        let fragments = note.toMutableJSON().fragments;
        delete fragments.todolist;
        if (isEmpty(fragments)) {
          await note.incrementalRemove();
          onDelete?.();
        }
      }}
    />
  {/if}
  {@render footer?.()}
</article>
