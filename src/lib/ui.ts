export function ignoreTab(handler: Function) {
  return (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      return e;
    }
    handler(e);
  };
}

export function updateURLParam(window: Window, param: string, value: string) {
  let url = new URL(window.location.href);
  url.searchParams.set(param, value)
  history.pushState(history.state, '', url.href)
}
