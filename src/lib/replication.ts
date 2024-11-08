import { type DocumentType } from "./db";
import { parseTags } from "./ui";

export type RxBaseDoc = {
  _deleted: boolean;
}
export type TempoTag = {
  id: string,
  text: string,
  sign: '-' | '+' | '#' | '@' | '!' | '~' | '?';
  type: 'feeling' | 'annotation';
  mood: number;
  value?: number | string | null | undefined;
}
export type TempoEntry = RxBaseDoc & {
  // yes, with and without underscore because PouchDB and RxDB uses both
  id: string;
  _id: string;
  date: string;
  text: string;
  type: 'entry';
  mood: number;
  tags: TempoTag[];
  form: null;
  thread: null;
  replies: [];
  favorite: false;
  data: null;
}

export type TempoSubtask = {
  label: string;
  done: boolean;
}

export type TempoTask = RxBaseDoc & {
  id: string;
  _id: string;
  type: 'task';
  date: string;
  index: -1;
  text: string;
  list: number;
  category: null;
  subtasks: TempoSubtask[];
}

export function pestoToTempoDocument(document: DocumentType, doneIndex: number) {
  let data: TempoEntry | TempoTask | null = null
  if (document.type === 'note') {
    let baseData = {
      date: document.created_at,
      _id: document.id,
      _deleted: document._deleted,
    }
    if (document.fragments?.text?.content) {
      let text = document.fragments?.text?.content
      let tags: TempoTag[] = parseTags(text)
      data = {
        ...baseData,
        type: 'entry',
        text,
        tags,
        mood: tags.map(t => t.mood).reduce((a, b) => a + b, 0),
        thread: null,
        replies: [],
        form: null,
        data: null,
        favorite: false,
      }
    }
    if (document.fragments?.todolist?.title) {
      let text = document.fragments?.todolist?.title
      let column = document.fragments.todolist.column
      let subtasks: TempoSubtask[] = (document.fragments.todolist.todos || []).map(t => {
        return {label: t.text, done: t.done}
      })
      data = {
        ...baseData,
        type: 'task',
        text,
        subtasks,
        category: null,
        index: -1,
        list: column === -1 ? doneIndex : column
      }
    }
  }
  console.debug("Converting document from pesto to tempo", document, data)
  return data  
}


export function tempoToPestoDocument(document: TempoEntry | TempoTask, doneIndex: number) {
  let data: DocumentType | null = null
  if (document.type === 'entry' || document.type === 'task') {
    let id = document.id || document._id
    let baseData = {
      id,
      type: 'note',
      created_at: document.date,
      modified_at: document.date,
      _deleted: document._deleted,
      fragments: {},
      tags: [],
      title: null,
    }
    if (document.type === 'entry' && document.text?.trim()) {
      let text = document.text
      let tags = document.tags.map(t => t.id)
      data = {
        ...baseData,
        tags,
        fragments: {text: {content: text}}
      }
    }
    if (document.type === 'task') {
      let text = document.text
      let todos = document.subtasks.map(t => {
        let subtaskId = id
        return {
          done: t.done,
          text: t.label,
          id: subtaskId,
        }
      })
      let done = document.list >= doneIndex
      let column = document.list >= doneIndex ? -1 : document.list
      data = {
        ...baseData,
        fragments: {todolist: {title: text, column, done, todos}}
      }
    }
  }
  if (!data) {
    let id = document._id
    if (document.type) {
      id = `${document.type}:${id}`
    }
    id = `ignored:tempo:${id}`
    data = {id, type: 'ignored'}
  }
  console.debug("Converting document from tempo to pesto", document, data)
  return data  
}