/**
 * Whether Save-and-continue must ask for explicit confirmation before PUT.
 * Empty → empty does not confirm. Skip/continue-without-tracking never uses this.
 */
export function shouldConfirmClearUsages(
  previousUsageCount: number,
  nextUsageCount: number,
): boolean {
  return previousUsageCount > 0 && nextUsageCount === 0;
}
