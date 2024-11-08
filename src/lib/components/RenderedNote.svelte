<script lang="ts">
  import { type Database, type DocumentDocument, formatDate, getNoteUpdateData } from '$lib/db';
  import { renderMarkdown } from '$lib/ui';
  import TodoListFragmentEditor from './TodoListFragmentEditor.svelte';

  interface Props {
    note: DocumentDocument;
    footer?: import('svelte').Snippet;
    [key: string]: any;
  }

  let { note = $bindable(), footer, ...rest }: Props = $props();
  note.$.subscribe(async (currentRxDocument) => {
    note = currentRxDocument
  });
</script>

<article {...rest}>
  <a href={`/my/notes/${note.id}`}>
    <time datetime={note.created_at}>{formatDate(note.created_at)}</time>
  </a>
  {#if note.fragments.text}
    <div class="flow prose">
      {@html renderMarkdown(note.fragments.text.content)}
    </div>
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
