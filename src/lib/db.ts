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
  type MangoQuerySelector
} from 'rxdb';
import { RxDBMigrationSchemaPlugin } from 'rxdb/plugins/migration-schema';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBStatePlugin } from 'rxdb/plugins/state';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import { dev } from '$app/environment';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import {
  replicateWebRTC,
  getConnectionHandlerSimplePeer
} from 'rxdb/plugins/replication-webrtc';

import { v7 as uuidv7 } from 'uuid';

if (dev) {
  import('rxdb/plugins/dev-mode').then(r => {
    addRxPlugin(r.RxDBDevModePlugin);
  })
}

addRxPlugin(RxDBMigrationSchemaPlugin);
addRxPlugin(RxDBStatePlugin);
addRxPlugin(RxDBUpdatePlugin);

export const LOCALE = (new Intl.NumberFormat()).resolvedOptions().locale

export const DATE_FORMATTER = new Intl.DateTimeFormat(LOCALE, {
  weekday: 'long',
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
})
export const TIME_FORMATTER = new Intl.DateTimeFormat(LOCALE, {
  timeStyle: 'short',
})
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
      type: ['string', 'null']
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
        type: 'string'
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
              type: 'string'
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
                  }
                }
              }
            }
          }
        }
      }
    }
  }
} as const;

const noteSchemaTyped = toTypedRxJsonSchema(noteSchemaLiteral);

// aggregate the document type from the schema
export type NoteDocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof noteSchemaTyped>;

export type TextType = NonNullable<NoteDocType['fragments']['text']>;
export type TodolistType = NonNullable<NoteDocType['fragments']['todolist']>;
export type TodosType = NonNullable<TodolistType['todos']>;
export type TodoType = TodosType[number];

// create the typed RxJsonSchema from the literal typed object.
export const noteSchema: RxJsonSchema<NoteDocType> = noteSchemaLiteral;

// and then merge all our types
export type NoteCollection = RxCollection<NoteDocType>;

export type NoteDocument = RxDocument<NoteDocType>;

export type DatabaseCollections = {
  notes: NoteCollection;
};

export type Database = RxDatabase<DatabaseCollections>;

export type Globals = {
  db: null | Database;
  uiState: null | RxState;
};
export const globals: Globals = {
  db: null,
  uiState: null,
  replication: null,
};

export async function getDb() {
  if (globals.db) {
    return globals;
  }
  let db = await createRxDatabase<Database>({
    name: 'main',
    storage: getRxStorageDexie()
  });

  const noteSchema: RxJsonSchema<NoteDocType> = noteSchemaLiteral;
  await db.addCollections({
    notes: {
      schema: noteSchema,
      migrationStrategies: {
        1: function (oldDoc) {
          if (oldDoc?.fragments?.todolist) {
            oldDoc.fragments.todolist.title = null;
          }
          return oldDoc;
        },
        2: function (oldDoc) {
          if (oldDoc?.fragments?.todolist) {
            oldDoc.fragments.todolist.done = true;
            for (const todo of oldDoc.fragments.todolist.todos) {
              if (!todo.done) {
                oldDoc.fragments.todolist.done = false;
                break;
              }
            }
          }
          return oldDoc;
        },
        3: function (oldDoc) {
          return oldDoc;
        },
        4: function (oldDoc) {
          if (oldDoc?.fragments?.todolist) {
            oldDoc.fragments.todolist.title = oldDoc.fragments.todolist.title || 'TODO';
          }
          return oldDoc;
        },
        5: function (oldDoc) {
          if (oldDoc?.fragments?.todolist) {
            for (const todo of oldDoc.fragments.todolist.todos) {
              todo.id = buildUniqueId({
                msecs: Date.parse(oldDoc.created_at)
              });
            }
          }
          return oldDoc;
        }
      }
    }
  });

  let uiState = await db.addState('ui');

  window.process = {
    nextTick: (fn, ...args) => setTimeout(() => fn(...args)),
  };
  const replicationPool = await replicateWebRTC(
    {
      collection: db.notes,
      // The topic is like a 'room-name'. All clients with the same topic
      // will replicate with each other. In most cases you want to use
      // a different topic string per user.
      topic: 'my-users-pool-agate-test-dev-pesto',
      /**
       * You need a collection handler to be able to create WebRTC connections.
       * Here we use the simple peer handler which uses the 'simple-peer' npm library.
       * To learn how to create a custom connection handler, read the source code,
       * it is pretty simple.
       */
      connectionHandlerCreator: getConnectionHandlerSimplePeer({
          // Set the signaling server url.
          // You can use the server provided by RxDB for tryouts,
          // but in production you should use your own server instead.
          signalingServerUrl: 'wss://signaling.rxdb.info/',
      }),
      pull: {
        
      },
      push: {
      },
    }
  );
  let initialAddPeer = replicationPool.addPeer.bind(replicationPool)
  let replicationMonkeyPatched = false
  replicationPool.addPeer = function addPeer (peer, replicationState) {
    let initialPushHandler = replicationState?.push.handler
    async function pushHandler(docs) {
      console.log("HELLO before", initialPushHandler, docs)
      docs = docs.filter(d => {
        return (d.newDocumentState.fragments?.text.content.includes('hello'))
      })
      console.log("HELLO after", initialPushHandler, docs)
      return await initialPushHandler(docs)
    }
    if (replicationState && !replicationMonkeyPatched) {
      replicationState.push.handler = pushHandler
      replicationMonkeyPatched = true
    }
    console.log("PEER ADDED", replicationState)
    return initialAddPeer(peer, replicationState)
  }
  return { db, uiState };
}

marked.use({
  gfm: true,
  breaks: true,
});

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
    tags: []
  } as Note;
}

export function getNewTextFragment(content = '') {
  return {
    content
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
  return results;
}

export type QueryToken = {
  type: 'is' | 'text';
  value: string;
};
export function getQueryTokens(q: string) {
  return q
    .split(' ')
    .filter((s) => {
      return s.trim();
    })
    .map((s) => {
      let raw = s.trim().toLowerCase();
      if (raw.startsWith('is:')) {
        return {
          type: 'is',
          value: raw.slice(3)
        } as QueryToken;
      } else {
        return {
          type: 'text',
          value: raw
        } as QueryToken;
      }
    });
}
export function tokensToMangoQuery(tokens: QueryToken[]) {
  let query = [];
  for (const token of tokens) {
    if (token.type === 'is') {
      if (token.value === 'task') {
        query.push({ 'fragments.todolist': { $exists: true } });
      } else if (token.value === 'subtask') {
        query.push({ 'fragments.todolist.todos.1': { $exists: true } });
      } else if (token.value === 'done') {
        query.push({ 'fragments.todolist.done': { $eq: true } });
      }else if (token.value === 'text') {
        query.push({ 'fragments.text.content': { $exists: true } });
      }
    }
    if (token.type === 'text') {
      let orQuery = [];
      let regex = { $regex: `.*${token.value}.*`, $options: 'i' };
      orQuery.push({ 'fragments.text.content': regex });
      orQuery.push({ 'fragments.todolist.title': regex });
      orQuery.push({ 'fragments.todolist.todos': { $elemMatch: { text: regex } } });
      query.push({ $or: orQuery });
    }
  }
  return query;
}
export function capitalizeFirstLetter(s: string) {
  return s[0].toUpperCase() + s.slice(1);
}

export function formatDate(d: string) {
  let p = new Date(d)
  let formatted = `${DATE_FORMATTER.format(p)} · ${TIME_FORMATTER.format(p)}`
  return capitalizeFirstLetter(formatted)
}