import { type DocumentType, type FormConfiguration, type FormFieldConfiguration } from './db';
import { parseTags } from './ui';
import isEmpty from 'lodash/isEmpty';

export type RxBaseDoc = {
  _deleted: boolean;
};
export type TempoTag = {
  id: string;
  text: string;
  sign: '-' | '+' | '#' | '@' | '!' | '~' | '?';
  type: 'feeling' | 'annotation';
  mood: number;
  value?: number | string | null | undefined;
};
export type TempoEntry = RxBaseDoc & {
  // yes, with and without underscore because PouchDB and RxDB uses both
  id: string;
  _id: string;
  date: string;
  text: string;
  type: 'entry';
  mood: number;
  tags: TempoTag[];
  form: string | null;
  thread: null;
  replies: [];
  favorite: false;
  data: null | object;
};

export type TempoSubtask = {
  label: string;
  done: boolean;
};

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
};

export function pestoToTempoDocument(document: DocumentType, doneIndex: number) {
  let data: TempoEntry | TempoTask | null = null;
  if (document.type === 'note') {
    let baseData = {
      date: document.created_at,
      _id: document.id,
      _deleted: document._deleted
    };
    if (document.fragments?.text?.content) {
      let text = document.fragments?.text?.content;
      let tags: TempoTag[] = parseTags(text);
      data = {
        ...baseData,
        type: 'entry',
        text,
        tags,
        mood: tags.map((t) => t.mood).reduce((a, b) => a + b, 0),
        thread: null,
        replies: [],
        form: null,
        data: null,
        favorite: false
      };
    }
    if (document.fragments?.todolist?.title) {
      let text = document.fragments?.todolist?.title;
      let column = document.fragments.todolist.column;
      let subtasks: TempoSubtask[] = (document.fragments.todolist.todos || []).map((t) => {
        return { label: t.text, done: t.done };
      });
      data = {
        ...baseData,
        type: 'task',
        text,
        subtasks,
        category: null,
        index: -1,
        list: column === -1 ? doneIndex : column
      };
    }
  }
  console.debug('Converting document from pesto to tempo', document, data);
  return data;
}

export function tempoToPestoDocument(document: TempoEntry | TempoTask, doneIndex: number) {
  let data: DocumentType | null = null;
  let id = document.id || document._id;
  if (document.type === 'settings' && id === 'boardConfig') {
    if (document.value?.lists) {
      let date = document.date || new Date().toISOString();
      data = {
        id: 'settings:board',
        type: 'setting',
        created_at: date,
        modified_at: date,
        fragments: {},
        tags: [],
        title: null,
        data: { columns: [...document.value.lists.map((l) => l.label), 'Done'] }
      };
    }
  }
  if (document.type === 'entry' || document.type === 'task') {
    let baseData = {
      id,
      type: 'note',
      created_at: document.date,
      modified_at: document.date,
      _deleted: document._deleted,
      fragments: {},
      tags: [],
      title: null
    };
    if (document.type === 'entry') {
      let text = document.text?.trim() || '';
      let tags = document.tags.map((t) => t.id);
      data = {
        ...baseData,
        tags,
        fragments: {}
      };
      if (text) {
        data.fragments.text = { content: text };
      }

      if (!isEmpty(document.data || {})) {
        let formFragment = {
          id: document.form || null,
          data: document.data || {}
        };
        data.fragments.form = formFragment;
      }
    }
    if (document.type === 'task') {
      let text = document.text;
      let todos = document.subtasks.map((t) => {
        let subtaskId = id;
        return {
          done: t.done === null ? false : t.done,
          text: t.label,
          id: subtaskId
        };
      });
      let done = document.list >= doneIndex;
      let column = document.list >= doneIndex ? -1 : document.list;
      data = {
        ...baseData,
        fragments: { todolist: { title: text, column, done, todos } }
      };
    }
  }
  if (!data) {
    if (document.type) {
      id = `${document.type}:${id}`;
    }
    id = `ignored:tempo:${id}`;
    data = { id, type: 'ignored' };
  }
  if (data.type === 'setting' || data.type === 'ignored') {
    console.debug('Converting document from tempo to pesto', document, data);
  }
  return data;
}

export function tempoBlueprintsToPestoForm(blueprints: object[]) {
  let fields = {};
  let forms = [];

  blueprints.forEach((b) => {
    b.definition?.fields?.forEach((f) => {
      fields[f.id] = f;
    });
    b.definition?.forms?.forEach((f) => {
      forms.push(f);
    });
  });
  let finalForms: FormConfiguration[] = [];

  forms.forEach((f) => {
    let finalFields: FormFieldConfiguration[] = f.fields.map((field) => {
      let final = fields[field.id];
      final = Object.assign(final, field);
      final.autosuggest = final.autosuggest === null ? false : true;
      final.required = final.required === undefined ? true : final.required;
      delete final.min;
      delete final.step;
      delete final.unit;
      return final;
    });
    let form: FormConfiguration = {
      id: f.id,
      name: f.label,
      fields: finalFields
    };
    finalForms.push(form);
  });
  return finalForms;
}
