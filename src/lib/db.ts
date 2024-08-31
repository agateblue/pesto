import { createRxDatabase, type MangoQuery, type RxCollection } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';

import isEqual from 'lodash/isEqual';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

import { v7 as uuidv7 } from 'uuid';
import type { TextFragment, Note, Fragment, DBEntry } from '../ambient';

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
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
      id: {
        type: 'string',
        maxLength: 40
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
    required: ['id', 'created_at', 'note_id', 'data', 'type']
  };

  await db.addCollections({
    notes: {
      schema: noteSchema
    },
    fragments: {
      schema: fragmentSchema
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
