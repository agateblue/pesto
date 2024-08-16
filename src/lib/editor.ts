import { generateHTML } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';

export const editorExtensions = [StarterKit, TaskItem, TaskList];

export function renderHTML(json) {
  return generateHTML({ type: 'doc', content: json }, editorExtensions);
}
