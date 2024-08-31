import isEqual from 'lodash/isEqual';
import PouchDB from 'pouchdb';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

import { v7 as uuidv7 } from 'uuid';
import type { TextFragment, Note, Fragment, DBEntry, FullNote } from '../ambient';

export const db = new PouchDB(
  'main',
  // // see https://github.com/pouchdb/pouchdb/issues/4987#issuecomment-199700504
  // // we try to limit the size of revisions to avoid infinite growth of the database
  // {revs_limit: 10, auto_compaction: true}
);

export function renderMarkdown(text: string): string {
  return DOMPurify.sanitize(marked.parse(text || ''));
}

export function buildUniqueId(objType: string, id: string | null = null, options = {}) {
  if (!id) {
    id = uuidv7(options);
  }
  return `${objType}/${id}`;
}
export function getIdWithoutType(id: string): string {
  return id.split('/')[1];
}

export function getNewNote() {
  return {
    _id: buildUniqueId('note'),
    version: '0',
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString(),
    title: null,
    tags: []
  } as Note;
}

export function getNewFragment(noteId: string, subtype: string) {
  return {
    version: '0',
    _id: buildUniqueId('fragment'),
    note_id: noteId,
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString(),
    subtype
  } as Fragment;
}

export function getNewTextFragment(noteId, content = '') {
  return {
    ...getNewFragment(noteId, 'text'),
    text: '' || content
  } as TextFragment;
}

export async function createOrUpdate(entry: DBEntry) {
  if (!entry._rev) {
    delete entry._rev;
  }

  // we check if the current entry in DB is identical (except the rev)
  // to the given one to avoid writing PouchDB data and revisions when unnecessary
  let existing: DBEntry | null;
  try {
    existing = (await db.get(entry._id)) as DBEntry;
  } catch (e) {
    existing = null;
  }
  if (existing) {
    let c1: DBEntry = { ...existing };
    let c2: DBEntry = { ...entry };
    delete c1._rev;
    delete c2._rev;
    if (isEqual(c1, c2)) {
      console.debug('Entry', entry._id, 'not saved, it matches what is in DB');
      return entry._rev;
    }
  }

  // no existing entry in DB or it needs to be updated
  console.debug('About to persist: ', entry);
  let result = await db.put(entry);
  if (result.ok) {
    return result.rev;
  }
  return null;
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
export async function fetchAllByType(type: string) {
  let result = await db.allDocs({
    include_docs: true,
    limit: 100000,
    descending: false,
    startkey: `${type}/`
  });
  return result.rows.map((r) => {
    return r.doc as DBEntry;
  });
}

export async function getById(id: string) {
  return await db.get(id);
}

export async function fetchMatching(type: string, matcher: Function) {
  let result = await fetchAllByType(type);
  let matching: DBEntry[] = [];
  return result.filter((r) => {
    return matcher(r);
  });
}
