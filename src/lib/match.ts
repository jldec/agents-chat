/**
 * Returns true if the pathname starts with any of the patterns
 */
export function match(pathname: string, patterns?: string | string[]): boolean {
  const p: string[] = Array.isArray(patterns) ? patterns : patterns ? [patterns] : []

  return p.some((pattern) => pathname.startsWith(pattern))
}