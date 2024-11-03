<script lang="ts">
  import MainNavigation from "$lib/components/MainNavigation.svelte";
  import TodoCard from "$lib/components/TodoCard.svelte";
  import { type RxDocument } from "rxdb";
  import { globals, type DocumentDocument } from "$lib/db";
  import type { MangoQuerySelector } from "rxdb";
  
  type BoardColumn = {
    name: string;
    notes: DocumentDocument[];
    index: number;
    selector: MangoQuerySelector<DocumentDocType>;
  }

  type SettingsBoard = DocumentType & {
    id: 'settings:board',
    data: {
      columns: string[];
    }
  }

  const FIRST_COLUMN_SELECTOR = { 
    'fragments.todolist.done': { $eq: false}, 
    $or: [{'fragments.todolist.column': { $eq: 0}}, {'fragments.todolist.column': {$exists: false}}]
  }
  const DONE_COLUMN_SELECTOR = { 'fragments.todolist.done': { $eq: true}}

  function getColumnSelector (i: number) {
    return { 'fragments.todolist.done': { $eq: false}, 'fragments.todolist.column': { $eq: i}}
  }

  let columns: BoardColumn[] = $state([])

  globals.db?.documents.findOne({selector: {id: 'settings:board'}}).$.subscribe(
    (settings: RxDocument<SettingsBoard> | null) => {
    if (!settings) {
      // we use the default settings
      columns = [
        {
          name: 'Todo',
          notes: [],
          index: 0,
          selector: FIRST_COLUMN_SELECTOR,
        },
        {
          name: 'Doing',
          notes: [],
          index: 1,
          selector: getColumnSelector(1),
        },
        {
          name: 'Done',
          notes: [],
          index: -1,
          selector: DONE_COLUMN_SELECTOR
        }
      ]
    } else {
      settings.data.columns.forEach((v, i) => {
        let c: BoardColumn = {
          name: v,
          notes: [],
          index: i,
          selector: getColumnSelector(i),
        }
        if (i === 0) {
          // unassign entries go to the first column
          c.selector = FIRST_COLUMN_SELECTOR
        }
        if (i === settings.data.columns.length) {
          // the last column automatically gets done entries
          c.selector = DONE_COLUMN_SELECTOR
          c.index = -1
        }
        columns = [...columns, c]
      })
    }

    columns.forEach((v, i) => {
      globals.db.documents.find({
        limit: 9999,
        sort: [{ modified_at: 'desc' }],
        selector: v.selector
      }).$.subscribe(notes => {
        v.notes = notes
      })
    })
  })

</script> 

<div class="my__layout">
  <MainNavigation />
  <main>
    <div class="flex__row">
      {#each columns as column}
        <section class="flex__grow | p__inline-2">
          <h2>{column.name}</h2>
          <ol class="board__column | p__block-0 p__inline-0 | flow">
            {#each column.notes as note}
              {#key note.id}
                <TodoCard {note} />
              {/key}
            {/each}
          </ol>
        </section>
      {/each}
    </div>
  </main>
</div>
