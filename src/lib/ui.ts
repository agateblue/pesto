import { pushState } from "$app/navigation";

export function ignoreTab(handler: Function) {
  return (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      return e;
    }
    handler(e);
  };
}

export function updateURLParam(pageUrl, param: string, value: string) {
  let query = new URLSearchParams(pageUrl.searchParams.toString());
  query.set(param, value);
  return query
}
