<script lang="ts">
  import MainNavigation from '$lib/components/MainNavigation.svelte';
  import TodoCard from '$lib/components/TodoCard.svelte';
  import MainNavigationToggle from '$lib/components/MainNavigationToggle.svelte';
  import LoadingState from '$lib/components/LoadingState.svelte';
  import DialogForm from '$lib/components/DialogForm.svelte';
  import { type RxDocument } from 'rxdb';
  import Lazy from 'svelte-lazy';
  import {
    globals,
    type DocumentDocument,
    getNoteUpdateData,
    getNewNote,
    getNewTodoListFragment,
    createOrUpdateSetting
  } from '$lib/db';
  import type { MangoQuerySelector } from 'rxdb';

  import { flip } from 'svelte/animate';
  import { dragHandle, dragHandleZone } from 'svelte-dnd-action';

  async function handleDndConsider(e, column: BoardColumn) {
    column.cards = e.detail.items;
  }
  async function handleDndFinalize(e, column: BoardColumn) {
    column.cards = e.detail.items;
    let newColumnIndex = parseInt(e.target.dataset.target);
    let updatedCards = e.detail.items.filter((c) => {
      return c.note.fragments.todolist.column != newColumnIndex;
    });
    let selector = {
      $or: updatedCards.map((c) => {
        return { id: c.note.id };
      })
    };
    let updateData = {
      modified_at: new Date().toISOString(),
      'fragments.todolist.column': newColumnIndex,
      'fragments.todolist.done': newColumnIndex === -1 ? true : false
    };
    await globals.db?.documents.find({ selector }).update({
      $set: updateData
    });
  }
  type BoardColumn = {
    name: string;
    cards: [];
    index: number;
    limit: number;
    selector: MangoQuerySelector<DocumentDocType>;
    isLoading: boolean;
  };

  type SettingsBoard = DocumentType & {
    id: 'settings:board';
    data: {
      columns: string[];
    };
  };

  const FIRST_COLUMN_SELECTOR = {
    'fragments.todolist.done': { $eq: false },
    $or: [
      { 'fragments.todolist.column': { $eq: 0 } },
      { 'fragments.todolist.column': { $exists: false } }
    ]
  };
  const DONE_COLUMN_SELECTOR = { 'fragments.todolist.done': { $eq: true } };

  function getColumnSelector(i: number) {
    return { 'fragments.todolist.done': { $eq: false }, 'fragments.todolist.column': { $eq: i } };
  }

  let columns: BoardColumn[] = $state([]);
  let boardColumnsConfig: string[] = $state([]);

  let autofocusKey: string = $state('noop');

  globals.db?.documents
    .findOne({ selector: { id: 'settings:board' } })
    .$.subscribe((settings: RxDocument<SettingsBoard> | null) => {
      if (!settings) {
        // we use the default settings
        columns = [
          {
            name: 'Todo',
            cards: [],
            index: 0,
            limit: 9999,
            selector: FIRST_COLUMN_SELECTOR,
            isLoading: true,
            
          },
          {
            name: 'Doing',
            cards: [],
            index: 1,
            limit: 9999,
            selector: getColumnSelector(1),
            isLoading: true,
            
          },
          {
            name: 'Done',
            cards: [],
            index: -1,
            limit: 30,
            selector: DONE_COLUMN_SELECTOR,
            isLoading: true,
            
          }
        ];
      } else {
        settings.data.columns.forEach((v, i) => {
          let c: BoardColumn = {
            name: v,
            cards: [],
            index: i,
            selector: getColumnSelector(i),
            isLoading: true,
          };
          if (i === 0) {
            // unassign entries go to the first column
            c.selector = FIRST_COLUMN_SELECTOR;
          }
          if (i === settings.data.columns.length - 1) {
            // the last column automatically gets done entries
            c.selector = DONE_COLUMN_SELECTOR;
            c.index = -1;
            c.limit = 30;
            c.isLoading = true
          }
          columns = [...columns, c];
        });
      }
      boardColumnsConfig = columns.map((c) => c.name);

      columns.forEach((v, i) => {
        globals.db.documents
        .find({
          limit: v.limit,
          sort: [v.index === -1 ? { modified_at: 'desc' } : { created_at: 'desc' }],
          selector: v.selector,
        })
        .$.subscribe((notes) => {
            v.isLoading = false
            v.cards = notes.map((n) => {
              return {
                id: n.id,
                note: n
              };
            });
          });
      });
    });

  async function saveBoard() {
    return await createOrUpdateSetting('settings:board', { columns: boardColumnsConfig });
  }
