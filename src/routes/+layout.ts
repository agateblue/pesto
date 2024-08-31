import { getDb } from '$lib/db';
export const ssr = false;

export async function load() {
  return {
    db: await getDb()
  };
}
