import {
  type DocumentType,
  type FormConfiguration,
  type FormFieldConfiguration,
  type DocumentDocument,
  createOrUpdateSetting,
  getSettingData,
  createOrUpdateForm,
  globals,
  CURRENT_DOCUMENT_VERSION,
  migrationStrategies,
  documentSchemaLiteral,
  getNewFormFragment
} from './db';
import { parseTags, type LogMessage } from './ui';
import isEmpty from 'lodash/isEmpty';

export type TempoTag = {
  id: string;
  text: string;
  sign: '-' | '+' | '#' | '@' | '!' | '~' | '?';
  type: 'feeling' | 'annotation';
  mood: number;
  value?: number | string | null | undefined;
};
export type TempoEntry = {
  _id: string;
  _rev: string;
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

export type TempoTask = {
  _id: string;
  _rev: string;
  type: 'task';
  date: string;
  index: -1;
  text: string;
  list: number;
  category: null;
  subtasks: TempoSubtask[];
};

export function pestoToTempoDocuments(document: DocumentType, doneIndex: number) {
  let data: (TempoEntry | TempoTask)[] = [];
  if (document.type === 'note') {
    let baseData = {
      date: document.created_at,
      _id: document.id,
      // a revision is mandatory so we hardcode one
      _rev: '1-00000000000000000000000000000000'
    };
    if (document.fragments?.text?.content) {
      let text = document.fragments?.text?.content;
      if (document.title) {
        text = `# ${document.title}\n\n${text}`
      }
      let tags: TempoTag[] = parseTags(text);
      let d = { ...(document.fragments?.form?.data || {}) };
      tags.forEach((t) => {
        if (t.type === 'annotation') {
          try {
            d[t.id] = JSON.parse(t.value);
          } catch {
            d[t.id] = t.value;
          }
        }
      });
      data.push({
        ...baseData,
        type: 'entry',
        text,
        tags,
        mood: tags.map((t) => t.mood).reduce((a, b) => a + b, 0),
        thread: null,
        replies: [],
        form: document.fragments?.form?.id || null,
        data: d,
        favorite: false
      });
    } else if (document.fragments?.form?.id) {
      let d = { ...(document.fragments?.form?.data || {}) };
      data.push({
        ...baseData,
        type: 'entry',
        text: '',
        tags: [],
        mood: 0,
        thread: null,
        replies: [],
        form: document.fragments?.form?.id,
        data: d,
        favorite: false
      });
    }
    if (document.fragments?.todolist?.todos?.length > 0) {
      let column = document.fragments.todolist.column;
      let todos = document.fragments.todolist.todos
      
      // tempo has a top level task, we use the note title if any or the first
      // todo for that
      let text = document.title?.trim()
      if (!text) {
        text = todos[0].text
        todos.shift()
      }
    
      let subtasks: TempoSubtask[] = (todos || []).map((t) => {
        return { label: t.text, done: t.done };
      });
      let _id = baseData._id;
      if (data.length > 0) {
        // we have both a note/form and a todolist in this document
        //
        // for backward compat with tempo, which doesn't support entry and task
        // in the same document, we create two documents, but we also
        // have to generate another id for the task.
        // We do that by incrementing microseconds by 1
        let timeWithoutMicroseconds, microseconds;
        [timeWithoutMicroseconds, microseconds] = _id.split('.');
        microseconds = parseInt(microseconds.replace('Z', '')) + 1;
        if (microseconds === 1000) {
          microseconds = '000';
        } else {
          microseconds = String(microseconds);
        }
        _id = `${timeWithoutMicroseconds}.${microseconds}Z`;
      }
      data.push({
        ...baseData,
        _id,
        type: 'task',
        text,
        subtasks,
        category: null,
        index: -1,
        list: column === -1 ? doneIndex : column
      });
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
        col: null,
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
      col: null,
      created_at: document.date,
      modified_at: document.date,
      _deleted: document._deleted,
      fragments: {},
      tags: [],
      starred: document.favorite,
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
        let formFragment = getNewFormFragment(document.form || null, document.data || {});
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
  data.source = 'Tempo';
  data._deleted = false
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

export function migrateDocumentToLatest(document: DocumentType, version: number) {
  while (version < CURRENT_DOCUMENT_VERSION) {
    version += 1;
    let migration = migrationStrategies[version];
    document = migration(document);
  }
  return document;
}

type ValidateFunction = {
  (document: DocumentType): boolean;
};

export async function getPestoDocumentValidator() {
  let Ajv = await import('ajv');
  let addFormats = await import('ajv-formats');
  let ajv = new Ajv();
  addFormats(ajv);
  let schema = { ...documentSchemaLiteral };
  delete schema.version;
  delete schema.indexes;
  delete schema.primaryKey;
  return ajv.compile(schema) as ValidateFunction;
}

export async function handleImportPesto(
  files: FileList,
  messages: LogMessage[],
  flags = {
    notes: true,
    forms: true,
    settings: true
  }
) {
  let pestoFile;
  try {
    pestoFile = files[0];
  } catch {
    return messages.push({ type: 'error', text: 'No file was provided' });
  }

  // init
  messages.push({ type: 'info', text: 'Opening file…' });
  let content = await pestoFile.text();
  messages.push({ type: 'info', text: 'File read!' });

  messages.push({ type: 'info', text: 'Parsing file…' });
  let data: object = JSON.parse(content);
  messages.push({ type: 'info', text: 'File parsed!' });

  let version: number = data.version;
  let documents: DocumentType[] = data.documents;
  let validate = await getPestoDocumentValidator();

  let steps = [
    {
      flag: 'settings',
      type: 'setting',
      label: 'settings'
    },
    {
      flag: 'forms',
      type: 'form',
      label: 'forms'
    },
    {
      flag: 'notes',
      type: 'note',
      label: 'notes'
    },
    {
      flag: 'collections',
      type: 'collection',
      label: 'Collections'
    }
  ];

  // starting importing various types:
  for (const step of steps) {
    if (flags[step.flag]) {
      let docs = documents.filter((d) => d.type === step.type);
      messages.push({ type: 'info', text: `Preparing ${docs.length} ${step.label}` });
      docs = docs.map((s) => migrateDocumentToLatest(s, version));
      messages.push({
        type: 'info',
        text: `Checking ${docs.length} ${step.label} for correctness…`
      });
      docs = docs.filter((s) => {
        let isValid = validate(s);
        if (!isValid) {
          console.debug('Invalid document', validate.errors, s);
        }
        return isValid;
      });
      messages.push({ type: 'info', text: `Inserting ${docs.length} ${step.label} in DB…` });
      let result = await globals.db?.documents.bulkInsert(docs);
      console.debug(`Saving ${step.label} result:`, result);
      messages.push({
        type: 'warning',
        text: `Ignored ${result.error.length} ${step.label} duplicates`
      });
    } else {
      messages.push({ type: 'info', text: `Skip ${step.label} import.` });
    }
  }
  messages.push({ type: 'success', text: `Import complete!` });
}

export async function handleImportTempo(
  files: FileList,
  messages: LogMessage[],
  flags = {
    entries: true,
    tasks: true,
    forms: true,
    aliases: true
  }
) {
  let tempoFile;
  try {
    tempoFile = files[0];
  } catch {
    return messages.push({ type: 'error', text: 'No file was provided' });
  }

  // init
  messages.push({ type: 'info', text: 'Opening file…' });
  let content = await tempoFile.text();
  messages.push({ type: 'info', text: 'File read!' });

  messages.push({ type: 'info', text: 'Parsing file…' });
  let data: object = JSON.parse(content);
  messages.push({ type: 'info', text: 'File parsed!' });

  let settingsById = {};
  for (const setting of data.settings || []) {
    settingsById[setting._id] = setting;
  }
  // starting importing various types:

  // import: forms
  if (flags.forms) {
    let blueprints: object[] = data.blueprints || [];
    messages.push({ type: 'info', text: `${blueprints.length} tempo blueprints to import found` });
    const forms: FormConfiguration[] = tempoBlueprintsToPestoForm(blueprints);
    messages.push({ type: 'info', text: `${blueprints.length} tempo forms to import` });
    for (const form of forms) {
      // skip form with existing matching ids
      let existing = await globals.db?.documents
        .findOne({
          selector: { type: 'form', 'data.id': form.id }
        })
        .exec();
      if (existing) {
        messages.push({ type: 'info', text: `Skipping ${form.id} at it already exists` });
      } else {
        // to avoid clashing ids we wait a few milliseconds
        await createOrUpdateForm(null, form, 'Tempo');
        messages.push({ type: 'info', text: `Inserted ${form.id}!` });
      }
    }
  } else {
    messages.push({ type: 'info', text: `Skip forms import.` });
  }

  // import: entries
  if (flags.entries) {
    let pestoNotes: DocumentDocument[] = [];
    let entries: [] = data.entries || [];

    messages.push({ type: 'info', text: `Importing ${entries.length} entries…` });
    for (const entry of entries) {
      let converted: DocumentType | null = tempoToPestoDocument(entry, -1);
      if (converted && converted.type != 'ignored') {
        pestoNotes.push(converted);
      } else {
        console.debug('Ignored tempo entry', entry, converted);
      }
    }

    messages.push({ type: 'info', text: `Saving ${pestoNotes.length} converted Tempo notes…` });
    let resultPestoNotes = await globals.db.documents.bulkInsert(pestoNotes);

    console.debug('Saving notes result:', resultPestoNotes);
    messages.push({
      type: 'warning',
      text: `Ignored ${resultPestoNotes.error.length} unsupported notes or duplicates`
    });
  } else {
    messages.push({ type: 'info', text: `Skip entries import.` });
  }

  // import: tasks/board
  if (flags.tasks) {
    let boardConfig: object = data?.board?.settings;
    let tasks: [] = data?.board?.tasks || [];
    let pestoTasks: DocumentDocument[] = [];

    messages.push({ type: 'info', text: `${tasks.length} tempo tasks found` });

    messages.push({
      type: 'info',
      text: boardConfig
        ? `Tempo board config found: ${JSON.stringify(boardConfig.lists)}`
        : `No board config found`
    });
    messages.push({ type: 'info', text: `Loading current board config…` });
    let newBoardConfig = await getSettingData('settings:board', {
      columns: ['Todo', 'Doing', 'Done']
    });
    if (boardConfig?.lists) {
      messages.push({ type: 'info', text: `Importing Tempo board config…` });
      // Tempo doesn't include the "done" column in the export, we add it manually
      newBoardConfig.columns = [...boardConfig.lists.map((r) => r.label), 'Done'];
      messages.push({
        type: 'info',
        text: `Importing Tempo board columns: ${newBoardConfig.columns.join(', ')}`
      });
      await createOrUpdateSetting('settings:board', newBoardConfig, 'Tempo');
    }

    for (const task of tasks) {
      let converted: DocumentType | null = tempoToPestoDocument(
        task,
        newBoardConfig.columns.length - 1
      );
      // console.debug('CONVERTED Tempo task', task, converted);
      if (converted && converted.type != 'ignored') {
        pestoTasks.push(converted);
      }
    }
    messages.push({ type: 'info', text: `Saving ${pestoTasks.length} converted Tempo tasks…` });

    let resultPestoTasks = await globals.db.documents.bulkInsert(pestoTasks);
    console.debug('Saving tasks result:', resultPestoTasks);
    messages.push({
      type: 'warning',
      text: `Ignored ${resultPestoTasks.error.length} tasks duplicates`
    });
  } else {
    messages.push({ type: 'info', text: `Skip tasks and board import.` });
  }

  // import: aliases
  if (flags.aliases) {
    if (settingsById.aliases) {
      messages.push({
        type: 'info',
        text: `Importing ${settingsById.aliases.length} Tempo aliases…`
      });
      let collections = settingsById.aliases.value.map((a) => {
        return {
          id: a._id,
          name: a.name,
          query: a.query
        };
      });
      await createOrUpdateSetting('settings:collections', { collections }, 'Tempo');
    }
  } else {
    messages.push({ type: 'info', text: `Skip aliases import.` });
  }

  messages.push({ type: 'success', text: `Import complete!` });
}

export async function handleExportPesto(
  messages: LogMessage[],
  flags = {
    notes: true,
    forms: true,
    settings: true
  }
) {
  // init
  let data = {
    version: CURRENT_DOCUMENT_VERSION,
    documents: []
  };

  let steps = [
    {
      flag: 'settings',
      type: 'setting',
      label: 'settings'
    },
    {
      flag: 'forms',
      type: 'form',
      label: 'forms'
    },
    {
      flag: 'notes',
      type: 'note',
      label: 'notes'
    },
    {
      flag: 'collections',
      type: 'collection',
      label: 'Collections'
    }
  ];

  for (const step of steps) {
    if (flags[step.flag]) {
      let documents: DocumentDocument[] = await globals.db?.documents
        .find({
          limit: 99999999999,
          sort: [{ created_at: 'asc' }],
          selector: { type: step.type }
        })
        .exec();
      messages.push({ type: 'info', text: `Found ${documents.length} ${step.label} to export` });
      documents.forEach((d) => {
        data.documents.push(d.toJSON());
      });
      messages.push({
        type: 'info',
        text: `Prepared and added ${documents.length} ${step.label} to export file`
      });
    }
  }
  messages.push({ type: 'success', text: `Export complete!` });
  return data;
}

export async function handleExportTempo(
  messages: LogMessage[],
  flags = {
    entries: true,
    tasks: true
  }
) {
  // init
  let data = {};

  let boardConfig = await globals.db?.documents
    .findOne({ selector: { id: 'settings:board' } })
    .exec();
  let columns = [...(boardConfig?.data.columns || ['Todo', 'Doing', 'Done'])];
  columns.pop();
  let doneColumn = columns.length;

  messages.push({ type: 'info', text: `Preparing documents for export…` });
  let tempoDocuments: (TempoEntry | TempoTask)[] = [];
  let pestoDocuments = await globals.db?.documents
    .find({
      limit: 99999999999,
      sort: [{ created_at: 'asc' }],
      selector: { type: 'note' }
    })
    .exec();

  pestoDocuments.forEach((d) => {
    pestoToTempoDocuments(d.toJSON(), doneColumn).forEach((t) => {
      tempoDocuments.push(t);
    });
  });
  messages.push({ type: 'info', text: `Prepared ${pestoDocuments.length}.` });

  if (flags.tasks) {
    data.board = {
      settings: {
        lists: columns.map((c) => {
          return { label: c };
        }),
        categories: []
      },
      tasks: tempoDocuments.filter((t) => t.type === 'task')
    };
    messages.push({ type: 'info', text: `Added ${data.board.tasks.length} tasks to export file` });
  }
  if (flags.entries) {
    data.entries = tempoDocuments.filter((t) => t.type === 'entry');
    messages.push({
      type: 'info',
      text: `Added ${data.board.tasks.length} entries to export file`
    });
  }

  messages.push({ type: 'success', text: `Export complete!` });
  return data;
}
