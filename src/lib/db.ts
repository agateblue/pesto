import PouchDB from 'pouchdb';
import DOMPurify from 'dompurify';
import { marked } from 'marked'

import { v7 as uuidv7 } from 'uuid';
import type { TextFragment, Note, Fragment, DBEntry, FullNote } from '../ambient';

export const db = new PouchDB('pesto');

export function renderMarkdown (text: string): string {
  return DOMPurify.sanitize(
    marked.parse(
      text || ''
    )
  );
}

export function buildUniqueId(objType, id: string = null)  {
  if (!id) {
    id = uuidv7()
  }
  return `${objType}/${id}`
}


export function getNewNote() {
  return {
    _id: buildUniqueId('note'),
    version: '0',
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString(),
    title: null,
    tags: [],
  } as Note
}


export function getNewFragment(noteId, subtype) {
  return {
    version: '0',
    _id: buildUniqueId('fragment'),
    note_id: noteId,
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString(),
    type: 'fragment',
    subtype,
  } as Fragment
}

export function getNewTextFragment(noteId, content = '') {
  return {
    ...getNewFragment(noteId, 'text'),
    text: '' || content,
  } as TextFragment
}

export async function createOrUpdate (entry: DBEntry) {
  if (!entry._rev) {
    delete entry._rev
  }
  console.debug("About to persist: ", entry)
  let result = await db.put(entry)
  if (result.ok) {
    entry._rev = result.rev
  }
}

interface GroupedObjects {
  [key: string]: Object[],
}

export function groupById(list: Array<Object>, property: string) {
  let mapping: GroupedObjects = {}
  list.forEach(e => {
    if (!mapping[e[property]]) {
      mapping[e[property]] = [] 
    }
    mapping[e[property]].push(e)
  })
  return mapping

}
export async function fetchAllByType (type: string) {
  let result = await db.allDocs({
    include_docs: true,
    limit: 100000,
    descending: false,
    startkey: `${type}/`

  });
  return result.rows.map(r => {
    return r.doc as DBEntry
  })
}
