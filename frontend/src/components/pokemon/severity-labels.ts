/**
 * Display label and color per threat severity.
 * Lives in its own module so both the threat list and its filter can use it
 * without either component file exporting a non-component.
 */
export const SEVERITY_LABELS: Record<string, { label: string; color: string }> = {
  ohko: { label: 'OHKO', color: '#ef4444' },
  near_ohko: { label: 'Near OHKO', color: '#f97316' },
  two_hko: { label: '2HKO', color: '#eab308' },
  pressure: { label: 'Pressure', color: '#64748b' },
};
