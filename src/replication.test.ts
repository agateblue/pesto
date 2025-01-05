import { describe, it, expect } from 'vitest';
import { type FormConfiguration, type DocumentType } from '$lib/db';
import {
  pestoToTempoDocuments,
  tempoToPestoDocument,
  tempoBlueprintsToPestoForm,
  type TempoEntry,
  type TempoTask
} from '$lib/replication';

describe('query language', () => {
  it('replication pestoToTempoDocuments note', () => {
    const input: DocumentType = {
      id: '2024-11-06T12:10:22.438Z',
      type: 'note',
      created_at: '2024-11-06T12:10:22.438Z',
      modified_at: '2024-11-06T12:26:37.871Z',
      title: null,
      fragments: {
        text: {
          content: "Hello #world I'm -sad"
        }
      },
      tags: ['world', 'sad']
    };
    const expected: TempoEntry = {
      _id: '2024-11-06T12:10:22.438Z',
      _rev: '1-00000000000000000000000000000000',
      date: '2024-11-06T12:10:22.438Z',
      text: "Hello #world I'm -sad",
      tags: [
        {
          text: '#world',
          sign: '#',
          id: 'world',
          type: 'tag',
          mood: null,
          value: null
        },
        {
          text: '-sad',
          sign: '-',
          id: 'sad',
          type: 'feeling',
          mood: -1,
          value: null
        }
      ],
      mood: -1,
      type: 'entry',
      thread: null,
      replies: [],
      form: null,
      data: {},
      favorite: false
    };
    expect(pestoToTempoDocuments(input, 0)).toStrictEqual([expected]);
  });
  it('replication pestoToTempoDocuments note with annotations', () => {
    const input: DocumentType = {
      id: '2024-11-06T12:10:22.438Z',
      type: 'note',
      created_at: '2024-11-06T12:10:22.438Z',
      modified_at: '2024-11-06T12:26:37.871Z',
      title: null,
      tags: [],
      fragments: {
        text: {
          content: `@weight:kilos=66
@weight:scale="home"`
        }
      }
    };
    const expected: TempoEntry = {
      _id: '2024-11-06T12:10:22.438Z',
      _rev: '1-00000000000000000000000000000000',
      date: '2024-11-06T12:10:22.438Z',
      text: `@weight:kilos=66
@weight:scale="home"`,
      thread: null,
      favorite: false,
      form: null,
      replies: [],
      tags: [
        {
          text: '@weight:kilos=66',
          sign: '@',
          id: 'weight:kilos',
          type: 'annotation',
          value: '66',
          mood: null
        },
        {
          text: '@weight:scale="home"',
          sign: '@',
          id: 'weight:scale',
          type: 'annotation',
          value: 'home',
          mood: null
        }
      ],
      mood: 0,
      type: 'entry',
      data: {
        'weight:kilos': 66,
        'weight:scale': 'home'
      }
    };
    expect(pestoToTempoDocuments(input, 0)).toStrictEqual([expected]);
  });
  it('replication pestoToTempoDocuments note form fragment with annotations', () => {
    const input: DocumentType = {
      id: '2024-11-06T12:10:22.438Z',
      type: 'note',
      created_at: '2024-11-06T12:10:22.438Z',
      modified_at: '2024-11-06T12:26:37.871Z',
      title: null,
      tags: [],
      fragments: {
        text: {
          content: '@weight:kilos=66'
        },
        form: {
          id: 'weighing',
          data: {
            scale: 'home'
          }
        }
      }
    };
    const expected: TempoEntry = {
      _id: '2024-11-06T12:10:22.438Z',
      _rev: '1-00000000000000000000000000000000',
      date: '2024-11-06T12:10:22.438Z',
      text: `@weight:kilos=66`,
      thread: null,
      favorite: false,
      form: 'weighing',
      replies: [],
      tags: [
        {
          text: '@weight:kilos=66',
          sign: '@',
          id: 'weight:kilos',
          type: 'annotation',
          value: '66',
          mood: null
        }
      ],
      mood: 0,
      type: 'entry',
      data: {
        'weight:kilos': 66,
        scale: 'home'
      }
    };
    expect(pestoToTempoDocuments(input, 0)).toStrictEqual([expected]);
  });
  it('replication pestoToTempoDocuments note form only', () => {
    const input: DocumentType = {
      id: '2024-11-06T12:10:22.438Z',
      type: 'note',
      created_at: '2024-11-06T12:10:22.438Z',
      modified_at: '2024-11-06T12:26:37.871Z',
      title: null,
      tags: [],
      fragments: {
        form: {
          id: 'weighing',
          data: {
            scale: 'home'
          }
        }
      }
    };
    const expected: TempoEntry = {
      _id: '2024-11-06T12:10:22.438Z',
      _rev: '1-00000000000000000000000000000000',
      date: '2024-11-06T12:10:22.438Z',
      text: '',
      thread: null,
      favorite: false,
      form: 'weighing',
      replies: [],
      tags: [],
      mood: 0,
      type: 'entry',
      data: {
        scale: 'home'
      }
    };
    expect(pestoToTempoDocuments(input, 0)).toStrictEqual([expected]);
  });
  it('replication pestoToTempoDocument task not done', () => {
    const input: DocumentType = {
      id: '2024-11-06T12:10:22.438Z',
      type: 'note',
      created_at: '2024-11-06T12:10:22.438Z',
      modified_at: '2024-11-06T12:26:37.871Z',
      title: 'Cleaning day',
      fragments: {
        todolist: {
          done: false,
          todos: [
            {
              id: '018fe787-270b-7000-8000-0862afeaa8e3',
              done: false,
              text: 'Dishes'
            },
            {
              id: '018fe787-270b-7000-8000-11c1dd22dc7d',
              done: true,
              text: 'Laundry'
            }
          ],
          column: 1
        }
      },
      tags: []
    };
    const expected: TempoTask = {
      _id: '2024-11-06T12:10:22.438Z',
      _rev: '1-00000000000000000000000000000000',
      date: '2024-11-06T12:10:22.438Z',
      type: 'task',
      text: 'Cleaning day',
      category: null,
      index: -1,
      list: 1,
      subtasks: [
        { done: false, label: 'Dishes' },
        { done: true, label: 'Laundry' }
      ]
    };
    expect(pestoToTempoDocuments(input, 3)).toStrictEqual([expected]);
  });

  it('replication pestoToTempoDocument task and text done', () => {
    const input: DocumentType = {
      id: '2024-11-06T12:10:22.999Z',
      type: 'note',
      created_at: '2024-11-06T12:10:22.999Z',
      modified_at: '2024-11-06T12:26:37.871Z',
      title: null,
      fragments: {
        text: { content: 'hello' },
        todolist: {
          done: true,
          todos: [{text: 'Cleaning day', done: true, id: 'noop'}],
          column: 1
        }
      },
      tags: []
    };
    const expected: (TempoTask | TempoEntry)[] = [
      {
        _id: '2024-11-06T12:10:22.999Z',
        _rev: '1-00000000000000000000000000000000',
        date: '2024-11-06T12:10:22.999Z',
        text: 'hello',
        thread: null,
        favorite: false,
        form: null,
        replies: [],
        tags: [],
        mood: 0,
        type: 'entry',
        data: {}
      },
      {
        _id: '2024-11-06T12:10:22.000Z',
        _rev: '1-00000000000000000000000000000000',
        date: '2024-11-06T12:10:22.999Z',
        type: 'task',
        text: 'Cleaning day',
        category: null,
        index: -1,
        list: 1,
        subtasks: []
      }
    ];
    expect(pestoToTempoDocuments(input, 3)).toStrictEqual(expected);
  });

  it('replication pestoToTempoDocument task done', () => {
    const input: DocumentType = {
      id: '2024-11-06T12:10:22.438Z',
      type: 'note',
      created_at: '2024-11-06T12:10:22.438Z',
      modified_at: '2024-11-06T12:26:37.871Z',
      title: null,
      fragments: {
        todolist: {
          done: true,
          todos: [{text: 'hello', done: true, id: 'noop'}],
          // this means done
          column: -1
        }
      },
      tags: []
    };
    const expected: TempoTask = {
      _id: '2024-11-06T12:10:22.438Z',
      _rev: '1-00000000000000000000000000000000',
      date: '2024-11-06T12:10:22.438Z',
      type: 'task',
      text: 'hello',
      category: null,
      index: -1,
      list: 3,
      subtasks: []
    };
    expect(pestoToTempoDocuments(input, 3)).toStrictEqual([expected]);
  });
  it('replication pestoToTempoDocument other type ignored', () => {
    const input: DocumentType = {
      id: '2024-11-06T12:10:22.438Z',
      type: 'settings',
      data: {}
    };
    expect(pestoToTempoDocuments(input, 3)).toStrictEqual([]);
  });

  it('replication tempoToPestoDocuments note', () => {
    const input: TempoEntry = {
      _id: '2024-11-06T12:10:22.438Z',
      _rev: '1-00000000000000000000000000000000',
      date: '2024-11-06T12:10:22.438Z',
      text: "Hello #world I'm -sad",
      tags: [
        {
          text: '#world',
          sign: '#',
          id: 'world',
          type: 'tag',
          mood: null,
          value: null
        },
        {
          text: '-sad',
          sign: '-',
          id: 'sad',
          type: 'feeling',
          mood: -1,
          value: null
        }
      ],
      mood: -1,
      type: 'entry',
      _deleted: false,
      form: 'test:form',
      data: {
        'form:field1': 0.14,
        'form:field2': true
      },
      favorite: true
    };
    const expected: DocumentType = {
      id: '2024-11-06T12:10:22.438Z',
      type: 'note',
      created_at: '2024-11-06T12:10:22.438Z',
      modified_at: '2024-11-06T12:10:22.438Z',
      title: null,
      starred: true,
      fragments: {
        text: {
          content: "Hello #world I'm -sad"
        },
        form: {
          id: 'test:form',
          data: {
            'form:field1': 0.14,
            'form:field2': true
          },
          annotations: {}
        }
      },
      tags: ['world', 'sad'],
      _deleted: false,
      source: 'Tempo'
    };
    expect(tempoToPestoDocument(input, 0)).toStrictEqual(expected);
  });

  it('replication tempoToPestoDocuments task not done', () => {
    const input: TempoTask = {
      _id: '2024-11-06T12:10:22.438Z',
      _rev: '1-00000000000000000000000000000000',
      date: '2024-11-06T12:10:22.438Z',
      type: 'task',
      text: 'Cleaning day',
      category: null,
      index: -1,
      list: 1,
      subtasks: [
        { label: 'Dishes', done: true },
        { label: 'Laundry', done: false }
      ],
      _deleted: false,
      favorite: false
    };
    const expected: DocumentType = {
      id: '2024-11-06T12:10:22.438Z',
      type: 'note',
      created_at: '2024-11-06T12:10:22.438Z',
      modified_at: '2024-11-06T12:10:22.438Z',
      title: null,
      _deleted: false,
      starred: false,
      fragments: {
        todolist: {
          done: false,
          title: 'Cleaning day',
          todos: [
            { text: 'Dishes', done: true, id: '2024-11-06T12:10:22.438Z' },
            { text: 'Laundry', done: false, id: '2024-11-06T12:10:22.438Z' }
          ],
          column: 1
        }
      },
      tags: [],
      source: 'Tempo'
    };
    expect(tempoToPestoDocument(input, 3)).toStrictEqual(expected);
  });

  it('replication tempoToPestoDocuments task done', () => {
    const input: TempoTask = {
      _id: '2024-11-06T12:10:22.438Z',
      _rev: '1-00000000000000000000000000000000',
      date: '2024-11-06T12:10:22.438Z',
      type: 'task',
      text: 'Cleaning day',
      category: null,
      index: -1,
      list: 3,
      subtasks: [],
      _deleted: false,
      favorite: true
    };
    const expected: DocumentType = {
      id: '2024-11-06T12:10:22.438Z',
      type: 'note',
      created_at: '2024-11-06T12:10:22.438Z',
      modified_at: '2024-11-06T12:10:22.438Z',
      title: null,
      starred: true,
      _deleted: false,
      fragments: {
        todolist: {
          done: true,
          title: 'Cleaning day',
          todos: [],
          // this means done
          column: -1
        }
      },
      tags: [],
      source: 'Tempo'
    };
    expect(tempoToPestoDocument(input, 3)).toStrictEqual(expected);
  });

  it('replication tempoToPestoDocuments boardconfig', () => {
    const input = {
      _id: 'boardConfig',
      _rev: '1-00000000000000000000000000000000',
      type: 'settings',
      date: new Date().toISOString(),
      value: {
        lists: [{ label: 'Today' }, { label: 'Tomorrow' }],
        categories: ['a', 'b', 'c']
      }
    };
    const expected: DocumentType = {
      id: 'settings:board',
      type: 'setting',
      modified_at: input.date,
      created_at: input.date,
      data: { columns: ['Today', 'Tomorrow', 'Done'] },
      fragments: {},
      tags: [],
      title: null,
      source: 'Tempo',
      _deleted: false,
    };
    expect(tempoToPestoDocument(input, 3)).toStrictEqual(expected);
  });

  it('replication tempoToPestoDocuments other document ignored', () => {
    const input = {
      _id: 'something',
      _rev: '1-00000000000000000000000000000000',
      type: 'settings'
    };
    const expected: DocumentType = {
      id: 'ignored:tempo:settings:something',
      type: 'ignored',
      source: 'Tempo',
      _deleted: false,
    };
    expect(tempoToPestoDocument(input, 3)).toStrictEqual(expected);
  });

  it('convert tempo blueprint to pesto forms', () => {
    const input = [
      {
        type: 'blueprint',
        definition: {
          id: 'common',
          label: 'Common',
          title: 'Commen stuff',
          version: '1',
          fields: [
            {
              id: 'agate:common:duration',
              label: 'Duration',
              type: 'number',
              unit: 'Minutes',
              step: 1,
              min: 0
            }
          ]
        }
      },
      {
        type: 'blueprint',
        definition: {
          id: 'work',
          label: 'Work',
          title: 'Work and tasks',
          version: '1',
          fields: [
            {
              id: 'work:client',
              label: 'Client',
              type: 'text',
              autosuggest: 'form'
            },
            {
              id: 'work:project',
              label: 'Project',
              type: 'text',
              autosuggest: 'form'
            }
          ],
          forms: [
            {
              id: 'work:tracking',
              label: 'Work time tracking',
              fields: [
                {
                  id: 'work:client'
                },
                {
                  id: 'work:project',
                  required: false
                },
                {
                  id: 'agate:common:duration',
                  default: 60
                }
              ]
            }
          ]
        }
      }
    ];
    const expected: FormConfiguration[] = [
      {
        id: 'work:tracking',
        name: 'Work time tracking',
        fields: [
          {
            id: 'work:client',
            label: 'Client',
            type: 'text',
            required: true,
            autosuggest: true
          },
          {
            id: 'work:project',
            label: 'Project',
            type: 'text',
            required: false,
            autosuggest: true
          },
          {
            id: 'agate:common:duration',
            label: 'Duration',
            type: 'number',
            required: true,
            autosuggest: true,
            default: 60
          }
        ]
      }
    ];
    expect(tempoBlueprintsToPestoForm(input)).toStrictEqual(expected);
  });
});
