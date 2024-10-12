import {
  type MangoQuery,
  type RxCollection,
  type RxDatabase,
  type RxDocument,
  type ExtractDocumentTypeFromTypedRxJsonSchema,
  type RxJsonSchema,
  createRxDatabase,
  addRxPlugin,
  toTypedRxJsonSchema,
  type RxState,
} from 'rxdb';
import { RxDBMigrationSchemaPlugin } from 'rxdb/plugins/migration-schema';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import { RxDBStatePlugin } from 'rxdb/plugins/state';

import DOMPurify from 'dompurify';
import { marked } from 'marked';

import { v7 as uuidv7 } from 'uuid';
import type { TextFragment, Note, TodoListFragment, Todo } from '../ambient';

import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
addRxPlugin(RxDBUpdatePlugin);
addRxPlugin(RxDBDevModePlugin);
addRxPlugin(RxDBMigrationSchemaPlugin);
addRxPlugin(RxDBStatePlugin);

export const noteSchemaLiteral = {
  version: 5,
  primaryKey: 'id',
  type: 'object',
  required: ['id', 'created_at', 'modified_at', 'tags', 'fragments'],
  properties: {
    id: {
      type: 'string',
      maxLength: 40
    },
    title: {
      type: ['string', 'null'],
    },
    created_at: {
      type: 'string',
      format: 'date-time'
    },
    modified_at: {
      type: 'string',
      format: 'date-time'
    },
    tags: {
      type: 'array',
      items: {
        type: 'string',
      }
    },
    fragments: {
      type: 'object',
      required: [],
      properties: {
        text: {
          type: 'object',
          required: ['content'],
          properties: {
            content: {
              type: 'string',
            }
          }
        },
        todolist: {
          type: 'object',
          required: ['todos', 'title', 'done'],
          properties: {
            title: {
              type: ['string']
            },
            done: {
              type: 'boolean'
            },
            todos: {
              type: 'array',
              minItems: 0,
              items: {
                type: 'object',
                required: ['id', 'done', 'text'],
                properties: {
                  id: {
                    type: 'string'
                  },
                  done: {
                    type: 'boolean'
                  },
                  text: {
                    type: 'string'
                  },
                }
              }
            }
          }
        },
      }
    }
  },
} as const;

const noteSchemaTyped = toTypedRxJsonSchema(noteSchemaLiteral);

// aggregate the document type from the schema
export type NoteDocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof noteSchemaTyped>;

export type TextType = NonNullable<NoteDocType["fragments"]["text"]>
export type TodolistType = NonNullable<NoteDocType["fragments"]["todolist"]>
export type TodosType = NonNullable<TodolistType["todos"]>
export type TodoType = TodosType[number]

// create the typed RxJsonSchema from the literal typed object.
export const noteSchema: RxJsonSchema<NoteDocType> = noteSchemaLiteral;

// and then merge all our types
export type NoteCollection = RxCollection<NoteDocType>;

export type NoteDocument = RxDocument<NoteDocType>;

export type DatabaseCollections = {
  notes: NoteCollection
}

export type Database = RxDatabase<DatabaseCollections>

export type Globals = {
  db: null | Database;
  uiState: null | RxState;
}
export const globals: Globals = {
  db: null,
  uiState: null,
}

export async function getDb() {
  if (globals.db) {
    return globals
  }
  let db = await createRxDatabase<Database>({
    name: 'main',
    storage: getRxStorageDexie()
  });

  const noteSchema: RxJsonSchema<NoteDocType> = noteSchemaLiteral
  await db.addCollections({
    notes: {
      schema: noteSchema,
      migrationStrategies: {
        1: function (oldDoc) {
          if (oldDoc?.fragments?.todolist) {
            oldDoc.fragments.todolist.title = null
          }
          return oldDoc
        },
        2: function (oldDoc) {
          if (oldDoc?.fragments?.todolist) {
            oldDoc.fragments.todolist.done = true
            for (const todo of oldDoc.fragments.todolist.todos) {
              if (!todo.done) {
                oldDoc.fragments.todolist.done = false
                break
              }
            }

          }
          return oldDoc
        },
        3: function (oldDoc) {
          return oldDoc
        },
        4: function (oldDoc) {
          if (oldDoc?.fragments?.todolist) {
            oldDoc.fragments.todolist.title = oldDoc.fragments.todolist.title || "TODO"
          }
          return oldDoc
        },
        5: function (oldDoc) {
          if (oldDoc?.fragments?.todolist) {
            for (const todo of oldDoc.fragments.todolist.todos) {
              todo.id = buildUniqueId({
                msecs: Date.parse(oldDoc.created_at)
              })
            }
          }
          return oldDoc
        }
      }
    }
  });

  let uiState = await db.addState('ui');
  return {db, uiState};
}

export function renderMarkdown(text: string): string {
  return DOMPurify.sanitize(marked.parse(text || ''));
}

export function buildUniqueId(options = {}) {
  return uuidv7(options);
}

export function getNewNote() {
  return {
    id: buildUniqueId(),
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString(),
    title: null,
    fragments: {},
    tags: [],
  } as Note;
}

export function getNewTextFragment(content = '') {
  return {
    content,
  } as TextFragment;
}

export function getNewTodoListFragment() {
  return {
    title: null,
    todos: []
  } as TodoListFragment;
}

export function getNewTodo() {
  return {
    id: buildUniqueId(),
    text: '',
    done: false
  } as Todo;
}
export async function createOrUpdate(collection: RxCollection, entry: DBEntry) {
  return await collection.upsert(entry);
}

interface GroupedObjects {
  [key: string]: Object[];
}

export async function getById(collection: RxCollection, id: string) {
  let results = await collection.findByIds([id]).exec();
  return results.get(id);
}

export async function getByQuery(collection: RxCollection, query: MangoQuery) {
  let results = await collection.find(query).exec();
  return results
}