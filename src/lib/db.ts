import {
  createRxDatabase,
  type MangoQuery,
  type RxCollection,
  type RxDatabase,
  addRxPlugin
} from 'rxdb';
import { RxDBMigrationSchemaPlugin } from 'rxdb/plugins/migration-schema';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';

import DOMPurify from 'dompurify';
import { marked } from 'marked';

import { v7 as uuidv7 } from 'uuid';
import type { TextFragment, Note, TodoListFragment, Fragment, DBEntry } from '../ambient';

import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
addRxPlugin(RxDBDevModePlugin);

addRxPlugin(RxDBMigrationSchemaPlugin);

export async function getDb() {
  let db = await createRxDatabase({
    name: 'main',
    storage: getRxStorageDexie()
  });

  const noteSchema = {
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
      id: {
        type: 'string',
        maxLength: 40
      },
      created_at: {
        type: 'string',
        format: 'date-time'
      }
    },
    required: ['id', 'created_at']
  };

  const fragmentSchema = {
    version: 1,
    primaryKey: 'id',
    type: 'object',
    properties: {
      id: {
        type: 'string',
        maxLength: 40
      },
      title: {
        type: ['string', 'null']
      },
      note_id: {
        type: 'string',
        maxLength: 40
      },
      created_at: {
        type: 'string',
        format: 'date-time'
      },
      type: {
        type: 'string',
        enum: ['text']
      },
      data: {
        type: 'object'
      }
    },
    required: ['id', 'title', 'created_at', 'note_id', 'data', 'type']
  };

  await db.addCollections({
    fragments: {
      schema: fragmentSchema,
      autoMigrate: true,
      migrationStrategies: {
        1: (oldDoc) => {
          oldDoc.title = null;
          return oldDoc;
        }
      }
    },
    notes: {
      schema: noteSchema
    }
  });
  return db;
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
    created_at: new Date().toISOString()
  } as Note;
}

export function getNewFragment(noteId: string, type: string, data: object) {
  return {
    id: buildUniqueId(),
    title: null,
    note_id: noteId,
    created_at: new Date().toISOString(),
    data,
    type
  } as Fragment;
}

export function getNewTextFragment(noteId: string, content = '') {
  return {
    ...getNewFragment(noteId, 'text', { text: content || '' })
  } as TextFragment;
}

export function getNewTodoListFragment(noteId: string, content = '') {
  return {
    ...getNewFragment(noteId, 'todolist', { todos: [] })
  } as TodoListFragment;
}

export function getNewTodo() {
  return {
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

export function groupById(list: Array<Object>, property: string) {
  let mapping: GroupedObjects = {};
  list.forEach((e) => {
    if (!mapping[e[property]]) {
      mapping[e[property]] = [];
    }
    mapping[e[property]].push(e);
  });
  return mapping;
}

export async function getById(collection: RxCollection, id: string) {
  let results = await collection.findByIds([id]).exec();
  return results.get(id);
}

export async function getByQuery(collection: RxCollection, query: MangoQuery) {
  let results = await collection.find(query).exec();
  return results.map((r) => {
    return r.toJSON();
  });
}
export async function findNotesAndFragments(db: RxDatabase, query: MangoQuery) {
  let notes = await db.notes.find(query).exec();
  let ids = notes.map((n) => {
    return n.id;
  });
  console.time('Update notes execution time');
  let fragments = await db.fragments
    .find({
      limit: null,
      selector: {
        note_id: { $in: ids }
      }
    })
    .exec();
  let fragmentsByNote = groupById(fragments, 'note_id');
  console.timeEnd('Update notes execution time');
  return {
    notes,
    fragmentsByNote
  };
}
