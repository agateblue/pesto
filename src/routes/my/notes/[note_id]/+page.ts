import { getById, getByQuery } from '$lib/db.js';

export async function load({ params, parent }) {
  let data = await parent();
  return {
    ...data,
    note: (await getById(data.db.notes, params.note_id)) as Note,
    fragments: await getByQuery(data.db.fragments, { selector: { note_id: params.note_id } })
  };
}
