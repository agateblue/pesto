import { goto } from '$app/navigation';

export async function load({ params, parent }) {
  await goto('/my');
  return {};
}
