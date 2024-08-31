import {db} from '$lib/db'
export const prerender = true;

export async function load() {
	return {
		db,
    noteId: null,
	};
}