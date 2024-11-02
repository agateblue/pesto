import { getById } from '$lib/db.js';

export async function load({ params, parent }) {
  let data = await parent();
  return {
    ...data,
    note: (await getById(data.db.documents, params.note_id)) as Document
  };
}
