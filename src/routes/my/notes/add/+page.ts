import { globals, getNewNote, getNewTextFragment } from '$lib/db';

export async function load({ params, url }) {
  let from = url.searchParams.get('from');
  let data = {};
  if (from === 'share') {
    let sharedNote = await globals.uiState.get('sharedNote');
    if (sharedNote.body?.trim() || sharedNote.title?.trim()) {
      let note = getNewNote();
      note.title = sharedNote.title?.trim() || null;
      note.fragments.text = getNewTextFragment(sharedNote.body?.trim());
      data.note = await globals.db?.documents.insert(note);
      await globals.uiState.set('sharedNote', () => null);
    }
  }
  return data;
}
