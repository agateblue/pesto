import DOMPurify from 'isomorphic-dompurify';
import { marked } from 'marked';
import { pushState } from '$app/navigation';
import debounce from 'lodash/debounce';

export type LogMessage = {
  text: string;
  type: 'debug' | 'info' | 'warning' | 'error' | 'critical' | 'success';
};

export function ignoreTab(handler: Function) {
  return (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      return e;
    }
    handler(e);
  };
}

const signToMood = {
  '+': 1,
  '-': -1,
  '~': 0,
  '?': null,
  '#': null,
  '!': null,
  '@': null
};
const signToType = {
  '+': 'feeling',
  '-': 'feeling',
  '~': 'feeling',
  '?': 'feeling',
  '#': 'tag',
  '!': 'tag',
  '@': 'annotation'
};

const tagRegex =
  /(^|\s)((#|\+{1,5}|-{1,5}|~|\?|!|@)([:A-zÀ-ÿ\d][:A-zÀ-ÿ\d-]*(=(true|false|[:A-zÀ-ÿ\d-]+|"[^"]*")?(-?\d*(\.(\d+))?)?)?))/gi;

export function parseTags(text: string) {
  const tags = [];
  const regex = new RegExp(tagRegex);
  let match = regex.exec(text);
  while (match != null) {
    let tag = {
      text: match[2],
      sign: match[3][0],
      id: match[4].replace(/"/g, ''),
      type: null,
      value: null
    };
    let include = true;
    tag.type = signToType[tag.sign];
    if (tag.type === 'annotation') {
      let parts = tag.id.replace(/"/g, '').split('=');
      tag.id = parts[0];
      tag.value = parts[1] || null;
    }
    tag.mood = signToMood[tag.sign];
    if (tag.mood) {
      tag.mood = tag.mood * match[3].length;
    }
    if (include) {
      tags.push(tag);
    }
    match = regex.exec(text);
  }
  return tags;
}

export function insertTagMarkup(source) {
  return source.replace(tagRegex, (match, m1, m2, m3, m4) => {
    return ` [${m2}](/my?q=tag:${encodeURIComponent(m4)})`;
  });
}

marked.use({
  gfm: true,
  breaks: true
});

export function renderMarkdown(text: string): string {
  text = insertTagMarkup(text);
  return DOMPurify.sanitize(marked.parse(text || ''));
}

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export function updateURLParam(pageUrl, param: string, value: string) {
  let query = new URLSearchParams(pageUrl.searchParams.toString());
  query.set(param, value);
  return query;
}

export function getRandomId(length = 8) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

export function syncPropertiesWithExternalChanges(
  observable,
  callback: Function,
  debounceInterval = 200
) {
  if (!observable?.subscribe) {
    return;
  }
  return observable.subscribe(debounce(callback, debounceInterval));
}

export function clearSubscriptions(subscriptions: []) {
  return () => {
    subscriptions.forEach((s) => {
      s?.unsubscribe();
    });
  };
}
