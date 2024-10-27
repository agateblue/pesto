<script lang="ts">
  import { renderMarkdown, type Database, type NoteDocument, formatDate } from '$lib/db';
  import TodoListFragmentEditor from './TodoListFragmentEditor.svelte';

  export let note: NoteDocument;
  note.$.subscribe(async currentRxDocument => {
    note = note.getLatest()
  });
</script>

<article {...$$restProps}>
  {note._rev}
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
          $set: { 'fragments.todolist': e.detail.fragment }
        });
      }}
      on:delete={async (e) => {
        await note.incrementalUpdate({
          $set: { 'fragments.todolist': undefined }
        });
        note = await note.getLatest();
      }}
    />
  {/if}
  <slot name="footer"></slot>
</article>