</script>

<div class="my__layout">
  <MainNavigation />
  <main>
    <div class="scroll__wrapper">
      <header class="p__inline-3">
        <MainNavigationToggle class="layout__multi-hidden" />
        <h2 class="flex__grow">Board</h2>

        <DialogForm
          anchorClass="button__link"
          anchorText="Settings"
          title="Update board settings"
          onsubmit={async (e: SubmitEvent) => {
            saveBoard();
            e.preventDefault();
            location.reload();
          }}
        >
          {#each boardColumnsConfig as column, i (i)}
            <div class="form__field">
              <label for={`column-${i}`}>Column #{i + 1}</label>
              <input
                type="text"
                id={`column-${i}`}
                name={`column-${i}`}
                bind:value={boardColumnsConfig[i]}
              />
              {#if i < boardColumnsConfig.length - 1 && i > 0}
                <button
                  type="button"
                  onclick={() => {
                    boardColumnsConfig.splice(i, 1);
                    boardColumnsConfig = [...boardColumnsConfig];
                  }}>Delete</button
                >
              {/if}
            </div>
          {/each}
          <button
            type="button"
            onclick={() => {
              boardColumnsConfig = [
                ...boardColumnsConfig.slice(0, boardColumnsConfig.length - 1),
                'New column',
                ...boardColumnsConfig.slice(-1)
              ];
            }}>Add column</button
          >
        </DialogForm>
      </header>
      <div class="scroll">
        <div class="flex__row | board">
          {#each columns as column}
            <section class="flex__column | board__column" aria-busy={column.isloading} aria-live="polite">
              <h3>{column.name}</h3>
              <button
              class="m__block-1"
              type="button"
              style={column.index === -1 ? 'visibility: hidden' : ''}
              onclick={async (e) => {
                  let note = getNewNote();
                  note.fragments.todolist = getNewTodoListFragment();
                  note.fragments.todolist.column = column.index;
                  autofocusKey = note.id;
                  await globals.db?.documents.insert(note);
                }}>Add task</button
              >
              <LoadingState isLoading={column.isLoading}>Loading data…</LoadingState>
              <ol
                class="flex__grow | p__block-0 p__inline-0 | flow"
                use:dragHandleZone={{ items: column.cards, flipDurationMs: 100 }}
                onconsider={async (e) => handleDndConsider(e, column)}
                onfinalize={async (e) => handleDndFinalize(e, column)}
                data-target={column.index}
              >
                {#each column.cards as item (item.id)}
                  <li class="card" animate:flip={{ duration: 100 }}>
                    <Lazy height={100} keep={true}>
                      <TodoCard
                        {dragHandle}
                        autofocus={autofocusKey === item.id}
                        note={item.note}
                        on:delete={(e) => {
                          e.detail.note.incrementalRemove();
                        }}
                      />
                    </Lazy>
                  </li>
                {/each}
              </ol>
              {#if column.index === -1 && column.cards.length > 0}
                <button
                  onclick={async (e) => {
                    let newCards = await globals.db.documents
                      .find({
                        limit: column.limit,
                        sort: [{ modified_at: 'desc' }],
                        selector: {
                          id: { $lt: column.cards.slice(-1)[0].id },
                          ...column.selector
                        }
                      })
                      .exec();
                    column.cards = [
                      ...column.cards,
                      ...newCards.map((n) => {
                        return { id: n.id, note: n };
                      })
                    ];
                  }}>Load more</button
                >
              {/if}
            </section>
          {/each}
        </div>
      </div>
    </div>
  </main>
</div>
