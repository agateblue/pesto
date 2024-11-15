<script lang="ts">
  import { type Database, type DocumentDocument, formatDate, getNoteUpdateData } from '$lib/db';
  import { renderMarkdown } from '$lib/ui';
  import TodoListFragmentEditor from './TodoListFragmentEditor.svelte';
  import CollapsableContent from './CollapsableContent.svelte';

  interface Props {
    note: DocumentDocument;
    footer?: import('svelte').Snippet;
    limitSize: boolean;
    [key: string]: any;
  }

  let { note = $bindable(), footer, limitSize = true, ...rest }: Props = $props();
</script>

<article {...rest}>
  <a href={`/my/notes/${note.id}`}>
    <time datetime={note.created_at}>{formatDate(note.created_at)}</time>
  </a>
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
      }}
    />
  {/if}
  {@render footer?.()}
</article>
