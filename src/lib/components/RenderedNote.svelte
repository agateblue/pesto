<script lang="ts">
  import { renderMarkdown, type Database, type NoteDocument } from '$lib/db';
  import TodoListFragmentEditor from './TodoListFragmentEditor.svelte';

  export let db: Database;
  export let note: NoteDocument;
</script>

<article class="diary__note">
  <a href={`/my/notes/${note.id}`}>
    <time datetime={note.created_at}>{note.created_at}</time>
  </a>
  {#if note.fragments.text}
    {@html renderMarkdown(note.fragments.text.content)}
  {/if}
  {#if note.fragments.todolist}
    <TodoListFragmentEditor
      fragment={note.fragments.todolist}
      showDelete={false}
      on:update={async (e) => {
        await note.incrementalUpdate({
          $set: {'fragments.todolist': e.detail.fragment}
        })
      }}
    />
  {/if}
  <slot name="footer"></slot>
</article>
