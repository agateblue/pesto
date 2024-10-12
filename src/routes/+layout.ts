import { getDb, globals } from '$lib/db';
export const ssr = false;

export async function load() {
  const {db, uiState} = await getDb()
  globals.db = db
  globals.uiState = uiState
  return {
    db: globals.db
  };
}
