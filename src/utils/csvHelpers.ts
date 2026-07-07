/**
 * Central CSV Helper utilities for ARCUS Admin Portal.
 * Handles encoding, escaping, downloading, and robust cell-by-cell CSV parsing.
 */

export interface CSVHeader {
  label: string;
  key: string;
}

/**
 * Exports an array of objects to CSV file and triggers a browser download.
 * Properly handles field escaping and Unicode formatting.
 */
export function exportToCSV(data: any[], headers: CSVHeader[], filename: string) {
  const escapeField = (val: any): string => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvHeaders = headers.map(h => escapeField(h.label)).join(',');
  const csvRows = data.map(row =>
    headers.map(h => escapeField(row[h.key])).join(',')
  );

  // Prepend UTF-8 BOM to ensure MS Excel opens file with correct encoding
  const csvContent = '\uFEFF' + [csvHeaders, ...csvRows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parses raw CSV text into a structured grid (array of rows, where each row is an array of strings).
 * Handles escaped double quotes, commas inside fields, and multi-line cell values.
 */
export function parseCSV(text: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let currentValue = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentValue += '"';
          i++; // Skip duplicate quote
        } else {
          inQuotes = false;
        }
      } else {
        currentValue += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(currentValue);
        currentValue = '';
      } else if (char === '\r' || char === '\n') {
        row.push(currentValue);
        currentValue = '';
        
        // Push row if it contains columns
        if (row.length > 0) {
          result.push(row);
        }
        row = [];
        
        if (char === '\r' && nextChar === '\n') {
          i++; // Skip matching linefeed
        }
      } else {
        currentValue += char;
      }
    }
  }

  // Push remainder
  if (currentValue !== '' || row.length > 0) {
    row.push(currentValue);
    result.push(row);
  }

  // Filter out completely blank lines
  return result.filter(r => r.some(cell => cell.trim() !== ''));
}
