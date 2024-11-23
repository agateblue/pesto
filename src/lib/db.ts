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
import { replicateWebRTC, getConnectionHandlerSimplePeer } from 'rxdb/plugins/replication-webrtc';

import {
  replicateCouchDB,
  getFetchWithCouchDBAuthorization
} from 'rxdb/plugins/replication-couchdb';

import cloneDeep from 'lodash/cloneDeep';
import { parseTags } from './ui';
import { tempoToPestoDocument } from './replication';

if (dev) {
  import('rxdb/plugins/dev-mode').then((r) => {
    addRxPlugin(r.RxDBDevModePlugin);
  });
}

addRxPlugin(RxDBMigrationSchemaPlugin);
addRxPlugin(RxDBStatePlugin);
addRxPlugin(RxDBUpdatePlugin);

export const DEFAULT_SIGNALING_SERVER = 'wss://signaling.rxdb.info/';

export const LOCALE = new Intl.NumberFormat().resolvedOptions().locale;

export const DATE_FORMATTER = new Intl.DateTimeFormat(LOCALE, {
  weekday: 'long',
  day: '2-digit',
  month: '2-digit',
  year: '2-digit'
});

export const DATE_FORMATTER_SHORT = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit',
  month: '2-digit',
  year: '2-digit'
});
export const TIME_FORMATTER = new Intl.DateTimeFormat(LOCALE, {
  timeStyle: 'short'
});
export const documentSchemaLiteral = {
  version: 3,
  primaryKey: 'id',
  type: 'object',
  required: ['id', 'type', 'created_at', 'modified_at', 'tags', 'fragments'],
  properties: {
    id: {
      type: 'string',
      maxLength: 40
    },
    type: {
      type: 'string',
      enum: ['note', 'setting']
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
    data: {
      type: 'object',
      additionalProperties: true,
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
          required: ['todos', 'title', 'done', 'column'],
          properties: {
            title: {
              type: ['string']
            },
            done: {
              type: 'boolean'
            },
            column: {
              type: 'number',
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

const documentSchemaTyped = toTypedRxJsonSchema(documentSchemaLiteral);

// aggregate the document type from the schema
export type DocumentType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof documentSchemaTyped>;
export type NoteType = DocumentType & {
  type: 'note';
};

export type TextType = NonNullable<DocumentType['fragments']['text']>;
export type TodolistType = NonNullable<DocumentType['fragments']['todolist']>;
export type TodosType = NonNullable<TodolistType['todos']>;
export type TodoType = TodosType[number];

// create the typed RxJsonSchema from the literal typed object.
export const documentSchema: RxJsonSchema<DocumentType> = documentSchemaLiteral;

// and then merge all our types
export type DocumentCollection = RxCollection<DocumentType>;

export type DocumentDocument = RxDocument<DocumentType>;

export type DatabaseCollections = {
  documents: DocumentCollection;
};

export type Database = RxDatabase<DatabaseCollections>;

export type Globals = {
  db: null | Database;
  uiState: null | RxState;
  replications: [];
};
export const globals: Globals = {
  db: null,
  uiState: null,
  replications: []
};

export type Replication = {
  type: string;
  pull: boolean;
  push: boolean;
};
export type WebRTCReplication = Replication & {
  type: 'webrtc';
  signalingServer: string;
  room: string;
};

export type CouchDBReplication = Replication & {
  type: 'couchdb';
  server: string;
  database: string;
  username: string;
  password: string;
};

export type CouchDBReplicationTempo = CouchDBReplication & {
  type: 'couchdb-tempo'
}

export type AnyReplication = CouchDBReplication | CouchDBReplicationTempo | WebRTCReplication;

export async function getDb() {
  if (globals.db) {
    return globals;
  }
  let db = await createRxDatabase<Database>({
    name: 'main',
    storage: getRxStorageDexie()
  });

  const documentSchema: RxJsonSchema<DocumentType> = documentSchemaLiteral;
  await db.addCollections({
    documents: {
      schema: documentSchema,
      migrationStrategies: {
        1: function(oldDocumentData) {
          if (oldDocumentData?.fragments.todolist) {
            if (oldDocumentData.fragments.todolist.done) {
              oldDocumentData.fragments.todolist.column = -1
            } else {
              oldDocumentData.fragments.todolist.column = 0
            }
          }
          return oldDocumentData
        },
        2: function(oldDocumentData) {
          oldDocumentData.data = {}
          return oldDocumentData
        },
        3: function(oldDocumentData) {
          return oldDocumentData
        }
      }
    }
  });

  let uiState = await db.addState('ui');

  uiState.replications$.subscribe(async (v) => {
    v = v || [];
    let newReplications = await setupReplications(db, globals.replications, v);
    globals.replications = newReplications;
  });

  return { db, uiState, replications: [] };
}

async function setupReplications(db: Database, current: [], config: AnyReplication[]) {
  // we stop and delete any existing replications
  for (const replicationState of current) {
    if (replicationState.remove) {
      await replicationState.remove();
    } else {
      await replicationState.cancel();
    }
  }

  // necessary for WebRTC replication to work
  window.process = {
    nextTick: (fn, ...args) => setTimeout(() => fn(...args))
  };

  let replicationStates = [];
  // we create replications from given configuration
  for (const conf of config) {
    let state = await createReplication(db, conf);
    if (state) {
      replicationStates.push(state);
    }
  }
  return replicationStates;
}

async function createReplication(db: Database, config: AnyReplication) {
  let state = null;
  let pushPullConfig = {};
  if (config.push) {
    pushPullConfig.push = {};
  }
  if (config.pull) {
    pushPullConfig.pull = {};
  }
  if (config.type === 'couchdb') {
    const couchdbUrl = `${config.server}/${config.database}/`;
    state = replicateCouchDB({
      replicationIdentifier: `pesto-couchdb-replication-${couchdbUrl}`,
      collection: db.documents,
      url: couchdbUrl,
      live: true,
      fetch: getFetchWithCouchDBAuthorization(config.username, config.password),
      ...pushPullConfig
    });
  }
  if (config.type === 'couchdb-tempo') {
    let boardSettings = await db.documents.findOne('settings:board').exec()
    let columns: string[] = boardSettings ? boardSettings.data.columns as string[] : ['Todo', 'Doing', 'Done']
    let doneColumn = columns.length - 1
    const couchdbUrl = `${config.server}/${config.database}/`;

    // pushing is disabled in this mode because we can't actually alter
    // the ids to match Tempo format, which breaks replication and duplicates documents
    delete pushPullConfig.push
   
    if (pushPullConfig.pull) {
      pushPullConfig.pull.modifier = (d) => {
        if (d._deleted && d.id.includes('T') && d.id.includes(':')) {
          return d
        }
        return tempoToPestoDocument(d, doneColumn)
      }
    }
    state = replicateCouchDB({
      replicationIdentifier: `pesto-tempo-couchdb-replication-${couchdbUrl}`,
      collection: db.documents,
      url: couchdbUrl,
      live: true,
      fetch: getFetchWithCouchDBAuthorization(config.username, config.password),
      ...pushPullConfig
    });
  }
  if (config.type === 'webrtc') {
    state = await replicateWebRTC({
      collection: db.documents,
      topic: config.room,
      ...pushPullConfig,
      connectionHandlerCreator: getConnectionHandlerSimplePeer({
        signalingServerUrl: config.signalingServer
      })
    });
    state.error$.subscribe((err) => {
      console.log('REPLICATION ERROR', err);
    });
    let initialAddPeer = state.addPeer.bind(state);
    let replicationMonkeyPatched = false;
    // if (!config.pull) {
    //   // we protect from rogue/misconfigured instances that might push their changes
    //   // even if we disabled pull locally
    //   state.masterReplicationHandler.masterWrite = async function (rows) {
    //     console.debug('Skip writing remote rows locally because pull is disabled', rows)
    //     return []
    //   }
    // }
    // let initialSend = state.connectionHandler.send
    // state.connectionHandler.send = async function (peer, message) {
    //   // drop some messages based on our push/pull configuration
    //   // to protect ourselves from rogue clients
    //   console.log("MESSAIGE", message)
    //   if (!config.push && (message?.result?.documents || Array.isArray(message.result))) {
    //     console.debug('Dropping message because push is disabled…', message)
    //     return
    //   }
    //   return await initialSend(peer, message)
    // }
    state.addPeer = function addPeer(peer, replicationState) {
      // let initialPushHandler = replicationState?.push?.handler
      // async function pushHandler(docs) {
      //   return await initialPushHandler(docs)
      // }
      // if (initialPushHandler && replicationState && !replicationMonkeyPatched) {
      //   replicationState.push.handler = pushHandler
      //   replicationMonkeyPatched = true
      // }
      console.log('PEER ADDED', replicationState);
      return initialAddPeer(peer, replicationState);
    };
    console.log('REPLICATION STATE', state);
  }
  return state;
}

export function buildUniqueId(date: Date | null = null) {
  return (date || new Date()).toISOString()
}

export function getNewNote() {
  let date = new Date()
  return {
    id: buildUniqueId(date),
    type: 'note',
    created_at: date.toISOString(),
    modified_at: date.toISOString(),
    title: null,
    fragments: {},
    tags: []
  } as DocumentType;
}

export function getNewTextFragment(content = '') {
  return {
    content
  } as TextType;
}

export function getNewTodoListFragment() {
  return {
    title: '',
    done: false,
    todos: [],
    column: 0,
  };
}

export function getNewTodo() {
  return {
    id: buildUniqueId(),
    text: '',
    done: false
  } as TodoType;
}

export async function getById(collection: RxCollection, id: string) {
  let results = await collection.findByIds([id]).exec();
  return results.get(id);
}

export async function createOrUpdateSetting(id: string, data: object) {
  let existing = await globals.db?.documents.findOne({selector: {id, type: 'setting'}}).exec()
  if (existing) {
    return await existing.incrementalUpdate({
      $set: {
        modified_at: new Date().toISOString(),
        data: cloneDeep(data),
      }
    })
  } else {
    let d = new Date().toISOString()
    return await globals.db?.documents.insert({
      id,
      type: 'setting',
      created_at: d,
      modified_at: d,
      tags: [],
      fragments: {},
      data: cloneDeep(data),
    })
  }
}
export function getNoteUpdateData(note: DocumentType, data: object) {
  data = cloneDeep(data);
  data.modified_at = new Date().toISOString();

  let tagsSource = data['fragments.text']?.content || note.fragments.text?.content;
  const tags = parseTags(tagsSource).map((t) => {
    return t.id;
  });
  data.tags = [...new Set(tags)];
  return data;
}
export type QueryToken = {
  type: 'is' | 'text' | 'tag';
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
      } else if (raw.startsWith('tag:')) {
        return {
          type: 'tag',
          value: raw.slice(4)
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
      } else if (token.value === 'text') {
        query.push({ 'fragments.text.content': { $exists: true } });
      }
    }
    if (token.type === 'tag') {
      query.push({ tags: token.value });
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
  let p = new Date(d);
  let formatted = `${DATE_FORMATTER.format(p)} · ${TIME_FORMATTER.format(p)}`;
  return capitalizeFirstLetter(formatted);
}

export function formatDateShort(d: string) {
  let p = new Date(d);
  let formatted = `${DATE_FORMATTER_SHORT.format(p)}`;
  return capitalizeFirstLetter(formatted);
}
