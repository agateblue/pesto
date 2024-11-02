import { describe, it, expect } from 'vitest';
import { tokensToMangoQuery, getQueryTokens, type QueryToken } from '$lib/db';
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
});
