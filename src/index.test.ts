import { describe, it, expect } from 'vitest';
import { tokensToMangoQuery, getQueryTokens, type QueryToken } from '$lib/db';

describe('query language', () => {
  it('getQueryTokens', () => {
    const input = 'is:task is:subtask is:done plop plip ploup';
    const expected = [
      { type: 'is', value: 'task' },
      { type: 'is', value: 'subtask' },
      { type: 'is', value: 'done' },
      { type: 'text', value: 'plop' },
      { type: 'text', value: 'plip' },
      { type: 'text', value: 'ploup' }
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
});
