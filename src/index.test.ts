import { describe, it, expect } from 'vitest';
import { tokensToMangoQuery, getQueryTokens, type QueryToken, type DocumentDocument } from '$lib/db';
import { pestoToTempoDocument, tempoToPestoDocument, type TempoEntry, type RxBaseDoc, type TempoTask } from '$lib/replication';
import { insertTagMarkup, renderMarkdown, parseTags } from '$lib/ui';

describe('query language', () => {
  it('getQueryTokens', () => {
    const input = 'is:task is:subtask is:done plop plip ploup tag:hello';
    const expected = [
      { type: 'is', value: 'task' },
      { type: 'is', value: 'subtask' },
      { type: 'is', value: 'done' },
      { type: 'text', value: 'plop' },
      { type: 'text', value: 'plip' },
      { type: 'text', value: 'ploup' },
      { type: 'tag', value: 'hello' }
    ];
    expect(getQueryTokens(input)).toStrictEqual(expected);
  });
  it('is:task', () => {
    const input: QueryToken[] = [{ type: 'is', value: 'task' }];
    const expected = [{ 'fragments.todolist': { $exists: true } }];
    expect(tokensToMangoQuery(input)).toStrictEqual(expected);
  });
  it('is:done', () => {
    const input: QueryToken[] = [{ type: 'is', value: 'done' }];
    const expected = [{ 'fragments.todolist.done': { $eq: true } }];
    expect(tokensToMangoQuery(input)).toStrictEqual(expected);
  });
  it('is:subtask', () => {
    const input: QueryToken[] = [{ type: 'is', value: 'subtask' }];
    const expected = [{ 'fragments.todolist.todos.1': { $exists: true } }];
    expect(tokensToMangoQuery(input)).toStrictEqual(expected);
  });
  it('is:text', () => {
    const input: QueryToken[] = [{ type: 'is', value: 'text' }];
    const expected = [{ 'fragments.text.content': { $exists: true } }];
    expect(tokensToMangoQuery(input)).toStrictEqual(expected);
  });
  it('tag:hello', () => {
    const input: QueryToken[] = [{ type: 'tag', value: 'hello' }];
    const expected = [{ tags: 'hello' }];
    expect(tokensToMangoQuery(input)).toStrictEqual(expected);
  });
  it('basic text', () => {
    const input: QueryToken[] = [{ type: 'text', value: 'hop' }];
    const expected = [
      {
        $or: [
          { 'fragments.text.content': { $regex: '.*hop.*', $options: 'i' } },
          { 'fragments.todolist.title': { $regex: '.*hop.*', $options: 'i' } },
          {
            'fragments.todolist.todos': {
              $elemMatch: { text: { $regex: '.*hop.*', $options: 'i' } }
            }
          }
        ]
      }
    ];
    expect(tokensToMangoQuery(input)).toStrictEqual(expected);
  });

  it('ui parseTags', () => {
    const input = 'this !is #a -mood yup @foo=bar';
    const expected = [
      {
        id: 'is',
        type: 'tag',
        mood: null,
        sign: '!',
        text: '!is',
        value: null
      },
      {
        id: 'a',
        mood: null,
        sign: '#',
        text: '#a',
        type: 'tag',
        value: null
      },
      {
        id: 'mood',
        mood: -1,
        sign: '-',
        text: '-mood',
        type: 'feeling',
        value: null
      },
      {
        id: 'foo',
        mood: null,
        sign: '@',
        text: '@foo=bar',
        type: 'annotation',
        value: 'bar'
      }
    ];
    expect(parseTags(input)).toStrictEqual(expected);
  });
  it('ui render tags to search link in markdown', () => {
    const input = 'hello this is a #hashtag yes';
    const expected = 'hello this is a [#hashtag](/my?q=tag:hashtag) yes';
    expect(insertTagMarkup(input)).toStrictEqual(expected);
  });

  it('ui render markdown', () => {
    const input = 'hello this is a #hashtag **yes**';
    const expected =
      '<p>hello this is a <a href="/my?q=tag:hashtag">#hashtag</a> <strong>yes</strong></p>\n';
    expect(renderMarkdown(input)).toStrictEqual(expected);
  });

  it('replication pestoToTempoDocument note', () => {
    const input: DocumentDocument & RxBaseDoc = {
      "id": "2024-11-06T12:10:22.438Z",
      "type": "note",
      "created_at": "2024-11-06T12:10:22.438Z",
      "modified_at": "2024-11-06T12:26:37.871Z",
      "title": null,
      "fragments": {
        "text": {
          "content": "Hello #world I'm -sad"
        }
      },
      "tags": ["world", "sad"],
      "_deleted": false,
    }
    const expected: TempoEntry = {
      "_id": "2024-11-06T12:10:22.438Z",
      "date": "2024-11-06T12:10:22.438Z",
      "text": "Hello #world I'm -sad",
      "tags": [
        {
          "text": "#world",
          "sign": "#",
          "id": "world",
          "type": "tag",
          "mood": null,
          "value": null,
        },
        {
          "text": "-sad",
          "sign": "-",
          "id": "sad",
          "type": "feeling",
          "mood": -1,
          "value": null,
        }
      ],
      "mood": -1,
      "type": "entry",
      "_deleted": false,
      "thread": null,
      "replies": [],
      "form": null,
      "data": null,
      "favorite": false,
    }
    expect(pestoToTempoDocument(input, 0)).toStrictEqual(expected);
  });
  it('replication pestoToTempoDocument task not done', () => {
    const input: DocumentDocument & RxBaseDoc = {
      "id": "2024-11-06T12:10:22.438Z",
      "type": "note",
      "created_at": "2024-11-06T12:10:22.438Z",
      "modified_at": "2024-11-06T12:26:37.871Z",
      "title": null,
      "fragments": {
        "todolist": {
          "done": false,
          "title": "Cleaning day",
          "todos": [
            {
              "id": "018fe787-270b-7000-8000-0862afeaa8e3",
              "done": false,
              "text": "Dishes"
            },
            {
              "id": "018fe787-270b-7000-8000-11c1dd22dc7d",
              "done": true,
              "text": "Laundry"
            },
          ],
          "column": 1
        }
      },
      "tags": [],
      "_deleted": false,
    }
    const expected: TempoTask = {
      "_id": "2024-11-06T12:10:22.438Z",
      "date": "2024-11-06T12:10:22.438Z",
      "type": "task",
      "text": "Cleaning day",
      "category": null,
      "index": -1,
      "list": 1,
      "subtasks": [
        {"done": false, "label": "Dishes"},
        {"done": true, "label": "Laundry"},
      ],
      "_deleted": false,      
    }
    expect(pestoToTempoDocument(input, 3)).toStrictEqual(expected);
  });

  it('replication pestoToTempoDocument task done', () => {
    const input: DocumentDocument & RxBaseDoc = {
      "id": "2024-11-06T12:10:22.438Z",
      "type": "note",
      "created_at": "2024-11-06T12:10:22.438Z",
      "modified_at": "2024-11-06T12:26:37.871Z",
      "title": null,
      "_deleted": false,
      "fragments": {
        "todolist": {
          "done": true,
          "title": "Cleaning day",
          "todos": [],
          // this means done
          "column": -1
        }
      },
      "tags": []
    }
    const expected: TempoTask = {
      "_id": "2024-11-06T12:10:22.438Z",
      "date": "2024-11-06T12:10:22.438Z",
      "type": "task",
      "text": "Cleaning day",
      "category": null,
      "index": -1,
      "list": 3,
      "subtasks": [],
      "_deleted": false,
      
    }
    expect(pestoToTempoDocument(input, 3)).toStrictEqual(expected);
  });
  it('replication pestoToTempoDocument other type ignored', () => {
    const input: DocumentDocument & RxBaseDoc = {
      "id": "2024-11-06T12:10:22.438Z",
      "type": "settings",
      "data": {}
    }
    const expected = null
    expect(pestoToTempoDocument(input, 3)).toStrictEqual(expected);
  });

  it('replication tempoToPestoDocument note', () => {
    const input: TempoEntry = {
      "_id": "2024-11-06T12:10:22.438Z",
      "date": "2024-11-06T12:10:22.438Z",
      "text": "Hello #world I'm -sad",
      "tags": [
        {
          "text": "#world",
          "sign": "#",
          "id": "world",
          "type": "tag",
          "mood": null,
          "value": null,
        },
        {
          "text": "-sad",
          "sign": "-",
          "id": "sad",
          "type": "feeling",
          "mood": -1,
          "value": null,
        }
      ],
      "mood": -1,
      "type": "entry",
      "_deleted": false,
      "form": 'test:form',
      "data": {
        "form:field1": 0.14,
        "form:field2": true,
      }
    }
    const expected: DocumentDocument & RxBaseDoc = {
      "id": "2024-11-06T12:10:22.438Z",
      "type": "note",
      "created_at": "2024-11-06T12:10:22.438Z",
      "modified_at": "2024-11-06T12:10:22.438Z",      
      "title": null,
      "fragments": {
        "text": {
          "content": "Hello #world I'm -sad"
        },
        "form": {
          "id": "test:form",
          "data": {
            "form:field1": 0.14,
            "form:field2": true,
          }
        }
      },
      "tags": [
        "world",
        "sad"
      ],
      "_deleted": false,
    }
    expect(tempoToPestoDocument(input, 0)).toStrictEqual(expected);
  });

  it('replication tempoToPestoDocument task not done', () => {
    const input: TempoTask = {
      "_id": "2024-11-06T12:10:22.438Z",
      "date": "2024-11-06T12:10:22.438Z",
      "type": "task",
      "text": "Cleaning day",
      "category": null,
      "index": -1,
      "list": 1,
      "subtasks": [
        {"label": "Dishes", "done": true},
        {"label": "Laundry", "done": false},
      ],
      "_deleted": false,
      
    }
    const expected: DocumentDocument & RxBaseDoc = {
      "id": "2024-11-06T12:10:22.438Z",
      "type": "note",
      "created_at": "2024-11-06T12:10:22.438Z",
      "modified_at": "2024-11-06T12:10:22.438Z",
      "title": null,
      "_deleted": false,
      "fragments": {
        "todolist": {
          "done": false,
          "title": "Cleaning day",
          "todos": [
            {"text": "Dishes", "done": true, "id": "2024-11-06T12:10:22.438Z"},
            {"text": "Laundry", "done": false, "id": "2024-11-06T12:10:22.438Z"},
          ],
          "column": 1
        }
      },
      "tags": []
    }
    expect(tempoToPestoDocument(input, 3)).toStrictEqual(expected);
  });

  it('replication tempoToPestoDocument task done', () => {
    const input: TempoTask = {
      "_id": "2024-11-06T12:10:22.438Z",
      "date": "2024-11-06T12:10:22.438Z",
      "type": "task",
      "text": "Cleaning day",
      "category": null,
      "index": -1,
      "list": 3,
      "subtasks": [],
      "_deleted": false,
      
    }
    const expected: DocumentDocument & RxBaseDoc = {
      "id": "2024-11-06T12:10:22.438Z",
      "type": "note",
      "created_at": "2024-11-06T12:10:22.438Z",
      "modified_at": "2024-11-06T12:10:22.438Z",
      "title": null,
      "_deleted": false,
      "fragments": {
        "todolist": {
          "done": true,
          "title": "Cleaning day",
          "todos": [],
          // this means done
          "column": -1
        }
      },
      "tags": []
    }
    expect(tempoToPestoDocument(input, 3)).toStrictEqual(expected);
  });

  it('replication tempoToPestoDocument boardconfig', () => {
    const input = {
      "_id": "boardConfig",
      "type": "settings",
      "date": new Date().toISOString(),
      "value": {
        "lists": [{"label": 'Today'}, {"label": 'Tomorrow'}],
        "categories": ['a', 'b', 'c'],
      },
    }
    const expected: DocumentDocument & RxBaseDoc = {
      "id": "settings:board",
      "type": "setting",
      "modified_at": input.date,
      "created_at": input.date,
      "data": {"columns": ["Today", "Tomorrow", "Done"]},
      "fragments": {},
      "tags": [],
      "title": null,
    }
    expect(tempoToPestoDocument(input, 3)).toStrictEqual(expected);
  });

  it('replication tempoToPestoDocument other document ignored', () => {
    const input = {
      "_id": "something",
      "type": "settings"
    }
    const expected: DocumentDocument & RxBaseDoc = {
      "id": "ignored:tempo:settings:something",
      "type": "ignored",
    }
    expect(tempoToPestoDocument(input, 3)).toStrictEqual(expected);
  });
});
