import { globals, getNewNote, getNewTextFragment } from '$lib/db';

export async function load({ params, url }) {
  let from = url.searchParams.get("from")
  let data = {}
  if (from === 'share') {
    let body = await globals.uiState.get('sharedNote')
    if (body?.trim()) {
      let note = getNewNote()
      note.fragments.text = getNewTextFragment(body)
      data.note = await globals.db?.documents.insert(note)
      await globals.uiState.set('sharedNote', () => null)
    }
  }
  return data;
}
