<script lang="ts">
  import MainNavigation from "$lib/components/MainNavigation.svelte";
  import TodoCard from "$lib/components/TodoCard.svelte";
  import { globals, type DocumentDocument} from "$lib/db";

  let columns = $state([
    {
      name: 'Todo',
      notes: [],
      modified_at: new Date().toISOString(),
      selector: { 
        'fragments.todolist.done': { $eq: false}, 
        $or: [{'fragments.todolist.column': { $eq: 0}}, {'fragments.todolist.column': {$exists: false}}]
      }
    },
    {
      name: 'Doing',
      notes: [],
      modified_at: new Date().toISOString(),
      selector: { 'fragments.todolist.done': { $eq: false}, 'fragments.todolist.column': { $eq: 1}}
    },
    {
      name: 'Done',
      notes: [],
      modified_at: new Date().toISOString(),
      selector: { 'fragments.todolist.done': { $eq: true}}
    }
  ])
  

  columns.forEach((v, i) => {
    globals.db.documents.find({
      limit: 9999,
      sort: [{ modified_at: 'desc' }],
      selector: v.selector
    }).$.subscribe(notes => {
      v.notes = notes
      v.modified_at = new Date().toISOString()
    })
  })

</script>

<div class="my__layout">
  <MainNavigation />
  <main>
    <div class="flex__row">
      {#each columns as column, i (i)}
        <section class="flex__grow | p__inline-2">
          <h2>{column.name}</h2>
          <ol class="board__column | p__block-0 p__inline-0 | flow">
            {#key column.modified_at}
              {#each column.notes as note}
                <TodoCard {note} />
              {/each}
            {/key}
          </ol>
        </section>
      {/each}
    </div>
  </main>
</div>
