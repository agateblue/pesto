import { getById, fetchMatching, buildUniqueId } from '$lib/db.js';

export async function load({ params }) {
  let noteId = buildUniqueId('note', params.note_id);
  return {
    note: (await getById(noteId)) as Note,
    fragments: (await fetchMatching('fragment', (r: Fragment) => {
      return r.note_id == noteId;
    })) as Fragment[]
  };
}
