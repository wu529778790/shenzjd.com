const CURSOR_REGEX = /^\d+$/

export function isValidCursor(cursor: string): boolean {
  return CURSOR_REGEX.test(cursor)
}
