/**
 * The name a committed draft should produce, or null when nothing changed.
 * Empty or whitespace-only input falls back rather than clearing the name.
 *
 * Lives apart from InlineEditableName so that file exports only a component,
 * which Fast Refresh requires.
 */
export function resolveCommittedName(
  draft: string,
  current: string,
  fallback: string,
): string | null {
  const next = draft.trim() || fallback;
  return next === current ? null : next;
}
