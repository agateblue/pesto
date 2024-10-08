<script lang="ts">
  import { renderMarkdown, createOrUpdate } from '$lib/db';
  import type { RxDatabase } from 'rxdb';
  import type { Note, Fragment } from '../../ambient.d';
  import TodoListFragmentEditor from './TodoListFragmentEditor.svelte';

  export let db: RxDatabase[];
  export let note: Note[];
  export let fragments: Fragment[];
</script>

<article class="diary__note">
  <a href={`/my/notes/${note.id}`}>
    <time datetime={note.created_at}>{note.created_at}</time>
  </a>
  {#if fragments}
    {#each fragments as fragment, i (i)}
      {#if fragment.type === 'text'}
        {@html renderMarkdown(fragment.data.text)}
      {/if}
      {#if fragment.type === 'todolist'}
        <TodoListFragmentEditor
          fragment={fragment.toJSON()}
          on:update={async (e) => {
            fragments[i] = await createOrUpdate(db.fragments, e.detail.fragment);
          }}
        />
      {/if}
    {/each}
  {/if}
  <slot name="footer"></slot>
</article>
