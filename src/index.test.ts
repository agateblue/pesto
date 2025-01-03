import { describe, it, expect } from 'vitest';
import { tokensToMangoQuery, getQueryTokens, type QueryToken, type DocumentType } from '$lib/db';
import { insertTagMarkup, renderMarkdown, parseTags, getTodoListFromMarkdown, noteToText } from '$lib/ui';

describe('query language', () => {
  it('getQueryTokens', () => {
    const input =
      'is:todo is:subtask is:done plop plip ploup tag:hello form:toto starred:true column:2';
    const expected = [
      { type: 'is', value: 'todo' },
      { type: 'is', value: 'subtask' },
      { type: 'is', value: 'done' },
      { type: 'text', value: 'plop' },
      { type: 'text', value: 'plip' },
      { type: 'text', value: 'ploup' },
      { type: 'tag', value: 'hello' },
      { type: 'form', value: 'toto' },
      { type: 'starred', value: 'true' },
      { type: 'column', value: 2 }
    ];
    expect(getQueryTokens(input)).toStrictEqual(expected);
  });
  it('is:todo', () => {
    const input: QueryToken[] = [{ type: 'is', value: 'todo' }];
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
  it('is:form', () => {
    const input: QueryToken[] = [{ type: 'is', value: 'form' }];
    const expected = [{ 'fragments.form': { $exists: true } }];
    expect(tokensToMangoQuery(input)).toStrictEqual(expected);
  });
  it('tag:hello', () => {
    const input: QueryToken[] = [{ type: 'tag', value: 'hello' }];
    const expected = [{ tags: 'hello' }];
    expect(tokensToMangoQuery(input)).toStrictEqual(expected);
  });
  it('form:toto', () => {
    const input: QueryToken[] = [{ type: 'form', value: 'toto' }];
    const expected = [{ 'fragments.form.id': 'toto' }];
    expect(tokensToMangoQuery(input)).toStrictEqual(expected);
  });
  it('starred:true', () => {
    const input: QueryToken[] = [{ type: 'starred', value: 'true' }];
    const expected = [{ starred: true }];
    expect(tokensToMangoQuery(input)).toStrictEqual(expected);
  });
  it('column:2', () => {
    const input: QueryToken[] = [{ type: 'column', value: 2 }];
    const expected = [{ 'fragments.todolist.column': 2 }];
    expect(tokensToMangoQuery(input)).toStrictEqual(expected);
  });
  it('basic text', () => {
    const input: QueryToken[] = [{ type: 'text', value: 'hop' }];
    const expected = [
      {
        $or: [
          { title: { $regex: '.*hop.*', $options: 'i' } },
          { 'fragments.text.content': { $regex: '.*hop.*', $options: 'i' } },
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
  it('ui get tasks from markdown source', () => {
    const input = `
- [ ] Task 1
  - [x] Task 2
- [ ] Task 3
`;
    const expected = {
      done: false,
      column: 0,
      todos: [
        {
          id: 'noop',
          text: 'Task 1',
          done: false
        },
        {
          id: 'noop',
          text: 'Task 2',
          done: true
        },
        {
          id: 'noop',
          text: 'Task 3',
          done: false
        }
      ]
    };
    expect(getTodoListFromMarkdown(input, () => 'noop')).toStrictEqual(expected);
  });
  it('ui noteToText', () => {
    const input: DocumentType = {
      id: '2024-11-06T12:10:22.438Z',
      type: 'note',
      created_at: '2024-11-06T12:10:22.438Z',
      modified_at: '2024-11-06T12:26:37.871Z',
      title: 'Cleaning day',
      fragments: {
        text: {content: "Hello world"},
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
            },
            {
              id: '018fe787-270b-7000-8000-11c1dd22dc7d',
              done: false,
              text: ''
            }
          ],
          column: 1
        }
      },
      tags: []
    };
    const expected = `# Cleaning day

Hello world

- [ ] Dishes
- [x] Laundry`
    expect(noteToText(input)).toStrictEqual(expected);
  });
});
