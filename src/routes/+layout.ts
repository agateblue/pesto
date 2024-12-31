import { goto } from '$app/navigation';
import { getDb, globals, loadFormsQuery, observeLoadForms, launchReplications } from '$lib/db';
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

  // ensure forms are loaded immediately so that they can be displayed properly
  (await loadFormsQuery().exec()).forEach((document) => {
    globals.forms[document.data.id] = document.data;
  });
  observeLoadForms();

  launchReplications(globals.uiState, globals.db);

  return {
    db: globals.db
  };
}
