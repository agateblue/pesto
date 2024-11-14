<script lang="ts">
  import MainNavigation from "$lib/components/MainNavigation.svelte";
  import TodoCard from "$lib/components/TodoCard.svelte";
  import { type RxDocument } from "rxdb";
  import Lazy from 'svelte-lazy';
  import { globals, type DocumentDocument, getNoteUpdateData, getNewNote, getNewTodoListFragment } from "$lib/db";
  import type { MangoQuerySelector } from "rxdb";
  
  import {flip} from "svelte/animate";
  import {dragHandle, dragHandleZone} from "svelte-dnd-action";

  const flipDurationMs = 300;

  async function handleDndConsider(e, column: BoardColumn) {
    column.cards = e.detail.items;
  }
  async function handleDndFinalize(e, column: BoardColumn) {
    column.cards = e.detail.items;
    let newColumnIndex = parseInt(e.target.dataset.target)
    let updatedCards = e.detail.items.filter(c => {
      return c.note.fragments.todolist.column != newColumnIndex
    })
    let selector = {$or: updatedCards.map(c => {
      return {id: c.note.id}
    })}
    let updateData = {
      modified_at: new Date().toISOString(),
      'fragments.todolist.column': newColumnIndex,
      'fragments.todolist.done': newColumnIndex === -1 ? true : false
    }
    await globals.db?.documents.find({selector}).update({
      $set: updateData
    })
  }
  type BoardColumn = {
    name: string;
    cards: [];
    index: number;
    limit: number;
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
  let autofocusKey: string = $state('noop')

  globals.db?.documents.findOne({selector: {id: 'settings:board'}}).$.subscribe(
    (settings: RxDocument<SettingsBoard> | null) => {
    if (!settings) {
      // we use the default settings
      columns = [
        {
          name: 'Todo',
          cards: [],
          index: 0,
          limit: 9999,
          selector: FIRST_COLUMN_SELECTOR,
        },
        {
          name: 'Doing',
          cards: [],
          index: 1,
          limit: 9999,
          selector: getColumnSelector(1),
        },
        {
          name: 'Done',
          cards: [],
          index: -1,
          limit: 30,
          selector: DONE_COLUMN_SELECTOR
        }
      ]
    } else {
      settings.data.columns.forEach((v, i) => {
        let c: BoardColumn = {
          name: v,
          cards: [],
          index: i,
          selector: getColumnSelector(i),
        }
        if (i === 0) {
          // unassign entries go to the first column
          c.selector = FIRST_COLUMN_SELECTOR
        }
        if (i === settings.data.columns.length - 1) {
          // the last column automatically gets done entries
          c.selector = DONE_COLUMN_SELECTOR
          c.index = -1
          c.limit = 30
        }
        columns = [...columns, c]
      })
    }

    columns.forEach((v, i) => {
      globals.db.documents.find({
        limit: v.limit,
        sort: [{ modified_at: 'desc' }],
        selector: v.selector
      }).$.subscribe(notes => {
        v.cards = notes.map(n => {
          return {
            id: n.id,
            note: n,
          }
        })
      })
    })
  })

</script> 

<div class="my__layout">
  <MainNavigation />
  <main>
    <div class="flex__row board">
      {#each columns as column}
        <section class="flex__column | board__column | p__inline-2">
          <h2>{column.name}</h2>
          <button class="m__block-1" type="button" onclick={async (e) => {
            let note = getNewNote()
            note.fragments.todolist = getNewTodoListFragment()
            note.fragments.todolist.column = column.index
            autofocusKey = note.id
            await globals.db?.documents.insert(note)
          }}>Add task</button>
          <ol 
            class="flex__grow | p__block-0 p__inline-0 | flow" 
            use:dragHandleZone="{{items: column.cards, flipDurationMs: 100}}" 
            onconsider="{async (e) => handleDndConsider(e, column)}" 
            onfinalize="{async (e) => handleDndFinalize(e, column)}"
            data-target={column.index}
          >
            {#each column.cards as item (item.id)}
              <li class="card" animate:flip={{duration: 100}} >
                <Lazy height={200} keep={true}>
                  <TodoCard
                  {dragHandle}
                  autofocus={autofocusKey === item.id}
                  note={item.note}
                  on:delete={(e) => {
                    e.detail.note.incrementalRemove()
                  }}
                  />
                </Lazy>
              </li>
            {/each}
          </ol>
          {#if column.index === -1 && column.cards.length > 0}
            <button
              onclick={async (e) => {
                let newCards = await globals.db.documents.find({
                  limit: column.limit,
                  sort: [{ modified_at: 'desc' }],
                  selector: {
                    id: { $lt: column.cards.slice(-1)[0].id },
                    ...column.selector
                  }
                }).exec();
                column.cards = [...column.cards, ...newCards.map(n => {return {id: n.id, note: n}})];
              }}>Load more</button
            >
          {/if}
        </section>
      {/each}
    </div>
  </main>
</div>
