/**
 * Formats a numeric value into INR currency format (e.g., ₹1,23,456).
 */
export function formatCurrency(value: number | string | undefined): string {
  if (value === undefined) return '₹0';
  const numeric = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^\d.]/g, '')) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(numeric);
}

/**
 * Formats an ISO date string or timestamp into a readable date format (e.g. June 23, 2026).
 */
export function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return 'N/A';
  }
}
