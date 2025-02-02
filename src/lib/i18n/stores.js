import { writable } from 'svelte/store';

export const lang = writable('fr-FR');
export const parsedTranslations = writable({});