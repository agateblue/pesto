import { writable } from 'svelte/store';

export const lang = writable('en-US');
export const parsedTranslations = writable({});