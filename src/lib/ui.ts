import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";
import debounce from "lodash/debounce";
import { type DocumentType, type TodolistType } from "$lib/db";

export type LogMessage = {
  text: string;
  type: "debug" | "info" | "warning" | "error" | "critical" | "success";
};

export function ignoreTab(handler: Function) {
  return (e: KeyboardEvent) => {
    if (e.key === "Tab") {
      return e;
    }
    handler(e);
  };
}

const signToMood = {
  "+": 1,
  "-": -1,
  "~": 0,
  "?": null,
  "#": null,
  "!": null,
  "@": null
};
export const signToType = {
  "+": "feeling",
  "-": "feeling",
  "~": "feeling",
  "?": "feeling",
  "#": "tag",
  "!": "tag",
  "@": "annotation"
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
      fullSign: match[3],
      id: match[4].replace(/"/g, ""),
      type: null,
      value: null
    };
    let include = true;
    tag.type = signToType[tag.sign];
    if (tag.type === "annotation") {
      let parts = tag.id.replace(/"/g, "").split("=");
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
  return DOMPurify.sanitize(marked.parse(text || ""));
}

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export function updateURLParam(searchParams, params: object[]) {
  let query = new URLSearchParams(searchParams.toString());
  params.forEach((p) => {
    if (!p.value) {
      query.delete(p.param);
    } else {
      query.set(p.param, p.value);
    }
  });

  return query;
}

export function getRandomId(length = 8) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
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
export function makeFile(text: string, mimetype: string) {
  let data = new Blob([text], { type: mimetype });
  let textFile = window.URL.createObjectURL(data);
  return textFile;
}

export function downloadFile(text: string, mimetype: string, name: string) {
  let f = makeFile(text, mimetype);
  var link = document.createElement("a");
  link.setAttribute("download", name);
  link.href = f;
  document.body.appendChild(link);

  window.requestAnimationFrame(function () {
    var event = new MouseEvent("click");
    link.dispatchEvent(event);
    document.body.removeChild(link);
  });
}

export function getTodoListFromMarkdown(text: string, getId: Function) {
  const regex = new RegExp(/- \[(x| )?\] (.*)/gi);
  let match = regex.exec(text);
  let todolist: null | TodolistType = null;
  while (match != null) {
    if (match[2].trim()) {
      if (todolist) {
        todolist.todos.push({
          id: getId(),
          done: !!match[1].trim(),
          text: match[2].trim()
        });
      } else {
        todolist = {
          done: !!match[1]?.trim(),
          column: !!match[1]?.trim() ? -1 : 0,
          todos: [{ id: getId(), done: !!match[1]?.trim(), text: match[2].trim() }]
        };
      }
    }
    match = regex.exec(text);
  }
  return todolist;
}

export function noteToText(note: DocumentType) {
  let parts = [];
  if (note.title?.trim()) {
    parts.push(`# ${note.title.trim()}`);
  }
  if (note.fragments.text) {
    parts.push(note.fragments.text.content.trim());
  }
  if (note.fragments.todolist?.todos) {
    let formattedTodos = note.fragments.todolist.todos
      .filter((t) => t.text.trim())
      .map((t) => {
        return `- [${t.done ? "x" : " "}] ${t.text.trim()}`;
      });
    let todos = formattedTodos.join("\n");
    if (todos.trim()) {
      parts.push(todos);
    }
  }
  return parts.join("\n\n");
}
