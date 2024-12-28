import { goto } from '$app/navigation';
import { getDb, globals, loadForms } from '$lib/db';
import { page } from '$app/stores';

export const ssr = false;
export const prerender = true;

export async function load() {
  const { db, uiState } = await getDb();
  if ((await db?.collections.documents.migrationNeeded()) && window.location.pathname != '/') {
    await goto('/');
  }

  globals.db = db;
  globals.uiState = uiState;
  return {
    db: globals.db
  };
}
