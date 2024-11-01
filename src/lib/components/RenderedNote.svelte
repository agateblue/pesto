<script lang="ts">
  import { renderMarkdown, type Database, type NoteDocument, formatDate } from '$lib/db';
  import { cloneDeep } from 'lodash';
  import TodoListFragmentEditor from './TodoListFragmentEditor.svelte';

  interface Props {
    note: NoteDocument;
    footer?: import('svelte').Snippet;
    [key: string]: any
  }

  let { note = $bindable(), footer, ...rest }: Props = $props();
  note.$.subscribe(async currentRxDocument => {
    note = note.getLatest()
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
      on:update={async (e) => {
        await note.incrementalUpdate({
          $set: { 'fragments.todolist': cloneDeep(e.detail.fragment), modified_at: new Date().toISOString() }
        });
      }}
      on:delete={async (e) => {
        await note.incrementalUpdate({
          $set: { 'fragments.todolist': undefined, modified_at: new Date().toISOString()  }
        });
        note = await note.getLatest();
      }}
    />
  {/if}
  {@render footer?.()}
</article>
