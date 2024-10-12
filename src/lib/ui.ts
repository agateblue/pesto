export function ignoreTab(handler: Function) {
  return (e: KeyboardEvent) => {
    if (e.key === "Tab") {
      return e
    }
    handler(e)
  }
}